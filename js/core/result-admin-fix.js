(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;
  let booted=false;
  const RESULT_GRACE_MS=105*60*1000;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const label=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const hasResult=m=>!!String(m?.result||'').trim();
  const msOf=v=>Date.parse(v||'');
  const resultReady=m=>{const ms=msOf(m?.time);return !Number.isFinite(ms)||Date.now()>=ms+RESULT_GRACE_MS};

  function addCss(){
    if(document.getElementById('directResultPanelCss'))return;
    const style=document.createElement('style');
    style.id='directResultPanelCss';
    style.textContent=`
      #resultForm{display:none!important;}
      #directResultPanel{margin-top:14px!important;padding:14px!important;border-radius:20px!important;background:linear-gradient(145deg,rgba(10,20,37,.88),rgba(4,10,20,.94))!important;border:1px solid rgba(255,216,122,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;}
      .direct-result-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:10px!important;margin-bottom:12px!important;}
      .direct-result-head h3{margin:0!important;color:#ffd77a!important;font-size:16px!important;line-height:1.15!important;text-shadow:0 0 14px rgba(228,184,78,.25)!important;}
      .direct-result-head small{display:block!important;margin-top:4px!important;color:rgba(235,238,247,.68)!important;font-size:12px!important;font-weight:800!important;line-height:1.3!important;}
      .direct-result-count{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:32px!important;height:28px!important;padding:0 9px!important;border-radius:999px!important;background:rgba(228,184,78,.12)!important;border:1px solid rgba(228,184,78,.28)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;}
      .direct-result-list{display:grid!important;gap:10px!important;}
      .direct-result-row{padding:11px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(255,197,94,.075),rgba(255,255,255,.035))!important;border:1px solid rgba(255,197,94,.24)!important;}
      .direct-result-teams{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin-bottom:5px!important;}
      .direct-result-teams b{color:#fff!important;font-size:14px!important;line-height:1.15!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
      .direct-result-time{display:block!important;color:rgba(235,238,247,.65)!important;font-size:11px!important;font-weight:800!important;margin-bottom:9px!important;}
      .direct-result-status{color:#ffd77a!important;font-weight:950!important;}
      .direct-result-buttons{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:7px!important;}
      .direct-result-btn{min-height:38px!important;border-radius:13px!important;border:1px solid rgba(255,216,122,.28)!important;background:rgba(228,184,78,.10)!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;line-height:1.1!important;padding:8px 7px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;}
      .direct-result-btn:active{transform:translateY(1px)!important;}
      .direct-result-empty{padding:12px!important;border-radius:15px!important;border:1px dashed rgba(255,255,255,.14)!important;color:rgba(235,238,247,.74)!important;font-size:13px!important;font-weight:850!important;line-height:1.35!important;}
      @media(max-width:430px){.direct-result-buttons{grid-template-columns:1fr!important}.direct-result-btn{min-height:42px!important;font-size:13px!important}.direct-result-teams{display:block!important}.direct-result-teams b{display:block!important;margin-bottom:3px!important}}
    `;
    document.head.appendChild(style);
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Direct result admin check failed',e);admin=false;return false}
  }

  function cleanupOldResultUi(){
    try{
      document.getElementById('vmResultButtonPanel')?.remove();
      document.getElementById('directResultPanelCssOld')?.remove();
      const form=document.getElementById('resultForm');
      if(form)form.style.display='none';
      const panels=[...document.querySelectorAll('#adminPanel section,#adminPanel article,#adminPanel .card')].filter(el=>el.id!=='directResultPanel'&&String(el.textContent||'').toLowerCase().includes('automatisk resultatpanel'));
      panels.forEach(el=>el.remove());
    }catch(e){console.warn('Old result cleanup skipped',e)}
  }

  function ensurePanel(){
    cleanupOldResultUi();
    const form=document.getElementById('resultForm');
    let panel=document.getElementById('directResultPanel');
    if(panel)return panel;
    const adminPanel=document.getElementById('adminPanel');
    if(!adminPanel)return null;
    panel=document.createElement('section');
    panel.id='directResultPanel';
    if(form)form.insertAdjacentElement('afterend',panel);
    else adminPanel.appendChild(panel);
    return panel;
  }

  function activeWindowIds(){
    try{
      const ids=window.VM_UPCOMING_MATCH_SEED?.computeAllowedIds?.();
      if(ids&&ids.size)return ids;
    }catch(e){console.warn('Could not read active 4-match window',e)}
    return null;
  }

  function unresolved(){
    const ids=activeWindowIds();
    return matches
      .filter(m=>!hasResult(m))
      .filter(m=>ids&&ids.size ? ids.has(m.id) : (m.seedGroup==='four-match-window-2026'||!m.seeded))
      .filter(m=>resultReady(m))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  function render(){
    addCss();
    const panel=ensurePanel();
    if(!panel)return;
    if(!admin){panel.innerHTML='';return}
    const rows=unresolved();
    const list=rows.length?rows.map(m=>`<article class="direct-result-row" data-direct-result-row="${esc(m.id)}">
      <div class="direct-result-teams"><b>${esc(m.home||'Hjemme')}</b><b>${esc(m.away||'Borte')}</b></div>
      <span class="direct-result-time">${esc(when(m.time))} · <span class="direct-result-status">Slutt / mangler resultat</span></span>
      <div class="direct-result-buttons">
        <button type="button" class="direct-result-btn" data-result-match="${esc(m.id)}" data-result-pick="home">${esc(label(m,'home'))}</button>
        <button type="button" class="direct-result-btn" data-result-match="${esc(m.id)}" data-result-pick="draw">Uavgjort</button>
        <button type="button" class="direct-result-btn" data-result-match="${esc(m.id)}" data-result-pick="away">${esc(label(m,'away'))}</button>
      </div>
    </article>`).join(''):'<div class="direct-result-empty">Ingen ferdige kamper i aktiv 4-pakke mangler resultat akkurat nå. Gamle/ikke-aktive kamper er skjult.</div>';
    panel.innerHTML=`<div class="direct-result-head"><div><h3>Resultatpanel</h3><small>Viser bare ferdige kamper i aktiv 4-pakke som mangler resultat. Gamle kamper skjules automatisk.</small></div><span class="direct-result-count">${rows.length}</span></div><div class="direct-result-list">${list}</div>`;
  }

  function listenMatches(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      render();
    },e=>{console.warn('Direct result matches failed',e);toast('Kunne ikke laste kamper uten resultat')});
  }

  async function saveResult(matchId,result){
    if(!matchId||!result)return toast('Mangler kamp eller resultat');
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const match=matches.find(m=>m.id===matchId);
      const text=match?`${title(match)}: ${label(match,result)}`:result;
      const ok=confirm(`Legge inn resultat?\n\n${text}`);
      if(!ok)return;
      await firebase.firestore().collection('matches').doc(matchId).set({
        result,
        resultSetBy:firebase.auth().currentUser.uid,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat oppdatert');
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id:matchId,result}),600);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),900);
    }catch(e){
      console.error('Direct result save failed',e);
      toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke lagre resultat'));
    }
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-result-match][data-result-pick]');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      saveResult(btn.dataset.resultMatch,btn.dataset.resultPick);
    },true);
    document.addEventListener('submit',e=>{
      if(e.target?.id==='resultForm'){
        e.preventDefault();
        e.stopImmediatePropagation();
        toast('Bruk knappene i resultatpanelet. Gammel dropdown er deaktivert.');
      }
    },true);
  }

  async function boot(){
    if(!ready())return;
    addCss();
    bind();
    await checkAdmin();
    ensurePanel();
    listenMatches();
    render();
    booted=true;
  }

  window.VM_RESULT_FIX={boot,refreshSelect:render,render,saveResult,unresolved};
  window.VM_DIRECT_RESULT_PANEL={boot,render,saveResult};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,350);else{matches=[];admin=false;render()}})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel'))setTimeout(boot,250)});
  setInterval(()=>{if(booted)render()},3000);
})();
