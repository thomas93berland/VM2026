(()=>{
  let admin=false,bound=false,lastHtml='';
  const $=id=>document.getElementById(id);
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=$('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,5200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();

  function status(msg,kind=''){
    const form=$('resultForm'); if(!form)return;
    let p=$('resultHardfixStatus');
    if(!p){p=document.createElement('p');p.id='resultHardfixStatus';p.className='admin-note';form.insertAdjacentElement('afterend',p)}
    p.textContent=msg;
    p.style.color=kind==='bad'?'#ffb0b0':kind==='good'?'#a9ffd0':'#ffd77a';
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Admin check failed',e);admin=false;return false}
  }

  function forceAdminUi(){
    if(!admin)return;
    const panel=$('adminPanel'),locked=$('adminLocked');
    if(panel)panel.hidden=false;
    if(locked)locked.hidden=true;
  }

  function matchStatus(m){
    const ms=Date.parse(m.time||'');
    return Number.isFinite(ms)&&ms<Date.now()?'slutt / mangler resultat':'ikke spilt ennå';
  }

  async function loadOpenMatches(){
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).filter(m=>!hasResult(m)).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refreshSelect(){
    const select=$('resultMatchSelect');
    if(!select||!ready())return;
    await checkAdmin();
    forceAdminUi();
    if(!admin){
      select.innerHTML='<option value="">Mangler admin-tilgang</option>';
      status('Du er innlogget, men Firestore-brukeren din mangler isAdmin:true. Resultat kan ikke lagres før admin er aktiv.', 'bad');
      return;
    }
    try{
      const current=select.value;
      const matches=await loadOpenMatches();
      const rows=matches.length?matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(matchStatus(m))}</option>`).join(''):'<option value="" disabled>Ingen kamper uten resultat</option>';
      const html='<option value="">Velg kamp uten resultat</option>'+rows;
      if(html!==lastHtml||select.options.length<2){
        lastHtml=html;
        select.innerHTML=html;
        if(current&&[...select.options].some(o=>o.value===current))select.value=current;
      }
      status(matches.length?`${matches.length} kamp(er) mangler resultat.`:'Alle kamper har resultat.', matches.length?'':'good');
    }catch(e){
      console.error('Could not refresh result selector',e);
      status('Kunne ikke laste resultatvelger: '+(e?.message||e),'bad');
    }
  }

  async function saveResult(form){
    if(!ready())return toast('Logg inn først');
    if(!(await checkAdmin())){
      status('Stoppet: users/{uid}.isAdmin er ikke true. Firestore vil nekte lagring.', 'bad');
      return toast('Mangler admin-tilgang');
    }
    forceAdminUi();
    const fd=new FormData(form);
    const matchId=String(fd.get('matchId')||'').trim();
    const result=String(fd.get('result')||'').trim();
    if(!matchId||!result)return toast('Velg kamp og resultat');
    try{
      status('Lagrer resultat...');
      const ref=firebase.firestore().collection('matches').doc(matchId);
      await ref.set({result,status:'Ferdig',updatedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      const verify=await ref.get();
      if(String(verify.data()?.result||'')!==result)throw new Error('Resultatet ble ikke bekreftet i Firestore');
      form.reset();
      lastHtml='';
      toast('Resultat lagret ✅');
      status('Resultat lagret. Bets oppdateres automatisk.', 'good');
      setTimeout(refreshSelect,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id:matchId,result}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(e){
      console.error('Result save failed',e);
      let msg=(e?.code?e.code+': ':'')+(e?.message||'Kunne ikke lagre resultat');
      if(e?.code==='permission-denied')msg+=' — Firestore nekter. Sjekk at bruker-dokumentet ditt har isAdmin:true.';
      status(msg,'bad');
      toast(msg);
    }
  }

  function bind(){
    const form=$('resultForm');
    if(!form||bound)return;
    bound=true;
    form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveResult(form)},true);
    document.addEventListener('submit',e=>{if(e.target===$('resultForm')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveResult(e.target)}},true);
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    forceAdminUi();
    bind();
    refreshSelect();
    setTimeout(refreshSelect,600);
    setTimeout(refreshSelect,1600);
  }

  window.VM_RESULT_SAVE_HARDFIX={boot,refreshSelect,saveResult,checkAdmin};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,summary'))setTimeout(boot,250)});
  setInterval(()=>{if(ready())boot()},5000);
})();
