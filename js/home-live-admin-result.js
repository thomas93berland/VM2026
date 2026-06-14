(()=>{
  function removePanel(){
    document.getElementById('homeLiveAdminResult')?.remove();
    document.querySelectorAll('.home-admin-result').forEach(e=>e.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removePanel);else removePanel();
  setInterval(removePanel,1000);
})();
