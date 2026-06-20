(()=>{
  let admin=false;
  let bound=false;
  let lastHtml='';
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const label=(m,p)=>p==='home'?m.home:p==='away'?m.away:'Uavgjort';
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Admin check failed',e);admin=false;return false}
  }

  function statusText(m){
    if(m.result)return '✅ resultat: '+label(m,m.result);
    const ms=Date.parse(m.time||'');
    if(Number.isFinite(ms)&&ms<Date.now())return '⏰ ferdig / mangler resultat';
    return '🟢 ikke spilt ennå';
  }

  async function loadMatches(){
    if(!ready())return [];
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refreshSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select||!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;

    const current=select.value;
    const matches=await loadMatches();
    const html='<option value="">Velg kamp</option>'+matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(statusText(m))}</option>`).join('');
    if(html!==lastHtml||select.options.length<2){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
  }

  async function submitResult(e){
    const form=document.getElementById('resultForm');
    if(!form||e.target!==form)return;
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
      setTimeout(refreshSelect,400);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
    }catch(err){
      console.error('Result override failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }
  }

  function addHint(){
    const form=document.getElementById('resultForm');
    if(!form||document.getElementById('resultFixHint'))return;
    const p=document.createElement('p');
    p.id='resultFixHint';
    p.className='admin-note';
    p.textContent='Resultatvelgeren viser nå alle kamper, også ferdige/passerte kamper og kamper med feil resultat som må overstyres.';
    form.insertAdjacentElement('afterend',p);
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    if(!bound){
      document.addEventListener('submit',submitResult,true);
      bound=true;
    }
    addHint();
    refreshSelect();
    setTimeout(refreshSelect,700);
    setTimeout(refreshSelect,1600);
  }

  window.VM_RESULT_FIX={boot,refreshSelect};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,300)});
  setInterval(refreshSelect,5000);
})();
