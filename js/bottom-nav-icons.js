(()=>{
  const icons={
    home:'<svg viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 9.5V20h13V9.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ball:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7.2 15 9l-1.1 3.2h-3.8L9 9l3-1.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.2 13.5 10 17m4-3.5 2.8 3.5M6.3 9.5 9 9m6 0 2.7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    medal:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 3h3l1 4H9L8 3Zm8 0h-3l-1 4h3l1-4Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="12" cy="14" r="5.2" stroke="currentColor" stroke-width="2.1"/><path d="m12 11.4.8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.3 1.9-.3.8-1.7Z" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="2.1"/><circle cx="16.5" cy="10.5" r="2.5" stroke="currentColor" stroke-width="2.1"/><path d="M4.5 18c.8-2.3 2.9-3.5 4.5-3.5s3.7 1.2 4.5 3.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M14 18c.5-1.6 2-2.5 3.2-2.5 1 0 2.2.5 3 1.7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
    profile:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="2.2"/><path d="M5 19c1.2-3 4-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  function style(){
    if(document.getElementById('bottomNavIconsStyle'))return;
    let s=document.createElement('style');
    s.id='bottomNavIconsStyle';
    s.textContent='.bottom-nav .nav-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important}.bottom-nav .nav-icon svg{width:100%!important;height:100%!important;display:block!important;filter:drop-shadow(0 0 8px rgba(228,184,78,.18))}.bottom-nav .bottom-item.active .nav-icon svg{filter:none!important}';
    document.head.appendChild(s);
  }
  function apply(){
    document.querySelectorAll('.bottom-nav .nav-icon[data-icon]').forEach(el=>{
      if(el.dataset.svgDone==='1')return;
      let i=icons[el.dataset.icon];
      if(i){el.innerHTML=i;el.dataset.svgDone='1'}
    });
  }
  function boot(){
    style();
    apply();
    setTimeout(apply,500);
    setTimeout(apply,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
