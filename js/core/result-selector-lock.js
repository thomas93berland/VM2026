(()=>{
  let admin=false;
  let lastHtml='';
  let writing=false;
  let bound=false;
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u)return admin=false;
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch{return admin=false}
  }

  function nativeInnerHtmlDescriptor(el){
    let p=el;
    while(p){
      const d=Object.getOwnPropertyDescriptor(p,'innerHTML');
      if(d?.get&&d?.set)return d;
      p=Object.getPrototypeOf(p);
    }
    return null;
  }

  function lock(select){
    if(!select||select.dataset.resultSelectorLocked==='yes')return;
    const d=nativeInnerHtmlDescriptor(select);
    if(!d)return;
    Object.defineProperty(select,'innerHTML',{
      configurable:true,
      get(){return d.get.call(this)},
      set(v){
        if(writing){d.set.call(this,v);return;}
        setTimeout(refresh,40);
      }
    });
    select.dataset.resultSelectorLocked='yes';
  }

  async function loadUnresolvedFinishedMatches(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter(m=>!hasResult(m)&&isPast(m))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refresh(){
    if(!ready())return;
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    lock(select);
    if(!admin)await checkAdmin();
    if(!admin)return;
    const current=select.value;
    const rows=await loadUnresolvedFinishedMatches();
    const body=rows.length
      ? rows.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · slutt / mangler resultat</option>`).join('')
      : '<option value="" disabled>Ingen sluttkamper uten resultat</option>';
    const html='<option value="">Velg sluttkamp uten resultat</option>'+body;
    if(html!==lastHtml||select.options.length<2||select.innerHTML!==html){
      lastHtml=html;
      writing=true;
      try{
        select.innerHTML=html;
        if(current&&[...select.options].some(o=>o.value===current))select.value=current;
      }finally{writing=false;}
    }
    select.disabled=false;
    select.style.pointerEvents='auto';
    select.style.position='relative';
    select.style.zIndex='20';
  }

  async function submit(e){
    const form=e.target.closest?.('#resultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const fd=new FormData(form);
      const id=fd.get('matchId');
      const result=fd.get('result');
      if(!id||!result)return toast('Velg kamp og resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      toast('Resultat lagt inn');
      form.reset();
      lastHtml='';
      setTimeout(refresh,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
    }catch(err){
      console.error(err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }
  }

  function boot(){
    if(!ready())return;
    refresh();
    if(!bound){
      document.addEventListener('submit',submit,true);
      bound=true;
    }
    setTimeout(refresh,300);
    setTimeout(refresh,900);
    setTimeout(refresh,1800);
  }

  window.VM_RESULT_SELECTOR_LOCK={boot,refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm,#resultMatchSelect'))setTimeout(boot,120)});
  setInterval(refresh,1800);
})();
