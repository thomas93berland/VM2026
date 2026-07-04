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

  function cleanupOldPanels(){
    document.getElementById('directResultPanel')?.remove();
    document.getElementById('directResultPanelCss')?.remove();
    document.getElementById('directResultPanelCssOld')?.remove();
    document.getElementById('vmResultButtonPanel')?.remove();
    const form=document.getElementById('resultForm');
    if(form){form.style.display='';form.hidden=false;}
  }

  function addCss(){
    if(document.getElementById('resultSelectorFixCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorFixCss';
    style.textContent=`
      #resultForm{display:grid!important;opacity:1!important;visibility:visible!important;gap:10px!important;}
      #resultMatchSelect,#resultForm select[name="result"]{min-height:48px!important;border-color:rgba(255,216,122,.36)!important;background:rgba(3,10,22,.76)!important;color:#fff!important;font-weight:850!important;}
      #resultMatchSelect option,#resultForm select[name="result"] option{background:#07111f!important;color:#fff!important;}
      #resultFixHint{color:rgba(255,216,122,.82)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
      #resultQuickPanel{margin-top:12px!important;padding:12px!important;border-radius:18px!important;background:rgba(3,10,22,.48)!important;border:1px solid rgba(255,216,122,.18)!important;display:grid!important;gap:10px!important;}
      .result-quick-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.04em!important;}
      .result-quick-head small{color:rgba(235,238,247,.70)!important;font-size:11px!important;text-transform:none!important;letter-spacing:0!important;}
      .result-quick-list{display:grid!important;gap:9px!important;}
      .result-quick-row{display:grid!important;gap:8px!important;padding:10px!important;border-radius:15px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.075)!important;}
      .result-quick-row.past{border-color:rgba(255,216,122,.28)!important;background:rgba(228,184,78,.075)!important;box-shadow:0 0 18px rgba(228,184,78,.08)!important;}
      .result-quick-match{display:grid!important;gap:3px!important;width:100%!important;padding:0!important;border:0!important;background:transparent!important;text-align:left!important;color:#fff!important;cursor:pointer!important;}
      .result-quick-match b{font-size:14px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      .result-quick-match small{font-size:11px!important;color:rgba(235,238,247,.68)!important;font-weight:800!important;}
      .result-quick-buttons{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important;}
      .result-quick-buttons button{min-height:38px!important;border-radius:12px!important;border:1px solid rgba(255,216,122,.26)!important;background:rgba(228,184,78,.11)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;cursor:pointer!important;}
      .result-quick-buttons button:active{transform:scale(.98)!important;}
      .result-quick-empty{padding:11px!important;border-radius:14px!important;background:rgba(255,255,255,.04)!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.72)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
    `;
    document.head.appendChild(style);
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=firebase.firestore().collection('users').doc(u.uid);
      const snap=await s.get();
      admin=!!(snap.exists&&snap.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result selector admin check failed',e);admin=false;return false}
  }

  function unresolvedMatches(){
    return matches.filter(m=>!hasResult(m)).sort((a,b)=>{
      const ap=isPast(a)?0:1;
      const bp=isPast(b)?0:1;
      return (ap-bp)||(timeMs(a)-timeMs(b))||title(a).localeCompare(title(b));
    });
  }

  function statusText(m){return isPast(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt ennå'}

  function renderSelect(){
    cleanupOldPanels();
    addCss();
    const select=document.getElementById('resultMatchSelect');
    if(!select||!admin)return;
    const current=select.value;
    const rows=unresolvedMatches();
    const past=rows.filter(isPast);
    const future=rows.filter(m=>!isPast(m));
    const opt=m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(statusText(m))}</option>`;
    let body='';
    if(past.length)body+=`<optgroup label="Slutt / mangler resultat">${past.map(opt).join('')}</optgroup>`;
    if(future.length)body+=`<optgroup label="Ikke spilt ennå">${future.map(opt).join('')}</optgroup>`;
    if(!body)body='<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastHtml||select.options.length<2){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    renderQuickPanel(rows);
    addHint();
  }

  function renderQuickPanel(rows){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let panel=document.getElementById('resultQuickPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='resultQuickPanel';
      form.insertAdjacentElement('afterend',panel);
    }
    const past=rows.filter(isPast).length;
    if(!rows.length){
      panel.innerHTML='<div class="result-quick-head"><span>Kamper uten resultat</span><small>0 stk</small></div><div class="result-quick-empty">Ingen kamper mangler resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML=`<div class="result-quick-head"><span>Kamper uten resultat</span><small>${rows.length} stk · ${past} slutt</small></div><div class="result-quick-list">${rows.map(m=>`<article class="result-quick-row ${isPast(m)?'past':'future'}"><button class="result-quick-match" type="button" data-select-match="${esc(m.id)}"><b>${esc(title(m))}</b><small>${esc(when(m.time))} · ${esc(statusText(m))}</small></button><div class="result-quick-buttons"><button type="button" data-quick-result="home" data-match-id="${esc(m.id)}">H · ${esc(m.home||'Hjemme')}</button><button type="button" data-quick-result="draw" data-match-id="${esc(m.id)}">U · Uavgjort</button><button type="button" data-quick-result="away" data-match-id="${esc(m.id)}">B · ${esc(m.away||'Borte')}</button></div></article>`).join('')}</div>`;
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
    cleanupOldPanels();
    addCss();
    if(!ready())return;
    admin=await checkAdmin();
    if(!admin)return;
    listenMatches();
    if(!matches.length)await loadMatchesOnce();
    renderSelect();
  }

  async function saveResult(id,result){
    if(saving)return;
    saving=true;
    try{
      admin=await checkAdmin();
      if(!admin)return toast('Kun admin kan legge inn resultat');
      if(!id||!result)return toast('Velg kamp og resultat');
      const match=matches.find(m=>m.id===id)||{};
      if(match&&hasResult(match))return toast('Denne kampen har allerede resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        resultSetBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat lagt inn: '+label(match,result));
      document.getElementById('resultForm')?.reset();
      lastHtml='';
      await loadMatchesOnce();
      renderSelect();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result,time:match.time||null}),700);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1100);
    }catch(err){
      console.error('Result selector save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{saving=false}
  }

  async function submitResult(e){
    const form=document.getElementById('resultForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    const fd=new FormData(form);
    await saveResult(String(fd.get('matchId')||'').trim(),String(fd.get('result')||'').trim());
  }

  function addHint(){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let p=document.getElementById('resultFixHint');
    if(!p){p=document.createElement('p');p.id='resultFixHint';p.className='admin-note';document.getElementById('resultQuickPanel')?.insertAdjacentElement('afterend',p)||form.insertAdjacentElement('afterend',p)}
    const rows=unresolvedMatches();
    p.textContent=`Resultatvelgeren viser kun kamper uten resultat. Slutt-kamper ligger øverst. Antall: ${rows.length}.`;
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('submit',submitResult,true);
    document.addEventListener('click',async e=>{
      const pick=e.target.closest?.('[data-select-match]');
      if(pick){
        e.preventDefault();
        const select=document.getElementById('resultMatchSelect');
        if(select)select.value=pick.dataset.selectMatch;
        return;
      }
      const btn=e.target.closest?.('[data-quick-result]');
      if(btn){
        e.preventDefault();
        e.stopPropagation();
        const id=btn.dataset.matchId;
        const result=btn.dataset.quickResult;
        const match=matches.find(m=>m.id===id)||{};
        const matchSelect=document.getElementById('resultMatchSelect');
        const resultSelect=document.querySelector('#resultForm select[name="result"]');
        if(matchSelect)matchSelect.value=id;
        if(resultSelect)resultSelect.value=result;
        if(!confirm(`Legg inn resultat?\n\n${title(match)}\nResultat: ${label(match,result)}`))return;
        await saveResult(id,result);
        return;
      }
      if(e.target.closest?.('#resultMatchSelect,#resultForm,#adminPanel'))setTimeout(refreshSelect,100);
    },true);
  }

  async function boot(){
    if(!ready())return;
    cleanupOldPanels();
    addCss();
    bind();
    admin=await checkAdmin();
    if(!admin)return;
    listenMatches();
    refreshSelect();
    setTimeout(refreshSelect,500);
    setTimeout(refreshSelect,1400);
  }

  window.VM_RESULT_FIX={boot,refreshSelect,renderSelect,saveResult,unresolvedMatches,diagnose:()=>({loadedScript:'result-admin-fix-v6-quick-buttons',admin,bound,matches:matches.length,unresolved:unresolvedMatches().length,selectOptions:document.getElementById('resultMatchSelect')?.options?.length||0,quickRows:document.querySelectorAll('#resultQuickPanel [data-quick-result]').length})};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,250);else{admin=false;matches=[];lastHtml=''}})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,250)});
  setInterval(refreshSelect,2500);
})();
