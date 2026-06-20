(()=>{
  let admin=false;
  let bound=false;
  let lastHtml='';
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const label=(m,p)=>p==='home'?m.home:p==='away'?m.away:'Uavgjort';
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('Admin check failed',e);admin=false;return false}
  }

  function statusText(m){
    if(m.result)return '✅ resultat: '+label(m,m.result);
    const ms=Date.parse(m.time||'');
    if(Number.isFinite(ms)&&ms<Date.now())return '⏰ ferdig / mangler resultat';
    return '🟢 ikke spilt ennå';
  }

  async function loadMatches(){
    if(!ready())return [];
    const snap=await firebase.firestore().collection('matches').get();
    return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  }

  async function refreshSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select||!ready())return;
    if(!admin)await checkAdmin();
    if(!admin)return;

    const current=select.value;
    const matches=await loadMatches();
    const html='<option value="">Velg kamp</option>'+matches.map(m=>`<option value="${esc(m.id)}">${esc(when(m.time))} · ${esc(title(m))} · ${esc(statusText(m))}</option>`).join('');
    if(html!==lastHtml||select.options.length<2){
      lastHtml=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
  }

  async function submitResult(e){
    const form=document.getElementById('resultForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
      const fd=new FormData(form);
      const id=fd.get('matchId');
      const result=fd.get('result');
      if(!id||!result)return toast('Velg kamp og resultat');
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      toast('Resultat lagt inn');
      setTimeout(refreshSelect,400);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
    }catch(err){
      console.error('Result override failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge inn resultat'));
    }
  }

  function addHint(){
    const form=document.getElementById('resultForm');
    if(!form||document.getElementById('resultFixHint'))return;
    const p=document.createElement('p');
    p.id='resultFixHint';
    p.className='admin-note';
    p.textContent='Resultatvelgeren viser nå alle kamper, også ferdige/passerte kamper og kamper med feil resultat som må overstyres.';
    form.insertAdjacentElement('afterend',p);
  }

  async function boot(){
    if(!ready())return;
    await checkAdmin();
    if(!admin)return;
    if(!bound){
      document.addEventListener('submit',submitResult,true);
      bound=true;
    }
    addHint();
    refreshSelect();
    setTimeout(refreshSelect,700);
    setTimeout(refreshSelect,1600);
  }

  window.VM_RESULT_FIX={boot,refreshSelect};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,300)});
  setInterval(refreshSelect,5000);
})();

