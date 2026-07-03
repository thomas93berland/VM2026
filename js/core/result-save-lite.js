(()=>{
  if(window.VM_RESULT_SAVE_LITE_RELOADER)return;
  window.VM_RESULT_SAVE_LITE_RELOADER=true;

  function loadClickFix(){
    try{
      if(document.querySelector('script[src*="result-click-fix.js"]')){
        setTimeout(()=>window.VM_RESULT_CLICK_FIX?.boot?.(),250);
        return;
      }
      const s=document.createElement('script');
      s.src='js/core/result-click-fix.js?v=1';
      s.defer=true;
      s.onload=()=>setTimeout(()=>window.VM_RESULT_CLICK_FIX?.boot?.(),250);
      document.body.appendChild(s);
    }catch(e){console.warn('Could not load result click fix',e)}
  }

  function boot(){
    loadClickFix();
    setTimeout(()=>window.VM_RESULT_CLICK_FIX?.boot?.(),700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm'))setTimeout(boot,250)});
})();
