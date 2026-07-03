(()=>{
  let admin=false,lastHtml='',unsub=null,bound=false,saving=false,refreshTimer=null;
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,r)=>r==='home'?(m.home||'Hjemme'):r==='away'?(m.away||'Borte'):'Uavgjort';
  const hasResult=m=>!!String(m?.result||'').trim();
  const msOf=m=>Date.parse(m?.time||'');
  const started=m=>{const ms=msOf(m);return !Number.isFinite(ms)||ms<=Date.now()+60000};
  const rowStatus=m=>started(m)?'⏰ slutt/startet · mangler resultat':'🟢 kommende · uten resultat';

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    try{const s=await firebase.firestore().collection('users').doc(u.uid).get();admin=!!(s.exists&&s.data()?.isAdmin===true)}
    catch(e){console.warn('Result admin check failed',e);admin=false}
    return admin;
  }

  function openAdminUi(){
    if(!admin)return;
    const panel=document.getElementById('adminPanel');
    const locked=document.getElementById('adminLocked');
    if(panel){panel.hidden=false;panel.style.display='block';panel.classList.remove('admin-locked')}
    if(locked)locked.hidden=true;
    document.querySelectorAll('.admin-only').forEach(el=>{el.hidden=false;el.style.display='block'});
  }

  function addCss(){
    if(document.getElementById('resultSelectorSimpleCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorSimpleCss';
    style.textContent=`
      #resultForm{position:relative!important;z-index:40!important;pointer-events:auto!important;display:grid!important;gap:10px!important;overflow:visible!important;}
      #resultForm .input,#resultMatchSelectSafe{min-height:52px!important;pointer-events:auto!important;position:relative!important;z-index:45!important;}
      #resultMatchSelect{display:none!important;}
      #resultMatchSelectSafe{background:rgba(3,10,22,.94)!important;color:#ffd77a!important;border:1px solid rgba(255,216,122,.58)!important;font-weight:950!important;touch-action:manipulation!important;}
      #resultSelectorSimpleHint{display:block!important;margin:10px 0 0!important;color:rgba(255,215,122,.88)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
    `;
    document.head.appendChild(style);
  }

  function safeSelect(){
    const form=document.getElementById('resultForm');
    const old=document.getElementById('resultMatchSelect');
    if(!form||!old)return null;
    old.removeAttribute('name');
    old.required=false;
    old.disabled=true;
    old.setAttribute('aria-hidden','true');
    old.style.display='none';
    let safe=document.getElementById('resultMatchSelectSafe');
    if(!safe){
      safe=document.createElement('select');
      safe.id='resultMatchSelectSafe';
      safe.name='matchId';
      safe.required=true;
      safe.className='input';
      old.insertAdjacentElement('afterend',safe);
    }
    safe.disabled=false;
    safe.required=true;
    return safe;
  }

  function hint(text){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let h=document.getElementById('resultSelectorSimpleHint');
    if(!h){h=document.createElement('p');h.id='resultSelectorSimpleHint';form.insertAdjacentElement('afterend',h)}
    h.textContent=text;
  }

  async function loadRows(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>!hasResult(m)).sort((a,b)=>{
      const as=started(a)?0:1,bs=started(b)?0:1;
      if(as!==bs)return as-bs;
      return String(a.time||'').localeCompare(String(b.time||''));
    });
  }

  async function refresh(){
    if(!ready())return;
    addCss();
    await checkAdmin();
    openAdminUi();
    const select=safeSelect();
    if(!select)return;
    if(!admin){hint('Admin ikke bekreftet. Sjekk at brukeren din har isAdmin=true i Firestore.');return}
    if(document.activeElement===select)return;
    const current=select.value;
    const rows=await loadRows();
    const body=rows.length
      ? rows.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(rowStatus(m))}</option>`).join('')
      : '<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastHtml||select.innerHTML!==html){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    hint(rows.length?`Viser ${rows.length} kamp(er) uten resultat. Slutt/startede kamper ligger øverst.`:'Ingen kamper mangler resultat akkurat nå.');
  }

  async function save(id,result){
    if(!id||!result)return toast('Velg kamp og resultat');
    if(saving)return;
    saving=true;
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const ref=firebase.firestore().collection('matches').doc(id);
      const snap=await ref.get();
      const m=snap.exists?{id:snap.id,...snap.data()}:{};
      await ref.set({
        result:String(result),
        resultLabel:label(m,result),
        status:'Ferdig',
        updatedBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      const check=await ref.get();
      if(String(check.data()?.result||'')!==String(result))throw new Error('Resultatet ble ikke lagret. Sjekk Firestore-regler eller innlogging.');
      toast('Resultat lagt inn ✅');
      lastHtml='';
      const form=document.getElementById('resultForm');
      if(form)form.reset();
      setTimeout(refresh,150);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1000);
    }catch(err){
      console.error('Result save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{saving=false}
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('submit',e=>{
      const form=e.target.closest?.('#resultForm');
      if(!form)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const safe=document.getElementById('resultMatchSelectSafe');
      const result=form.querySelector('select[name="result"]');
      save(safe?.value,result?.value);
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(()=>{
      lastHtml='';
      clearTimeout(refreshTimer);
      refreshTimer=setTimeout(refresh,180);
    },e=>console.warn('Result selector listen failed',e));
  }

  function boot(){
    if(!ready())return;
    bind();listen();addCss();safeSelect();refresh();
    setTimeout(refresh,300);setTimeout(refresh,1200);
  }

  window.VM_RESULT_SELECTOR_LOCK={boot,refresh,save,loadRows};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm'))setTimeout(boot,160)});
  setInterval(()=>{if(document.activeElement?.id!=='resultMatchSelectSafe')refresh()},5000);
})();
