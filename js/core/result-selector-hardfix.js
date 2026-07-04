(()=>{
  if(window.VM_RESULT_SELECTOR_HARDFIX_LOADED)return;
  window.VM_RESULT_SELECTOR_HARDFIX_LOADED=true;

  let admin=false;
  let matches=[];
  let lastHtml='';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,p)=>p==='home'?m.home:p==='away'?m.away:'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const started=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<=Date.now()};
  const status=m=>started(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt enda';

  function addCss(){
    if(document.getElementById('resultSelectorHardfixCss'))return;
    const s=document.createElement('style');
    s.id='resultSelectorHardfixCss';
    s.textContent=`
      #resultMatchSelect{min-height:48px!important;border-color:rgba(255,216,122,.34)!important;background:rgba(3,10,22,.86)!important;color:#fff!important;font-weight:850!important;}
      #resultForm select[name="result"]{min-height:48px!important;border-color:rgba(255,216,122,.24)!important;}
      .result-hardfix-panel{margin-top:13px!important;padding:12px!important;border-radius:18px!important;background:rgba(3,10,22,.46)!important;border:1px solid rgba(255,216,122,.16)!important;display:grid!important;gap:10px!important;}
      .result-hardfix-head{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.04em!important;}
      .result-hardfix-count{color:rgba(235,238,247,.70)!important;font-size:11px!important;text-transform:none!important;letter-spacing:0!important;}
      .result-hardfix-list{display:grid!important;gap:9px!important;}
      .result-hardfix-row{display:grid!important;gap:8px!important;padding:10px!important;border-radius:15px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.075)!important;}
      .result-hardfix-row.past{border-color:rgba(255,216,122,.28)!important;background:rgba(228,184,78,.075)!important;box-shadow:0 0 18px rgba(228,184,78,.08)!important;}
      .result-hardfix-match{display:grid!important;gap:3px!important;width:100%!important;padding:0!important;border:0!important;background:transparent!important;text-align:left!important;color:#fff!important;cursor:pointer!important;}
      .result-hardfix-match b{font-size:14px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      .result-hardfix-match small{font-size:11px!important;color:rgba(235,238,247,.68)!important;font-weight:800!important;}
      .result-hardfix-buttons{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important;}
      .result-hardfix-buttons button{min-height:38px!important;border-radius:12px!important;border:1px solid rgba(255,216,122,.26)!important;background:rgba(228,184,78,.11)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;cursor:pointer!important;}
      .result-hardfix-buttons button:active{transform:scale(.98)!important;}
      .result-hardfix-empty{padding:11px!important;border-radius:14px!important;background:rgba(255,255,255,.04)!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.72)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
    `;
    document.head.appendChild(s);
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const snap=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(snap.exists&&snap.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result hardfix admin failed',e);admin=false;return false}
  }

  async function loadMatches(){
    if(!ready())return[];
    const snap=await firebase.firestore().collection('matches').get();
    matches=snap.docs.map(d=>({id:d.id,...d.data()}))
      .filter(m=>!hasResult(m))
      .sort((a,b)=>(started(b)?1:0)-(started(a)?1:0)||String(a.time||'9999').localeCompare(String(b.time||'9999')));
    return matches;
  }

  function renderSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    const opt=m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(status(m))}</option>`;
    const past=matches.filter(started);
    const future=matches.filter(m=>!started(m));
    let body='';
    if(past.length)body+=`<optgroup label="Slutt / mangler resultat">${past.map(opt).join('')}</optgroup>`;
    if(future.length)body+=`<optgroup label="Ikke spilt enda">${future.map(opt).join('')}</optgroup>`;
    if(!body)body='<option value="" disabled>Ingen kamper uten resultat</option>';
    const html='<option value="">Velg kamp uten resultat</option>'+body;
    if(html!==lastHtml){
      const current=select.value;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
      lastHtml=html;
    }
  }

  function renderPanel(){
    const form=document.getElementById('resultForm');
    if(!form)return;
    let panel=document.getElementById('resultHardfixPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='resultHardfixPanel';
      panel.className='result-hardfix-panel';
      form.insertAdjacentElement('afterend',panel);
    }
    const past=matches.filter(started).length;
    if(!matches.length){
      panel.innerHTML='<div class="result-hardfix-head"><span>Kamper uten resultat</span><span class="result-hardfix-count">0 stk</span></div><div class="result-hardfix-empty">Ingen kamper mangler resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML=`<div class="result-hardfix-head"><span>Kamper uten resultat</span><span class="result-hardfix-count">${matches.length} stk · ${past} slutt</span></div><div class="result-hardfix-list">${matches.map(m=>`<article class="result-hardfix-row ${started(m)?'past':'future'}"><button class="result-hardfix-match" type="button" data-select-result-match="${esc(m.id)}"><b>${esc(title(m))}</b><small>${esc(when(m.time))} · ${esc(status(m))}</small></button><div class="result-hardfix-buttons"><button type="button" data-hard-result="home" data-match-id="${esc(m.id)}">H · ${esc(m.home||'Hjemme')}</button><button type="button" data-hard-result="draw" data-match-id="${esc(m.id)}">U · Uavgjort</button><button type="button" data-hard-result="away" data-match-id="${esc(m.id)}">B · ${esc(m.away||'Borte')}</button></div></article>`).join('')}</div>`;
  }

  async function saveResult(id,result){
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    const match=matches.find(m=>m.id===id)||{};
    await firebase.firestore().collection('matches').doc(id).set({
      result,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtMs:Date.now()
    },{merge:true});
    toast('Resultat lagt inn: '+label(match,result));
    document.getElementById('resultForm')?.reset();
    lastHtml='';
    setTimeout(boot,250);
    setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result,time:match.time||null}),900);
  }

  function bindClicks(){
    if(document.body?.dataset.resultHardfixClicks==='1')return;
    document.body.dataset.resultHardfixClicks='1';
    document.addEventListener('click',async e=>{
      const pick=e.target.closest?.('[data-select-result-match]');
      if(pick){
        e.preventDefault();
        const select=document.getElementById('resultMatchSelect');
        if(select)select.value=pick.dataset.selectResultMatch;
        return;
      }
      const btn=e.target.closest?.('[data-hard-result]');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      const id=btn.dataset.matchId;
      const result=btn.dataset.hardResult;
      const match=matches.find(m=>m.id===id)||{};
      const s1=document.getElementById('resultMatchSelect');
      const s2=document.querySelector('#resultForm select[name="result"]');
      if(s1)s1.value=id;
      if(s2)s2.value=result;
      if(!confirm(`Legg inn resultat?\n\n${title(match)}\nResultat: ${label(match,result)}`))return;
      try{await saveResult(id,result)}catch(err){console.error('Hard result failed',err);toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'))}
    },true);
  }

  async function boot(){
    if(!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;
    addCss();
    bindClicks();
    await loadMatches();
    renderSelect();
    renderPanel();
    window.VM_RESULT_SELECTOR_OK=true;
  }

  window.VM_RESULT_SELECTOR_HARDFIX={boot,saveResult,loadMatches};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,220)});
  setInterval(boot,2500);
})();
