(()=>{
  function apply(){
    if(document.getElementById('biggerFlagsStyle'))return;
    const s=document.createElement('style');
    s.id='biggerFlagsStyle';
    s.textContent=`
      /* Store flagg + tydelige landnavn */
      .match-card .teams{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;gap:8px!important;margin:8px 0 10px!important}
      .match-card .teams>strong{min-width:0!important;display:flex!important;align-items:center!important;gap:14px!important;padding:12px 12px!important;min-height:74px!important;border-radius:18px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.095)!important}
      .match-card .teams>strong>span:not(.vm-team-flag){min-width:0!important;display:block!important}
      .match-card .vm-team-flag{font-size:60px!important;line-height:1!important;min-width:62px!important;width:62px!important;text-align:center!important;filter:drop-shadow(0 7px 12px rgba(0,0,0,.45))!important}
      .match-card .vm-team-name{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:27px!important;line-height:.98!important;font-weight:1000!important;color:#fff!important;letter-spacing:-.045em!important;text-shadow:0 3px 8px rgba(0,0,0,.65)!important}
      .match-card .teams>strong:last-child{justify-content:flex-end!important;text-align:right!important}

      /* Fjern forkortelsen/koden nederst */
      .match-card .vm-team-code,
      .match-card .team-code,
      .match-card .country-code,
      .match-card .team-abbr,
      .match-card .team-short,
      .match-card .team-bottom-code,
      .match-card .country-short{display:none!important}

      @media(max-width:520px){
        .match-card .teams{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;gap:5px!important;margin:6px 0 9px!important}
        .match-card .teams>span{width:28px!important;height:28px!important;min-width:28px!important;border-radius:50%!important;font-size:9px!important}
        .match-card .teams>strong{min-height:66px!important;padding:9px 7px!important;gap:7px!important;border-radius:16px!important}
        .match-card .teams>strong:last-child{justify-content:flex-end!important;text-align:right!important}
        .match-card .vm-team-flag{font-size:48px!important;min-width:48px!important;width:48px!important}
        .match-card .vm-team-name{font-size:22px!important;line-height:.98!important;font-weight:1000!important;color:#fff!important;letter-spacing:-.04em!important;text-shadow:0 3px 8px rgba(0,0,0,.65)!important}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
