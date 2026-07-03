(()=>{
  if(window.VM_RESULT_CLICK_FIX_LOADED)return;
  window.VM_RESULT_CLICK_FIX_LOADED=true;

  let admin=false;
  let saving=false;
  let lastHtml='';
  let unsubMatches=null;
  let matches=[];

  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const clean=s=>String(s??'').trim();
  const hasResult=m=>!!clean(m?.result);
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const past=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};
  const status=m=>past(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt ennå';
  const toast=msg=>{try{const t=$('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};

  function addCss(){
    if($('resultClickFixCss'))return;
    const s=document.createElement('style');
    s.id='resultClickFixCss';
    s.textContent=`
      #page-betting #adminPanel{position:relative!important;z-index:80!important;overflow:visible!important;}
      #page-betting #resultForm{position:relative!important;z-index:90!important;display:grid!important;gap:10px!important;}
      #page-betting #resultForm select,
      #page-betting #resultForm button{position:relative!important;z-index:95!important;pointer-events:auto!important;touch-action:manipulation!important;}
      #page-betting #resultForm button,
      #safeResultSaveBtn{grid-column:1/-1!important;min-height:52px!important;border-radius:16px!important;font-size:15px!important;font-weight:1000!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;}
      #page-betting #resultForm button.is-saving,
      #safeResultSaveBtn.is-saving{opacity:.65!important;filter:saturate(.8)!important;}
      #resultFixHint{grid-column:1/-1!important;color:rgba(235,238,247,.72)!important;line-height:1.35!important;}
      @media(max-width:880px){#page-betting #adminPanel{margin-bottom:120px!important;}#page-betting #resultForm{grid-template-columns:1fr!important;}}
    `;
    document.head.appendChild(s);
  }

  async function checkAdmin(){
    try{
      if(!ready()){admin=false;return false}
      const u=firebase.auth().currentUser;
      const snap=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(snap.exists&&snap.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result admin check failed',e);admin=false;return false}
  }

  function unresolved(){
    return matches
      .filter(m=>!hasResult(m))
      .sort((a,b)=>{
        const ap=past(a)?0:1,bp=past(b)?0:1;
        return (ap-bp)||String(a.time||'').localeCompare(String(b.time||''));
      });
  }

  function renderSelect(){
    const select=$('resultMatchSelect');
    if(!select)return;
    const old=select.value;
    const rows=unresolved();
    const html='<option value="">Velg kamp uten resultat</option>'+(rows.length?rows.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(status(m))}</option>`).join(''):'<option value="" disabled>Ingen kamper uten resultat</option>');
    if(html!==lastHtml){
      lastHtml=html;
      select.innerHTML=html;
      if(old&&[...select.options].some(o=>o.value===old))select.value=old;
    }
  }

  function listenMatches(){
    if(!ready()||unsubMatches)return;
    unsubMatches=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      renderSelect();
    },e=>console.warn('Result match listen failed',e));
  }

  function prepareButton(){
    const form=$('resultForm');
    if(!form)return;
    let btn=form.querySelector('button');
    if(btn){
      btn.type='button';
      btn.id='resultSaveButton';
      btn.textContent='Lagre resultat';
      btn.disabled=false;
      btn.classList.add('btn','primary');
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();saveResult()};
    }
    let hint=$('resultFixHint');
    if(!hint){
      hint=document.createElement('p');
      hint.id='resultFixHint';
      hint.className='admin-note';
      form.insertAdjacentElement('afterend',hint);
    }
    hint.textContent='Velgeren viser kun kamper som mangler resultat. Knappen lagrer direkte, uten form-submit.';
  }

  async function saveResult(){
    if(saving)return;
    const form=$('resultForm');
    if(!form)return toast('Fant ikke resultat-skjema');
    const matchId=clean($('resultMatchSelect')?.value);
    const result=clean(form.querySelector('[name="result"]')?.value);
    if(!matchId||!result)return toast('Velg kamp og resultat');
    saving=true;
    const btn=$('resultSaveButton')||form.querySelector('button');
    try{
      if(btn){btn.classList.add('is-saving');btn.disabled=true;btn.textContent='Lagrer...'}
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      await firebase.firestore().collection('matches').doc(matchId).set({
        result,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat lagret');
      form.querySelector('[name="result"]').value='';
      if($('resultMatchSelect'))$('resultMatchSelect').value='';
      matches=matches.map(m=>m.id===matchId?{...m,result}:m);
      lastHtml='';
      renderSelect();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id:matchId,result}),500);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),900);
    }catch(e){
      console.error('Result click save failed',e);
      toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke lagre resultat'));
    }finally{
      saving=false;
      if(btn){btn.classList.remove('is-saving');btn.disabled=false;btn.textContent='Lagre resultat'}
    }
  }

  function bindHardEvents(){
    document.addEventListener('submit',e=>{
      if(e.target?.id==='resultForm'){
        e.preventDefault();
        e.stopImmediatePropagation();
        saveResult();
      }
    },true);
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('#resultSaveButton,#resultForm button');
      if(btn&&btn.closest?.('#resultForm')){
        e.preventDefault();
        e.stopImmediatePropagation();
        saveResult();
      }
    },true);
  }

  async function boot(){
    addCss();
    prepareButton();
    if(ready()){
      await checkAdmin();
      listenMatches();
      renderSelect();
    }
    setTimeout(prepareButton,300);
    setTimeout(renderSelect,600);
  }

  window.VM_RESULT_CLICK_FIX={boot,saveResult,renderSelect};
  bindHardEvents();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,summary'))setTimeout(boot,220)});
  setInterval(()=>{prepareButton();renderSelect()},2500);
})();
