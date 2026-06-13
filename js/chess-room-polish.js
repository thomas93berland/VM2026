(()=>{
  function inject(){
    const old=document.getElementById('chessRoomPolishStyle');
    if(old)old.remove();
    const s=document.createElement('style');
    s.id='chessRoomPolishStyle';
    s.textContent=`
      #page-chess{padding-bottom:110px!important}
      #page-chess .chess-card{
        padding:34px 18px 30px!important;
        border-radius:30px!important;
        border:1px solid rgba(133,160,196,.18)!important;
        background:radial-gradient(circle at 22% 0,rgba(32,73,124,.24),transparent 30rem),linear-gradient(180deg,rgba(7,22,41,.98),rgba(3,10,20,.98))!important;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)!important;
        overflow:visible!important;
      }
      #page-chess .chess-card>div:first-child{padding:0 16px!important}
      #page-chess .chess-card h2{
        margin:0 0 22px!important;
        font-size:clamp(44px,12vw,64px)!important;
        line-height:.98!important;
        letter-spacing:-.07em!important;
        color:#f8f2e7!important;
      }
      #page-chess .chess-card p{
        max-width:650px!important;
        margin:0 0 28px!important;
        color:#dfe5ef!important;
        font-size:clamp(20px,4.4vw,32px)!important;
        line-height:1.43!important;
        letter-spacing:-.035em!important;
      }
      #page-chess .chess-stats{display:flex!important;gap:16px!important;margin:0 0 30px!important;flex-wrap:wrap!important}
      #page-chess .chess-stats>div{
        min-width:146px!important;
        padding:21px 26px!important;
        border-radius:24px!important;
        background:rgba(255,255,255,.04)!important;
        border:1px solid rgba(255,255,255,.08)!important;
      }
      #page-chess .chess-stats small{font-size:22px!important;color:#aeb8c8!important;font-weight:500!important}
      #page-chess .chess-stats strong{font-size:34px!important;color:var(--gold)!important;letter-spacing:-.04em!important}
      #page-chess .chess-card .btn.primary{
        min-height:86px!important;
        min-width:254px!important;
        border-radius:28px!important;
        font-size:24px!important;
        font-weight:950!important;
        margin-bottom:24px!important;
      }
      #miniBoard{
        width:calc(100% + 36px)!important;
        max-width:none!important;
        margin:20px -18px 0!important;
        aspect-ratio:1/1!important;
        min-height:0!important;
        border-radius:12px!important;
        border:0!important;
        background:transparent!important;
        overflow:hidden!important;
        display:block!important;
        box-shadow:0 14px 42px rgba(0,0,0,.36)!important;
      }
      #miniBoard img.chess-room-board-img,#miniBoard img{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
        display:block!important;
        border-radius:12px!important;
      }
      .bottom-nav{z-index:30!important}
      @media(max-width:520px){
        #page-chess{padding-left:18px!important;padding-right:18px!important}
        #page-chess .chess-card{padding:30px 16px 20px!important;border-radius:28px!important}
        #page-chess .chess-card>div:first-child{padding:0 18px!important}
        #page-chess .chess-card h2{font-size:44px!important;margin-bottom:28px!important}
        #page-chess .chess-card p{font-size:20px!important;line-height:1.52!important;margin-bottom:28px!important}
        #page-chess .chess-stats{gap:14px!important;margin-bottom:30px!important}
        #page-chess .chess-stats>div{min-width:146px!important;padding:20px 26px!important;border-radius:24px!important}
        #page-chess .chess-stats small{font-size:20px!important}
        #page-chess .chess-stats strong{font-size:32px!important}
        #page-chess .chess-card .btn.primary{min-height:86px!important;min-width:254px!important;font-size:24px!important;margin-bottom:28px!important}
        #miniBoard{width:calc(100% + 32px)!important;margin:18px -16px 0!important;border-radius:10px!important}
        #miniBoard img{border-radius:10px!important}
      }
    `;
    document.head.appendChild(s);
  }
  function boot(){inject();setTimeout(inject,700);setTimeout(inject,1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
