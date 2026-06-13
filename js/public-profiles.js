(()=>{
  let db=null,auth=null,me=null,users=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=n=>Number(n||0).toLocaleString('nb-NO');
  const pct=(w,c)=>Number(c||0)>0?Math.round(Number(w||0)/Number(c||0)*100):0;
  function initFirebase(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();
    db=firebase.firestore();
    return true;
  }
  function injectStyles(){
    if(document.getElementById('publicProfilesStyles'))return;
    const s=document.createElement('style');
    s.id='publicProfilesStyles';
    s.textContent=`
      .leaderboard-row.profile-clickable{cursor:pointer;transition:transform .12s ease,border-color .12s ease,background .12s ease}
      .leaderboard-row.profile-clickable:active{transform:scale(.985)}
      .leaderboard-row.profile-clickable:hover{border-color:rgba(228,184,78,.26)!important;background:rgba(228,184,78,.055)!important}
      .profile-open-hint{display:block!important;color:var(--gold)!important;font-size:10px!important;margin-top:3px!important;text-transform:uppercase!important;letter-spacing:.05em!important;font-weight:900!important}
      .public-profile-modal[hidden]{display:none!important}
      .public-profile-modal{position:fixed;inset:0;z-index:999998;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.64);backdrop-filter:blur(7px)}
      .public-profile-panel{width:min(440px,100%);border-radius:28px;border:1px solid rgba(228,184,78,.32);background:linear-gradient(180deg,rgba(10,24,43,.98),rgba(3,9,18,.99));box-shadow:0 30px 120px rgba(0,0,0,.62);padding:20px;position:relative;overflow:hidden}
      .public-profile-panel:before{content:"";position:absolute;right:-58px;top:-58px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(228,184,78,.22),transparent 68%)}
      .public-profile-close{position:absolute;right:14px;top:14px;z-index:2;width:42px;height:42px;border-radius:15px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);color:var(--text);font-size:26px;line-height:1}
      .public-profile-top{position:relative;z-index:1;display:flex;gap:14px;align-items:center;padding-right:42px}
      .public-profile-avatar{width:74px;height:74px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.12),rgba(228,184,78,.14));border:1px solid rgba(228,184,78,.35);color:var(--gold);font-size:32px;font-weight:950}
      .public-profile-name small{display:block;color:var(--gold);font-weight:900;text-transform:uppercase;letter-spacing:.10em;font-size:11px}
      .public-profile-name h2{margin:3px 0 0;font-size:30px;letter-spacing:-.05em}
      .public-profile-rank{margin-top:7px;display:inline-flex;min-height:25px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(228,184,78,.12);border:1px solid rgba(228,184,78,.25);color:var(--gold);font-weight:900;font-size:12px}
      .public-profile-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
      .public-profile-stat{border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.075);padding:13px;text-align:center}
      .public-profile-stat small{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:850}
      .public-profile-stat b{display:block;margin-top:5px;color:var(--text);font-size:21px;letter-spacing:-.04em}
      .public-profile-stat.gold b{color:var(--gold)}
      .public-profile-footer{position:relative;z-index:1;margin-top:14px;border-radius:18px;background:rgba(228,184,78,.08);border:1px solid rgba(228,184,78,.18);padding:12px;color:#dfe5ef;font-weight:750;line-height:1.4}
      @media(max-width:430px){.public-profile-panel{border-radius:24px;padding:17px}.public-profile-avatar{width:66px;height:66px}.public-profile-name h2{font-size:25px}.public-profile-grid{gap:8px}.public-profile-stat{padding:11px 7px}.public-profile-stat b{font-size:18px}}
    `;
    document.head.appendChild(s);
  }
  function normalize(d,id){
    const completed=Number(d.completedBets||0),won=Number(d.wonBets||0);
    return{uid:d.uid||id,name:d.name||d.email?.split('@')[0]||'Spiller',email:d.email||'',coins:Number(d.coins||0),elo:Number(d.elo||1000),placedBets:Number(d.placedBets||0),wonBets:won,completedBets:completed,netProfit:Number(d.netProfit||0),hitRate:pct(won,completed)};
  }
  function modal(){
    let m=document.getElementById('publicProfileModal');
    if(m)return m;
    m=document.createElement('div');
    m.id='publicProfileModal';
    m.className='public-profile-modal';
    m.hidden=true;
    m.innerHTML='<div class="public-profile-panel"><button class="public-profile-close" aria-label="Lukk">×</button><div id="publicProfileContent"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});
    m.querySelector('.public-profile-close').onclick=()=>m.hidden=true;
    return m;
  }
  function openProfile(uid){
    const u=users.find(x=>x.uid===uid);
    if(!u)return;
    const sorted=[...users].sort((a,b)=>b.coins-a.coins);
    const rank=sorted.findIndex(x=>x.uid===uid)+1;
    const isMe=me&&me.uid===uid;
    const m=modal();
    m.querySelector('#publicProfileContent').innerHTML=`
      <div class="public-profile-top">
        <div class="public-profile-avatar">${esc((u.name||'S').slice(0,1).toUpperCase())}</div>
        <div class="public-profile-name">
          <small>${isMe?'Din profil':'Spillerprofil'}</small>
          <h2>${esc(u.name)}</h2>
          <span class="public-profile-rank">#${rank||'-'} på leaderboard</span>
        </div>
      </div>
      <div class="public-profile-grid">
        <div class="public-profile-stat gold"><small>VM Coins</small><b>${fmt(u.coins)}</b></div>
        <div class="public-profile-stat gold"><small>Gambling Rating</small><b>${fmt(u.elo)}</b></div>
        <div class="public-profile-stat"><small>Plasserte spill</small><b>${fmt(u.placedBets)}</b></div>
        <div class="public-profile-stat"><small>Vinnprosent</small><b>${u.hitRate}%</b></div>
        <div class="public-profile-stat"><small>Vunnede</small><b>${fmt(u.wonBets)}</b></div>
        <div class="public-profile-stat ${u.netProfit>=0?'gold':''}"><small>Netto</small><b>${fmt(u.netProfit)}</b></div>
      </div>
      <div class="public-profile-footer">Trykk på spillere i leaderboardet for å se profilen deres. Dette viser offentlig venneliga-statistikk, ikke privat innloggingsinfo.</div>
    `;
    m.hidden=false;
  }
  function enhanceLeaderboard(){
    document.querySelectorAll('.leaderboard-row').forEach(row=>{
      if(row.dataset.publicProfileReady==='1')return;
      const bs=[...row.querySelectorAll('b')];
      const name=(bs[1]?.textContent||'').trim();
      if(!name)return;
      const u=users.find(x=>x.name===name);
      if(!u)return;
      row.dataset.publicProfileReady='1';
      row.dataset.profileUid=u.uid;
      row.classList.add('profile-clickable');
      row.setAttribute('role','button');
      row.setAttribute('tabindex','0');
      row.title='Åpne profil for '+u.name;
      const info=row.querySelector('small');
      if(info&&!row.querySelector('.profile-open-hint'))info.insertAdjacentHTML('afterend','<small class="profile-open-hint">Trykk for profil</small>');
      row.addEventListener('click',()=>openProfile(u.uid));
      row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProfile(u.uid)}});
    });
  }
  function listen(){
    auth.onAuthStateChanged(u=>{me=u||null});
    db.collection('users').onSnapshot(s=>{
      users=s.docs.map(d=>normalize(d.data(),d.id));
      enhanceLeaderboard();
    },console.warn);
    setInterval(enhanceLeaderboard,900);
  }
  function boot(){if(!initFirebase())return;injectStyles();modal();listen()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
