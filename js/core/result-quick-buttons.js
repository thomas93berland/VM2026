(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;
  let saving=false;
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,r)=>r==='home'?(m.home||'Hjemme'):r==='away'?(m.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const isStarted=m=>{const ms=Date.parse(m?.time||'');return !Number.isFinite(ms)||ms<=Date.now()+60000};

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    const email=String(u.email||'').toLowerCase();
    const name=String(u.displayName||email.split('@')[0]||'').toLowerCase();
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=email===ADMIN_EMAIL||name.includes('thomas')||!!(s.exists&&s.data()?.isAdmin===true);
    }catch(e){
      console.warn('Quick result admin check failed',e);
      admin=email===ADMIN_EMAIL||name.includes('thomas');
    }
    openAdminUi();
    return admin;
  }

  function openAdminUi(){
    if(!admin)return;
    const panel=document.getElementById('adminPanel');
    if(panel){panel.hidden=false;panel.style.display='block';panel.classList.remove('admin-locked')}
    const locked=document.getElementById('adminLocked');
    if(locked)locked.hidden=true;
    document.querySelectorAll('.admin-only').forEach(el=>{el.hidden=false;el.style.display='block'});
  }

  function addCss(){
    if(document.getElementById('quickResultButtonsCss'))return;
    const style=document.createElement('style');
    style.id='quickResultButtonsCss';
    style.textContent=`
      #resultForm,#resultFixHint,#resultSelectorSimpleHint{display:none!important;}
      #resultMatchSelect,#resultMatchSelectSafe{display:none!important;pointer-events:none!important;}
      .quick-result-panel{display:grid!important;gap:10px!important;margin-top:14px!important;padding:13px!important;border-radius:19px!important;background:linear-gradient(145deg,rgba(12,24,43,.88),rgba(4,10,21,.95))!important;border:1px solid rgba(255,216,122,.20)!important;position:relative!important;z-index:50!important;pointer-events:auto!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;}
      .quick-result-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;letter-spacing:.04em!important;text-transform:uppercase!important;}
      .quick-result-title span{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:32px!important;height:27px!important;border-radius:999px!important;background:rgba(228,184,78,.12)!important;border:1px solid rgba(228,184,78,.28)!important;color:#ffd77a!important;font-size:12px!important;}
      .quick-result-note{color:rgba(235,238,247,.70)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;margin-top:-2px!important;}
      .quick-result-empty{padding:12px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;line-height:1.35!important;border:1px dashed rgba(255,255,255,.12)!important;}
      .quick-result-row{display:grid!important;gap:8px!important;padding:11px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.92))!important;border:1px solid rgba(255,255,255,.08)!important;}
      .quick-result-row b{color:#fff!important;font-size:14px!important;line-height:1.2!important;}
      .quick-result-row small{color:rgba(215,219,228,.72)!important;font-size:11px!important;font-weight:800!important;}
      .quick-result-status{color:#ffd77a!important;font-size:11px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.03em!important;}
      .quick-result-buttons{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;}
      .quick-result-buttons button{min-height:46px!important;border-radius:13px!important;border:1px solid rgba(228,184,78,.34)!important;background:rgba(228,184,78,.13)!important;color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;line-height:1.1!important;touch-action:manipulation!important;pointer-events:auto!important;cursor:pointer!important;}
      .quick-result-buttons button:active{transform:scale(.98)!important;background:rgba(228,184,78,.24)!important;}
      .quick-result-buttons button[disabled]{opacity:.55!important;cursor:wait!important;}
    `;
    document.head.appendChild(style);
  }

  function unresolved(){
    return (matches||[])
      .filter(m=>!hasResult(m))
      .sort((a,b)=>{
        const as=isStarted(a)?0:1,bs=isStarted(b)?0:1;
        return as-bs||String(a.time||'').localeCompare(String(b.time||''));
      });
  }

  function render(){
    addCss();
    openAdminUi();
    const adminPanel=document.getElementById('adminPanel');
    if(!adminPanel||!admin)return;
    let panel=document.getElementById('quickResultPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='quickResultPanel';
      panel.className='quick-result-panel';
      const form=document.getElementById('resultForm');
      if(form)form.insertAdjacentElement('afterend',panel);
      else adminPanel.appendChild(panel);
    }
    const list=unresolved();
    if(!list.length){
      panel.innerHTML='<div class="quick-result-title">Resultatknapper <span>0</span></div><div class="quick-result-empty">Ingen kamper mangler resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML=`<div class="quick-result-title">Resultatknapper <span>${list.length}</span></div><div class="quick-result-note">Viser kun kamper uten resultat. Slutt/startede kamper ligger øverst. Trykk direkte på riktig utfall.</div>`+list.map(m=>`
      <div class="quick-result-row">
        <b>${esc(title(m))}</b>
        <small>${esc(when(m.time))}</small>
        <div class="quick-result-status">${isStarted(m)?'Slutt/startet · mangler resultat':'Ikke spilt ennå · uten resultat'}</div>
        <div class="quick-result-buttons">
          <button type="button" data-quick-result="home" data-match-id="${esc(m.id)}">H: ${esc(m.home||'Hjemme')}</button>
          <button type="button" data-quick-result="draw" data-match-id="${esc(m.id)}">U: Uavgjort</button>
          <button type="button" data-quick-result="away" data-match-id="${esc(m.id)}">B: ${esc(m.away||'Borte')}</button>
        </div>
      </div>`).join('');
  }

  async function saveResult(id,result,button=null){
    if(saving)return;
    if(!id||!result)return toast('Velg kamp og resultat');
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    saving=true;
    if(button)button.disabled=true;
    const m=matches.find(x=>x.id===id)||{};
    const ok=confirm(`Legge inn resultat?\n\n${title(m)}\nResultat: ${label(m,result)}`);
    if(!ok){saving=false;if(button)button.disabled=false;return}
    const db=firebase.firestore();
    const ref=db.collection('matches').doc(id);
    const payload={
      result:String(result),
      resultLabel:label(m,result),
      status:'Ferdig',
      updatedBy:firebase.auth().currentUser.uid,
      updatedAtMs:Date.now(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    try{
      await ref.set(payload,{merge:true});
      const check=await ref.get();
      const saved=check.exists?check.data().result:null;
      if(String(saved)!==String(result))throw new Error('Resultatet ble ikke lagret. Sjekk Firestore-regler eller innlogging.');
      matches=matches.map(x=>x.id===id?{...x,...payload}:x);
      render();
      toast(`Resultat lagt inn: ${label(m,result)} ✅`);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),850);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error(err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }finally{
      saving=false;
      if(button)button.disabled=false;
    }
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('click',async e=>{
      const btn=e.target.closest?.('[data-quick-result][data-match-id]');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      await saveResult(btn.dataset.matchId,btn.dataset.quickResult,btn);
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      render();
    },e=>console.warn('Quick result listen failed',e));
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    bind();
    listen();
    render();
    setTimeout(render,500);
    setTimeout(render,1400);
  }

  window.VM_QUICK_RESULT={boot,render,saveResult};
  bind();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,500)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#quickResultPanel'))setTimeout(boot,250)});
  setInterval(()=>{if(admin)render()},3000);
})();
