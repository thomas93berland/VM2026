(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;
  let saving=false;
  let selectedMatchId='';
  let selectedResult='';

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;t.style.zIndex='999999';clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,6000)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};
  const resultLabel=(m,r)=>r==='home'?(m?.home||'Hjemme'):r==='away'?(m?.away||'Borte'):'Uavgjort';

  function status(msg,kind=''){
    const el=document.getElementById('mobileResultStatus');
    if(!el)return;
    el.textContent=msg;
    el.style.color=kind==='bad'?'#ffb0b0':kind==='good'?'#a9ffd0':'rgba(235,238,247,.82)';
    el.style.fontWeight='950';
  }

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
    if(document.getElementById('mobileResultPickerCss'))return;
    const style=document.createElement('style');
    style.id='mobileResultPickerCss';
    style.textContent=`
      #simpleResultBox,#simpleResultCss{display:none!important;}
      #resultForm{display:none!important;}
      #mobileResultBox{margin:16px 0 0!important;padding:15px!important;border-radius:20px!important;background:linear-gradient(145deg,rgba(15,25,43,.90),rgba(3,10,22,.96))!important;border:1px solid rgba(255,216,122,.35)!important;box-shadow:0 12px 30px rgba(0,0,0,.24)!important;position:relative!important;z-index:80!important;}
      #mobileResultBox h3{margin:0 0 6px!important;color:#ffd77a!important;font-size:17px!important;font-weight:1000!important;letter-spacing:.01em!important;}
      #mobileResultBox .result-help{margin:0 0 12px!important;color:rgba(235,238,247,.72)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;}
      #mobileResultBox .result-list{display:grid!important;gap:8px!important;max-height:310px!important;overflow:auto!important;padding-right:3px!important;margin-bottom:13px!important;-webkit-overflow-scrolling:touch!important;}
      #mobileResultBox .result-match-btn{width:100%!important;text-align:left!important;border-radius:15px!important;border:1px solid rgba(255,255,255,.10)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;padding:11px 12px!important;display:grid!important;gap:3px!important;touch-action:manipulation!important;position:relative!important;z-index:90!important;}
      #mobileResultBox .result-match-btn strong{font-size:14px!important;line-height:1.18!important;color:#fff!important;font-weight:950!important;}
      #mobileResultBox .result-match-btn small{font-size:11px!important;color:rgba(235,238,247,.70)!important;font-weight:800!important;}
      #mobileResultBox .result-match-btn.is-past small{color:#ffd77a!important;}
      #mobileResultBox .result-match-btn.active{border-color:rgba(255,216,122,.72)!important;background:rgba(228,184,78,.15)!important;box-shadow:0 0 0 2px rgba(228,184,78,.10)!important;}
      #mobileResultBox .result-picks{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;margin:12px 0!important;}
      #mobileResultBox .result-pick-btn{min-height:46px!important;border-radius:14px!important;border:1px solid rgba(255,216,122,.32)!important;background:rgba(255,255,255,.055)!important;color:#ffe08a!important;font-size:13px!important;font-weight:1000!important;touch-action:manipulation!important;position:relative!important;z-index:90!important;}
      #mobileResultBox .result-pick-btn.active{background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;border-color:rgba(255,216,122,.68)!important;}
      #mobileResultBox #mobileSaveResult{width:100%!important;min-height:54px!important;border-radius:16px!important;border:1px solid rgba(255,216,122,.58)!important;background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;font-size:16px!important;font-weight:1000!important;touch-action:manipulation!important;position:relative!important;z-index:100!important;}
      #mobileResultBox #mobileSaveResult:disabled{opacity:.58!important;filter:saturate(.65)!important;}
      #mobileResultBox .result-status{margin:10px 0 0!important;color:rgba(235,238,247,.78)!important;font-size:12px!important;font-weight:850!important;line-height:1.35!important;}
      #mobileResultBox .result-empty{padding:12px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;}
      @media(max-width:430px){#mobileResultBox{padding:13px!important;border-radius:18px!important;margin-bottom:96px!important}#mobileResultBox .result-picks{grid-template-columns:1fr!important}#mobileResultBox .result-list{max-height:340px!important}}
    `;
    document.head.appendChild(style);
  }

  function removeBrokenBoxes(){
    document.getElementById('simpleResultBox')?.remove();
    document.getElementById('simpleResultCss')?.remove();
    const old=document.getElementById('resultForm');
    if(old)old.hidden=true;
  }

  function unresolved(){
    return matches.filter(m=>!hasResult(m)).sort((a,b)=>(isPast(b)?1:0)-(isPast(a)?1:0)||String(a.time||'').localeCompare(String(b.time||'')));
  }

  function ensureBox(){
    addCss();
    removeBrokenBoxes();
    const panel=document.getElementById('adminPanel');
    if(!panel)return null;
    let box=document.getElementById('mobileResultBox');
    if(box)return box;
    box=document.createElement('section');
    box.id='mobileResultBox';
    box.innerHTML=`
      <h3>✅ Resultatvelger</h3>
      <p class="result-help">Trykk på kamp, velg resultat, og lagre. Viser kun kamper som mangler resultat.</p>
      <div class="result-list" id="mobileResultList"></div>
      <div class="result-picks" id="mobileResultPicks">
        <button type="button" class="result-pick-btn" data-result-pick="home">Hjemme</button>
        <button type="button" class="result-pick-btn" data-result-pick="draw">Uavgjort</button>
        <button type="button" class="result-pick-btn" data-result-pick="away">Borte</button>
      </div>
      <button type="button" id="mobileSaveResult">Lagre resultat</button>
      <p class="result-status" id="mobileResultStatus">Laster kamper...</p>`;
    const matchForm=document.getElementById('matchForm');
    if(matchForm)matchForm.insertAdjacentElement('afterend',box);else panel.appendChild(box);
    return box;
  }

  function selectedMatch(){return matches.find(m=>m.id===selectedMatchId)}

  function render(){
    const box=ensureBox();
    if(!box)return;
    const list=document.getElementById('mobileResultList');
    const rows=unresolved();
    if(selectedMatchId&&!rows.some(m=>m.id===selectedMatchId)){selectedMatchId='';selectedResult=''}
    if(list){
      list.innerHTML=rows.length?rows.map(m=>`<button type="button" class="result-match-btn ${m.id===selectedMatchId?'active':''} ${isPast(m)?'is-past':''}" data-result-match="${esc(m.id)}"><strong>${esc(title(m))}</strong><small>${esc(when(m.time))} · ${isPast(m)?'Slutt/startet · mangler resultat':'Ikke spilt ennå'}</small></button>`).join(''):'<div class="result-empty">Ingen kamper mangler resultat akkurat nå.</div>';
    }
    document.querySelectorAll('[data-result-pick]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.resultPick===selectedResult);
      const m=selectedMatch();
      if(btn.dataset.resultPick==='home')btn.textContent=m?m.home||'Hjemme':'Hjemme';
      if(btn.dataset.resultPick==='away')btn.textContent=m?m.away||'Borte':'Borte';
      if(btn.dataset.resultPick==='draw')btn.textContent='Uavgjort';
    });
    const m=selectedMatch();
    if(!saving){
      status(m&&selectedResult?`Klar: ${title(m)} → ${resultLabel(m,selectedResult)}`:`Admin OK · ${rows.length} kamp(er) mangler resultat.`);
    }
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      render();
    },e=>{console.warn('Result match listen failed',e);toast('Kunne ikke laste kamper')});
  }

  async function save(){
    if(saving)return;
    const btn=document.getElementById('mobileSaveResult');
    try{
      if(!(await checkAdmin())){status('Mangler admin-tilgang: users/{uid}.isAdmin er ikke true.','bad');return toast('Kun admin kan legge inn resultat')}
      const id=selectedMatchId;
      const result=selectedResult;
      const m=selectedMatch();
      if(!id){status('Velg en kamp først.','bad');return toast('Velg kamp først')}
      if(!result){status('Velg Hjemme, Uavgjort eller Borte først.','bad');return toast('Velg resultat først')}
      saving=true;
      if(btn){btn.disabled=true;btn.textContent='Lagrer resultat...'}
      status(`Lagrer: ${title(m)} → ${resultLabel(m,result)} ...`);
      const ref=firebase.firestore().collection('matches').doc(id);
      await ref.set({result,status:'Ferdig',updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAtMs:Date.now()},{merge:true});
      const verify=await ref.get();
      if(String(verify.data()?.result||'')!==result)throw new Error('Resultatet ble ikke bekreftet i Firestore');
      toast('Resultat lagret ✅');
      status(`Lagret ✅ ${title(m)} → ${resultLabel(m,result)}`,'good');
      selectedMatchId='';
      selectedResult='';
      setTimeout(render,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Result save failed',err);
      const msg=(err?.code?err.code+': ':'')+(err?.message||'Kunne ikke lagre resultat');
      status(msg,'bad');
      toast(msg);
    }finally{
      saving=false;
      if(btn){btn.disabled=false;btn.textContent='Lagre resultat'}
    }
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('click',e=>{
      const matchBtn=e.target.closest?.('[data-result-match]');
      if(matchBtn){e.preventDefault();e.stopPropagation();selectedMatchId=matchBtn.dataset.resultMatch;selectedResult='';render();return}
      const pickBtn=e.target.closest?.('[data-result-pick]');
      if(pickBtn){e.preventDefault();e.stopPropagation();selectedResult=pickBtn.dataset.resultPick;render();return}
      if(e.target.closest?.('#mobileSaveResult')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();save();return}
    },true);
    document.addEventListener('submit',e=>{
      if(e.target?.id==='resultForm'||e.target?.id==='simpleResultForm'){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    },true);
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    ensureBox();
    bind();
    listen();
    render();
  }

  window.VM_RESULT_FIX={boot,refreshSelect:render,render,save};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#mobileResultBox'))setTimeout(boot,200)});
  setInterval(()=>{removeBrokenBoxes();if(admin)render()},4000);
})();
