(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,5200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      const panel=document.getElementById('adminPanel');
      const locked=document.getElementById('adminLocked');
      if(panel){panel.hidden=!admin;if(admin)panel.open=true}
      if(locked)locked.hidden=admin;
      return admin;
    }catch(e){console.warn('Admin check failed',e);admin=false;return false}
  }

  function addCss(){
    if(document.getElementById('simpleResultCss'))return;
    const style=document.createElement('style');
    style.id='simpleResultCss';
    style.textContent=`
      #simpleResultBox{margin:14px 0!important;padding:14px!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(15,25,43,.88),rgba(3,10,22,.94))!important;border:1px solid rgba(255,216,122,.35)!important;box-shadow:0 10px 28px rgba(0,0,0,.22)!important;}
      #simpleResultBox h3{margin:0 0 10px!important;color:#ffd77a!important;font-size:15px!important;font-weight:1000!important;}
      #simpleResultForm{display:grid!important;grid-template-columns:minmax(0,1.4fr) minmax(0,.8fr) auto!important;gap:10px!important;align-items:center!important;}
      #simpleResultForm select,#simpleResultForm button{min-height:50px!important;border-radius:14px!important;font-size:14px!important;font-weight:900!important;}
      #simpleResultForm select{width:100%!important;padding:0 12px!important;background:rgba(3,10,22,.94)!important;color:#ffe08a!important;border:1px solid rgba(255,216,122,.48)!important;}
      #simpleResultForm button{padding:0 15px!important;border:1px solid rgba(255,216,122,.58)!important;background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;}
      #simpleResultNote{margin:10px 0 0!important;color:rgba(235,238,247,.78)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;}
      @media(max-width:720px){#simpleResultForm{grid-template-columns:1fr!important}#simpleResultForm button{width:100%!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureBox(){
    addCss();
    const panel=document.getElementById('adminPanel');
    if(!panel)return;
    let box=document.getElementById('simpleResultBox');
    if(box)return box;
    box=document.createElement('section');
    box.id='simpleResultBox';
    box.innerHTML=`
      <h3>✅ Enkel resultatvelger</h3>
      <form id="simpleResultForm">
        <select id="simpleResultMatch" name="matchId" required><option value="">Laster kamper...</option></select>
        <select id="simpleResultPick" name="result" required>
          <option value="">Velg resultat</option>
          <option value="home">Hjemmeseier</option>
          <option value="draw">Uavgjort</option>
          <option value="away">Borteseier</option>
        </select>
        <button type="submit">Lagre resultat</button>
      </form>
      <p id="simpleResultNote">Viser bare kamper som mangler resultat.</p>`;
    const matchForm=document.getElementById('matchForm');
    if(matchForm)matchForm.insertAdjacentElement('afterend',box);else panel.appendChild(box);
    return box;
  }

  function unresolved(){
    return matches.filter(m=>!hasResult(m)).sort((a,b)=>(isPast(b)?1:0)-(isPast(a)?1:0)||String(a.time||'').localeCompare(String(b.time||'')));
  }

  function renderSelect(){
    ensureBox();
    const select=document.getElementById('simpleResultMatch');
    const note=document.getElementById('simpleResultNote');
    if(!select)return;
    const rows=unresolved();
    const current=select.value;
    select.innerHTML=rows.length?'<option value="">Velg kamp uten resultat</option>'+rows.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${isPast(m)?'slutt/startet':'ikke spilt'}</option>`).join(''):'<option value="">Ingen kamper uten resultat</option>';
    if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    if(note)note.textContent=admin?`Admin OK · ${rows.length} kamp(er) mangler resultat.`:'Admin ikke aktiv.';
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      renderSelect();
    },e=>console.warn('Result match listen failed',e));
  }

  async function save(e){
    const form=e.target.closest?.('#simpleResultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    const fd=new FormData(form);
    const id=fd.get('matchId');
    const result=fd.get('result');
    if(!id||!result)return toast('Velg kamp og resultat');
    try{
      await firebase.firestore().collection('matches').doc(id).set({result,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAtMs:Date.now()},{merge:true});
      toast('Resultat lagret ✅');
      form.reset();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Result save failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke lagre resultat'));
    }
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    ensureBox();
    listen();
    renderSelect();
    if(!bound){document.addEventListener('submit',save,true);bound=true}
  }

  window.VM_RESULT_FIX={boot,refreshSelect:renderSelect};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#simpleResultBox'))setTimeout(boot,200)});
})();
