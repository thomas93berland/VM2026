(()=>{
  function apply(){
    if(document.getElementById('bottomNavCleanStyles'))return;
    const s=document.createElement('style');
    s.id='bottomNavCleanStyles';
    s.textContent=`
      .bottom-nav .bottom-item[data-page="chat"],
      .bottom-nav .bottom-item[data-page="chess"]{
        display:none!important;
      }
      .bottom-nav{
        grid-template-columns:repeat(5,1fr)!important;
        gap:7px!important;
        padding:8px 9px calc(8px + env(safe-area-inset-bottom))!important;
        background:linear-gradient(180deg,rgba(9,20,35,.94),rgba(3,8,16,.98))!important;
        border-top:1px solid rgba(228,184,78,.18)!important;
        box-shadow:0 -18px 45px rgba(0,0,0,.36)!important;
      }
      .bottom-nav .bottom-item{
        min-height:62px!important;
        border-radius:18px!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:5px!important;
        color:#d9dfeb!important;
        background:rgba(255,255,255,.035)!important;
        border:1px solid rgba(255,255,255,.075)!important;
        font-weight:850!important;
      }
      .bottom-nav .bottom-item .nav-icon{
        width:28px!important;
        height:28px!important;
        color:var(--gold)!important;
        filter:drop-shadow(0 0 10px rgba(228,184,78,.18));
      }
      .bottom-nav .bottom-item small{
        display:block!important;
        font-size:11px!important;
        line-height:1!important;
        letter-spacing:.01em!important;
        color:#f3f0e9!important;
      }
      .bottom-nav .bottom-item.active{
        color:#171004!important;
        background:linear-gradient(180deg,#f2c96a,#cf982e)!important;
        border-color:rgba(255,240,190,.42)!important;
        box-shadow:0 0 22px rgba(228,184,78,.20)!important;
      }
      .bottom-nav .bottom-item.active .nav-icon,
      .bottom-nav .bottom-item.active small{
        color:#171004!important;
      }
      @media(max-width:380px){
        .bottom-nav{gap:5px!important;padding-left:6px!important;padding-right:6px!important}
        .bottom-nav .bottom-item{min-height:58px!important;border-radius:15px!important}
        .bottom-nav .bottom-item .nav-icon{width:24px!important;height:24px!important}
        .bottom-nav .bottom-item small{font-size:10px!important}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
