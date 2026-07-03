(()=>{
  function addCss(){
    if(document.getElementById('resultSelectorRouteCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorRouteCss';
    style.textContent=`
      #resultForm{display:none!important;}
      #resultFixHint{display:none!important;}
      #resultSelectorSimpleHint{display:none!important;}
      #resultMatchSelect{display:none!important;}
      #resultMatchSelectSafe{display:none!important;}
      #quickResultPanel{display:grid!important;}
    `;
    document.head.appendChild(style);
  }

  function refresh(){
    addCss();
    try{
      if(window.VM_QUICK_RESULT&&typeof window.VM_QUICK_RESULT.render==='function')window.VM_QUICK_RESULT.render();
      if(window.VM_QUICK_RESULT&&typeof window.VM_QUICK_RESULT.boot==='function')window.VM_QUICK_RESULT.boot();
    }catch(e){console.warn('Result route refresh skipped',e)}
  }

  window.VM_RESULT_SELECTOR_LOCK={boot:refresh,refresh,save:function(){},loadRows:async function(){return[]}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(refresh,400)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#quickResultPanel'))setTimeout(refresh,200)});
  setInterval(refresh,4000);
})();
