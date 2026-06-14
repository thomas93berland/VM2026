(()=>{
  let db=null,auth=null,isAdmin=false,unsub=null,currentText='';
  const DOC='homeHeroMessage';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function styles(){
    if(document.getElementById('homeHeroMessageStyle'))return;
    const s=document.createElement('style');
    s.id='homeHeroMessageStyle';
    s.textContent=`
      #page-home .hero{display:block!important;min-height:auto!important;padding:14px!important;border-radius:26px!important}
      #page-home .hero .hero-text h1,#page-home .hero .hero-actions,#page-home .hero .hero-art{display:none!important}
      #page-home .hero .hero-text{width:100%!important;max-width:none!important;position:relative!important;z-index:2!important}
      .home-hero-board{width:100%;position:relative;z-index:3;border-radius:22px;padding:14px;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025));border:1px solid rgba(228,184,78,.24);box-shadow:inset 0 0 0 1px rgba(255,255,255,.035),0 14px 34px rgba(0,0,0,.18)}
      .home-hero-board:before{content:"";position:absolute;inset:0;border-radius:22px;background:radial-gradient(circle at top right,rgba(228,184,78,.18),transparent 42%);pointer-events:none}
      .home-hero-read{position:relative;z-index:1;min-height:70px;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font-size:20px;line-height:1.22;font-weight:950;letter-spacing:-.025em;text-shadow:0 3px 9px rgba(0,0,0,.55);white-space:pre-wrap;word-break:break-word}
      .home-hero-empty{color:rgba(255,255,255,.46);font-size:15px;font-weight:850;text-shadow:none}
      .home-hero-admin{position:relative;z-index:2;display:grid;gap:9px}
      .home-hero-admin textarea{width:100%;min-height:86px;resize:vertical;border:1px solid rgba(228,184,78,.26);border-radius:18px;background:rgba(2,7,14,.48);color:#fff;padding:12px;font-size:16px;font-weight:850;line-height:1.25;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035)}
      .home-hero-admin textarea::placeholder{color:rgba(255,255,255,.44)}
      .home-hero-admin-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .home-hero-admin small{color:#cfd6e4;font-size:11px;font-weight:800}
      .home-hero-save{min-height:36px;border:1px solid rgba(228,184,78,.35);border-radius:999px;background:linear-gradient(135deg,rgba(228,184,78,.28),rgba(228,184,78,.11));color:#fff;padding:0 15px;font-size:12px;font-weight:1000}
      .home-hero-save:active{transform:scale(.98)}
      @media(max-width:520px){#page-home .hero{padding:11px!important;border-radius:23px!important}.home-hero-board{padding:11px;border-radius:20px}.home-hero-read{min-height:64px;font-size:17px}.home-hero-admin textarea{min-height:80px;font-size:15px}.home-hero-admin-row{align-items:flex-start}.home-hero-save{min-width:92px}}
    `;
    document.head.appendChild(s);
  }
  function ensure(){
    styles();
    const hero=document.querySelector('#page-home .hero');
    if(!hero)return null;
    const text=hero.querySelector('.hero-text')||hero;
    let board=document.getElementById('homeHeroMessageBoard');
    if(!board){
      board=document.createElement('div');
      board.id='homeHeroMessageBoard';
      board.className='home-hero-board';
      text.prepend(board);
    }
    return board;
  }
  function render(){
    const board=ensure();
    if(!board)return;
    const value=currentText.trim();
    if(isAdmin){
      board.innerHTML=`
        <div class="home-hero-admin">
          <textarea id="homeHeroMessageInput" maxlength="240" placeholder="Skriv hva du vil vise øverst på Home-siden...">${esc(currentText)}</textarea>
          <div class="home-hero-admin-row">
            <small>Adminfelt · vises på tvers av hele toppkortet</small>
            <button type="button" class="home-hero-save" id="homeHeroMessageSave">Lagre</button>
          </div>
        </div>`;
      const btn=document.getElementById('homeHeroMessageSave');
      const input=document.getElementById('homeHeroMessageInput');
      btn.onclick=async e=>{
        e.preventDefault();e.stopPropagation();
        const next=input.value.trim();
        try{
          await db.collection('siteSettings').doc(DOC).set({text:next,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAtMs:Date.now()},{merge:true});
          btn.textContent='Lagret';
          setTimeout(()=>btn.textContent='Lagre',1200);
        }catch(err){console.warn(err);btn.textContent='Feil';setTimeout(()=>btn.textContent='Lagre',1200)}
      };
    }else{
      board.innerHTML=`<div class="home-hero-read ${value?'':'home-hero-empty'}">${value?esc(value):' '}</div>`;
    }
  }
  async function loadAdmin(u){
    isAdmin=false;
    if(!u)return;
    try{const me=await db.collection('users').doc(u.uid).get();isAdmin=!!me.data()?.isAdmin}catch(e){isAdmin=false}
  }
  function boot(){
    styles();ensure();
    if(!init()){render();return;}
    auth.onAuthStateChanged(async u=>{
      if(unsub){try{unsub()}catch(e){}}
      await loadAdmin(u);
      unsub=db.collection('siteSettings').doc(DOC).onSnapshot(s=>{currentText=s.exists?String(s.data().text||''):'';render();},()=>render());
      render();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
