(()=>{
  let db=null,auth=null,stopMe=null,stopUsers=null,me=null,users=[];
  const ranks=[['Rookie',0],['Bronse',900],['Sølv',1100],['Gull',1300],['Elite',1600],['Legende ⭐',2000]];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function rankName(data={}){
    if(data.profileRank)return String(data.profileRank);
    const elo=Number(data.gamblingElo??data.elo??0);
    let r=ranks[0][0];
    for(const x of ranks){if(elo>=x[1])r=x[0]}
    return r;
  }
  function css(){
    if(document.getElementById('premiumProfileLayoutCss'))return;
    const s=document.createElement('style');
    s.id='premiumProfileLayoutCss';
    s.textContent=`
      #page-profile{--profile-gold:#f7c64f;--profile-gold2:#9b6417;--profile-line:rgba(247,198,79,.30)}
      #page-profile .profile-detail.premium-profile-card{position:relative;overflow:hidden;display:grid!important;grid-template-columns:250px minmax(0,1fr)!important;align-items:center!important;gap:28px!important;padding:34px 36px!important;border-radius:34px!important;background:radial-gradient(circle at 18% 20%,rgba(247,198,79,.13),transparent 22rem),radial-gradient(circle at 80% 18%,rgba(247,198,79,.10),transparent 16rem),linear-gradient(180deg,rgba(8,21,38,.92),rgba(2,8,16,.96))!important;border:1px solid rgba(247,198,79,.24)!important;box-shadow:0 28px 90px rgba(0,0,0,.50),inset 0 0 0 1px rgba(255,255,255,.035)!important}
      #page-profile .profile-detail.premium-profile-card:before{content:"";position:absolute;inset:14px;border-radius:28px;border:1px solid rgba(255,255,255,.035);pointer-events:none}
      #page-profile .profile-detail.premium-profile-card:after{content:"";position:absolute;right:-80px;bottom:-120px;width:290px;height:290px;border-radius:50%;background:radial-gradient(circle,rgba(247,198,79,.13),transparent 68%);pointer-events:none}
      .premium-avatar-shell{position:relative;z-index:1;display:grid;place-items:center}
      #page-profile .avatar.large{width:190px!important;height:190px!important;border-radius:50%!important;font-size:70px!important;color:var(--profile-gold)!important;background:radial-gradient(circle at 35% 25%,rgba(247,198,79,.22),rgba(10,22,37,.92) 62%,rgba(2,6,12,.98))!important;border:5px solid rgba(247,198,79,.86)!important;box-shadow:0 0 0 8px rgba(247,198,79,.08),0 0 34px rgba(247,198,79,.34),inset 0 0 24px rgba(0,0,0,.65)!important;text-shadow:0 0 22px rgba(247,198,79,.6)!important}
      #page-profile .avatar.large.has-photo{border-color:rgba(247,198,79,.92)!important;background-size:cover!important;background-position:center!important;color:transparent!important}
      .premium-profile-main{position:relative;z-index:1;min-width:0;display:grid;gap:8px}
      .premium-label-line{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;color:var(--profile-gold);font-size:13px;font-weight:1000;letter-spacing:.12em;text-transform:uppercase;margin-bottom:-2px}
      .premium-label-line:before,.premium-label-line:after{content:"";height:1px;background:linear-gradient(90deg,transparent,rgba(247,198,79,.55),transparent)}
      #page-profile .profile-detail.premium-profile-card h1{margin:0!important;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(58px,8vw,96px)!important;line-height:.86!important;letter-spacing:-.075em!important;font-style:italic!important;background:linear-gradient(180deg,#fff4b7 0%,#f7c64f 42%,#b9761a 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;text-shadow:0 10px 34px rgba(247,198,79,.23)!important;filter:drop-shadow(0 0 14px rgba(247,198,79,.30))}
      .premium-separator{height:22px;background:linear-gradient(90deg,transparent,rgba(247,198,79,.36),transparent);mask:linear-gradient(#000,#000) center/100% 1px no-repeat;opacity:.9}
      .premium-profile-subtitle{display:flex;align-items:center;gap:10px;color:var(--profile-gold);font-size:15px;font-weight:1000;letter-spacing:.05em;text-transform:uppercase}.premium-profile-subtitle .crown{font-size:22px;line-height:1}
      .premium-rank-title{font-family:Georgia,'Times New Roman',serif;font-size:clamp(48px,7vw,78px);line-height:.95;font-weight:800;background:linear-gradient(180deg,#fff3b1,#f7c64f 55%,#a66a18);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 10px 28px rgba(247,198,79,.22);filter:drop-shadow(0 0 12px rgba(247,198,79,.25));margin:2px 0 0}
      #page-profile .profile-detail.premium-profile-card p{font-size:17px!important;color:#d5d2cc!important;margin:2px 0 8px!important}
      #page-profile .profile-rank-inline{width:100%;justify-content:space-between;border-radius:20px!important;padding:13px 16px!important;background:rgba(4,11,20,.58)!important;border:1px solid rgba(247,198,79,.28)!important;color:var(--profile-gold)!important;font-size:14px!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.03)}
      #page-profile .profile-rank-inline b{font-family:Georgia,'Times New Roman',serif;font-size:25px;color:var(--profile-gold)!important;font-weight:900!important}
      #page-profile .profile-photo-actions{display:grid!important;grid-template-columns:1fr auto!important;gap:10px!important;margin-top:12px!important;width:100%!important}
      #page-profile .photo-btn{min-height:54px!important;border-radius:18px!important;font-size:15px!important;padding:0 18px!important;background:linear-gradient(180deg,#ffd867,#d99c24)!important;color:#1f1505!important;border:1px solid rgba(255,232,137,.45)!important;box-shadow:0 12px 26px rgba(247,198,79,.16)!important}
      #page-profile .photo-btn.secondary{background:rgba(255,255,255,.035)!important;color:#dfe5ef!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:none!important}
      #page-profile .photo-hint{grid-column:1/-1;color:#d2d0cc!important;font-size:13px!important;margin-top:0!important}
      #page-profile #editNameBtn{justify-self:start!important;margin:12px 0 0!important;min-height:48px!important;min-width:260px!important;border-radius:18px!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(247,198,79,.24)!important;color:var(--profile-gold)!important;font-weight:1000!important}
      #page-profile .profile-stats{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;margin-top:20px!important}
      #page-profile .profile-stats .stat{min-height:190px!important;border-radius:28px!important;position:relative;overflow:hidden;background:radial-gradient(circle at 86% 30%,rgba(247,198,79,.14),transparent 8rem),linear-gradient(180deg,rgba(9,23,42,.86),rgba(3,10,19,.94))!important;border:1px solid rgba(255,255,255,.11)!important;box-shadow:0 20px 60px rgba(0,0,0,.30),inset 0 0 0 1px rgba(255,255,255,.035)!important;text-align:center!important;display:grid!important;place-items:center!important;align-content:center!important;gap:12px!important}
      #page-profile .profile-stats .stat:nth-child(n+3){display:none!important}
      #page-profile .profile-stats .stat small{font-size:18px!important;color:#eef0f5!important;text-transform:none!important;letter-spacing:0!important}
      #page-profile .profile-stats .stat strong{font-size:56px!important;color:var(--profile-gold)!important;letter-spacing:.035em!important;text-shadow:0 0 22px rgba(247,198,79,.25)!important}
      #page-profile .profile-stats .stat .nav-icon,#page-profile .profile-stats .stat .coin{width:36px!important;height:36px!important;font-size:35px!important;color:var(--profile-gold)!important;filter:drop-shadow(0 0 12px rgba(247,198,79,.35))}
      #page-profile .profile-stats .stat:nth-child(2):after{content:"◆";position:absolute;right:24px;bottom:20px;width:86px;height:86px;border-radius:50%;display:grid;place-items:center;color:rgba(247,198,79,.75);font-size:44px;border:1px solid rgba(247,198,79,.25);background:radial-gradient(circle,rgba(247,198,79,.12),rgba(0,0,0,.18));box-shadow:0 0 26px rgba(247,198,79,.18)}
      .public-profile-panel{border-radius:34px!important;border:1px solid rgba(247,198,79,.30)!important;background:radial-gradient(circle at 20% 8%,rgba(247,198,79,.13),transparent 17rem),linear-gradient(180deg,rgba(8,21,38,.98),rgba(2,8,16,.99))!important;box-shadow:0 32px 120px rgba(0,0,0,.68)!important;padding:24px!important}
      .public-profile-top{align-items:center!important}.public-profile-avatar{width:104px!important;height:104px!important;border:4px solid rgba(247,198,79,.82)!important;box-shadow:0 0 0 5px rgba(247,198,79,.08),0 0 28px rgba(247,198,79,.28)!important;font-size:42px!important}.public-profile-name h2{font-family:Georgia,'Times New Roman',serif!important;font-style:italic!important;font-size:46px!important;line-height:.9!important;background:linear-gradient(180deg,#fff4b7,#f7c64f 56%,#a66a18)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}.public-profile-rank{border-radius:18px!important;padding:8px 12px!important;color:var(--profile-gold)!important;background:rgba(247,198,79,.10)!important}.public-profile-stat.gold b{color:var(--profile-gold)!important}.public-profile-footer{display:none!important}
      @media(max-width:720px){#page-profile .profile-detail.premium-profile-card{grid-template-columns:128px minmax(0,1fr)!important;gap:16px!important;padding:22px 18px!important;border-radius:30px!important}#page-profile .avatar.large{width:118px!important;height:118px!important;font-size:44px!important;border-width:4px!important}.premium-label-line{font-size:11px;gap:8px}#page-profile .profile-detail.premium-profile-card h1{font-size:clamp(52px,15vw,72px)!important}.premium-rank-title{font-size:clamp(44px,12vw,62px)}#page-profile .profile-photo-actions{grid-column:1/-1;grid-template-columns:1fr!important}#page-profile #editNameBtn{grid-column:1/-1;width:100%;min-width:0!important}.premium-profile-main{display:contents}.premium-profile-main>.premium-label-line,.premium-profile-main>h1,.premium-profile-main>.premium-separator,.premium-profile-main>.premium-profile-subtitle,.premium-profile-main>.premium-rank-title,.premium-profile-main>p,.premium-profile-main>.profile-rank-inline{grid-column:2}.premium-profile-main>.profile-photo-actions,.premium-profile-main>#editNameBtn{grid-column:1/-1}#page-profile .profile-stats{grid-template-columns:1fr 1fr!important;gap:10px!important}#page-profile .profile-stats .stat{min-height:150px!important;border-radius:22px!important}#page-profile .profile-stats .stat small{font-size:14px!important}#page-profile .profile-stats .stat strong{font-size:42px!important}#page-profile .profile-stats .stat:nth-child(2):after{width:58px;height:58px;right:12px;bottom:12px;font-size:30px}.public-profile-panel{width:min(420px,100%)!important;border-radius:28px!important}.public-profile-name h2{font-size:36px!important}.public-profile-avatar{width:86px!important;height:86px!important}}
      @media(max-width:420px){#page-profile .profile-detail.premium-profile-card{grid-template-columns:104px minmax(0,1fr)!important;padding:18px 14px!important;gap:12px!important}#page-profile .avatar.large{width:96px!important;height:96px!important;font-size:36px!important}#page-profile .profile-detail.premium-profile-card h1{font-size:52px!important}.premium-rank-title{font-size:45px}.premium-profile-subtitle{font-size:12px}.profile-rank-inline{font-size:12px!important}#page-profile .profile-rank-inline b{font-size:20px!important}#page-profile .photo-btn{min-height:48px!important;font-size:13px!important}.public-profile-grid{grid-template-columns:1fr 1fr!important}}
    `;
    document.head.appendChild(s);
  }
  function structureOwn(){
    const page=document.getElementById('page-profile');
    const card=page?.querySelector('.profile-detail');
    if(!card)return;
    css();
    card.classList.add('premium-profile-card');
    const avatar=document.getElementById('profileAvatar');
    const text=card.querySelector('h1[data-bind="name"]')?.parentElement;
    const edit=document.getElementById('editNameBtn');
    if(avatar&&!avatar.parentElement.classList.contains('premium-avatar-shell')){
      const shell=document.createElement('div');shell.className='premium-avatar-shell';avatar.parentNode.insertBefore(shell,avatar);shell.appendChild(avatar);
    }
    if(text&&!text.classList.contains('premium-profile-main'))text.classList.add('premium-profile-main');
    const main=card.querySelector('.premium-profile-main')||text;
    const h=main?.querySelector('h1[data-bind="name"]');
    if(main&&h&&!main.querySelector('.premium-label-line'))h.insertAdjacentHTML('beforebegin','<div class="premium-label-line">NAVN</div>');
    if(main&&h&&!main.querySelector('.premium-separator'))h.insertAdjacentHTML('afterend','<div class="premium-separator"></div>');
    if(main&&!main.querySelector('.premium-profile-subtitle')){
      const sep=main.querySelector('.premium-separator')||h;
      sep.insertAdjacentHTML('afterend','<div class="premium-profile-subtitle"><span class="crown">♛</span> Brukerprofil</div>');
    }
    let rank=main?.querySelector('.premium-rank-title');
    if(main&&!rank){
      const sub=main.querySelector('.premium-profile-subtitle')||h;
      sub.insertAdjacentHTML('afterend','<div class="premium-rank-title">Legende ⭐</div>');
      rank=main.querySelector('.premium-rank-title');
    }
    if(rank)rank.textContent=rankName(me||{});
    const p=main?.querySelector('p');if(p)p.textContent='VM-tipster • Chess Lounge member';
    if(edit&&main&&!main.contains(edit))main.appendChild(edit);
    const stats=page?.querySelector('.profile-stats');
    if(stats){
      const first=stats.querySelector('.stat:nth-child(1) small');if(first)first.textContent='Gambling Rating';
      const firstIcon=stats.querySelector('.stat:nth-child(1) .nav-icon'); if(firstIcon)firstIcon.dataset.icon='trend';
    }
  }
  function structurePublic(){
    const modal=document.getElementById('publicProfileModal');
    const panel=modal?.querySelector('.public-profile-panel');
    const content=modal?.querySelector('#publicProfileContent');
    if(!panel||!content)return;
    panel.classList.add('premium-public-profile');
    const h=content.querySelector('.public-profile-name h2');
    if(h&&!content.querySelector('.public-premium-label'))h.insertAdjacentHTML('beforebegin','<div class="premium-label-line public-premium-label">NAVN</div>');
    const small=content.querySelector('.public-profile-name small'); if(small)small.textContent='Brukerprofil';
    const rank=content.querySelector('.public-profile-rank');
    if(rank&&!rank.dataset.premiumRank){rank.dataset.premiumRank='1';rank.textContent='Gambling rank: '+rank.textContent.replace(/^#/, '#');}
  }
  function apply(){structureOwn();structurePublic();}
  function boot(){
    css();
    init();
    apply();
    setInterval(apply,900);
    new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
    if(auth&&db){
      auth.onAuthStateChanged(u=>{
        if(stopMe){try{stopMe()}catch(e){}}
        if(!u){me=null;apply();return;}
        stopMe=db.collection('users').doc(u.uid).onSnapshot(s=>{me=s.exists?{uid:s.id,...s.data()}:null;apply();},console.warn);
      });
      stopUsers=db.collection('users').onSnapshot(s=>{users=s.docs.map(d=>({uid:d.id,...d.data()}));apply();},console.warn);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
