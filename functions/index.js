const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-apisports-key'
};

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function getArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.response)) return payload.response;
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
  const fixture = m.fixture || {};
  const teams = m.teams || {};
  const goals = m.goals || {};
  const score = m.score || m.result || {};
  const homeTeam = teams.home || m.homeTeam || m.home_team || m.home || m.team1 || m.homeTeamData;
  const awayTeam = teams.away || m.awayTeam || m.away_team || m.away || m.team2 || m.awayTeamData;
  const homeScore = pick(m, ['homeScore', 'scoreHome', 'homeGoals', 'home_score']) ?? goals.home ?? pick(score, ['homeScore', 'scoreHome', 'homeGoals', 'home', 'home_score']);
  const awayScore = pick(m, ['awayScore', 'scoreAway', 'awayGoals', 'away_score']) ?? goals.away ?? pick(score, ['awayScore', 'scoreAway', 'awayGoals', 'away', 'away_score']);
  const status = fixture.status || m.status || {};
  const venue = fixture.venue || m.venue || m.stadium || {};
  const league = m.league || {};

  return {
    apiId: String(fixture.id || m.id || m.matchId || m.match_id || ''),
    home: teamName(homeTeam) || String(m.homeName || m.home_name || ''),
    away: teamName(awayTeam) || String(m.awayName || m.away_name || ''),
    homeScore: homeScore === undefined ? null : Number(homeScore),
    awayScore: awayScore === undefined ? null : Number(awayScore),
    status: String(status.long || status.short || m.matchStatus || m.state || ''),
    elapsed: status.elapsed ?? null,
    group: String(league.round || m.group || m.groupName || m.stage || ''),
    venue: teamName(venue) || String(m.venueName || m.stadiumName || ''),
    time: fixture.date || m.time || m.date || m.utcDate || m.kickoff || m.startTime || null,
    raw: m
  };
}

function apiSportsUrl(mode) {
  const base = env('LIVE_API_BASE_URL', 'https://v3.football.api-sports.io');
  const leagueId = env('LIVE_API_LEAGUE_ID', '732');
  const season = env('LIVE_API_SEASON', '2026');
  const path = env('LIVE_API_FIXTURES_PATH', '/fixtures');
  const params = new URLSearchParams();
  params.set('league', leagueId);
  params.set('season', season);
  if (mode === 'live') params.set('live', 'all');
  return base + path + '?' + params.toString();
}

exports.liveScores = onRequest({ region: 'us-central1', timeoutSeconds: 30 }, async (req, res) => {
  Object.entries(corsHeaders).forEach(([k, v]) => res.set(k, v));
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const mode = String(req.query.mode || 'live');
    const token = env('LIVE_API_TOKEN');
    if (!token) return res.status(500).json({ error: 'LIVE_API_TOKEN is not configured' });

    const url = apiSportsUrl(mode === 'all' ? 'all' : 'live');
    const headers = {
      'Accept': 'application/json',
      'x-apisports-key': token
    };

    const apiRes = await fetch(url, { headers });
    if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'API Sports failed', status: apiRes.status });
    const payload = await apiRes.json();
    const matches = getArray(payload).map(normalizeMatch);

    return res.json({ updatedAt: Date.now(), provider: 'api-sports-football', leagueId: env('LIVE_API_LEAGUE_ID', '732'), season: env('LIVE_API_SEASON', '2026'), mode, matches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Live score error' });
  }
});
