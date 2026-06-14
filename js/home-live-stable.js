(()=>{
  let lastKey='';
  function stable(){
    const line=document.querySelector('.home-live-tvline');
    if(!line)return;
    line.style.transition='none';
    line.style.animation='none';
    line.style.willChange='auto';
    const key=line.textContent.trim();
    if(lastKey&&lastKey===key)return;
    lastKey=key;
  }
  function lock(){
    stable();
    const card=document.getElementById('homeLiveMatchCard');
    if(!card)return;
    const observer=new MutationObserver(()=>stable());
    observer.observe(card,{childList:true,subtree:true,characterData:true});
  }
  function boot(){
    stable();
    setTimeout(lock,1200);
    setInterval(stable,5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