(()=>{
  let unsubBets=null;
  let unsubUsers=null;
  let bets=[];
  let users=new Map();
  let booted=false;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=n=>Number(n||0).toLocaleString('nb-NO');
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const todayKey=()=>new Date().toLocaleDateString('sv-SE');
  const localKey=ms=>{
    const n=Number(ms||0);
    if(!Number.isFinite(n)||n<=0)return '';
    return new Date(n).toLocaleDateString('sv-SE');
  };
  const doneStatuses=new Set(['Vunnet','Tapt']);

  function addCss(){
    if(document.getElementById('dailyHomeResultCss'))return;
    const style=document.createElement('style');
    style.id='dailyHomeResultCss';
    style.textContent=`
      #homeActivity.daily-result-list{display:grid!important;gap:10px!important;}
      #homeActivity .daily-result-row{display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:11px 12px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.88))!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;}
      #homeActivity .daily-result-row .daily-icon{width:38px!important;height:38px!important;border-radius:14px!important;display:grid!important;place-items:center!important;font-size:20px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.08)!important;}
      #homeActivity .daily-result-row b{display:block!important;color:#fff!important;font-size:15px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      #homeActivity .daily-result-row small{display:block!important;margin-top:3px!important;color:rgba(215,219,228,.74)!important;font-size:11px!important;font-weight:750!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      #homeActivity .daily-result-row strong{font-size:15px!important;font-weight:950!important;white-space:nowrap!important;}
      #homeActivity .daily-result-row.win strong{color:#5dff9b!important;}
      #homeActivity .daily-result-row.loss strong{color:#ff7676!important;}
      #homeActivity .daily-result-row.best strong{color:#ffd77a!important;}
      #homeActivity .daily-empty{padding:13px 12px!important;border-radius:16px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.12)!important;color:rgba(235,238,247,.82)!important;font-weight:800!important;line-height:1.35!important;}
    `;
    document.head.appendChild(style);
  }

  function renameCard(){
    const box=document.getElementById('homeActivity');
    if(!box)return;
    const card=box.closest('.card');
    const title=card?.querySelector('.card-title h2');
    if(title)title.textContent='Dagens resultat';
    const icon=card?.querySelector('.card-title .nav-icon');
    if(icon)icon.setAttribute('data-icon','trend');
    box.classList.add('daily-result-list');
  }

  function userNameFor(uid,fallback){
    const u=users.get(uid);
    return u?.name||fallback||'Spiller';
  }

  function netForBet(b){
    const status=String(b.status||'');
    const stake=Number(b.stake||0);
    const possibleWin=Number(b.possibleWin||0);
    if(status==='Vunnet')return possibleWin-stake;
    if(status==='Tapt')return -stake;
    return 0;
  }

  function groupToday(){
    const day=todayKey();
    const map=new Map();
    bets.forEach(b=>{
      const status=String(b.status||'');
      if(!doneStatuses.has(status))return;
      const ms=Number(b.settledAtMs||b.updatedAtMs||b.createdAtMs||0);
      if(localKey(ms)!==day)return;
      const uid=b.userId||b.uid||b.userName||'unknown';
      const row=map.get(uid)||{uid,name:userNameFor(uid,b.userName),net:0,wins:0,losses:0,completed:0};
      row.name=userNameFor(uid,row.name||b.userName);
      row.net+=netForBet(b);
      if(status==='Vunnet')row.wins+=1;
      if(status==='Tapt')row.losses+=1;
      row.completed+=1;
      map.set(uid,row);
    });
    return [...map.values()];
  }

  function render(){
    renameCard();
    const box=document.getElementById('homeActivity');
    if(!box)return;
    const rows=groupToday();
    if(!rows.length){
      box.innerHTML='<div class="daily-empty">Ingen ferdige bets i dag ennå. Når kampresultater legges inn, viser denne boksen dagens største gevinst, største tap og beste treff automatisk.</div>';
      return;
    }
    const winner=rows.filter(r=>r.net>0).sort((a,b)=>b.net-a.net)[0];
    const loser=rows.filter(r=>r.net<0).sort((a,b)=>a.net-b.net)[0];
    const best=rows.filter(r=>r.completed>0).sort((a,b)=>((b.wins/b.completed)-(a.wins/a.completed))||b.wins-a.wins||b.net-a.net)[0];
    const blocks=[];
    if(winner)blocks.push({cls:'win',icon:'💰',label:'Dagens største gevinst',name:winner.name,value:'+'+money(winner.net),sub:`${winner.wins}/${winner.completed} treff`});
    else blocks.push({cls:'win',icon:'💰',label:'Dagens største gevinst',name:'Ingen pluss ennå',value:'0',sub:'Venter på vinnere'});
    if(loser)blocks.push({cls:'loss',icon:'📉',label:'Dagens største tap',name:loser.name,value:'−'+money(Math.abs(loser.net)),sub:`${loser.wins}/${loser.completed} treff`});
    else blocks.push({cls:'loss',icon:'📉',label:'Dagens største tap',name:'Ingen minus ennå',value:'0',sub:'Ingen tap registrert'});
    if(best)blocks.push({cls:'best',icon:'🎯',label:'Dagens beste treff',name:best.name,value:`${best.wins}/${best.completed}`,sub:`Netto ${best.net>=0?'+':''}${money(best.net)}`});
    box.innerHTML=blocks.map(b=>`<div class="daily-result-row ${b.cls}"><span class="daily-icon">${b.icon}</span><div><b>${esc(b.label)}</b><small>${esc(b.name)} · ${esc(b.sub)}</small></div><strong>${esc(b.value)}</strong></div>`).join('');
  }

  function listen(){
    if(!ready())return;
    const db=firebase.firestore();
    if(!unsubUsers){
      unsubUsers=db.collection('users').onSnapshot(s=>{
        users=new Map(s.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
        render();
      },e=>console.warn('Daily users failed',e));
    }
    if(!unsubBets){
      unsubBets=db.collection('bets').onSnapshot(s=>{
        bets=s.docs.map(d=>({id:d.id,...d.data()}));
        render();
      },e=>console.warn('Daily bets failed',e));
    }
  }

  function boot(){
    addCss();
    renameCard();
    if(ready())listen();
    render();
    booted=true;
  }

  window.VM_DAILY_HOME_RESULTS={boot,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot();else{bets=[];users=new Map();render();}})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="home"]'))setTimeout(boot,250)});
  setInterval(()=>{if(booted)render();},30000);
})();
