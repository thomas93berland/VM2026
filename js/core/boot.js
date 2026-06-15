(()=>{
  const FEATURES=[];
  const loaded=new Set();

  function log(...args){
    if(window.VM_DEBUG_BOOT)console.log('[VM boot]',...args);
  }

  function script(id,src){
    if(!id||!src||loaded.has(id)||document.getElementById(id))return;
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.defer=true;
    s.onerror=()=>console.warn('[VM boot] Kunne ikke laste',src);
    document.head.appendChild(s);
    loaded.add(id);
    log('lastet',id,src);
  }

  function startFeature(feature){
    if(!feature||feature.enabled!==true)return;
    const page=feature.page;
    if(page&&document.querySelector('.page.active')?.id!=='page-'+page)return;
    script(feature.id,feature.src);
  }

  function startAll(){
    if(window.VM_EXTRA_SCRIPTS_DISABLED===true){
      log('ekstra scripts er deaktivert');
      return;
    }
    FEATURES.forEach(startFeature);
  }

  function onReady(){
    if(!window.firebase||!firebase.auth){
      log('venter på Firebase Auth');
      return;
    }
    firebase.auth().onAuthStateChanged(user=>{
      if(!user)return;
      window.setTimeout(startAll,350);
    });
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-page]');
      if(!btn)return;
      window.setTimeout(startAll,250);
    });
  }

  window.VM_SAFE_BOOT={
    features:FEATURES,
    load:script,
    startAll,
    startFeature
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady);else onReady();
})();
