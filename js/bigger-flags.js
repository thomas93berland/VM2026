(()=>{
  function apply(){
    if(document.getElementById('biggerFlagsStyle'))return;
    const s=document.createElement('style');
    s.id='biggerFlagsStyle';
    s.textContent=`
      /* Større flagg inne i navneboksen */
      .match-card .teams{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:center!important;gap:8px!important}
      .match-card .teams>strong{min-width:0!important;display:flex!important;align-items:center!important;gap:12px!important;padding:10px 9px!important;min-height:50px!important;border-radius:16px!important}
      .match-card .teams>strong>span:not(.vm-team-flag){min-width:0!important;display:block!important}
      .match-card .vm-team-flag{font-size:42px!important;line-height:1!important;min-width:44px!important;width:44px!important;text-align:center!important;filter:drop-shadow(0 6px 10px rgba(0,0,0,.40))!important}
      .match-card .vm-team-name{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:13.5px!important;line-height:1.05!important;font-weight:950!important}
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
        .match-card .teams{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;gap:6px!important;margin:5px 0 8px!important}
        .match-card .teams>span{width:30px!important;height:30px!important;min-width:30px!important;border-radius:50%!important;font-size:9px!important}
        .match-card .teams>strong{min-height:48px!important;padding:8px 7px!important;gap:8px!important;border-radius:15px!important}
        .match-card .teams>strong:last-child{justify-content:flex-end!important;text-align:right!important}
        .match-card .vm-team-flag{font-size:36px!important;min-width:38px!important;width:38px!important}
        .match-card .vm-team-name{font-size:12px!important;line-height:1.05!important}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
