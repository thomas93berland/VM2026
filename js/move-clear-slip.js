(()=>{
  function apply(){
    const btn=document.getElementById('clearSlipBtn');
    const slip=document.getElementById('betSlip');
    if(!btn||!slip)return;
    const title=slip.querySelector('.card-title')||slip;
    btn.classList.add('slip-clear-corner');
    btn.textContent='Tøm';
    if(btn.parentElement!==title)title.appendChild(btn);
    if(!document.getElementById('moveClearSlipStyle')){
      const s=document.createElement('style');
      s.id='moveClearSlipStyle';
      s.textContent=`
        #page-betting>.page-head #clearSlipBtn{display:none!important}
        #betSlip .card-title{position:relative!important;padding-right:58px!important}
        #betSlip #clearSlipBtn.slip-clear-corner{display:inline-flex!important;position:absolute!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;min-height:30px!important;height:30px!important;padding:0 10px!important;border-radius:999px!important;font-size:11px!important;font-weight:950!important;background:rgba(235,80,80,.12)!important;border:1px solid rgba(235,80,80,.25)!important;color:#ff9a9a!important;box-shadow:none!important;z-index:3!important}
        #betSlip #clearSlipBtn.slip-clear-corner:hover{background:rgba(235,80,80,.18)!important;color:#ffd0d0!important}
        @media(max-width:520px){#betSlip .card-title{padding-right:50px!important}#betSlip #clearSlipBtn.slip-clear-corner{height:28px!important;min-height:28px!important;padding:0 9px!important;font-size:10px!important}}
      `;
      document.head.appendChild(s);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,300);
  setTimeout(apply,1200);
})();
