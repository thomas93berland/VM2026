(()=>{
  function style(){
    if(document.getElementById('homeLiveCleanNamesStyle'))return;
    const s=document.createElement('style');
    s.id='homeLiveCleanNamesStyle';
    s.textContent=`
      #homeLiveMatchCard .home-live-score{display:none!important}
      #homeLiveMatchCard .home-live-scoreboard{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:9px!important;margin:9px 0 11px!important}
      #homeLiveMatchCard .home-live-team{color:var(--gold)!important;background:linear-gradient(135deg,rgba(228,184,78,.18),rgba(228,184,78,.055))!important;border:1px solid rgba(228,184,78,.36)!important;font-size:21px!important;font-weight:1000!important;letter-spacing:-.035em!important;text-shadow:0 3px 9px rgba(0,0,0,.70)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.04),0 10px 24px rgba(0,0,0,.16)!important}
      #homeLiveMatchCard .home-live-team:last-child{text-align:right!important}
      #homeLiveMatchCard .home-live-label{font-weight:1000!important}
      #homeLiveMatchCard .home-live-meta{border-top:1px solid rgba(228,184,78,.16)!important;padding-top:9px!important}
      @media(max-width:520px){
        #homeLiveMatchCard .home-live-scoreboard{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:7px!important}
        #homeLiveMatchCard .home-live-team{font-size:17px!important;min-height:48px!important;padding:11px 9px!important;display:flex!important;align-items:center!important}
        #homeLiveMatchCard .home-live-team:last-child{justify-content:flex-end!important;text-align:right!important}
      }
    `;
    document.head.appendChild(s);
  }
  function clean(){
    style();
    const card=document.getElementById('homeLiveMatchCard');
    if(!card)return;
    card.querySelectorAll('.home-live-score').forEach(e=>{e.style.display='none'});
    card.querySelectorAll('.home-live-team').forEach(e=>{
      e.setAttribute('title',e.textContent.trim());
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();
  new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(clean,1500);
})();
