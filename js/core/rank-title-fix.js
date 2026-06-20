(()=>{
  let users=[];
  let me=null;
  let unsubUsers=null;
  let unsubMe=null;
  let observer=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};

  function rankTitle(coins){
    coins=Number(coins||0);
    if(coins>=7000)return{t:'VM Kongen',icon:'👑',level:7};
    if(coins>=6500)return{t:'Legenden',icon:'⭐',level:6};
    if(coins>=6000)return{t:'Kongen',icon:'♛',level:5};
    if(coins>=5000)return{t:'Profesjonell',icon:'💎',level:4};
    if(coins>=4000)return{t:'Normal',icon:'⚜️',level:3};
    if(coins>=3000)return{t:'Begynner',icon:'✨',level:2};
    return{t:'Nybegynner',icon:'🌱',level:1};
  }

  function addCss(){
    if(document.getElementById('vmRankLowerCss'))return;
    const st=document.createElement('style');
    st.id='vmRankLowerCss';
    st.textContent=`
      .vm-rank-badge{display:inline-flex!important;align-items:center!important;gap:5px!important;width:max-content!important;margin-top:5px!important;padding:4px 8px!important;border-radius:999px!important;background:linear-gradient(135deg,rgba(255,216,122,.22),rgba(139,91,20,.18))!important;border:1px solid rgba(255,216,122,.46)!important;box-shadow:0 0 16px rgba(228,184,78,.20),inset 0 1px 0 rgba(255,255,255,.11)!important;color:#ffd77a!important;font-size:11px!important;font-weight:1000!important;line-height:1!important;letter-spacing:.035em!important;text-transform:uppercase!important;text-shadow:0 0 9px rgba(228,184,78,.36)!important;white-space:nowrap!important;}
      .vm-rank-badge.big{font-size:14px!important;padding:7px 12px!important;margin-top:8px!important;background:linear-gradient(135deg,rgba(255,216,122,.30),rgba(139,91,20,.22))!important;border-color:rgba(255,216,122,.58)!important;box-shadow:0 0 24px rgba(228,184,78,.25),inset 0 1px 0 rgba(255,255,255,.14)!important;}
      .vm-rank-badge.side{margin:7px 0 0!important;font-size:12px!important;justify-content:center!important;width:100%!important;}
      .vm-rank-badge.top-rank{background:linear-gradient(135deg,rgba(255,226,142,.36),rgba(191,134,34,.28))!important;border-color:rgba(255,226,142,.72)!important;color:#ffe28e!important;box-shadow:0 0 28px rgba(228,184,78,.34),inset 0 1px 0 rgba(255,255,255,.18)!important;}
      .vm-rank-coins{opacity:.80!important;font-size:10px!important;font-weight:900!important;text-transform:none!important;letter-spacing:0!important;}
      .leaderboard-row .vm-rank-badge{grid-column:2!important;grid-row:1!important;align-self:end!important;margin-top:22px!important;}
      .safe-rank-card strong,.rank-title-gold{background:linear-gradient(90deg,#fff0b7,#f5d07a,#b98525)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;text-shadow:0 0 18px rgba(228,184,78,.22)!important;}
      @media(max-width:430px){.vm-rank-badge{font-size:10px!important;padding:3px 7px!important}.vm-rank-badge.big{font-size:13px!important;padding:6px 10px!important}.leaderboard-row .vm-rank-badge{margin-top:21px!important}}
    `;
    document.head.appendChild(st);
  }

  function sortedUsers(){
    return[...users].sort((a,b)=>(Number(b.coins||0)-Number(a.coins||0))||String(a.name||'').localeCompare(String(b.name||'')));
  }

  function badgeHtml(rank,coins,includeCoins=true){
    const top=rank.level===7?' top-rank':'';
    return{cls:top,html:`${rank.icon} ${esc(rank.t)}${includeCoins?` <span class="vm-rank-coins">${Number(coins||0).toLocaleString('nb-NO')}</span>`:''}`};
  }

  function injectLeaderboard(){
    const sorted=sortedUsers();
    ['homeLeaderboard','leaderboardPageList'].forEach(id=>{
      const box=document.getElementById(id);
      if(!box)return;
      [...box.querySelectorAll('.leaderboard-row')].forEach((row,i)=>{
        const u=sorted[i];
        if(!u)return;
        const holder=row.querySelector('div:not(.avatar)');
        if(!holder)return;
        const rank=rankTitle(u.coins);
        let badge=holder.querySelector('.vm-rank-badge');
        if(!badge){
          badge=document.createElement('span');
          badge.className='vm-rank-badge';
          holder.appendChild(badge);
        }
        const data=badgeHtml(rank,u.coins,true);
        badge.className='vm-rank-badge'+data.cls;
        badge.innerHTML=data.html;
      });
    });
  }

  function injectProfile(){
    const u=me;
    if(!u)return;
    const rank=rankTitle(u.coins);
    const detail=document.querySelector('#page-profile .profile-detail');
    if(detail){
      let badge=detail.querySelector('#vmProfileRank');
      if(!badge){
        badge=document.createElement('div');
        badge.id='vmProfileRank';
        const target=detail.querySelector('p')||detail.querySelector('h1')||detail;
        target.insertAdjacentElement('afterend',badge);
      }
      const data=badgeHtml(rank,u.coins,true);
      badge.className='vm-rank-badge big'+data.cls;
      badge.innerHTML=`${rank.icon} Rank: ${esc(rank.t)} <span class="vm-rank-coins">${Number(u.coins||0).toLocaleString('nb-NO')} coins</span>`;
    }

    const side=document.querySelector('.side-wallet');
    if(side){
      let sideBadge=side.querySelector('#vmSideRank');
      if(!sideBadge){
        sideBadge=document.createElement('div');
        sideBadge.id='vmSideRank';
        side.appendChild(sideBadge);
      }
      const data=badgeHtml(rank,u.coins,false);
      sideBadge.className='vm-rank-badge side'+data.cls;
      sideBadge.innerHTML=data.html;
    }

    const stat=[...document.querySelectorAll('#page-profile .stat')].find(x=>x.textContent.includes('Rangering')||x.textContent.includes('Rank-tittel'));
    if(stat){
      stat.classList.add('safe-rank-card');
      const small=stat.querySelector('small');
      const strong=stat.querySelector('strong');
      if(small)small.textContent='Rank-tittel';
      if(strong){
        strong.textContent=rank.t;
        strong.classList.add('rank-title-gold');
      }
    }
  }

  function render(){
    addCss();
    injectLeaderboard();
    injectProfile();
  }

  function listen(){
    if(!ready())return;
    const db=firebase.firestore();
    const u=firebase.auth().currentUser;
    if(!unsubUsers){
      unsubUsers=db.collection('users').onSnapshot(s=>{
        users=s.docs.map(d=>({id:d.id,...d.data()}));
        render();
      },e=>console.warn('Rank users failed',e));
    }
    if(u&&!unsubMe){
      unsubMe=db.collection('users').doc(u.uid).onSnapshot(s=>{
        me=s.exists?{id:s.id,...s.data()}:null;
        render();
      },e=>console.warn('Rank me failed',e));
    }
  }

  function watch(){
    if(observer)return;
    observer=new MutationObserver(()=>setTimeout(render,80));
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function boot(){
    addCss();
    watch();
    if(ready())listen();
    render();
  }

  window.VM_RANK_TITLES={boot,render,rankTitle};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(!u){me=null;render();return}listen();setTimeout(boot,400)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="leaderboard"],[data-page="profile"],[data-page="home"]'))setTimeout(boot,250)});
  setInterval(render,4000);
})();
