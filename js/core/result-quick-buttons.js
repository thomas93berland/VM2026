(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;
  let saving=false;
  let writingSelect=false;
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,r)=>r==='home'?(m.home||'Hjemme'):r==='away'?(m.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<=Date.now()};

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    const email=(u.email||'').toLowerCase();
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=email===ADMIN_EMAIL || !!(s.exists&&s.data()?.isAdmin===true);
    }catch(e){
      console.warn('Quick result admin check failed',e);
      admin=email===ADMIN_EMAIL;
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
      #resultForm{position:relative!important;z-index:20!important;pointer-events:auto!important;}
      #resultForm .input{min-height:48px!important;pointer-events:auto!important;position:relative!important;z-index:30!important;}
      #resultMatchSelect{background:rgba(3,10,22,.90)!important;color:#ffd77a!important;border-color:rgba(255,216,122,.42)!important;font-weight:950!important;}
      .quick-result-panel{display:grid!important;gap:10px!important;margin-top:14px!important;padding:12px!important;border-radius:18px!important;background:rgba(3,10,22,.52)!important;border:1px solid rgba(255,216,122,.16)!important;position:relative!important;z-index:5!important;pointer-events:auto!important;}
      .quick-result-title{color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;letter-spacing:.04em!important;text-transform:uppercase!important;}
      .quick-result-empty{padding:12px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;line-height:1.35!important;}
      .quick-result-row{display:grid!important;gap:8px!important;padding:10px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.92))!important;border:1px solid rgba(255,255,255,.08)!important;}
      .quick-result-row b{color:#fff!important;font-size:14px!important;line-height:1.2!important;}
      .quick-result-row small{color:rgba(215,219,228,.72)!important;font-size:11px!important;font-weight:800!important;}
      .quick-result-buttons{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;}
      .quick-result-buttons button{min-height:46px!important;border-radius:13px!important;border:1px solid rgba(228,184,78,.34)!important;background:rgba(228,184,78,.13)!important;color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;line-height:1.1!important;touch-action:manipulation!important;pointer-events:auto!important;cursor:pointer!important;}
      .quick-result-buttons button:active{transform:scale(.98)!important;background:rgba(228,184,78,.24)!important;}
      .quick-result-buttons button[disabled]{opacity:.55!important;cursor:wait!important;}
    `;
    document.head.appendChild(style);
  }

  function unresolved(ms){
    return (ms||[]).filter(m=>!hasResult(m)&&isPast(m)).sort((a,b)=>Date.parse(a.time||'')-Date.parse(b.time||''));
  }

  function nativeInnerHtmlDescriptor(el){
    let p=el;
    while(p){
      const d=Object.getOwnPropertyDescriptor(p,'innerHTML');
      if(d?.get&&d?.set)return d;
      p=Object.getPrototypeOf(p);
    }
    return null;
  }

  function lockNativeSelect(select){
    if(!select||select.dataset.quickResultLocked==='yes')return;
    const d=nativeInnerHtmlDescriptor(select);
    if(!d)return;
    Object.defineProperty(select,'innerHTML',{
      configurable:true,
      get(){return d.get.call(this)},
      set(v){
        if(writingSelect){d.set.call(this,v);return;}
        setTimeout(syncNativeSelect,60);
      }
    });
    select.dataset.quickResultLocked='yes';
  }

  function syncNativeSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    lockNativeSelect(select);
    const current=select.value;
    const list=unresolved(matches);
    const html='<option value="">Velg ferdig kamp uten resultat</option>'+(
      list.length?list.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · slutt / mangler resultat</option>`).join(''):'<option value="" disabled>Ingen ferdige kamper uten resultat</option>'
    );
    if(select.innerHTML!==html||select.options.length<2){
      writingSelect=true;
      try{
        select.innerHTML=html;
        if(current&&[...select.options].some(o=>o.value===current))select.value=current;
      }finally{writingSelect=false;}
    }
    select.disabled=false;
  }

  function render(){
    addCss();
    openAdminUi();
    const form=document.getElementById('resultForm');
    if(!form||!admin)return;
    syncNativeSelect();
    let panel=document.getElementById('quickResultPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='quickResultPanel';
      panel.className='quick-result-panel';
      form.insertAdjacentElement('afterend',panel);
    }
    const list=unresolved(matches);
    if(!list.length){
      panel.innerHTML='<div class="quick-result-title">Rask resultatvelger</div><div class="quick-result-empty">Ingen ferdige kamper mangler resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML='<div class="quick-result-title">Rask resultatvelger · kun sluttede kamper</div>'+list.map(m=>`
      <div class="quick-result-row">
        <b>${esc(title(m))}</b>
        <small>${esc(when(m.time))} · slutt / mangler resultat</small>
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
      setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),850);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
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
      try{await saveResult(btn.dataset.matchId,btn.dataset.quickResult,btn)}
      catch(err){console.error(err);toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'))}
    },true);
    document.addEventListener('submit',async e=>{
      const form=e.target.closest?.('#resultForm');
      if(!form)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const fd=new FormData(form);
      try{await saveResult(fd.get('matchId'),fd.get('result'))}
      catch(err){console.error(err);toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'))}
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
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#resultForm,#resultMatchSelect,#adminPanel'))setTimeout(boot,250)});
  setInterval(()=>{if(admin)render()},3000);
})();
