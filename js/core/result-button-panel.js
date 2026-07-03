(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let booted=false;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const hasResult=m=>!!String(m?.result||'').trim();
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Result panel admin check failed',e);admin=false;return false}
  }

  function addCss(){
    if(document.getElementById('vmResultButtonPanelCss'))return;
    const style=document.createElement('style');
    style.id='vmResultButtonPanelCss';
    style.textContent=`
      #resultForm{display:none!important;}
      #resultFixHint{display:none!important;}
      .vm-result-panel{margin-top:14px!important;padding:14px!important;border-radius:20px!important;background:linear-gradient(145deg,rgba(12,24,43,.88),rgba(4,10,21,.94))!important;border:1px solid rgba(255,216,122,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;}
      .vm-result-panel-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;margin-bottom:12px!important;}
      .vm-result-panel-head h3{margin:0!important;color:#ffd77a!important;font-size:17px!important;font-weight:1000!important;letter-spacing:-.01em!important;}
      .vm-result-panel-head p{margin:4px 0 0!important;color:rgba(235,238,247,.70)!important;font-size:12px!important;line-height:1.35!important;font-weight:750!important;}
      .vm-result-count{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:34px!important;height:28px!important;border-radius:999px!important;background:rgba(228,184,78,.12)!important;border:1px solid rgba(228,184,78,.28)!important;color:#ffd77a!important;font-weight:1000!important;font-size:12px!important;}
      .vm-result-list{display:grid!important;gap:10px!important;}
      .vm-result-empty{padding:13px!important;border-radius:15px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;line-height:1.35!important;}
      .vm-result-row{display:grid!important;gap:10px!important;padding:12px!important;border-radius:16px!important;background:rgba(2,8,18,.42)!important;border:1px solid rgba(255,255,255,.08)!important;}
      .vm-result-meta{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;}
      .vm-result-meta small{color:rgba(235,238,247,.62)!important;font-size:11px!important;font-weight:850!important;}
      .vm-result-status{color:#ffd77a!important;font-size:11px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.035em!important;white-space:nowrap!important;}
      .vm-result-title{color:#fff!important;font-size:15px!important;font-weight:1000!important;line-height:1.2!important;}
      .vm-result-actions{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;}
      .vm-result-btn{min-height:42px!important;border-radius:13px!important;border:1px solid rgba(255,216,122,.26)!important;background:rgba(228,184,78,.10)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;line-height:1.1!important;padding:8px!important;cursor:pointer!important;touch-action:manipulation!important;}
      .vm-result-btn:hover{background:rgba(228,184,78,.18)!important;border-color:rgba(255,216,122,.45)!important;}
      .vm-result-btn:disabled{opacity:.55!important;cursor:wait!important;}
      @media(max-width:430px){.vm-result-panel{padding:12px!important;border-radius:18px!important}.vm-result-actions{grid-template-columns:1fr!important}.vm-result-btn{min-height:44px!important;font-size:13px!important}.vm-result-panel-head h3{font-size:16px!important}}
    `;
    document.head.appendChild(style);
  }

  function getUnresolved(){
    return [...matches]
      .filter(m=>!hasResult(m))
      .sort((a,b)=>{
        const ap=isPast(a)?0:1,bp=isPast(b)?0:1;
        return ap-bp||String(a.time||'').localeCompare(String(b.time||''));
      });
  }

  function ensurePanel(){
    const adminPanel=document.getElementById('adminPanel');
    if(!adminPanel)return null;
    let panel=document.getElementById('vmResultButtonPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='vmResultButtonPanel';
      panel.className='vm-result-panel';
      const resultForm=document.getElementById('resultForm');
      if(resultForm)resultForm.insertAdjacentElement('afterend',panel);
      else adminPanel.appendChild(panel);
    }
    return panel;
  }

  function render(){
    addCss();
    const panel=ensurePanel();
    if(!panel||!admin)return;
    const rows=getUnresolved();
    panel.innerHTML=`
      <div class="vm-result-panel-head">
        <div>
          <h3>Legg inn resultat</h3>
          <p>Viser kun kamper uten resultat. Bruk knappene under — dette overstyrer den ustabile dropdownen.</p>
        </div>
        <span class="vm-result-count">${rows.length}</span>
      </div>
      <div class="vm-result-list">
        ${rows.length?rows.map(m=>`
          <article class="vm-result-row" data-result-row="${esc(m.id)}">
            <div class="vm-result-meta">
              <small>${esc(when(m.time))}</small>
              <span class="vm-result-status">${isPast(m)?'Slutt / mangler resultat':'Ikke spilt ennå'}</span>
            </div>
            <div class="vm-result-title">${esc(title(m))}</div>
            <div class="vm-result-actions">
              <button class="vm-result-btn" type="button" data-result-match="${esc(m.id)}" data-result-pick="home">${esc(label(m,'home'))}</button>
              <button class="vm-result-btn" type="button" data-result-match="${esc(m.id)}" data-result-pick="draw">Uavgjort</button>
              <button class="vm-result-btn" type="button" data-result-match="${esc(m.id)}" data-result-pick="away">${esc(label(m,'away'))}</button>
            </div>
          </article>
        `).join(''):'<div class="vm-result-empty">Ingen kamper mangler resultat akkurat nå.</div>'}
      </div>
    `;
  }

  async function setResult(matchId,result,button){
    if(!matchId||!result)return;
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    const m=matches.find(x=>x.id===matchId);
    const ok=confirm(`Legge inn resultat: ${title(m||{})}\nResultat: ${label(m||{},result)}?`);
    if(!ok)return;
    try{
      if(button)button.disabled=true;
      await firebase.firestore().collection('matches').doc(matchId).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      toast('Resultat lagt inn');
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id:matchId,result}),700);
      setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),800);
    }catch(e){
      console.error('Result button failed',e);
      toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke legge inn resultat'));
    }finally{
      if(button)button.disabled=false;
    }
  }

  function bind(){
    if(document.body?.dataset.vmResultButtonsBound==='1')return;
    document.body.dataset.vmResultButtonsBound='1';
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-result-match][data-result-pick]');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      setResult(btn.dataset.resultMatch,btn.dataset.resultPick,btn);
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      render();
    },e=>console.warn('Result panel match listen failed',e));
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    booted=true;
    addCss();
    bind();
    listen();
    render();
  }

  window.VM_RESULT_BUTTON_PANEL={boot,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,400)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,200)});
  setInterval(()=>{if(booted)render()},4000);
})();
