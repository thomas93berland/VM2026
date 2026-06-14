(()=>{
  function channelFor(match){
    const explicit=match?.channel||match?.tvChannel||match?.broadcaster||match?.norwayChannel;
    if(explicit)return String(explicit);
    return 'NRK / TV 2 Play';
  }
  function scoreText(match){
    const r=match?.result;
    if(typeof r==='string'){
      const n=r.match(/\d+/g);
      if(n&&n.length>=2)return n[0]+'–'+n[1];
    }
    if(r&&typeof r==='object'){
      const h=r.homeScore??r.scoreHome??r.homeGoals??r.home;
      const a=r.awayScore??r.scoreAway??r.awayGoals??r.away;
      if(h!==undefined&&a!==undefined)return Number(h)+'–'+Number(a);
    }
    const h=match?.homeScore??match?.scoreHome??match?.homeGoals;
    const a=match?.awayScore??match?.scoreAway??match?.awayGoals;
    if(h!==undefined||a!==undefined)return Number(h||0)+'–'+Number(a||0);
    return null;
  }
  function css(){
    if(document.getElementById('homeLiveTvStyle'))return;
    const s=document.createElement('style');
    s.id='homeLiveTvStyle';
    s.textContent='.home-live-tvline{position:relative;z-index:2;margin-top:10px;padding:9px 10px;border-radius:15px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.075);display:flex;align-items:center;justify-content:space-between;gap:8px;color:#dfe5ef;font-size:12px;font-weight:850}.home-live-tvline b{color:var(--gold)}.home-live-scoreline{color:#ff7777;font-weight:950}@media(max-width:520px){.home-live-tvline{font-size:11px;align-items:flex-start;flex-direction:column;gap:4px}}';
    document.head.appendChild(s);
  }
  async function apply(){
    try{
      css();
      if(typeof firebase==='undefined'||!firebase.apps.length)return;
      const card=document.getElementById('homeLiveMatchCard');
      if(!card)return;
      const snap=await firebase.firestore().collection('matches').get();
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      const live=all.find(m=>scoreText(m))||all.find(m=>!m.result)||all[0];
      if(!live)return;
      let line=card.querySelector('.home-live-tvline');
      if(!line){line=document.createElement('div');line.className='home-live-tvline';card.appendChild(line)}
      const score=scoreText(live)||'Live resultat kommer';
      line.innerHTML='<span class="home-live-scoreline">Live resultat: <b>'+score+'</b></span><span>Vises i Norge: <b>'+channelFor(live)+'</b></span>';
    }catch(e){console.warn('home live tv',e)}
  }
  function boot(){apply();setInterval(apply,4000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
