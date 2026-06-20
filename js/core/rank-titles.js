(()=>{
  let users = [];
  let me = null;
  let unsubUsers = null;
  let unsubMe = null;
  let observer = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready = () => {
    try { return window.firebase && firebase.auth && firebase.firestore && firebase.auth().currentUser; }
    catch { return false; }
  };

  function rankTitle(coins){
    coins = Number(coins || 0);
    if (coins >= 7000) return { title:'VM KONGEN', icon:'👑', level:7 };
    if (coins >= 6000) return { title:'Legende', icon:'💎', level:6 };
    if (coins >= 5000) return { title:'Profesjonell', icon:'🏆', level:5 };
    if (coins >= 3500) return { title:'God Gambler', icon:'💰', level:4 };
    if (coins >= 2500) return { title:'Erfaren', icon:'🥈', level:3 };
    if (coins >= 1000) return { title:'Begynner', icon:'🥉', level:2 };
    return { title:'Nybegynner', icon:'‼️', level:1 };
  }

  function addCss(){
    if (document.getElementById('vmRankTitlesCss')) return;
    const style = document.createElement('style');
    style.id = 'vmRankTitlesCss';
    style.textContent = `
      .vm-rank-badge{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:5px!important;
        width:max-content!important;
        max-width:100%!important;
        margin-top:5px!important;
        padding:4px 8px!important;
        border-radius:999px!important;
        background:linear-gradient(135deg,rgba(255,216,122,.22),rgba(139,91,20,.18))!important;
        border:1px solid rgba(255,216,122,.46)!important;
        box-shadow:0 0 16px rgba(228,184,78,.20),inset 0 1px 0 rgba(255,255,255,.12)!important;
        color:#ffd77a!important;
        font-size:11px!important;
        font-weight:1000!important;
        line-height:1!important;
        letter-spacing:.035em!important;
        text-transform:uppercase!important;
        text-shadow:0 0 9px rgba(228,184,78,.34)!important;
        white-space:nowrap!important;
      }
      .vm-rank-badge.top-rank{
        background:linear-gradient(135deg,rgba(255,226,142,.36),rgba(191,134,34,.30))!important;
        border-color:rgba(255,226,142,.72)!important;
        color:#ffe28e!important;
        box-shadow:0 0 28px rgba(228,184,78,.34),inset 0 1px 0 rgba(255,255,255,.18)!important;
      }
      .vm-rank-badge.big{
        font-size:14px!important;
        padding:7px 12px!important;
        margin-top:8px!important;
        background:linear-gradient(135deg,rgba(255,216,122,.30),rgba(139,91,20,.22))!important;
        border-color:rgba(255,216,122,.58)!important;
        box-shadow:0 0 24px rgba(228,184,78,.25),inset 0 1px 0 rgba(255,255,255,.14)!important;
      }
      .vm-rank-badge.big.top-rank{
        background:linear-gradient(135deg,rgba(255,226,142,.40),rgba(191,134,34,.34))!important;
        border-color:rgba(255,226,142,.78)!important;
        box-shadow:0 0 32px rgba(228,184,78,.38),inset 0 1px 0 rgba(255,255,255,.20)!important;
      }
      .vm-rank-badge.side{
        margin:7px 0 0!important;
        font-size:12px!important;
        width:100%!important;
      }
      .vm-rank-coins{
        opacity:.80!important;
        font-size:10px!important;
        font-weight:900!important;
        text-transform:none!important;
        letter-spacing:0!important;
      }
      .leaderboard-row .vm-rank-badge{
        display:inline-flex!important;
        margin-top:5px!important;
        font-size:10.5px!important;
        padding:3px 7px!important;
      }
      .safe-rank-card strong,
      .rank-title-gold{
        background:linear-gradient(90deg,#fff0b7,#f5d07a,#b98525)!important;
        -webkit-background-clip:text!important;
        background-clip:text!important;
        color:transparent!important;
        text-shadow:0 0 18px rgba(228,184,78,.22)!important;
      }
      @media(max-width:430px){
        .vm-rank-badge{font-size:10px!important;padding:3px 7px!important;}
        .vm-rank-badge.big{font-size:13px!important;padding:6px 10px!important;}
        .leaderboard-row .vm-rank-badge{font-size:9.8px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function sortedUsers(){
    return [...users].sort((a,b) => (Number(b.coins||0) - Number(a.coins||0)) || String(a.name||'').localeCompare(String(b.name||'')));
  }

  function badgeClass(rank, extra=''){
    return `vm-rank-badge${extra}${rank.level===7?' top-rank':''}`;
  }

  function injectLeaderboard(){
    const sorted = sortedUsers();
    ['homeLeaderboard','leaderboardPageList'].forEach(id => {
      const box = document.getElementById(id);
      if (!box) return;
      [...box.querySelectorAll('.leaderboard-row')].forEach((row, i) => {
        const u = sorted[i];
        if (!u) return;
        const holder = row.querySelector('div:not(.avatar)');
        if (!holder) return;
        const r = rankTitle(u.coins);
        let badge = holder.querySelector('.vm-rank-badge');
        if (!badge) {
          badge = document.createElement('span');
          holder.appendChild(badge);
        }
        badge.className = badgeClass(r);
        badge.innerHTML = `${r.icon} ${esc(r.title)} <span class="vm-rank-coins">${Number(u.coins||0).toLocaleString('nb-NO')}</span>`;
      });
    });
  }

  function injectProfile(){
    const u = me;
    if (!u) return;
    const r = rankTitle(u.coins);

    const detail = document.querySelector('#page-profile .profile-detail');
    if (detail) {
      let badge = detail.querySelector('#vmProfileRank');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'vmProfileRank';
        const target = detail.querySelector('p') || detail.querySelector('h1') || detail;
        target.insertAdjacentElement('afterend', badge);
      }
      badge.className = badgeClass(r,' big');
      badge.innerHTML = `${r.icon} Rank: ${esc(r.title)} <span class="vm-rank-coins">${Number(u.coins||0).toLocaleString('nb-NO')} coins</span>`;
    }

    const side = document.querySelector('.side-wallet');
    if (side) {
      let sideBadge = side.querySelector('#vmSideRank');
      if (!sideBadge) {
        sideBadge = document.createElement('div');
        sideBadge.id = 'vmSideRank';
        side.appendChild(sideBadge);
      }
      sideBadge.className = badgeClass(r,' side');
      sideBadge.innerHTML = `${r.icon} ${esc(r.title)}`;
    }

    const stat = [...document.querySelectorAll('#page-profile .stat')].find(x => x.textContent.includes('Rangering') || x.textContent.includes('Rank-tittel'));
    if (stat) {
      stat.classList.add('safe-rank-card');
      const small = stat.querySelector('small');
      const strong = stat.querySelector('strong');
      if (small) small.textContent = 'Rank-tittel';
      if (strong) {
        strong.textContent = r.title;
        strong.classList.add('rank-title-gold');
      }
    }
  }

  function render(){
    addCss();
    injectLeaderboard();
    injectProfile();
  }

  function listen(){
    if (!ready()) return;
    const db = firebase.firestore();
    const u = firebase.auth().currentUser;
    if (!unsubUsers) {
      unsubUsers = db.collection('users').onSnapshot(s => {
        users = s.docs.map(d => ({ id:d.id, ...d.data() }));
        render();
      }, e => console.warn('Rank users failed', e));
    }
    if (u && !unsubMe) {
      unsubMe = db.collection('users').doc(u.uid).onSnapshot(s => {
        me = s.exists ? { id:s.id, ...s.data() } : null;
        render();
      }, e => console.warn('Rank me failed', e));
    }
  }

  function watch(){
    if (observer || !document.body) return;
    observer = new MutationObserver(() => setTimeout(render, 80));
    observer.observe(document.body, { childList:true, subtree:true });
  }

  function boot(){
    addCss();
    watch();
    if (ready()) listen();
    render();
  }

  window.VM_RANK_TITLES = { boot, render, rankTitle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  try {
    firebase.auth().onAuthStateChanged(u => {
      if (!u) { me = null; render(); return; }
      listen();
      setTimeout(boot, 400);
    });
  } catch {}
  document.addEventListener('click', e => {
    if (e.target.closest?.('[data-page="leaderboard"],[data-page="profile"],[data-page="home"]')) setTimeout(boot, 250);
  });
  setInterval(render, 4000);
})();
