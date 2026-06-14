(()=>{
  function parseScore(m){
    if(!m)return null;
    const r=m.result;
    if(typeof r==='string'){
      const n=r.match(/\d+/g);
      if(n&&n.length>=2)return [Number(n[0])||0,Number(n[1])||0];
    }
    if(r&&typeof r==='object'){
      const h=r.homeScore??r.scoreHome??r.homeGoals??r.home;
      const a=r.awayScore??r.scoreAway??r.awayGoals??r.away;
      if(h!==undefined&&a!==undefined)return [Number(h)||0,Number(a)||0];
    }
    const h=m.homeScore??m.scoreHome??m.homeGoals;
    const a=m.awayScore??m.scoreAway??m.awayGoals;
    if(h!==undefined||a!==undefined)return [Number(h)||0,Number(a)||0];
    return null;
  }
  function pick(all){
    const scored=all.find(m=>parseScore(m));
    if(scored)return scored;
    const now=Date.now();
    return all.filter(m=>m.time).sort((a,b)=>new Date(a.time)-new Date(b.time)).find(m=>new Date(m.time).getTime()<=now+115*60000)||all[0];
  }
  async function apply(){
    try{
      if(!window.firebase||!firebase.apps.length)return;
      const db=firebase.firestore();
      const card=document.getElementById('homeLiveMatchCard');
      if(!card)return;
      const snap=await db.collection('matches').get();
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      const m=pick(all); if(!m)return;
      const sc=parseScore(m); if(!sc)return;
      const score=card.querySelector('.home-live-score');
      if(score)score.innerHTML='<b>'+sc[0]+'</b><span>–</span><b>'+sc[1]+'</b>';
      const label=card.querySelector('.home-live-label');
      if(label){label.classList.remove('next');label.innerHTML='<i class="home-live-pulse"></i>LIVE NÅ'}
      const time=card.querySelector('.home-live-time');
      if(time)time.textContent='Live resultat';
    }catch(e){console.warn('home score fix',e)}
  }
  function boot(){apply();setInterval(apply,4000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
