(()=>{
  let admin=false,lastHtml='',unsub=null,bound=false,busy=false,observer=null;
  const adminEmail=['thomas93berland','gmail.com'].join('@');
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const kickoffMs=m=>Date.parse(m?.time||'');
  const hasStarted=m=>{const ms=kickoffMs(m);return !Number.isFinite(ms)||ms<=Date.now()+60000};
  const status=m=>hasStarted(m)?'⏰ slutt/startet · mangler resultat':'🟢 kommende · uten resultat';

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const email=String(u.email||'').toLowerCase();
      if(email===adminEmail){admin=true;return true}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result selector admin check failed',e);admin=false;return false}
  }

  async function loadUnresolved(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>!hasResult(m)).sort((a,b)=>{
      const as=hasStarted(a)?0:1,bs=hasStarted(b)?0:1;
      if(as!==bs)return as-bs;
      return String(a.time||'').localeCompare(String(b.time||''));
    });
  }

  function stylePanel(){
    const panel=document.getElementById('adminPanel'),locked=document.getElementById('adminLocked');
    if(panel&&admin)panel.hidden=false;
    if(locked&&admin)locked.hidden=true;
    const form=document.getElementById('resultForm');
    if(!form)return;
    form.style.display='grid';
    form.style.gap='10px';
    const select=document.getElementById('resultMatchSelect');
    if(select){
      select.disabled=false;
      select.required=true;
      select.dataset.rescueOwner='1';
      select.style.minHeight='48px';
      select.style.borderColor='rgba(255,216,122,.45)';
      select.style.background='rgba(3,10,22,.92)';
      select.style.color='#ffd77a';
      select.style.fontWeight='950';
    }
    let p=document.getElementById('resultSelectorRescueHint');
    if(!p){p=document.createElement('p');p.id='resultSelectorRescueHint';p.className='admin-note';form.insertAdjacentElement('afterend',p)}
    p.textContent=admin?'Resultatvelgeren viser kun kamper uten registrert resultat. Kamper med resultat skjules automatisk.':'Resultatvelgeren er låst fordi admin ikke er bekreftet.';
  }

  async function refresh(){
    if(!ready())return;
    await checkAdmin();
    stylePanel();
    const select=document.getElementById('resultMatchSelect');
    if(!select||!admin)return;
    const current=select.value;
    const matches=await loadUnresolved();
    const body=matches.length?matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(status(m))}</option>`).join(''):'<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastHtml||select.innerHTML!==html){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
  }

  async function submit(e){
    const form=e.target.closest?.('#resultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(busy)return;
    busy=true;
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const fd=new FormData(form),id=fd.get('matchId'),result=fd.get('result');
      if(!id||!result)return toast('Velg kamp og resultat');
      await firebase.firestore().collection('matches').doc(id).set({result,updatedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      toast('Resultat lagt inn');
      form.reset();
      lastHtml='';
      await refresh();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1000);
    }catch(err){
      console.error('Result selector rescue submit failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{busy=false}
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(()=>{lastHtml='';setTimeout(refresh,60)},e=>console.warn('Result selector match listen failed',e));
  }

  function watchAppOverwrites(){
    const select=document.getElementById('resultMatchSelect');
    if(!select||observer)return;
    observer=new MutationObserver(()=>setTimeout(refresh,30));
    observer.observe(select,{childList:true,subtree:true,attributes:true});
  }

  function boot(){
    if(!ready())return;
    if(!bound){
      document.addEventListener('submit',submit,true);
      document.addEventListener('focusin',e=>{if(e.target?.id==='resultMatchSelect')setTimeout(refresh,30)});
      document.addEventListener('pointerdown',e=>{if(e.target?.id==='resultMatchSelect')setTimeout(refresh,30)},true);
      bound=true;
    }
    listen();watchAppOverwrites();refresh();
    setTimeout(watchAppOverwrites,250);setTimeout(refresh,250);setTimeout(refresh,800);setTimeout(refresh,1600);
  }

  window.VM_RESULT_SELECTOR_RESCUE={boot,refresh,loadUnresolved};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm,#resultMatchSelect'))setTimeout(boot,120)});
  setInterval(refresh,1200);
})();
