(()=>{
  function replaceText(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      if(n.nodeValue&&n.nodeValue.includes('Sjakk ELO')){
        n.nodeValue=n.nodeValue.replaceAll('Sjakk ELO','Gambling Rating');
      }
    });
    document.querySelectorAll('[aria-label]').forEach(el=>{
      const v=el.getAttribute('aria-label');
      if(v&&v.includes('Sjakk ELO'))el.setAttribute('aria-label',v.replaceAll('Sjakk ELO','Gambling Rating'));
    });
  }
  function boot(){
    replaceText();
    const obs=new MutationObserver(()=>replaceText());
    obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
