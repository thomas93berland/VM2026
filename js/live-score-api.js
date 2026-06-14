(()=>{
  const FN_URL = window.VM_LIVE_SCORE_FUNCTION_URL || 'https://us-central1-the-club-17c87.cloudfunctions.net/liveScores';
  let lastMatches=[];
  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9æøå]/g,'')}
  function score(m){
    const h=m?.homeScore, a=m?.awayScore;
    if(h===null||h===undefined||a===null||a===undefined)return null;
    return [Number(h)||0,Number(a)||0];
  }
  function findLocal(apiMatch, localMatches){
    const h=norm(apiMatch.home), a=norm(apiMatch.away);
    return localMatches.find(m=>{
      const mh=norm(m.home), ma=norm(m.away);
      return (mh===h&&ma===a)||(mh===a&&ma===h)||((mh.includes(h)||h.includes(mh))&&(ma.includes(a)||a.includes(ma)));
    });
  }
  function updateHome(matches){
    const m=matches.find(x=>score(x))||matches[0];
    if(!m)return;
    const sc=score(m);
    const card=document.getElementById('homeLiveMatchCard');
    if(!card||!sc)return;
    const teams=card.querySelectorAll('.home-live-team');
    if(teams[0])teams[0].textContent=m.home||teams[0].textContent;
    if(teams[1])teams[1].textContent=m.away||teams[1].textContent;
    const box=card.querySelector('.home-live-score');
    if(box)box.innerHTML='<b>'+sc[0]+'</b><span>–</span><b>'+sc[1]+'</b>';
    const label=card.querySelector('.home-live-label');
    if(label){label.classList.remove('next');label.innerHTML='<i class="home-live-pulse"></i>LIVE NÅ'}
    const time=card.querySelector('.home-live-time');
    if(time)time.textContent='Live fra API';
  }
  async function updateFirestore(matches){
    try{
      if(!window.firebase||!firebase.apps.length)return;
      const auth=firebase.auth(); const u=auth.currentUser; if(!u)return;
      const db=firebase.firestore();
      const me=await db.collection('users').doc(u.uid).get();
      if(!me.exists||me.data().isAdmin!==true)return;
      const snap=await db.collection('matches').get();
      const local=snap.docs.map(d=>({id:d.id,...d.data()}));
      for(const apiMatch of matches){
        const sc=score(apiMatch); if(!sc)continue;
        const localMatch=findLocal(apiMatch,local); if(!localMatch)continue;
        await db.collection('matches').doc(localMatch.id).set({
          homeScore:sc[0],
          awayScore:sc[1],
          liveStatus:apiMatch.status||'LIVE',
          venue:apiMatch.venue||localMatch.venue||'',
          apiId:apiMatch.apiId||localMatch.apiId||'',
          updatedFromLiveApiAtMs:Date.now(),
          updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        },{merge:true});
      }
    }catch(e){console.warn('live api firestore update',e)}
  }
  async function poll(){
    try{
      const res=await fetch(FN_URL+'?mode=live&ts='+Date.now(),{cache:'no-store'});
      if(!res.ok)throw new Error('Live score API '+res.status);
      const data=await res.json();
      lastMatches=Array.isArray(data.matches)?data.matches:[];
      updateHome(lastMatches);
      updateFirestore(lastMatches);
      window.VM_LIVE_API_MATCHES=lastMatches;
    }catch(e){console.warn('live score api',e)}
  }
  function boot(){poll();setInterval(poll,30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
