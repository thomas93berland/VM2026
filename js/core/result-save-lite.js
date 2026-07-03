(()=>{
  function cleanup(){
    try{
      document.getElementById('vmResultButtonPanelCss')?.remove();
      document.getElementById('vmResultButtonPanel')?.remove();
      const form=document.getElementById('resultForm');
      if(form){
        form.style.removeProperty('display');
        form.style.removeProperty('visibility');
        form.style.removeProperty('pointer-events');
        form.style.removeProperty('height');
        form.style.removeProperty('overflow');
        form.hidden=false;
      }
      window.VM_RESULT_FIX?.boot?.();
      window.VM_RESULT_FIX?.refreshSelect?.();
    }catch(e){console.warn('Result selector cleanup skipped',e)}
  }
  function boot(){cleanup();setTimeout(cleanup,300);setTimeout(cleanup,1000);setTimeout(cleanup,2200)}
  window.VM_RESULT_SAVE_LITE={boot,render:boot,save:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,150)});
  setInterval(cleanup,2500);
})();
