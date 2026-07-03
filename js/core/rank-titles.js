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
      .vm-rank-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:max-content!important;max-width:100%!important;margin-top:5px!important;padding:4px 8px!important;border-radius:999px!important;background:linear-gradient(135deg,rgba(255,216,122,.22),rgba(139,91,20,.18))!important;border:1px solid rgba(255,216,122,.46)!important;box-shadow:0 0 16px rgba(228,184,78,.20),inset 0 1px 0 rgba(255,255,255,.12)!important;color:#ffd77a!important;font-size:11px!important;font-weight:1000!important;line-height:1!important;letter-spacing:.035em!important;text-transform:uppercase!important;text-shadow:0 0 9px rgba(228,184,78,.34)!important;white-space:nowrap!important;}
      .vm-rank-badge.top-rank{background:linear-gradient(135deg,rgba(255,226,142,.36),rgba(191,134,34,.30))!important;border-color:rgba(255,226,142,.72)!important;color:#ffe28e!important;box-shadow:0 0 28px rgba(228,184,78,.34),inset 0 1px 0 rgba(255,255,255,.18)!important;}
      .vm-rank-badge.big{font-size:14px!important;padding:7px 12px!important;margin-top:8px!important;background:linear-gradient(135deg,rgba(255,216,122,.30),rgba(139,91,20,.22))!important;border-color:rgba(255,216,122,.58)!important;box-shadow:0 0 24px rgba(228,184,78,.25),inset 0 1px 0 rgba(255,255,255,.14)!important;}
      .vm-rank-badge.big.top-rank{background:linear-gradient(135deg,rgba(255,226,142,.40),rgba(191,134,34,.34))!important;border-color:rgba(255,226,142,.78)!important;box-shadow:0 0 32px rgba(228,184,78,.38),inset 0 1px 0 rgba(255,255,255,.20)!important;}
      .vm-rank-badge.side{margin:7px 0 0!important;font-size:12px!important;width:100%!important;}
      .vm-rank-coins{opacity:.80!important;font-size:10px!important;font-weight:900!important;text-transform:none!important;letter-spacing:0!important;}
      .leaderboard-row .vm-rank-badge{display:inline-flex!important;margin-top:5px!important;font-size:10.5px!important;padding:3px 7px!important;}
      .safe-rank-card strong,.rank-title-gold{background:linear-gradient(90deg,#fff0b7,#f5d07a,#b98525)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;text-shadow:0 0 18px rgba(228,184,78,.22)!important;}

      #vmLoungeHeaderLogo.vm-lounge-strip{height:58px!important;width:100%!important;margin:0 0 18px!important;padding:0 14px!important;border-radius:22px!important;border:1px solid rgba(255,216,122,.24)!important;background:radial-gradient(circle at 12% 18%,rgba(255,216,122,.22),transparent 28%),linear-gradient(135deg,rgba(14,35,64,.96),rgba(5,13,26,.98) 52%,rgba(9,22,40,.96))!important;box-shadow:0 16px 44px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px rgba(255,216,122,.035)!important;display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;position:relative!important;overflow:hidden!important;isolation:isolate!important;}
      #vmLoungeHeaderLogo.vm-lounge-strip::before{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,transparent,rgba(255,216,122,.13),transparent)!important;transform:translateX(-80%) skewX(-18deg)!important;animation:vmLogoShine 5.8s ease-in-out infinite!important;z-index:-1!important;}
      #vmLoungeHeaderLogo.vm-lounge-strip::after{content:""!important;position:absolute!important;inset:0!important;background:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 1px,transparent 1px 12px)!important;opacity:.20!important;z-index:-2!important;}
      .vm-lounge-mark{width:44px!important;height:44px!important;border-radius:15px!important;display:grid!important;place-items:center!important;position:relative!important;flex:0 0 44px!important;background:radial-gradient(circle at 35% 18%,#fff1ba 0,#f2c768 30%,#b88425 62%,#1d1203 100%)!important;border:1px solid rgba(255,234,162,.62)!important;box-shadow:0 0 24px rgba(228,184,78,.26),inset 0 1px 0 rgba(255,255,255,.35)!important;color:#07111f!important;}
      .vm-lounge-mark b{font-family:Georgia,'Times New Roman',serif!important;font-size:20px!important;line-height:1!important;font-weight:1000!important;letter-spacing:-.12em!important;text-shadow:0 1px 0 rgba(255,255,255,.25)!important;transform:translateX(-1px)!important;}
      .vm-lounge-mark i{position:absolute!important;right:5px!important;top:5px!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#ffe28e!important;box-shadow:0 0 12px rgba(255,216,122,.95)!important;}
      .vm-lounge-title{min-width:0!important;display:grid!important;gap:1px!important;}
      .vm-lounge-title small{display:block!important;color:rgba(255,216,122,.82)!important;font-size:9px!important;font-weight:1000!important;letter-spacing:.22em!important;text-transform:uppercase!important;line-height:1!important;}
      .vm-lounge-title strong{display:block!important;width:max-content!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(22px,5vw,32px)!important;line-height:.98!important;font-weight:1000!important;letter-spacing:-.055em!important;background:linear-gradient(90deg,#fff4bf,#f0c35c 55%,#b88425)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;text-shadow:0 0 24px rgba(228,184,78,.18)!important;}
      .vm-lounge-bet-tag{height:36px!important;min-width:92px!important;border-radius:14px!important;border:1px solid rgba(255,216,122,.24)!important;background:linear-gradient(135deg,rgba(255,216,122,.12),rgba(255,255,255,.035))!important;color:#f8d36f!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;padding:0 10px!important;font-size:10px!important;font-weight:1000!important;letter-spacing:.075em!important;text-transform:uppercase!important;white-space:nowrap!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;}
      .vm-lounge-bars{width:18px!important;height:18px!important;display:flex!important;align-items:flex-end!important;gap:2px!important;position:relative!important;flex:0 0 18px!important;}
      .vm-lounge-bars span{width:4px!important;border-radius:999px 999px 2px 2px!important;background:linear-gradient(180deg,#fff0b7,#c8922c)!important;box-shadow:0 0 8px rgba(228,184,78,.28)!important;}
      .vm-lounge-bars span:nth-child(1){height:7px!important;}.vm-lounge-bars span:nth-child(2){height:11px!important;}.vm-lounge-bars span:nth-child(3){height:15px!important;}
      .vm-lounge-bars::after{content:""!important;position:absolute!important;right:-2px!important;top:0!important;width:7px!important;height:7px!important;border-top:2px solid #ffe28e!important;border-right:2px solid #ffe28e!important;transform:rotate(0deg)!important;}

      #vmBettingNightPoster.vm-betting-poster-card{margin:0 0 16px!important;padding:10px!important;border-radius:26px!important;border:1px solid rgba(255,216,122,.26)!important;background:linear-gradient(180deg,rgba(12,26,45,.78),rgba(5,13,24,.92))!important;box-shadow:0 20px 70px rgba(0,0,0,.35),0 0 26px rgba(228,184,78,.10)!important;overflow:hidden!important;}
      #vmBettingNightPoster img{display:block!important;width:100%!important;height:auto!important;max-height:620px!important;object-fit:cover!important;object-position:top center!important;border-radius:20px!important;border:1px solid rgba(255,216,122,.18)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;}
      @keyframes vmLogoShine{0%,62%{transform:translateX(-85%) skewX(-18deg);opacity:0;}74%{opacity:.9;}100%{transform:translateX(110%) skewX(-18deg);opacity:0;}}
      @media(max-width:620px){#vmBettingNightPoster.vm-betting-poster-card{padding:7px!important;border-radius:22px!important;}#vmBettingNightPoster img{max-height:none!important;border-radius:17px!important;}}
      @media(max-width:430px){.vm-rank-badge{font-size:10px!important;padding:3px 7px!important;}.vm-rank-badge.big{font-size:13px!important;padding:6px 10px!important;}.leaderboard-row .vm-rank-badge{font-size:9.8px!important;}#vmLoungeHeaderLogo.vm-lounge-strip{height:58px!important;padding:0 12px!important;gap:10px!important;}.vm-lounge-mark{width:42px!important;height:42px!important;flex-basis:42px!important;}.vm-lounge-title strong{font-size:25px!important;}.vm-lounge-bet-tag{min-width:82px!important;height:34px!important;font-size:9px!important;padding:0 8px!important;}.vm-lounge-bars{display:none!important;}}
      @media(max-width:355px){.vm-lounge-bet-tag{display:none!important;}.vm-lounge-title strong{font-size:27px!important;}}
    `;
    document.head.appendChild(style);
  }

  function installHeaderLogo(){
    const main = document.querySelector('.main');
    if (!main) return;
    const search = main.querySelector(':scope > .search') || document.querySelector('.search');
    let strip = document.getElementById('vmLoungeHeaderLogo');
    if (!strip) {
      strip = document.createElement('div');
      strip.id = 'vmLoungeHeaderLogo';
      strip.className = 'vm-lounge-strip';
      strip.setAttribute('role', 'img');
      strip.setAttribute('aria-label', 'TheLounge VM 2026 The Best Bet');
      strip.innerHTML = `<div class="vm-lounge-mark" aria-hidden="true"><b>TL</b><i></i></div><div class="vm-lounge-title"><small>VM 2026</small><strong>TheLounge</strong></div><div class="vm-lounge-bet-tag" aria-hidden="true"><span class="vm-lounge-bars"><span></span><span></span><span></span></span><b>The Best Bet</b></div>`;
    }
    if (search) { search.replaceWith(strip); return; }
    if (!strip.isConnected) {
      const topbar = main.querySelector('.topbar');
      if (topbar) topbar.insertAdjacentElement('afterend', strip);
      else main.prepend(strip);
    }
  }

  function installBettingPoster(){
    const page = document.getElementById('page-betting');
    if (!page) return;
    page.querySelectorAll('.betting-poster,.betting-hero-image,.vm-betting-night-poster').forEach(el => { if (el.id !== 'vmBettingNightPoster') el.remove(); });
    let poster = document.getElementById('vmBettingNightPoster');
    if (!poster) {
      poster = document.createElement('article');
      poster.id = 'vmBettingNightPoster';
      poster.className = 'vm-betting-poster-card vm-betting-night-poster';
      poster.innerHTML = '<img src="assets/vm-kamper-ikveld.svg?v=1" alt="VM-kamper i kveld – fire kamper, full spenning" loading="eager" />';
    }
    const head = page.querySelector('.page-head');
    if (head && head.nextElementSibling !== poster) head.insertAdjacentElement('afterend', poster);
    else if (!poster.isConnected) page.prepend(poster);
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
      const box = document.getElementById(id); if (!box) return;
      [...box.querySelectorAll('.leaderboard-row')].forEach((row, i) => {
        const u = sorted[i]; if (!u) return;
        const holder = row.querySelector('div:not(.avatar)'); if (!holder) return;
        const r = rankTitle(u.coins);
        let badge = holder.querySelector('.vm-rank-badge');
        if (!badge) { badge = document.createElement('span'); holder.appendChild(badge); }
        badge.className = badgeClass(r);
        badge.innerHTML = `${r.icon} ${esc(r.title)} <span class="vm-rank-coins">${Number(u.coins||0).toLocaleString('nb-NO')}</span>`;
      });
    });
  }
  function injectProfile(){
    const u = me; if (!u) return;
    const r = rankTitle(u.coins);
    const detail = document.querySelector('#page-profile .profile-detail');
    if (detail) {
      let badge = detail.querySelector('#vmProfileRank');
      if (!badge) { badge = document.createElement('div'); badge.id = 'vmProfileRank'; const target = detail.querySelector('p') || detail.querySelector('h1') || detail; target.insertAdjacentElement('afterend', badge); }
      badge.className = badgeClass(r,' big');
      badge.innerHTML = `${r.icon} Rank: ${esc(r.title)} <span class="vm-rank-coins">${Number(u.coins||0).toLocaleString('nb-NO')} coins</span>`;
    }
    const side = document.querySelector('.side-wallet');
    if (side) {
      let sideBadge = side.querySelector('#vmSideRank');
      if (!sideBadge) { sideBadge = document.createElement('div'); sideBadge.id = 'vmSideRank'; side.appendChild(sideBadge); }
      sideBadge.className = badgeClass(r,' side');
      sideBadge.innerHTML = `${r.icon} ${esc(r.title)}`;
    }
    const stat = [...document.querySelectorAll('#page-profile .stat')].find(x => x.textContent.includes('Rangering') || x.textContent.includes('Rank-tittel'));
    if (stat) {
      stat.classList.add('safe-rank-card');
      const small = stat.querySelector('small');
      const strong = stat.querySelector('strong');
      if (small) small.textContent = 'Rank-tittel';
      if (strong) { strong.textContent = r.title; strong.classList.add('rank-title-gold'); }
    }
  }

  function render(){ addCss(); installHeaderLogo(); installBettingPoster(); injectLeaderboard(); injectProfile(); }
  function listen(){
    if (!ready()) return;
    const db = firebase.firestore();
    const u = firebase.auth().currentUser;
    if (!unsubUsers) unsubUsers = db.collection('users').onSnapshot(s => { users = s.docs.map(d => ({ id:d.id, ...d.data() })); render(); }, e => console.warn('Rank users failed', e));
    if (u && !unsubMe) unsubMe = db.collection('users').doc(u.uid).onSnapshot(s => { me = s.exists ? { id:s.id, ...s.data() } : null; render(); }, e => console.warn('Rank me failed', e));
  }
  function watch(){
    if (observer || !document.body) return;
    observer = new MutationObserver(() => setTimeout(render, 80));
    observer.observe(document.body, { childList:true, subtree:true });
  }
  function loadUpcomingSeeder(){
    if (document.querySelector('script[src*="upcoming-match-seed.js"]')) return;
    const script = document.createElement('script');
    script.src = 'js/core/upcoming-match-seed.js?v=4';
    script.defer = true;
    document.body.appendChild(script);
  }
  function boot(){ addCss(); installHeaderLogo(); installBettingPoster(); watch(); loadUpcomingSeeder(); if (ready()) listen(); render(); }

  window.VM_RANK_TITLES = { boot, render, rankTitle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  try { firebase.auth().onAuthStateChanged(u => { if (!u) { me = null; render(); return; } listen(); setTimeout(boot, 400); }); } catch {}
  document.addEventListener('click', e => { if (e.target.closest?.('[data-page="leaderboard"],[data-page="profile"],[data-page="home"],[data-page="betting"]')) setTimeout(boot, 250); });
  setInterval(render, 4000);
})();
