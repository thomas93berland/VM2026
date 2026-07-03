(()=>{
  let admin=false;
  let bound=false;
  let lastSelectHtml='';
  let lastInfo=null;
  const ADMIN_EMAILS=new Set(['thomas93berland@gmail.com']);
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const truthy=v=>v===true||v===1||String(v??'').trim().toLowerCase()==='true'||String(v??'').trim()==='1'||String(v??'').trim().toLowerCase()==='ja';
  const toast=msg=>{try{const t=$('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,5200)}else alert(msg)}catch{alert(msg)}};
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const statusText=m=>{const ms=Date.parse(m.time||'');return Number.isFinite(ms)&&ms<Date.now()?'⏰ slutt / mangler resultat':'🟢 ikke spilt ennå'};

  function addCss(){
    if(document.getElementById('adminResultRescueCss'))return;
    const style=document.createElement('style');
    style.id='adminResultRescueCss';
    style.textContent=`
      #adminRescueInfo{margin:10px 0 0!important;padding:10px 11px!important;border-radius:14px!important;background:rgba(255,216,122,.08)!important;border:1px solid rgba(255,216,122,.22)!important;color:rgba(246,247,251,.88)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;word-break:break-word!important;}
      #adminRescueInfo b{color:#ffd77a!important;}
      #adminRescueInfo.ok{background:rgba(79,225,159,.08)!important;border-color:rgba(79,225,159,.26)!important;}
      #adminRescueInfo.bad{background:rgba(255,118,118,.08)!important;border-color:rgba(255,118,118,.26)!important;}
      #resultMatchSelect.admin-rescue-select{min-height:48px!important;border-color:rgba(255,216,122,.34)!important;box-shadow:0 0 0 2px rgba(228,184,78,.08)!important;}
      #resultForm.admin-rescue-ready button,#matchForm.admin-rescue-ready button{box-shadow:0 0 22px rgba(228,184,78,.16)!important;}
    `;
    document.head.appendChild(style);
  }

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    let raw=null,data=null,exists=false;
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      exists=s.exists;
      data=s.exists?s.data()||{}:{};
      raw=data.isAdmin;
    }catch(e){console.warn('Admin doc read failed',e)}

    const byExact=raw===true;
    const byLoose=truthy(data?.isAdmin)||truthy(data?.admin)||truthy(data?.is_admin)||truthy(data?.isadmin);
    const byEmail=ADMIN_EMAILS.has(String(u.email||'').toLowerCase());
    admin=!!(byExact||byLoose||byEmail);
    lastInfo={uid:u.uid,email:u.email||'',exists,raw,byExact,byLoose,byEmail,admin};
    applyUi();
    return admin;
  }

  function infoText(){
    const i=lastInfo;
    if(!i)return 'Admin-sjekk: laster...';
    const raw=typeof i.raw==='undefined'?'mangler':`${String(i.raw)} (${typeof i.raw})`;
    if(i.admin){
      return `✅ <b>Admin OK</b><br>E-post: ${esc(i.email)}<br>UID: ${esc(i.uid)}<br>users/${esc(i.uid)} · isAdmin: ${esc(raw)}${i.byEmail&&!i.byExact?'<br>Godkjent via Thomas e-post-fallback. Firestore-regler må også være publisert med e-post-fallback, eller isAdmin må være boolean true.':''}`;
    }
    return `❌ <b>Admin ikke godkjent</b><br>E-post: ${esc(i.email)}<br>UID: ${esc(i.uid)}<br>Fant users/${esc(i.uid)}: ${i.exists?'ja':'nei'}<br>isAdmin: ${esc(raw)}<br>Riktig format er: users/${esc(i.uid)} → felt <b>isAdmin</b> = boolean <b>true</b>.`;
  }

  function placeInfo(){
    const panel=$('adminPanel');
    const locked=$('adminLocked');
    const target=panel||locked||$('page-betting');
    if(!target)return;
    let box=$('adminRescueInfo');
    if(!box){box=document.createElement('div');box.id='adminRescueInfo';}
    box.className=admin?'ok':'bad';
    box.innerHTML=infoText();
    if(panel&&!panel.contains(box)){
      const note=panel.querySelector('.admin-note')||panel.firstElementChild;
      (note||panel).insertAdjacentElement('afterend',box);
    }else if(!panel&&target&&!target.contains(box))target.appendChild(box);
  }

  function applyUi(){
    addCss();
    const panel=$('adminPanel');
    const locked=$('adminLocked');
    if(panel){
      panel.hidden=!admin;
      if(admin)panel.open=true;
    }
    if(locked)locked.hidden=admin;
    $('resultForm')?.classList.add('admin-rescue-ready');
    $('matchForm')?.classList.add('admin-rescue-ready');
    $('resultMatchSelect')?.classList.add('admin-rescue-select');
    placeInfo();
  }

  async function unresolvedMatches(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter(m=>!hasResult(m))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refreshSelect(){
    const select=$('resultMatchSelect');
    if(!select||!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;
    const current=select.value;
    try{
      const matches=await unresolvedMatches();
      const body=matches.length
        ? matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(statusText(m))}</option>`).join('')
        : '<option value="" disabled>Ingen kamper uten resultat</option>';
      const html='<option value="">Velg kamp uten resultat</option>'+body;
      if(html!==lastSelectHtml||select.options.length<2){
        lastSelectHtml=html;
        select.innerHTML=html;
        if(current&&[...select.options].some(o=>o.value===current))select.value=current;
      }
    }catch(e){
      console.error('Result selector load failed',e);
      toast((e?.code?e.code+': ':'')+'Kunne ikke laste kampene i resultatvelgeren');
    }
  }

  function adminErrorMessage(err){
    const i=lastInfo;
    const uid=i?.uid||firebase.auth().currentUser?.uid||'DIN_UID';
    if(err?.code==='permission-denied'){
      return `permission-denied: Firestore nekter skriving. Sjekk at users/${uid}.isAdmin er boolean true, og at Firestore-reglene er publisert.`;
    }
    return (err?.code?err.code+': ':'')+(err?.message||'Kunne ikke lagre');
  }

  async function handleMatchSubmit(e){
    const form=$('matchForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin. Se admin-diagnosen under panelet.');
      const f=new FormData(form);
      const home=String(f.get('home')||'').trim();
      const away=String(f.get('away')||'').trim();
      const time=String(f.get('time')||'').trim();
      if(!home||!away||!time)return toast('Fyll inn hjemmelag, bortelag og tid');
      await firebase.firestore().collection('matches').add({
        home,away,time,group:'VM 2026',result:null,
        odds:{home:Number(f.get('homeOdds')||2.1),draw:Number(f.get('drawOdds')||3.2),away:Number(f.get('awayOdds')||2.9)},
        createdBy:firebase.auth().currentUser.uid,
        createdAtMs:Date.now(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      toast('Kamp lagt til');
      setTimeout(refreshSelect,500);
    }catch(err){
      console.error('Admin match submit failed',err);
      toast(adminErrorMessage(err));
    }
  }

  async function handleResultSubmit(e){
    const form=$('resultForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin. Se admin-diagnosen under panelet.');
      const f=new FormData(form);
      const id=String(f.get('matchId')||'').trim();
      const result=String(f.get('result')||'').trim();
      if(!id||!result)return toast('Velg kamp og resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      form.reset();
      lastSelectHtml='';
      toast('Resultat lagt inn');
      setTimeout(refreshSelect,350);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Admin result submit failed',err);
      toast(adminErrorMessage(err));
    }
  }

  function bind(){
    if(bound)return;
    document.addEventListener('submit',handleMatchSubmit,true);
    document.addEventListener('submit',handleResultSubmit,true);
    bound=true;
  }

  async function boot(){
    if(!ready())return;
    bind();
    await checkAdmin();
    applyUi();
    refreshSelect();
    setTimeout(refreshSelect,600);
    setTimeout(refreshSelect,1600);
  }

  window.VM_ADMIN_RESULT_RESCUE={boot,refreshSelect,checkAdmin};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,summary'))setTimeout(boot,250)});
  setInterval(()=>{if(ready())boot()},5000);
})();
