(()=>{
  let admin=false;
  let bound=false;
  let lastHtml='';
  let unsubMatches=null;
  let matches=[];
  let saving=false;

  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const timeMs=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)?ms:Number.MAX_SAFE_INTEGER};
  const isPast=m=>timeMs(m)<=Date.now();

  function cleanupDirectPanel(){
    document.getElementById('directResultPanel')?.remove();
    document.getElementById('directResultPanelCss')?.remove();
    document.getElementById('directResultPanelCssOld')?.remove();
    document.getElementById('vmResultButtonPanel')?.remove();
    const form=document.getElementById('resultForm');
    if(form){
      form.style.display='';
      form.hidden=false;
    }
  }

  function addCss(){
    if(document.getElementById('resultSelectorFixCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorFixCss';
    style.textContent=`
      #resultForm{display:grid!important;opacity:1!important;visibility:visible!important;}
      #resultMatchSelect,#resultForm select[name="result"]{
        min-height:48px!important;
        border-color:rgba(255,216,122,.36)!important;
        background:rgba(3,10,22,.76)!important;
        color:#fff!important;
        font-weight:850!important;
      }
      #resultMatchSelect option,#resultForm select[name="result"] option{background:#07111f!important;color:#fff!important;}
      #resultFixHint{color:rgba(255,216,122,.82)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
    `;
    document.head.appendChild(style);
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){
      console.warn('Result selector admin check failed',e);
      admin=false;
      return false;
    }
  }

  function unresolvedMatches(){
    return matches
      .filter(m=>!hasResult(m))
      .sort((a,b)=>{
        const ap=isPast(a)?0:1;
        const bp=isPast(b)?0:1;
        return (ap-bp)||(timeMs(a)-timeMs(b))||title(a).localeCompare(title(b));
      });
  }

  function statusText(m){
    return isPast(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt ennå';
  }

  function renderSelect(){
    cleanupDirectPanel();
    addCss();
    const select=document.getElementById('resultMatchSelect');
    if(!select||!admin)return;
    const current=select.value;
    const rows=unresolvedMatches();
    const body=rows.length
      ? rows.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(statusText(m))}</option>`).join('')
      : '<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastHtml||select.options.length<2){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    addHint();
  }

  async function loadMatchesOnce(){
    if(!ready())return;
    const snap=await firebase.firestore().collection('matches').get();
    matches=snap.docs.map(d=>({id:d.id,...d.data()}));
    renderSelect();
  }

  function listenMatches(){
    if(!ready()||unsubMatches)return;
    unsubMatches=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      renderSelect();
    },e=>{console.warn('Result selector match listen failed',e);toast('Kunne ikke laste kamper til resultatvelgeren')});
  }

  async function refreshSelect(){
    cleanupDirectPanel();
    addCss();
    if(!ready())return;
    admin=await checkAdmin();
    if(!admin)return;
    listenMatches();
    if(!matches.length)await loadMatchesOnce();
    renderSelect();
  }

  async function submitResult(e){
    const form=document.getElementById('resultForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    if(saving)return;
    saving=true;
    try{
      admin=await checkAdmin();
      if(!admin)return toast('Kun admin kan legge inn resultat');
      const fd=new FormData(form);
      const id=String(fd.get('matchId')||'').trim();
      const result=String(fd.get('result')||'').trim();
      if(!id||!result)return toast('Velg kamp og resultat');
      const match=matches.find(m=>m.id===id);
      if(match&&hasResult(match))return toast('Denne kampen har allerede resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        resultSetBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat lagt inn');
      form.reset();
      lastHtml='';
      await loadMatchesOnce();
      renderSelect();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1100);
    }catch(err){
      console.error('Result selector submit failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{
      saving=false;
    }
  }

  function addHint(){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let p=document.getElementById('resultFixHint');
    if(!p){
      p=document.createElement('p');
      p.id='resultFixHint';
      p.className='admin-note';
      form.insertAdjacentElement('afterend',p);
    }
    const n=unresolvedMatches().length;
    p.textContent=`Resultatvelgeren viser kun kamper uten resultat. Kamper som er slutt ligger øverst. Antall i velgeren: ${n}.`;
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('submit',submitResult,true);
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#resultMatchSelect,#resultForm,#adminPanel'))setTimeout(refreshSelect,100);
    },true);
  }

  async function boot(){
    if(!ready())return;
    cleanupDirectPanel();
    addCss();
    bind();
    admin=await checkAdmin();
    if(!admin)return;
    listenMatches();
    refreshSelect();
    setTimeout(refreshSelect,500);
    setTimeout(refreshSelect,1400);
  }

  window.VM_RESULT_FIX={boot,refreshSelect,renderSelect,unresolvedMatches,diagnose:()=>({loadedScript:'result-admin-fix-v5-dropdown',admin,bound,matches:matches.length,unresolved:unresolvedMatches().length,selectOptions:document.getElementById('resultMatchSelect')?.options?.length||0})};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,250);else{admin=false;matches=[];lastHtml=''}})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,250)});
  setInterval(refreshSelect,3000);
})();
