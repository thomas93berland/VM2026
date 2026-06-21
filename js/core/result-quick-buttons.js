(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const label=(m,r)=>r==='home'?(m.home||'Hjemme'):r==='away'?(m.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();

  async function checkAdmin(){
    if(!ready())return false;
    const u=firebase.auth().currentUser;
    try{
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=(u.email||'').toLowerCase()===ADMIN_EMAIL || !!(s.exists&&s.data()?.isAdmin===true);
    }catch{admin=(u.email||'').toLowerCase()===ADMIN_EMAIL;}
    return admin;
  }

  function addCss(){
    if(document.getElementById('quickResultButtonsCss'))return;
    const style=document.createElement('style');
    style.id='quickResultButtonsCss';
    style.textContent=`
      #resultForm .input{min-height:46px!important;}
      .quick-result-panel{display:grid!important;gap:10px!important;margin-top:14px!important;padding:12px!important;border-radius:18px!important;background:rgba(3,10,22,.52)!important;border:1px solid rgba(255,216,122,.16)!important;}
      .quick-result-title{color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;letter-spacing:.04em!important;text-transform:uppercase!important;}
      .quick-result-empty{padding:12px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;line-height:1.35!important;}
      .quick-result-row{display:grid!important;gap:8px!important;padding:10px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.92))!important;border:1px solid rgba(255,255,255,.08)!important;}
      .quick-result-row b{color:#fff!important;font-size:14px!important;line-height:1.2!important;}
      .quick-result-row small{color:rgba(215,219,228,.72)!important;font-size:11px!important;font-weight:800!important;}
      .quick-result-buttons{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;}
      .quick-result-buttons button{min-height:44px!important;border-radius:13px!important;border:1px solid rgba(228,184,78,.34)!important;background:rgba(228,184,78,.13)!important;color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;line-height:1.1!important;touch-action:manipulation!important;}
      .quick-result-buttons button:active{transform:scale(.98)!important;background:rgba(228,184,78,.24)!important;}
    `;
    document.head.appendChild(style);
  }

  function unresolved(ms){
    return (ms||[]).filter(m=>!hasResult(m)).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  function syncNativeSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    const list=unresolved(matches);
    select.innerHTML='<option value="">Velg kamp uten resultat</option>'+(
      list.length?list.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))}</option>`).join(''):'<option value="" disabled>Ingen kamper uten resultat</option>'
    );
  }

  function render(){
    addCss();
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
      panel.innerHTML='<div class="quick-result-title">Rask resultatvelger</div><div class="quick-result-empty">Ingen kamper uten resultat akkurat nå.</div>';
      return;
    }
    panel.innerHTML='<div class="quick-result-title">Rask resultatvelger</div>'+list.map(m=>`
      <div class="quick-result-row">
        <b>${esc(title(m))}</b>
        <small>${esc(when(m.time))}</small>
        <div class="quick-result-buttons">
          <button type="button" data-quick-result="home" data-match-id="${esc(m.id)}">H: ${esc(m.home||'Hjemme')}</button>
          <button type="button" data-quick-result="draw" data-match-id="${esc(m.id)}">U: Uavgjort</button>
          <button type="button" data-quick-result="away" data-match-id="${esc(m.id)}">B: ${esc(m.away||'Borte')}</button>
        </div>
      </div>`).join('');
  }

  async function saveResult(id,result){
    if(!id||!result)return toast('Velg kamp og resultat');
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    const m=matches.find(x=>x.id===id)||{};
    if(!confirm(`Legge inn ${label(m,result)} som resultat for ${title(m)}?`))return;

    const db=firebase.firestore();
    const ref=db.collection('matches').doc(id);
    const payload={
      result:String(result),
      resultLabel:label(m,result),
      status:'Ferdig',
      updatedBy:firebase.auth().currentUser.uid,
      updatedAtMs:Date.now()
    };

    try{
      await ref.update(payload);
    }catch(e){
      // Fallback dersom update feiler på gamle/importerte kampdokumenter.
      await ref.set(payload,{merge:true});
    }

    const check=await ref.get();
    const saved=check.exists ? check.data().result : null;
    if(String(saved)!==String(result)){
      throw new Error('Resultatet ble ikke lagret. Sjekk Firestore-regler eller innlogging.');
    }

    matches=matches.map(x=>x.id===id?{...x,...payload}:x);
    render();
    toast('Resultat lagt inn ✅');
    setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
  }

  function bind(){
    document.addEventListener('click',async e=>{
      const btn=e.target.closest?.('[data-quick-result][data-match-id]');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      try{await saveResult(btn.dataset.matchId,btn.dataset.quickResult)}
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
    listen();
    render();
    setTimeout(render,700);
    setTimeout(render,1600);
  }

  window.VM_QUICK_RESULT={boot,render,saveResult};
  bind();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,400);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,700)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,250)});
})();
