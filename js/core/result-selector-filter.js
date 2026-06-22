(()=>{
  let last='';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const past=m=>{const ms=Date.parse(m.time||'');return Number.isFinite(ms)&&ms<=Date.now()};
  const missing=m=>!String(m.result||'').trim();

  async function refresh(){
    if(!ready())return;
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    const snap=await firebase.firestore().collection('matches').get();
    const matches=snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>missing(m)&&past(m)).sort((a,b)=>Date.parse(a.time||'')-Date.parse(b.time||''));
    const html='<option value="">Velg ferdig kamp uten resultat</option>'+(matches.length?matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))}</option>`).join(''):'<option value="" disabled>Ingen ferdige kamper uten resultat</option>');
    if(html!==last){last=html;const cur=select.value;select.innerHTML=html;if(cur&&[...select.options].some(o=>o.value===cur))select.value=cur;}
  }

  function boot(){refresh();setTimeout(refresh,300);setTimeout(refresh,900);}
  window.VM_RESULT_SELECTOR_FILTER={boot,refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#resultMatchSelect,#adminPanel'))setTimeout(refresh,120)});
  setInterval(refresh,1000);
})();
