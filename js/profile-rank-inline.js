(()=>{
  let db=null,auth=null,stop=null;
  const ranks=[['Rookie',0],['Bronze',900],['Silver',1100],['Gold',1300],['Elite',1600],['Legend',2000]];
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function rankName(elo){let r=ranks[0][0];for(const x of ranks){if(elo>=x[1])r=x[0]}return r}
  function css(){
    if(document.getElementById('profileRankInlineCss'))return;
    const s=document.createElement('style');
    s.id='profileRankInlineCss';
    s.textContent='.profile-rank-inline{display:inline-flex;align-items:center;gap:7px;margin-top:8px;padding:7px 10px;border-radius:999px;background:rgba(228,184,78,.13);border:1px solid rgba(228,184,78,.28);color:var(--gold);font-size:12px;font-weight:950}.profile-rank-inline b{color:#fff}.profile-rank-card,#profileRankCard{display:none!important}.profile-detail [data-bind="elo"],.profile-detail .elo-bar{display:none!important}';
    document.head.appendChild(s);
  }
  function render(u){
    css();
    document.querySelectorAll('.profile-rank-card,#profileRankCard').forEach(x=>x.remove());
    const detail=document.querySelector('#page-profile .profile-detail');
    if(!detail)return;
    let target=detail.querySelector('h1[data-bind="name"]')?.parentElement||detail;
    let el=document.getElementById('profileRankInline');
    if(!el){el=document.createElement('div');el.id='profileRankInline';el.className='profile-rank-inline';target.appendChild(el)}
    const elo=Number(u.gamblingElo??u.elo??1000);
    el.innerHTML='Gambling rank: <b>'+rankName(elo)+'</b> · '+elo+' ELO';
  }
  function boot(){
    if(!init())return;
    css();
    auth.onAuthStateChanged(u=>{
      if(stop){try{stop()}catch(e){}}
      if(!u)return;
      stop=db.collection('users').doc(u.uid).onSnapshot(s=>{if(s.exists)render(s.data())});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
