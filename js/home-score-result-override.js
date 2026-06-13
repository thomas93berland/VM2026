(()=>{
  function parse(m){
    const r=m&&m.result;
    if(typeof r==='string'){
      const n=r.match(/\d+/g);
      if(n&&n.length>1)return [Number(n[0]),Number(n[1])];
    }
    if(r&&typeof r==='object'){
      const h=r.homeScore??r.scoreHome??r.homeGoals??r.home;
      const a=r.awayScore??r.scoreAway??r.awayGoals??r.away;
      if(h!==undefined&&a!==undefined)return [Number(h),Number(a)];
    }
    return null;
  }
  function draw(m,score){
    const card=document.getElementById('homeLiveMatchCard');
    if(!card||!score)return;
    const label=card.querySelector('.home-live-label');
    const time=card.querySelector('.home-live-time');
    const teams=card.querySelectorAll('.home-live-team');
    const middle=card.querySelector('.home-live-score,.home-live-vs');
    if(label){label.classList.remove('next');label.innerHTML='<i class="home-live-pulse"></i>LIVE NÅ'}
    if(time)time.textContent='Registrert resultat';
    if(teams[0])teams[0].textContent=m.home||'Hjemme';
    if(teams[1])teams[1].textContent=m.away||'Borte';
    if(middle){middle.className='home-live-score';middle.innerHTML='<b>'+score[0]+'</b><span>–</span><b>'+score[1]+'</b>'}
  }
  function run(){
    try{
      if(typeof firebase==='undefined'||!firebase.apps.length)return;
      firebase.firestore().collection('matches').get().then(snap=>{
        let found=null,score=null;
        snap.docs.some(d=>{const m={id:d.id,...d.data()};const s=parse(m);if(s){found=m;score=s;return true}return false});
        if(found)draw(found,score);
      });
    }catch(e){console.warn(e)}
  }
  function boot(){run();setInterval(run,3000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
