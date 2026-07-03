(()=>{
  if(window.VM_RESULT_MOBILE_HOTFIX_V2)return;
  window.VM_RESULT_MOBILE_HOTFIX_V2=true;

  let admin=false;
  let matches=[];
  let unsub=null;
  let selectedMatchId='';
  let selectedResult='';
  let saving=false;

  const ADMIN_EMAIL='thomas93berland@gmail.com';
  const $=id=>document.getElementById(id);
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const clean=s=>String(s??'').trim();
  const hasResult=m=>!!clean(m?.result);
  const msOf=v=>Date.parse(v||'');
  const started=m=>{const ms=msOf(m?.time);return !Number.isFinite(ms)||ms<=Date.now()+60000};
  const title=m=>(m?.home||'Hjemme')+' – '+(m?.away||'Borte');
  const resultLabel=(m,r)=>r==='home'?(m?.home||'Hjemme'):r==='away'?(m?.away||'Borte'):'Uavgjort';
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const toast=msg=>{try{const t=$('toast');if(t){t.textContent=msg;t.hidden=false;t.style.zIndex='999999';clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,6000)}else alert(msg)}catch{alert(msg)}};

  function withTimeout(promise,ms,label){
    let timer;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error((label||'Operasjon')+' tok for lang tid. Prøv refresh og lagre igjen.')),ms)});
    return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
  }

  async function checkAdmin(){
    if(!ready()){admin=false;return false}
    const u=firebase.auth().currentUser;
    const email=String(u?.email||'').toLowerCase();
    try{
      const s=await withTimeout(firebase.firestore().collection('users').doc(u.uid).get(),6000,'Admin-sjekk');
      admin=!!(s.exists&&s.data()?.isAdmin===true)||email===ADMIN_EMAIL;
    }catch(e){
      console.warn('Mobile result admin check failed',e);
      admin=email===ADMIN_EMAIL;
    }
    const panel=$('adminPanel'),locked=$('adminLocked');
    if(panel){panel.hidden=!admin;if(admin)panel.open=true}
    if(locked)locked.hidden=admin;
    return admin;
  }

  function addCss(){
    if($('vmResultMobileHotfixCss'))return;
    const style=document.createElement('style');
    style.id='vmResultMobileHotfixCss';
    style.textContent=`
      #resultForm{display:none!important;}
      #mobileResultBox{margin:16px 0 130px!important;padding:15px!important;border-radius:20px!important;background:linear-gradient(145deg,rgba(15,25,43,.92),rgba(3,10,22,.97))!important;border:1px solid rgba(255,216,122,.42)!important;box-shadow:0 14px 34px rgba(0,0,0,.30)!important;position:relative!important;z-index:160!important;overflow:visible!important;}
      #mobileResultBox h3{margin:0 0 7px!important;color:#ffd77a!important;font-size:17px!important;font-weight:1000!important;}
      #mobileResultBox .result-help{margin:0 0 12px!important;color:rgba(235,238,247,.76)!important;font-size:12px!important;font-weight:850!important;line-height:1.38!important;}
      #mobileResultBox .result-list{display:grid!important;gap:8px!important;max-height:330px!important;overflow:auto!important;padding:0 3px 2px 0!important;margin-bottom:13px!important;-webkit-overflow-scrolling:touch!important;}
      #mobileResultBox .result-match-btn{width:100%!important;text-align:left!important;border-radius:16px!important;border:1px solid rgba(255,255,255,.11)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;padding:11px 12px!important;display:grid!important;gap:3px!important;touch-action:manipulation!important;position:relative!important;z-index:170!important;cursor:pointer!important;}
      #mobileResultBox .result-match-btn strong{font-size:14px!important;line-height:1.18!important;color:#fff!important;font-weight:950!important;}
      #mobileResultBox .result-match-btn small{font-size:11px!important;color:rgba(235,238,247,.70)!important;font-weight:850!important;line-height:1.2!important;}
      #mobileResultBox .result-match-btn.is-started small{color:#ffd77a!important;}
      #mobileResultBox .result-match-btn.active{border-color:rgba(255,216,122,.78)!important;background:rgba(228,184,78,.16)!important;box-shadow:0 0 0 2px rgba(228,184,78,.12)!important;}
      #mobileResultBox .result-picks{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;margin:12px 0!important;}
      #mobileResultBox .result-pick-btn{min-height:46px!important;border-radius:15px!important;border:1px solid rgba(255,216,122,.34)!important;background:rgba(255,255,255,.055)!important;color:#ffe08a!important;font-size:13px!important;font-weight:1000!important;touch-action:manipulation!important;position:relative!important;z-index:180!important;cursor:pointer!important;}
      #mobileResultBox .result-pick-btn.active{background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;border-color:rgba(255,216,122,.72)!important;}
      #mobileResultBox #mobileSaveResult{width:100%!important;min-height:54px!important;border-radius:17px!important;border:1px solid rgba(255,216,122,.62)!important;background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;font-size:16px!important;font-weight:1000!important;touch-action:manipulation!important;position:relative!important;z-index:190!important;cursor:pointer!important;}
      #mobileResultBox #mobileSaveResult:disabled{opacity:.62!important;filter:saturate(.65)!important;cursor:wait!important;}
      #mobileResultBox .result-status{margin:10px 0 0!important;color:rgba(235,238,247,.82)!important;font-size:12px!important;font-weight:900!important;line-height:1.35!important;word-break:break-word!important;}
      #mobileResultBox .result-status.good{color:#a9ffd0!important;}
      #mobileResultBox .result-status.bad{color:#ffb0b0!important;}
      #mobileResultBox .result-empty{padding:12px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.78)!important;font-weight:850!important;}
      @media(max-width:430px){#mobileResultBox{padding:13px!important;border-radius:18px!important;margin-bottom:145px!important}#mobileResultBox .result-picks{grid-template-columns:1fr!important}#mobileResultBox .result-list{max-height:340px!important}}
    `;
    document.head.appendChild(style);
  }

  function status(msg,kind=''){
    const el=$('mobileResultStatus');
    if(!el)return;
    el.textContent=msg;
    el.className='result-status '+kind;
  }

  function ensureBox(){
    addCss();
    const panel=$('adminPanel');
    if(!panel)return null;
    const form=$('resultForm');
    if(form)form.style.display='none';
    let box=$('mobileResultBox');
    if(!box){
      box=document.createElement('section');
      box.id='mobileResultBox';
      const matchForm=$('matchForm');
      if(matchForm)matchForm.insertAdjacentElement('afterend',box);else panel.appendChild(box);
    }
    box.innerHTML=`
      <h3>✅ Resultatvelger</h3>
      <p class="result-help">Trykk på kamp, velg resultat, og lagre. Viser kun kamper som mangler resultat.</p>
      <div class="result-list" id="mobileResultList"></div>
      <div class="result-picks" id="mobileResultPicks">
        <button type="button" class="result-pick-btn" data-hotfix-pick="home">Hjemme</button>
        <button type="button" class="result-pick-btn" data-hotfix-pick="draw">Uavgjort</button>
        <button type="button" class="result-pick-btn" data-hotfix-pick="away">Borte</button>
      </div>
      <button type="button" id="mobileSaveResult">Lagre resultat</button>
      <p class="result-status" id="mobileResultStatus">Laster kamper...</p>`;
    return box;
  }

  function unresolved(){
    return matches.filter(m=>!hasResult(m)).sort((a,b)=>{const as=started(a)?0:1,bs=started(b)?0:1;return(as-bs)||String(a.time||'').localeCompare(String(b.time||''))});
  }
  function selectedMatch(){return matches.find(m=>m.id===selectedMatchId)}

  function render(){
    const box=ensureBox();
    if(!box)return;
    const list=unresolved();
    if(selectedMatchId&&!list.some(m=>m.id===selectedMatchId)){selectedMatchId='';selectedResult=''}
    const listBox=$('mobileResultList');
    if(listBox){
      listBox.innerHTML=list.length?list.map(m=>`<button type="button" class="result-match-btn ${m.id===selectedMatchId?'active':''} ${started(m)?'is-started':''}" data-hotfix-match="${esc(m.id)}"><strong>${esc(title(m))}</strong><small>${esc(when(m.time))} · ${started(m)?'Slutt/startet · mangler resultat':'Ikke spilt ennå'}</small></button>`).join(''):'<div class="result-empty">Ingen kamper mangler resultat akkurat nå.</div>';
    }
    const m=selectedMatch();
    document.querySelectorAll('[data-hotfix-pick]').forEach(btn=>{
      const pick=btn.dataset.hotfixPick;
      btn.classList.toggle('active',pick===selectedResult);
      if(pick==='home')btn.textContent=m?m.home||'Hjemme':'Hjemme';
      if(pick==='away')btn.textContent=m?m.away||'Borte':'Borte';
      if(pick==='draw')btn.textContent='Uavgjort';
    });
    const save=$('mobileSaveResult');
    if(save&&!saving){save.disabled=false;save.textContent='Lagre resultat'}
    if(!saving)status(m&&selectedResult?`Klar: ${title(m)} → ${resultLabel(m,selectedResult)}`:`Admin OK · ${list.length} kamp(er) mangler resultat.`);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{matches=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{console.warn('Result match listen failed',e);status('Kunne ikke laste kamper: '+(e?.message||e),'bad')});
  }

  async function save(){
    if(saving)return;
    const btn=$('mobileSaveResult');
    const id=selectedMatchId;
    const result=selectedResult;
    const m=selectedMatch();
    try{
      if(!(await checkAdmin())){status('Mangler admin-tilgang.','bad');return toast('Kun admin kan legge inn resultat')}
      if(!id){status('Velg en kamp først.','bad');return toast('Velg kamp først')}
      if(!result){status('Velg Hjemme, Uavgjort eller Borte først.','bad');return toast('Velg resultat først')}
      saving=true;
      if(btn){btn.disabled=true;btn.textContent='Lagrer resultat...'}
      status(`Lagrer: ${title(m)} → ${resultLabel(m,result)} ...`);
      const ref=firebase.firestore().collection('matches').doc(id);
      const data={result,updatedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
      await withTimeout(ref.update(data).catch(err=>{
        if(String(err?.code||'').includes('not-found'))return ref.set(data,{merge:true});
        throw err;
      }),9000,'Lagring av resultat');
      matches=matches.map(x=>x.id===id?{...x,result,updatedAtMs:Date.now()}:x);
      selectedMatchId='';
      selectedResult='';
      toast('Resultat lagret ✅');
      status(`Lagret ✅ ${title(m)} → ${resultLabel(m,result)}`,'good');
      render();
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),500);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),900);
      setTimeout(()=>window.VM_RESULT_FIX?.refreshSelect?.(),1000);
    }catch(err){
      console.error('Mobile result save failed',err);
      const code=String(err?.code||'');
      const msg=code.includes('permission-denied')?'Mangler Firestore-rettighet. Sjekk at Thomas-brukeren er admin.':((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke lagre resultat'));
      status(msg,'bad');
      toast(msg);
    }finally{
      saving=false;
      if(btn){btn.disabled=false;btn.textContent='Lagre resultat'}
    }
  }

  function bind(){
    if(window.VM_RESULT_MOBILE_HOTFIX_BOUND_V2)return;
    window.VM_RESULT_MOBILE_HOTFIX_BOUND_V2=true;
    window.addEventListener('click',e=>{
      const matchBtn=e.target.closest?.('[data-hotfix-match]');
      const pickBtn=e.target.closest?.('[data-hotfix-pick]');
      const saveBtn=e.target.closest?.('#mobileSaveResult');
      if(!matchBtn&&!pickBtn&&!saveBtn)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if(matchBtn){selectedMatchId=matchBtn.dataset.hotfixMatch;selectedResult='';render();return}
      if(pickBtn){selectedResult=pickBtn.dataset.hotfixPick;render();return}
      if(saveBtn){save();return}
    },true);
  }

  async function boot(){
    addCss();
    bind();
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    ensureBox();
    listen();
    render();
  }

  window.VM_RESULT_MOBILE_HOTFIX={boot,render,save};
  window.VM_RESULT_FIX={boot,refreshSelect:render,render,save};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,summary,#mobileResultBox'))setTimeout(boot,120)});
  setInterval(()=>{if(ready()&&!saving)render()},2500);
})();
