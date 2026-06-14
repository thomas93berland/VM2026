(()=>{
  function load(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.head.appendChild(s)}
  function apply(){
    if(document.getElementById('oddsButtonSizeStyle'))return;
    const s=document.createElement('style');
    s.id='oddsButtonSizeStyle';
    s.textContent=`
      .odds button,.odds-btn,.match-odds button,.bet-option,.pick-btn{
        min-height:46px!important;
        padding:10px 12px!important;
        border-radius:15px!important;
        font-size:13px!important;
        font-weight:950!important;
        letter-spacing:.01em!important;
        line-height:1.1!important;
      }
      .odds button b,.odds-btn b,.match-odds button b,.bet-option b,.pick-btn b,
      .odds button strong,.odds-btn strong,.match-odds button strong,.bet-option strong,.pick-btn strong{
        display:block!important;
        margin-top:3px!important;
        font-size:18px!important;
        font-weight:1000!important;
        color:var(--gold,#e4b84e)!important;
        letter-spacing:-.03em!important;
      }
      .odds,.match-odds,.odds-row{
        gap:9px!important;
      }
      @media(max-width:520px){
        .odds button,.odds-btn,.match-odds button,.bet-option,.pick-btn{
          min-height:48px!important;
          padding:10px 8px!important;
          font-size:12px!important;
        }
        .odds button b,.odds-btn b,.match-odds button b,.bet-option b,.pick-btn b,
        .odds button strong,.odds-btn strong,.match-odds button strong,.bet-option strong,.pick-btn strong{
          font-size:17px!important;
        }
      }
    `;
    document.head.appendChild(s);
    load('gamblingEloSettlementScript','js/gambling-elo-settlement.js?v=1');
    load('profileRankScript','js/profile-rank.js?v=1');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
