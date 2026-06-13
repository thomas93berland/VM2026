(()=>{
  function inject(){
    if(document.getElementById('leaderboardCleanStyles'))return;
    const s=document.createElement('style');
    s.id='leaderboardCleanStyles';
    s.textContent=`
      .leaderboard-row{
        grid-template-columns:64px 1fr auto!important;
        gap:14px!important;
        align-items:center!important;
        min-height:76px!important;
        padding:14px 16px!important;
      }
      .leaderboard-row .avatar{display:none!important}
      .leaderboard-row small{display:none!important}
      .leaderboard-row>div{min-width:0!important}
      .leaderboard-row>div>b{
        display:block!important;
        font-size:clamp(18px,4vw,26px)!important;
        color:var(--text)!important;
        letter-spacing:-.035em!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .leaderboard-row>b:first-child{
        width:54px!important;
        height:54px!important;
        border-radius:18px!important;
        display:grid!important;
        place-items:center!important;
        color:#1c1204!important;
        background:linear-gradient(180deg,#f2c96a,#cf982e)!important;
        border:1px solid rgba(255,240,190,.35)!important;
        font-size:22px!important;
        box-shadow:0 10px 28px rgba(228,184,78,.15)!important;
      }
      .leaderboard-row>b:last-child{
        color:var(--gold)!important;
        font-size:clamp(22px,5vw,34px)!important;
        letter-spacing:-.055em!important;
        text-align:right!important;
      }
      .leaderboard-row>b:last-child::after{
        content:' VM Coins';
        display:block;
        font-size:11px;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:var(--muted);
        margin-top:3px;
      }
      .leaderboard-row.me{
        border-color:rgba(228,184,78,.45)!important;
        background:linear-gradient(180deg,rgba(228,184,78,.10),rgba(255,255,255,.025))!important;
      }
      @media(max-width:520px){
        .leaderboard-row{grid-template-columns:50px 1fr auto!important;padding:12px!important;gap:10px!important}
        .leaderboard-row>b:first-child{width:44px!important;height:44px!important;border-radius:15px!important;font-size:18px!important}
        .leaderboard-row>div>b{font-size:18px!important}
        .leaderboard-row>b:last-child{font-size:22px!important}
        .leaderboard-row>b:last-child::after{font-size:9px}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
