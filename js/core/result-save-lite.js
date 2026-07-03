(()=>{
  function load(){
    if(window.VM_RESULT_BUTTON_PANEL?.boot){window.VM_RESULT_BUTTON_PANEL.boot();return}
    if(document.querySelector('script[src*="result-button-panel.js"]'))return;
    const s=document.createElement('script');
    s.src='js/core/result-button-panel.js?v=3';
    s.defer=true;
    s.onload=()=>setTimeout(()=>window.VM_RESULT_BUTTON_PANEL?.boot?.(),200);
    document.body.appendChild(s);
  }
  function boot(){load();setTimeout(()=>window.VM_RESULT_BUTTON_PANEL?.boot?.(),700)}
  window.VM_RESULT_SAVE_LITE={boot,render:boot,save(){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,180)});
})();
