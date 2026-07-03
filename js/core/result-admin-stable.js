(()=>{
  let admin=false;
  let bound=false;
  let lastHtml='';
  const RESULT_GRACE_MS=105*60*1000;
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const hasResult=m=>!!String(m?.result||'').trim();
  const msOf=v=>Date.parse(v||'');
  const resultReady=m=>{const ms=msOf(m?.time);return !Number.isFinite(ms)||Date.now()>=ms+RESULT_GRACE_MS};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>`${m.home||'Hjemme'} – ${m.away||'Borte'}`;
  const label=(m,p)=>p==='home'?m.home:p==='away'?m.away:'Uavgjort';

  function addCss(){
    if(document.getElementById('vmStableResultCss'))return;
    const style=document.createElement('style');
    style.id='vmStableResultCss';
    style.textContent=`
      #vmResultButtonPanel,#vmResultButtonPanelCss{display:none!important;}
      #adminPanel .vm-old-auto-result{display:none!important;}
      #resultForm{display:grid!important;gap:10px!important;margin-top:14px!important;}
      #resultForm .input,#resultForm button{min-height:46px!important;}
      #resultMatchSelect{border-color:rgba(255,216,122,.32)!important;background:rgba(3,10,22,.78)!important;color:#f6f1e6!important;}
      #resultForm select[name="result"]{border-color:rgba(255,216,122,.22)!important;background:rgba(3,10,22,.72)!important;}
      #resultFixHint{margin-top:10px!important;color:rgba(235,238,247,.74)!important;font-weight:850!important;line-height:1.35!important;}
      #resultFixHint strong{color:#ffd77a!important;}
    `;
    document.head.appendChild(style);
  }

  function killOldPanels(){
    try{
      document.getElementById('vmResultButtonPanel')?.remove();
      document.getElementById('vmResultButtonPanelCss')?.remove();
      document.querySelectorAll('#adminPanel article,#adminPanel section,#adminPanel .card,#adminPanel div').forEach(el=>{
        const txt=(el.textContent||'').toLowerCase();
        if(txt.includes('automatisk resultatpanel')||txt.includes('dropdownen er fjernet')){
          if(!el.closest('#resultForm')&&!el.matches('#adminPanel'))el.remove();
        }
      });
    }catch(e){console.warn('Old result panel cleanup skipped',e)}
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

  function activeWindowIds(){
    try{
      const ids=window.VM_UPCOMING_MATCH_SEED?.computeAllowedIds?.();
      if(ids&&ids.size)return ids;
    }catch(e){console.warn('Could not read active match window',e)}
    return null;
  }

  async function loadCandidates(){
    if(!ready())return [];
    const snap=await firebase.firestore().collection('matches').get();
    let rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    const ids=activeWindowIds();
    if(ids&&ids.size)rows=rows.filter(m=>ids.has(m.id));
    rows=rows.filter(m=>!hasResult(m)&&resultReady(m));
    return rows.sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refreshSelect(){
    killOldPanels();
    const select=document.getElementById('resultMatchSelect');
    if(!select||!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;
    const current=select.value;
    const matches=await loadCandidates();
    const body=matches.length
      ? matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · slutt / mangler resultat</option>`).join('')
      : '<option value="" disabled>Ingen ferdige kamper mangler resultat i aktiv 4-pakke</option>';
    const html='<option value="">Velg ferdig kamp uten resultat</option>'+body;
    if(html!==lastHtml||select.options.length<2){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    addHint(matches.length);
  }

  function addHint(count=0){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let p=document.getElementById('resultFixHint');
    if(!p){
      p=document.createElement('p');
      p.id='resultFixHint';
      p.className='admin-note';
      form.insertAdjacentElement('afterend',p);
    }
    p.innerHTML=`Admin OK · <strong>${count}</strong> ferdige kamp(er) i aktiv 4-pakke mangler resultat.`;
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
      const matchSnap=await firebase.firestore().collection('matches').doc(id).get();
      const match=matchSnap.exists?{id,...matchSnap.data()}:null;
      const msg=match?`Legge inn resultat?\n\n${title(match)}: ${label(match,result)}`:'Legge inn resultat?';
      if(!confirm(msg))return;
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      form.reset();
      lastHtml='';
      toast('Resultat lagt inn');
      setTimeout(refreshSelect,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),900);
    }catch(err){
      console.error('Stable result save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }
  }

  async function boot(){
    addCss();
    killOldPanels();
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    if(!bound){
      document.addEventListener('submit',submitResult,true);
      bound=true;
    }
    refreshSelect();
    setTimeout(refreshSelect,400);
    setTimeout(refreshSelect,1200);
    setTimeout(killOldPanels,1600);
  }

  window.VM_RESULT_FIX={boot,refreshSelect,killOldPanels,loadCandidates};
  window.VM_RESULT_STABLE={boot,refreshSelect,killOldPanels,loadCandidates};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,180)});
  setInterval(()=>{killOldPanels();refreshSelect()},1800);
})();
