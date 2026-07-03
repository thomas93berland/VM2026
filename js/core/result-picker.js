(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let booted=false;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>`${m.home||'Hjemme'} – ${m.away||'Borte'}`;
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result picker admin check failed',e);admin=false;return false}
  }

  function addCss(){
    if(document.getElementById('safeResultPickerCss'))return;
    const style=document.createElement('style');
    style.id='safeResultPickerCss';
    style.textContent=`
      #resultForm.safe-result-hidden{display:none!important;}
      #safeResultPicker{display:grid!important;gap:10px!important;margin-top:13px!important;}
      #safeResultPicker .srp-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-bottom:2px!important;}
      #safeResultPicker .srp-head b{color:#ffd77a!important;font-size:14px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.04em!important;}
      #safeResultPicker .srp-head small{color:rgba(235,238,247,.66)!important;font-size:11px!important;font-weight:850!important;}
      #safeResultPicker .srp-card{padding:12px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.88))!important;border:1px solid rgba(255,216,122,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important;}
      #safeResultPicker .srp-title{display:grid!important;gap:4px!important;margin-bottom:10px!important;}
      #safeResultPicker .srp-title strong{color:#fff!important;font-size:15px!important;font-weight:950!important;line-height:1.18!important;}
      #safeResultPicker .srp-title small{color:rgba(235,238,247,.68)!important;font-size:11px!important;font-weight:800!important;line-height:1.2!important;}
      #safeResultPicker .srp-past{color:#ffd77a!important;}
      #safeResultPicker .srp-actions{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;}
      #safeResultPicker .srp-btn{min-height:42px!important;border-radius:13px!important;border:1px solid rgba(255,216,122,.25)!important;background:rgba(228,184,78,.10)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;line-height:1.05!important;cursor:pointer!important;touch-action:manipulation!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important;}
      #safeResultPicker .srp-btn:active{transform:scale(.98)!important;}
      #safeResultPicker .srp-empty{padding:13px!important;border-radius:16px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.12)!important;color:rgba(235,238,247,.76)!important;font-weight:850!important;line-height:1.35!important;}
      @media(max-width:430px){#safeResultPicker .srp-actions{grid-template-columns:1fr!important}#safeResultPicker .srp-btn{min-height:40px!important}}
    `;
    document.head.appendChild(style);
  }

  function unresolved(){
    return matches
      .filter(m=>!hasResult(m))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  function ensurePanel(){
    const form=document.getElementById('resultForm');
    if(!form)return null;
    form.classList.add('safe-result-hidden');
    let panel=document.getElementById('safeResultPicker');
    if(!panel){
      panel=document.createElement('section');
      panel.id='safeResultPicker';
      form.insertAdjacentElement('afterend',panel);
    }
    return panel;
  }

  function syncOriginalSelect(list){
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    select.innerHTML='<option value="">Velg kamp uten resultat</option>'+list.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))}</option>`).join('');
  }

  function render(){
    addCss();
    const panel=ensurePanel();
    if(!panel)return;
    const list=unresolved();
    syncOriginalSelect(list);
    const head=`<div class="srp-head"><b>Resultatvelger</b><small>${list.length} kamp${list.length===1?'':'er'} uten resultat</small></div>`;
    if(!list.length){
      panel.innerHTML=head+'<div class="srp-empty">Ingen kamper mangler resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML=head+list.map(m=>`
      <article class="srp-card" data-result-card="${esc(m.id)}">
        <div class="srp-title">
          <strong>${esc(title(m))}</strong>
          <small>${esc(when(m.time))} · ${isPast(m)?'<span class="srp-past">Slutt / mangler resultat</span>':'Ikke spilt ennå'}</small>
        </div>
        <div class="srp-actions">
          <button type="button" class="srp-btn" data-result-match="${esc(m.id)}" data-result-pick="home">H: ${esc(label(m,'home'))}</button>
          <button type="button" class="srp-btn" data-result-match="${esc(m.id)}" data-result-pick="draw">U: Uavgjort</button>
          <button type="button" class="srp-btn" data-result-match="${esc(m.id)}" data-result-pick="away">B: ${esc(label(m,'away'))}</button>
        </div>
      </article>
    `).join('');
  }

  async function setResult(matchId,result){
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    const m=matches.find(x=>x.id===matchId);
    if(!m)return toast('Fant ikke kampen');
    const ok=confirm(`Legge inn resultat for ${title(m)}?\n\nResultat: ${label(m,result)}`);
    if(!ok)return;
    try{
      await firebase.firestore().collection('matches').doc(matchId).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      toast('Resultat lagt inn');
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id:matchId,result}),800);
    }catch(e){
      console.error('Stable result picker failed',e);
      toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke legge inn resultat'));
    }
  }

  function bind(){
    if(document.body?.dataset.safeResultPickerBound==='1')return;
    document.body.dataset.safeResultPickerBound='1';
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-result-match][data-result-pick]');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      setResult(btn.dataset.resultMatch,btn.dataset.resultPick);
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      render();
    },e=>console.warn('Result picker matches failed',e));
  }

  async function boot(){
    addCss();
    bind();
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    ensurePanel();
    listen();
    render();
    booted=true;
  }

  window.VM_SAFE_RESULT_PICKER={boot,render,setResult};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,250)});
  setInterval(()=>{if(booted)render()},5000);
})();
