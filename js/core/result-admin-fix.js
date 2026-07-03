(()=>{
  // Compatibility shim.
  // The old result-admin-fix created its own #mobileSaveResult handler before
  // result-mobile-hotfix.js. Because both scripts used the same button ID, the
  // old capture listener could stop the new hotfix from saving.
  // Keep this file harmless so older index.html references do not break.
  function boot(){
    try{
      const oldForm=document.getElementById('resultForm');
      if(oldForm) oldForm.style.display='none';
      window.VM_RESULT_MOBILE_HOTFIX?.boot?.();
    }catch(e){console.warn('Result compatibility boot skipped',e)}
  }

  function render(){
    try{
      window.VM_RESULT_MOBILE_HOTFIX?.render?.();
    }catch(e){console.warn('Result compatibility render skipped',e)}
  }

  function save(){
    try{
      return window.VM_RESULT_MOBILE_HOTFIX?.save?.();
    }catch(e){console.warn('Result compatibility save skipped',e)}
  }

  window.VM_RESULT_ADMIN_FIX_DISABLED=true;
  window.VM_RESULT_FIX={boot,refreshSelect:render,render,save};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
})();
