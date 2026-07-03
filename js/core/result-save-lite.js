(()=>{
  function cleanup(){
    try{
      document.getElementById('vmResultButtonPanelCss')?.remove();
      document.getElementById('vmResultButtonPanel')?.remove();
      document.getElementById('directResultPanelCss')?.remove();
      document.getElementById('directResultPanel')?.remove();
      window.VM_RESULT_STABLE?.boot?.();
      window.VM_RESULT_STABLE?.refreshSelect?.();
      window.VM_RESULT_FIX?.refreshSelect?.();
    }catch(e){console.warn('Result admin cleanup skipped',e)}
  }
  function boot(){cleanup();setTimeout(cleanup,250);setTimeout(cleanup,900);setTimeout(cleanup,2200)}
  window.VM_RESULT_SAVE_LITE={boot,render:boot,save:boot,cleanup};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,150)});
  setInterval(cleanup,1400);
})();
