(()=>{
  function apply(){
    if(document.getElementById('compactMatchCardsStyle'))return;
    const s=document.createElement('style');
    s.id='compactMatchCardsStyle';
    s.textContent=`
      .match-card{padding:11px 12px!important;border-radius:18px!important}
      .match-card .match-top{margin-bottom:6px!important;font-size:11px!important;line-height:1.1!important}
      .match-card .teams{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;gap:8px!important;margin:5px 0 8px!important;min-height:34px!important}
      .match-card .teams strong{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:14px!important;line-height:1.15!important;padding:8px 8px!important;border-radius:14px!important;background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.06)!important}
      .match-card .teams strong:last-child{text-align:right!important}
      .match-card .teams span{font-size:11px!important;font-weight:950!important;color:var(--gold)!important;opacity:.9!important;text-transform:uppercase!important;padding:0 1px!important}
      .match-card .odds-row{gap:7px!important;margin-top:6px!important}
      .match-card .odd{min-height:40px!important;padding:7px 7px!important;border-radius:13px!important}
      .match-card .odd small{font-size:10px!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important}
      .match-card .odd strong{font-size:15px!important;margin-top:2px!important}
      .match-card .match-result,.match-card [data-result]{margin:4px 0!important;font-size:12px!important}
      @media(max-width:520px){
        .match-card{padding:10px!important;border-radius:17px!important}
        .match-card .teams{gap:6px!important;margin:4px 0 7px!important}
        .match-card .teams strong{font-size:12.5px!important;padding:8px 6px!important;border-radius:13px!important}
        .match-card .teams span{font-size:10px!important}
        .match-card .odd{min-height:39px!important;padding:7px 5px!important}
        .match-card .odd strong{font-size:14px!important}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
