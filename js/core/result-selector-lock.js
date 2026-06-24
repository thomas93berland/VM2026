(()=>{
  let admin=false;
  let lastHtml='';
  let unsub=null;
  let bound=false;
  let saving=false;
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,r)=>r==='home'?(m.home||'Hjemme'):r==='away'?(m.away||'Borte'):'Uavgjort';
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<=Date.now()+60000};

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    const email=String(u.email||'').toLowerCase();
    const name=String(u.displayName||email.split('@')[0]||'').toLowerCase();
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=email===ADMIN_EMAIL||name.includes('thomas')||!!(s.exists&&s.data()?.isAdmin===true);
    }catch(e){
      console.warn('Result admin check failed',e);
      admin=email===ADMIN_EMAIL||name.includes('thomas');
    }
    return admin;
  }

  function openAdminUi(){
    if(!admin)return;
    const panel=document.getElementById('adminPanel');
    const locked=document.getElementById('adminLocked');
    if(panel){panel.hidden=false;panel.style.display='block';}
    if(locked)locked.hidden=true;
    document.querySelectorAll('.admin-only').forEach(el=>{el.hidden=false;el.style.display='block'});
  }

  function addCss(){
    if(document.getElementById('resultSelectorSimpleCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorSimpleCss';
    style.textContent=`
      #resultForm{position:relative!important;z-index:30!important;pointer-events:auto!important;display:grid!important;gap:10px!important;}
      #resultForm .input,#resultMatchSelect{min-height:50px!important;pointer-events:auto!important;position:relative!important;z-index:35!important;}
      #resultMatchSelect{background:rgba(3,10,22,.94)!important;color:#ffd77a!important;border:1px solid rgba(255,216,122,.48)!important;font-weight:950!important;}
      #resultSelectorSimpleHint{display:block!important;margin:10px 0 0!important;color:rgba(255,215,122,.88)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
    `;
    document.head.appendChild(style);
  }

  async function loadRows(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter(m=>!hasResult(m)&&isPast(m))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refresh(){
    if(!ready())return;
    addCss();
    await checkAdmin();
    openAdminUi();
    const form=document.getElementById('resultForm');
    const select=document.getElementById('resultMatchSelect');
    if(!form||!select)return;
    let hint=document.getElementById('resultSelectorSimpleHint');
    if(!hint){hint=document.createElement('p');hint.id='resultSelectorSimpleHint';form.insertAdjacentElement('afterend',hint)}
    if(!admin){hint.textContent='Admin ikke bekreftet. Logg inn som Thomas/admin.';return;}
    const current=select.value;
    const rows=await loadRows();
    const body=rows.length
      ? rows.map(m=>`<option value="${esc(m.id)}">⏰ ${esc(when(m.time))} · ${esc(title(m))}</option>`).join('')
      : '<option value="" disabled>Ingen sluttkamper uten resultat</option>';
    const html='<option value="">Velg sluttkamp uten resultat</option>'+body;
    if(html!==lastHtml||select.innerHTML!==html){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    select.disabled=false;
    hint.textContent=rows.length?`Viser ${rows.length} sluttkamp(er) som mangler resultat.`:'Ingen sluttkamper mangler resultat akkurat nå.';
  }

  async function save(id,result){
    if(!id||!result)return toast('Velg kamp og resultat');
    if(saving)return;
    saving=true;
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const snap=await firebase.firestore().collection('matches').doc(id).get();
      const m=snap.exists?{id:snap.id,...snap.data()}:{};
      await firebase.firestore().collection('matches').doc(id).set({
        result:String(result),
        resultLabel:label(m,result),
        status:'Ferdig',
        updatedBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat lagt inn ✅');
      lastHtml='';
      const form=document.getElementById('resultForm');
      if(form)form.reset();
      setTimeout(refresh,200);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),800);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Result save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{saving=false;}
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('submit',e=>{
      const form=e.target.closest?.('#resultForm');
      if(!form)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const fd=new FormData(form);
      save(fd.get('matchId'),fd.get('result'));
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(()=>{
      lastHtml='';
      setTimeout(refresh,100);
    },e=>console.warn('Result selector listen failed',e));
  }

  function boot(){
    if(!ready())return;
    bind();
    listen();
    refresh();
    setTimeout(refresh,300);
    setTimeout(refresh,900);
    setTimeout(refresh,1800);
  }

  window.VM_RESULT_SELECTOR_LOCK={boot,refresh,save};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,600)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm,#resultMatchSelect'))setTimeout(boot,120)});
  setInterval(refresh,1800);
})();
