(()=>{
  const FLAGS={
    'brasil':'🇧🇷','brazil':'🇧🇷','frankrike':'🇫🇷','france':'🇫🇷','argentina':'🇦🇷','tyskland':'🇩🇪','germany':'🇩🇪','portugal':'🇵🇹','uruguay':'🇺🇾','norge':'🇳🇴','norway':'🇳🇴','irak':'🇮🇶','iraq':'🇮🇶','senegal':'🇸🇳','mexico':'🇲🇽','sør-afrika':'🇿🇦','south africa':'🇿🇦','sør korea':'🇰🇷','south korea':'🇰🇷','czechia':'🇨🇿','czech republic':'🇨🇿','canada':'🇨🇦','qatar':'🇶🇦','sveits':'🇨🇭','switzerland':'🇨🇭','usa':'🇺🇸','united states':'🇺🇸','paraguay':'🇵🇾','australia':'🇦🇺','tyrkia':'🇹🇷','turkey':'🇹🇷','marokko':'🇲🇦','morocco':'🇲🇦','haiti':'🇭🇹','skottland':'🏴','scotland':'🏴','nederland':'🇳🇱','netherlands':'🇳🇱','japan':'🇯🇵','sverige':'🇸🇪','sweden':'🇸🇪','tunisia':'🇹🇳','belgia':'🇧🇪','belgium':'🇧🇪','egypt':'🇪🇬','iran':'🇮🇷','new zealand':'🇳🇿','spania':'🇪🇸','spain':'🇪🇸','uruguay':'🇺🇾','saudi arabia':'🇸🇦','cape verde':'🇨🇻','algeria':'🇩🇿','austria':'🇦🇹','jordan':'🇯🇴','england':'🏴','croatia':'🇭🇷','ghana':'🇬🇭','panama':'🇵🇦','ecuador':'🇪🇨','ivory coast':'🇨🇮','cote d\'ivoire':'🇨🇮','curacao':'🇨🇼','dr congo':'🇨🇩','colombia':'🇨🇴','uzbekistan':'🇺🇿'};
  const clean=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
  const flag=name=>FLAGS[clean(name)]||'⚽';
  const text=el=>String(el?.textContent||'').replace(/^\s*[^\p{L}\p{N}]+/u,'').trim();
  function status(card){
    const top=card.querySelector('.match-top');
    if(!top)return;
    let old=top.querySelector('.safe-status-badge');
    if(!old){old=document.createElement('span');old.className='safe-status-badge';top.appendChild(old)}
    const isDone=/Resultat:/i.test(card.textContent||'');
    if(isDone){old.textContent='Ferdig';old.className='safe-status-badge done';return}
    const dateText=Array.from(top.querySelectorAll('small')).map(x=>x.textContent||'').join(' ');
    old.textContent='Åpen';old.className='safe-status-badge open';
    if(/nå|live/i.test(dateText)){old.textContent='LIVE';old.className='safe-status-badge live'}
    if(/i dag|today|snart/i.test(dateText)){old.textContent='Snart';old.className='safe-status-badge soon'}
  }
  function teams(card){
    const box=card.querySelector('.teams');
    if(!box||box.dataset.safeFlags==='1')return;
    const home=box.querySelector('strong:first-child'),away=box.querySelector('strong:last-child');
    if(home&&!home.querySelector('.team-flag'))home.innerHTML='<span class="team-flag">'+flag(text(home))+'</span><span class="team-name">'+home.innerHTML+'</span>';
    if(away&&!away.querySelector('.team-flag'))away.innerHTML='<span class="team-name">'+away.innerHTML+'</span><span class="team-flag">'+flag(text(away))+'</span>';
    box.dataset.safeFlags='1';
  }
  function polish(){document.querySelectorAll('#page-betting .match-card').forEach(card=>{teams(card);status(card);card.classList.add('safe-polished-match')})}
  function start(){polish();const list=document.getElementById('matchList');if(list&&!list.dataset.safeBettingObserver){list.dataset.safeBettingObserver='1';new MutationObserver(()=>polish()).observe(list,{childList:true,subtree:true})}setTimeout(polish,300);setTimeout(polish,1000);setTimeout(polish,2200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
