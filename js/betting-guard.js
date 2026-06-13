(()=>{
  let db=null,auth=null,user=null,betMatchIds=new Set(),hooked=false;
  const $=id=>document.getElementById(id);
  function toast(m){let e=$('toast');if(!e)return alert(m);e.textContent=m;e.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>e.hidden=true,3800)}
  function initFirebase(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();
    auth.onAuthStateChanged(u=>{user=u;betMatchIds=new Set();if(!u)return;listenBets(u.uid)})
  }
  function listenBets(uid){
    db.collection('bets').where('userId','==',uid).onSnapshot(s=>{
      const ids=new Set();
      s.docs.forEach(d=>{const b=d.data();(b.selections||[]).forEach(x=>{if(x.matchId)ids.add(x.matchId)})});
      betMatchIds=ids;
      cleanBettingPage();
    },e=>console.warn('betting guard bets error',e));
  }
  function cardIsFinished(card){
    if(!card)return false;
    if(card.textContent.includes('Resultat:'))return true;
    return !!card.querySelector('.odd[disabled]');
  }
  function cleanBettingPage(){
    const list=$('matchList');
    if(!list)return;
    const cards=[...list.querySelectorAll('.match-card')];
    cards.forEach(card=>{
      if(cardIsFinished(card)){card.remove();return;}
      const firstOdd=card.querySelector('.odd[data-m]');
      if(!firstOdd)return;
      const matchId=firstOdd.dataset.m;
      if(betMatchIds.has(matchId)){
        card.classList.add('already-bet-match');
        card.querySelectorAll('.odd').forEach(btn=>{btn.disabled=true;btn.classList.remove('selected')});
        if(!card.querySelector('.already-bet-note')){
          const note=document.createElement('div');
          note.className='already-bet-note';
          note.textContent='Du har allerede bettet på denne kampen';
          card.appendChild(note);
        }
      }
    });
    if(!list.querySelector('.match-card')&&!list.querySelector('.empty')){
      list.innerHTML='<article class="card empty">Ingen åpne kamper å bette på akkurat nå.</article>';
    }
  }
  function injectStyles(){
    if($('bettingGuardStyles'))return;
    const s=document.createElement('style');s.id='bettingGuardStyles';s.textContent=`
      .already-bet-match{opacity:.72;position:relative}
      .already-bet-match .odd{cursor:not-allowed!important;filter:grayscale(.35)}
      .already-bet-note{margin-top:10px;border-radius:14px;padding:10px 12px;background:rgba(228,184,78,.10);border:1px solid rgba(228,184,78,.28);color:var(--gold);font-weight:850;text-align:center}
    `;document.head.appendChild(s);
  }
  function hookApp(){
    if(hooked)return;
    if(typeof window.matches!=='function'||typeof window.pick!=='function'||typeof window.bet!=='function')return;
    hooked=true;
    const oldMatches=window.matches,oldPick=window.pick,oldBet=window.bet;
    window.matches=function(){const r=oldMatches.apply(this,arguments);setTimeout(cleanBettingPage,0);return r};
    window.pick=function(id,p){if(betMatchIds.has(id)){toast('Du har allerede bettet på denne kampen.');cleanBettingPage();return}return oldPick.apply(this,arguments)};
    window.bet=function(){const dup=[...document.querySelectorAll('.odd.selected')].some(b=>betMatchIds.has(b.dataset.m));if(dup){toast('Du kan bare bette én gang per kamp.');cleanBettingPage();return}return oldBet.apply(this,arguments)};
    cleanBettingPage();
  }
  function boot(){injectStyles();initFirebase();setInterval(()=>{hookApp();cleanBettingPage()},700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
