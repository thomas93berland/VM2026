(()=>{
  let admin=false;
  let lastHtml='';
  let unsub=null;
  let bound=false;
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Safe result admin check failed',e);admin=false;return false}
  }

  function ensureSafeSelect(){
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
      safe.className='input safe-result-select';
      old.insertAdjacentElement('afterend',safe);
    }
    safe.disabled=false;
    safe.required=true;
    safe.style.minHeight='52px';
    safe.style.borderColor='rgba(255,216,122,.55)';
    safe.style.background='rgba(3,10,22,.92)';
    safe.style.color='#ffd77a';
    safe.style.fontWeight='950';
    safe.style.position='relative';
    safe.style.zIndex='20';
    safe.style.pointerEvents='auto';
    return safe;
  }

  function setHint(text){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let p=document.getElementById('resultSelectorSafeHint');
    if(!p){
      p=document.createElement('p');
      p.id='resultSelectorSafeHint';
      p.className='admin-note';
      form.insertAdjacentElement('afterend',p);
    }
    p.textContent=text;
  }

  async function loadMatches(){
    if(!ready())return[];
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter(m=>!hasResult(m))
      .sort((a,b)=>{
        const ap=isPast(a)?0:1,bp=isPast(b)?0:1;
        return (ap-bp)||String(a.time||'').localeCompare(String(b.time||''));
      });
  }

  async function refresh(){
    const select=ensureSafeSelect();
    if(!select||!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;
    const current=select.value;
    const matches=await loadMatches();
    const rows=matches.map(m=>{
      const status=isPast(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt / mangler resultat';
      return `<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${status}</option>`;
    }).join('');
    const html='<option value="">Velg kamp uten resultat</option>'+(rows||'<option value="" disabled>Ingen kamper uten resultat</option>');
    if(html!==lastHtml||select.innerHTML!==html){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    setHint(matches.length
      ? `Trygg resultatvelger aktiv: ${matches.length} kamp(er) mangler resultat. Sluttkamper ligger øverst.`
      : 'Trygg resultatvelger aktiv: ingen kamper mangler resultat akkurat nå.');
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(()=>{lastHtml='';setTimeout(refresh,80)},e=>console.warn('Safe result matches listen failed',e));
  }

  function bindSubmit(){
    if(bound)return;
    const form=document.getElementById('resultForm');
    if(!form)return;
    bound=true;
    form.addEventListener('submit',async e=>{
      const safe=document.getElementById('resultMatchSelectSafe');
      const result=form.querySelector('select[name="result"]');
      if(!safe||!result)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const id=safe.value;
      const pick=result.value;
      if(!id||!pick)return toast('Velg kamp og resultat');
      try{
        if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
        await firebase.firestore().collection('matches').doc(id).set({
          result:pick,
          updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
          updatedAtMs:Date.now()
        },{merge:true});
        toast('Resultat lagt inn');
        form.reset();
        lastHtml='';
        setTimeout(refresh,150);
        setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result:pick}),800);
      }catch(err){
        console.error('Safe result submit failed',err);
        toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
      }
    },true);
  }

  function boot(){
    if(!ready())return;
    ensureSafeSelect();
    bindSubmit();
    listen();
    refresh();
    setTimeout(refresh,300);
    setTimeout(refresh,1000);
  }

  window.VM_RESULT_SELECTOR_SAFE={boot,refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,300)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#resultForm'))setTimeout(boot,120)});
  setInterval(refresh,2500);
})();
