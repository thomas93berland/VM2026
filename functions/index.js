const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function getArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.matches)) return payload.matches;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function pick(obj, names) {
  for (const name of names) {
    const value = obj?.[name];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function teamName(team) {
  if (!team) return '';
  if (typeof team === 'string') return team;
  return team.name || team.name_en || team.en || team.title || team.country || team.code || '';
}

function normalizeMatch(m) {
  const homeTeam = m.homeTeam || m.home_team || m.home || m.team1 || m.homeTeamData;
  const awayTeam = m.awayTeam || m.away_team || m.away || m.team2 || m.awayTeamData;
  const score = m.score || m.result || {};
  const homeScore = pick(m, ['homeScore', 'scoreHome', 'homeGoals', 'home_score']) ?? pick(score, ['homeScore', 'scoreHome', 'homeGoals', 'home', 'home_score']);
  const awayScore = pick(m, ['awayScore', 'scoreAway', 'awayGoals', 'away_score']) ?? pick(score, ['awayScore', 'scoreAway', 'awayGoals', 'away', 'away_score']);

  return {
    apiId: String(m.id || m.matchId || m.match_id || ''),
    home: teamName(homeTeam) || String(m.homeName || m.home_name || ''),
    away: teamName(awayTeam) || String(m.awayName || m.away_name || ''),
    homeScore: homeScore === undefined ? null : Number(homeScore),
    awayScore: awayScore === undefined ? null : Number(awayScore),
    status: String(m.status || m.matchStatus || m.state || ''),
    group: String(m.group || m.groupName || m.stage || ''),
    venue: teamName(m.venue || m.stadium) || String(m.venueName || m.stadiumName || ''),
    time: m.time || m.date || m.utcDate || m.kickoff || m.startTime || null,
    raw: m
  };
}

async function getToken() {
  const directToken = env('LIVE_API_TOKEN');
  if (directToken) return directToken;

  const base = env('LIVE_API_BASE_URL');
  const username = env('LIVE_API_USERNAME');
  const password = env('LIVE_API_PASSWORD');
  const loginPath = env('LIVE_API_LOGIN_PATH', '/api/auth/login');
  if (!base || !username || !password) return '';

  const res = await fetch(base + loginPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: username, password })
  });
  if (!res.ok) throw new Error('Live API login failed: ' + res.status);
  const data = await res.json();
  return data.token || data.accessToken || data.access_token || data.jwt || '';
}

exports.liveScores = onRequest({ region: 'us-central1', timeoutSeconds: 30 }, async (req, res) => {
  Object.entries(corsHeaders).forEach(([k, v]) => res.set(k, v));
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const base = env('LIVE_API_BASE_URL');
    if (!base) return res.status(500).json({ error: 'LIVE_API_BASE_URL is not configured' });

    const mode = String(req.query.mode || 'live');
    const livePath = env('LIVE_API_LIVE_PATH', '/api/matches/live');
    const matchesPath = env('LIVE_API_MATCHES_PATH', '/api/matches');
    const url = base + (mode === 'all' ? matchesPath : livePath);
    const token = await getToken();

    const headers = { 'Accept': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;

    const apiRes = await fetch(url, { headers });
    if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Live API failed', status: apiRes.status });
    const payload = await apiRes.json();
    const matches = getArray(payload).map(normalizeMatch);

    return res.json({ updatedAt: Date.now(), mode, matches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Live score error' });
  }
});
