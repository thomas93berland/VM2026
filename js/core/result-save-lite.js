(()=>{
  if(window.VM_RESULT_SAVE_LITE_RELOADER)return;
  window.VM_RESULT_SAVE_LITE_RELOADER=true;

  function loadFreshResultPicker(){
    try{
      if(document.querySelector('script[src*="result-admin-fix.js?v=8"]')){
        setTimeout(()=>window.VM_RESULT_FIX?.boot?.(),300);
        return;
      }
      const s=document.createElement('script');
      s.src='js/core/result-admin-fix.js?v=8';
      s.defer=true;
      s.onload=()=>setTimeout(()=>window.VM_RESULT_FIX?.boot?.(),250);
      document.body.appendChild(s);
    }catch(e){console.warn('Could not reload result picker',e)}
  }

  function boot(){
    loadFreshResultPicker();
    setTimeout(()=>window.VM_RESULT_FIX?.boot?.(),900);
    setTimeout(()=>window.VM_RESULT_FIX?.render?.(),1400);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#mobileResultBox'))setTimeout(boot,250)});
})();
