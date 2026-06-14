(()=>{
  let db=null,auth=null,isAdmin=false,adminMode=localStorage.getItem('vmAdminMode')==='on';
  let heroText='';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }

  function styles(){
    if(document.getElementById('adminModeToggleStyle'))return;
    const s=document.createElement('style');
    s.id='adminModeToggleStyle';
    s.textContent=`
      .admin-mode-toggle{position:fixed;right:14px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:9999;min-height:38px;padding:0 13px;border-radius:999px;border:1px solid rgba(228,184,78,.36);background:linear-gradient(135deg,rgba(228,184,78,.22),rgba(3,9,18,.92));color:#fff;font-size:11px;font-weight:1000;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 14px 34px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.05)}
      .admin-mode-toggle.off{background:rgba(4,10,19,.88);color:#d8dfec;border-color:rgba(255,255,255,.16)}
      .admin-mode-toggle b{color:var(--gold)}
      body.vm-admin-view-off .admin-only,
      body.vm-admin-view-off .admin-card,
      body.vm-admin-view-off #adminPanel,
      body.vm-admin-view-off #adminLocked,
      body.vm-admin-view-off .home-admin-result,
      body.vm-admin-view-off #homeLiveAdminResult{display:none!important}
      body.vm-admin-view-off .home-hero-admin{display:none!important}
      body.vm-admin-view-off .admin-only *{pointer-events:none!important}
      @media(max-width:520px){.admin-mode-toggle{right:10px;bottom:calc(72px + env(safe-area-inset-bottom));min-height:35px;padding:0 11px;font-size:10px}}
    `;
    document.head.appendChild(s);
  }

  function setBody(){
    document.body.classList.toggle('vm-admin-view-on',isAdmin&&adminMode);
    document.body.classList.toggle('vm-admin-view-off',isAdmin&&!adminMode);
  }

  function button(){
    styles();
    let b=document.getElementById('adminModeToggle');
    if(!isAdmin){b?.remove();return;}
    if(!b){
      b=document.createElement('button');
      b.id='adminModeToggle';
      b.className='admin-mode-toggle';
      b.type='button';
      document.body.appendChild(b);
      b.addEventListener('click',()=>{
        adminMode=!adminMode;
        localStorage.setItem('vmAdminMode',adminMode?'on':'off');
        setBody();
        renderButton();
        enforceView();
      });
    }
    renderButton();
  }

  function renderButton(){
    const b=document.getElementById('adminModeToggle');
    if(!b)return;
    b.classList.toggle('off',!adminMode);
    b.innerHTML=adminMode?'Admin <b>PÅ</b>':'Admin <b>AV</b>';
    b.title=adminMode?'Trykk for å se siden slik andre ser den':'Trykk for å vise alle adminpanel';
  }

  function renderHeroNormal(){
    if(!isAdmin||adminMode)return;
    const board=document.getElementById('homeHeroMessageBoard');
    if(!board)return;
    const value=heroText.trim();
    if(board.querySelector('.home-hero-admin')||!board.querySelector('.home-hero-read')){
      board.innerHTML=`<div class="home-hero-read ${value?'':'home-hero-empty'}">${value?esc(value):' '}</div>`;
    }
  }

  function enforceView(){
    setBody();
    button();
    if(!isAdmin)return;
    if(!adminMode){
      document.querySelectorAll('.home-admin-result,#homeLiveAdminResult').forEach(e=>e.remove());
      renderHeroNormal();
    }
  }

  function boot(){
    styles();
    if(!init())return;
    auth.onAuthStateChanged(async u=>{
      isAdmin=false;
      if(u){
        try{const me=await db.collection('users').doc(u.uid).get();isAdmin=!!me.data()?.isAdmin}catch(e){isAdmin=false}
        try{db.collection('siteSettings').doc('homeHeroMessage').onSnapshot(s=>{heroText=s.exists?String(s.data().text||''):'';enforceView();});}catch(e){}
      }
      enforceView();
    });
    const obs=new MutationObserver(()=>enforceView());
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
