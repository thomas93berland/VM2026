(()=>{
  let admin=false;
  let adminInfo=null;
  let matches=[];
  let unsubMatches=null;
  let bound=false;
  let lastOptions='';

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const yes=v=>v===true||v===1||String(v??'').trim().toLowerCase()==='true'||String(v??'').trim()==='1'||String(v??'').trim().toLowerCase()==='ja';
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,5200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const hasResult=m=>!!String(m?.result||'').trim();
  const isPast=m=>{const ms=Date.parse(m?.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  function addCss(){
    if(document.getElementById('safeResultAdminCss'))return;
    const style=document.createElement('style');
    style.id='safeResultAdminCss';
    style.textContent=`
      #resultForm.safe-hidden-result-form{display:none!important;}
      .safe-result-card{margin-top:14px!important;padding:14px!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(15,25,43,.82),rgba(3,10,22,.92))!important;border:1px solid rgba(255,216,122,.24)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;}
      .safe-result-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-bottom:10px!important;color:#ffd77a!important;font-weight:1000!important;font-size:13px!important;letter-spacing:.04em!important;text-transform:uppercase!important;}
      .safe-result-title small{color:rgba(235,238,247,.65)!important;font-size:11px!important;font-weight:800!important;text-transform:none!important;letter-spacing:0!important;}
      .safe-result-form{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(0,.8fr) auto!important;gap:10px!important;align-items:center!important;}
      .safe-result-form select,.safe-result-form button{min-height:48px!important;border-radius:14px!important;font-size:14px!important;font-weight:900!important;outline:none!important;}
      .safe-result-form select{width:100%!important;padding:0 12px!important;background:rgba(3,10,22,.90)!important;color:#ffe08a!important;border:1px solid rgba(255,216,122,.36)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;}
      .safe-result-form select:focus{border-color:rgba(255,216,122,.70)!important;box-shadow:0 0 0 3px rgba(228,184,78,.12)!important;}
      .safe-result-form button{padding:0 15px!important;border:1px solid rgba(255,216,122,.52)!important;background:linear-gradient(135deg,#f3cf74,#b88424)!important;color:#08111f!important;cursor:pointer!important;white-space:nowrap!important;}
      .safe-result-form button:disabled{opacity:.45!important;cursor:not-allowed!important;filter:saturate(.5)!important;}
      .safe-result-hint{margin:10px 0 0!important;padding:10px 11px!important;border-radius:14px!important;background:rgba(255,216,122,.08)!important;border:1px solid rgba(255,216,122,.20)!important;color:rgba(246,247,251,.90)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;word-break:break-word!important;}
      .safe-result-hint b{color:#ffd77a!important;}
      .safe-result-hint.ok{background:rgba(79,225,159,.08)!important;border-color:rgba(79,225,159,.28)!important;}
      .safe-result-hint.bad{background:rgba(255,118,118,.08)!important;border-color:rgba(255,118,118,.28)!important;}
      @media(max-width:720px){.safe-result-form{grid-template-columns:1fr!important}.safe-result-form button{width:100%!important}}
    `;
    document.head.appendChild(style);
  }

  async function checkAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u){admin=false;adminInfo=null;return false}
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      const d=s.exists?s.data()||{}:{};
      admin=d.isAdmin===true||yes(d.isAdmin)||yes(d.admin)||yes(d.is_admin)||yes(d.isadmin);
      adminInfo={uid:u.uid,email:u.email||'',exists:s.exists,raw:d.isAdmin,admin};
      syncAdminPanel();
      return admin;
    }catch(e){
      console.warn('Admin check failed',e);
      admin=false;
      adminInfo={error:e?.message||String(e)};
      syncAdminPanel();
      return false;
    }
  }

  function syncAdminPanel(){
    addCss();
    const panel=document.getElementById('adminPanel');
    const locked=document.getElementById('adminLocked');
    if(panel){panel.hidden=!admin;if(admin)panel.open=true}
    if(locked)locked.hidden=admin;
    renderHint();
  }

  function ensureSafeForm(){
    addCss();
    const panel=document.getElementById('adminPanel');
    const oldForm=document.getElementById('resultForm');
    if(oldForm){
      oldForm.classList.add('safe-hidden-result-form');
      oldForm.setAttribute('aria-hidden','true');
      oldForm.querySelectorAll('select,button,input').forEach(x=>{x.tabIndex=-1});
    }
    if(!panel)return null;
    let box=document.getElementById('safeResultAdmin');
    if(!box){
      box=document.createElement('section');
      box.id='safeResultAdmin';
      box.className='safe-result-card';
      box.innerHTML=`
        <div class="safe-result-title"><span>✅ Legg inn kampresultat</span><small>Trygg velger</small></div>
        <form id="safeResultForm" class="safe-result-form">
          <select id="safeResultMatchSelect" name="matchId" required><option value="">Laster kamper...</option></select>
          <select id="safeResultPickSelect" name="result" required>
            <option value="">Velg resultat</option>
            <option value="home">Hjemmeseier</option>
            <option value="draw">Uavgjort</option>
            <option value="away">Borteseier</option>
          </select>
          <button id="safeSaveResultBtn" type="submit">Lagre resultat</button>
        </form>
        <p id="safeResultHint" class="safe-result-hint">Laster admin-status...</p>`;
      if(oldForm)oldForm.insertAdjacentElement('afterend',box);else panel.appendChild(box);
    }
    return box;
  }

  function optionLabel(m){
    const status=isPast(m)?'⏰ slutt / mangler resultat':'🟢 ikke spilt / mangler resultat';
    return `${when(m.time)} · ${title(m)} · ${status}`;
  }

  function unresolved(){
    return matches
      .filter(m=>!hasResult(m))
      .sort((a,b)=>(isPast(b)?1:0)-(isPast(a)?1:0)||String(a.time||'').localeCompare(String(b.time||'')));
  }

  function renderSafeSelect(force=false){
    ensureSafeForm();
    const select=document.getElementById('safeResultMatchSelect');
    const btn=document.getElementById('safeSaveResultBtn');
    if(!select)return;
    const rows=unresolved();
    const current=select.value;
    const html=rows.length
      ? '<option value="">Velg kamp uten resultat</option>'+rows.map(m=>`<option value="${esc(m.id)}">${esc(optionLabel(m))}</option>`).join('')
      : '<option value="">Ingen kamper uten resultat</option>';

    if(!force&&document.activeElement===select&&select.options.length>1)return;

    if(force||html!==lastOptions||select.innerHTML!==html){
      lastOptions=html;
      select.innerHTML=html;
      if(current&&[...select.options].some(o=>o.value===current))select.value=current;
    }
    if(btn)btn.disabled=!rows.length;
    renderHint(rows.length);
  }

  function renderHint(count=null){
    const p=document.getElementById('safeResultHint')||document.getElementById('resultFixHint');
    if(!p)return;
    if(!adminInfo){p.textContent='Admin-sjekk: laster...';return}
    const raw=typeof adminInfo.raw==='undefined'?'mangler':`${String(adminInfo.raw)} (${typeof adminInfo.raw})`;
    p.className='safe-result-hint '+(admin?'ok':'bad');
    if(admin){
      const n=count===null?unresolved().length:count;
      p.innerHTML=`✅ <b>Admin OK</b><br>Resultatvelgeren er isolert fra app-renderen og viser bare kamper uten resultat.<br>Kamper å velge: <b>${n}</b>`;
    }else{
      p.innerHTML=`❌ <b>Admin ikke godkjent</b><br>E-post: ${esc(adminInfo.email||'')}<br>UID: ${esc(adminInfo.uid||'')}<br>Fant users/${esc(adminInfo.uid||'')}: ${adminInfo.exists?'ja':'nei'}<br>isAdmin: ${esc(raw)}<br>Riktig er <b>users/${esc(adminInfo.uid||'DIN_UID')}</b> → <b>isAdmin</b> = boolean <b>true</b>.`;
    }
  }

  async function refreshMatches(){
    if(!ready())return;
    const snap=await firebase.firestore().collection('matches').get();
    matches=snap.docs.map(d=>({id:d.id,...d.data()}));
    renderSafeSelect(true);
  }

  function listenMatches(){
    if(!ready()||unsubMatches)return;
    unsubMatches=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      renderSafeSelect(false);
    },e=>console.warn('Safe result matches failed',e));
  }

  async function submitSafeResult(e){
    const form=e.target.closest?.('#safeResultForm');
    if(!form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin. Se admin-diagnosen under resultatboksen.');
      const fd=new FormData(form);
      const id=fd.get('matchId');
      const result=fd.get('result');
      if(!id||!result)return toast('Velg kamp og resultat');
      const match=matches.find(m=>m.id===id);
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs:Date.now()
      },{merge:true});
      toast(`Resultat lagret: ${match?title(match):'Kamp'}`);
      form.reset();
      lastOptions='';
      setTimeout(refreshMatches,250);
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),900);
      setTimeout(()=>window.VM_UPCOMING_MATCH_SEED?.boot?.(),1200);
    }catch(err){
      console.error('Safe result submit failed',err);
      const uid=adminInfo?.uid||firebase.auth().currentUser?.uid||'DIN_UID';
      if(err?.code==='permission-denied')return toast(`permission-denied: Sjekk at users/${uid}.isAdmin er boolean true og at Firestore-reglene er publisert.`);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke lagre resultat'));
    }
  }

  async function submitMatch(e){
    const form=document.getElementById('matchForm');
    if(!form||e.target!==form)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    try{
      if(!(await checkAdmin()))return toast('Kun admin. Se admin-diagnosen under resultatboksen.');
      const fd=new FormData(form);
      const home=String(fd.get('home')||'').trim();
      const away=String(fd.get('away')||'').trim();
      const time=String(fd.get('time')||'').trim();
      if(!home||!away||!time)return toast('Fyll inn hjemmelag, bortelag og tid');
      await firebase.firestore().collection('matches').add({
        home,away,time,group:'VM 2026',result:null,
        odds:{home:Number(fd.get('homeOdds')||2.1),draw:Number(fd.get('drawOdds')||3.2),away:Number(fd.get('awayOdds')||2.9)},
        createdBy:firebase.auth().currentUser.uid,
        createdAtMs:Date.now(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      toast('Kamp lagt til');
      setTimeout(refreshMatches,400);
    }catch(err){
      console.error('Match submit failed',err);
      toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke legge til kamp'));
    }
  }

  function boot(){
    if(!ready())return;
    addCss();
    ensureSafeForm();
    checkAdmin().then(()=>{listenMatches();refreshMatches();});
    if(!bound){
      document.addEventListener('submit',submitSafeResult,true);
      document.addEventListener('submit',submitMatch,true);
      bound=true;
    }
    setTimeout(()=>{ensureSafeForm();renderSafeSelect(true)},400);
    setTimeout(()=>{ensureSafeForm();renderSafeSelect(true)},1400);
  }

  window.VM_RESULT_FIX={boot,refreshSelect:refreshMatches,refreshMatches,checkAdmin};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"],#adminPanel,#safeResultAdmin'))setTimeout(boot,200)});
})();

(()=>{
  let unsubBets=null,unsubUsers=null,bets=[],users=new Map(),booted=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=n=>Number(n||0).toLocaleString('nb-NO');
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const todayKey=()=>new Date().toLocaleDateString('sv-SE');
  const localKey=ms=>{const n=Number(ms||0);if(!Number.isFinite(n)||n<=0)return'';return new Date(n).toLocaleDateString('sv-SE')};
  const doneStatuses=new Set(['Vunnet','Tapt']);
  function addCss(){if(document.getElementById('dailyHomeResultCss'))return;const style=document.createElement('style');style.id='dailyHomeResultCss';style.textContent=`#homeActivity.daily-result-list{display:grid!important;gap:10px!important}#homeActivity .daily-result-row{display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:11px 12px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(15,25,43,.78),rgba(7,14,28,.88))!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important}#homeActivity .daily-result-row .daily-icon{width:38px!important;height:38px!important;border-radius:14px!important;display:grid!important;place-items:center!important;font-size:20px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.08)!important}#homeActivity .daily-result-row b{display:block!important;color:#fff!important;font-size:15px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}#homeActivity .daily-result-row small{display:block!important;margin-top:3px!important;color:rgba(215,219,228,.74)!important;font-size:11px!important;font-weight:750!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}#homeActivity .daily-result-row strong{font-size:15px!important;font-weight:950!important;white-space:nowrap!important}#homeActivity .daily-result-row.win strong{color:#5dff9b!important}#homeActivity .daily-result-row.loss strong{color:#ff7676!important}#homeActivity .daily-result-row.best strong{color:#ffd77a!important}#homeActivity .daily-empty{padding:13px 12px!important;border-radius:16px!important;background:rgba(255,255,255,.045)!important;border:1px dashed rgba(255,255,255,.12)!important;color:rgba(235,238,247,.82)!important;font-weight:800!important;line-height:1.35!important}`;document.head.appendChild(style)}
  function renameCard(){const box=document.getElementById('homeActivity');if(!box)return;const card=box.closest('.card'),title=card?.querySelector('.card-title h2');if(title)title.textContent='Dagens resultat';const icon=card?.querySelector('.card-title .nav-icon');if(icon)icon.setAttribute('data-icon','trend');box.classList.add('daily-result-list')}
  function userNameFor(uid,fallback){const u=users.get(uid);return u?.name||fallback||'Spiller'}
  function netForBet(b){const status=String(b.status||''),stake=Number(b.stake||0),possibleWin=Number(b.possibleWin||0);if(status==='Vunnet')return possibleWin-stake;if(status==='Tapt')return-stake;return 0}
  function groupToday(){const day=todayKey(),map=new Map();bets.forEach(b=>{const status=String(b.status||'');if(!doneStatuses.has(status))return;const ms=Number(b.settledAtMs||b.updatedAtMs||b.createdAtMs||0);if(localKey(ms)!==day)return;const uid=b.userId||b.uid||b.userName||'unknown';const row=map.get(uid)||{uid,name:userNameFor(uid,b.userName),net:0,wins:0,losses:0,completed:0};row.name=userNameFor(uid,row.name||b.userName);row.net+=netForBet(b);if(status==='Vunnet')row.wins+=1;if(status==='Tapt')row.losses+=1;row.completed+=1;map.set(uid,row)});return[...map.values()]}
  function render(){renameCard();const box=document.getElementById('homeActivity');if(!box)return;const rows=groupToday();if(!rows.length){box.innerHTML='<div class="daily-empty">Ingen ferdige bets i dag ennå. Når kampresultater legges inn, viser denne boksen dagens største gevinst, største tap og beste treff automatisk.</div>';return}const winner=rows.filter(r=>r.net>0).sort((a,b)=>b.net-a.net)[0],loser=rows.filter(r=>r.net<0).sort((a,b)=>a.net-b.net)[0],best=rows.filter(r=>r.completed>0).sort((a,b)=>((b.wins/b.completed)-(a.wins/a.completed))||b.wins-a.wins||b.net-a.net)[0],blocks=[];if(winner)blocks.push({cls:'win',icon:'💰',label:'Dagens største gevinst',name:winner.name,value:'+'+money(winner.net),sub:`${winner.wins}/${winner.completed} treff`});else blocks.push({cls:'win',icon:'💰',label:'Dagens største gevinst',name:'Ingen pluss ennå',value:'0',sub:'Venter på vinnere'});if(loser)blocks.push({cls:'loss',icon:'📉',label:'Dagens største tap',name:loser.name,value:'−'+money(Math.abs(loser.net)),sub:`${loser.wins}/${loser.completed} treff`});else blocks.push({cls:'loss',icon:'📉',label:'Dagens største tap',name:'Ingen minus ennå',value:'0',sub:'Ingen tap registrert'});if(best)blocks.push({cls:'best',icon:'🎯',label:'Dagens beste treff',name:best.name,value:`${best.wins}/${best.completed}`,sub:`Netto ${best.net>=0?'+':''}${money(best.net)}`});box.innerHTML=blocks.map(b=>`<div class="daily-result-row ${b.cls}"><span class="daily-icon">${b.icon}</span><div><b>${esc(b.label)}</b><small>${esc(b.name)} · ${esc(b.sub)}</small></div><strong>${esc(b.value)}</strong></div>`).join('')}
  function listen(){if(!ready())return;const db=firebase.firestore();if(!unsubUsers)unsubUsers=db.collection('users').onSnapshot(s=>{users=new Map(s.docs.map(d=>[d.id,{id:d.id,...d.data()}]));render()},e=>console.warn('Daily users failed',e));if(!unsubBets)unsubBets=db.collection('bets').onSnapshot(s=>{bets=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>console.warn('Daily bets failed',e))}
  function boot(){addCss();renameCard();if(ready())listen();render();booted=true}
  window.VM_DAILY_HOME_RESULTS={boot,render};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();try{firebase.auth().onAuthStateChanged(u=>{if(u)boot();else{bets=[];users=new Map();render()}})}catch{}document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="home"]'))setTimeout(boot,250)});setInterval(()=>{if(booted)render()},30000);
})();

(()=>{
  let comments=[],unsub=null,userDoc=null,observer=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,3800)}else alert(msg)}catch{alert(msg)}};
  const sample=['Brasil banker dette.','Marokko undervurdert.','Thomas jinxer alltid favorittene.','Her lukter det U.','Denne ryker på overtid.'];
  function addCss(){if(document.getElementById('trashTalkCss'))return;const style=document.createElement('style');style.id='trashTalkCss';style.textContent=`.trash-talk{margin-top:12px!important;padding:10px!important;border-radius:15px!important;background:rgba(2,8,18,.38)!important;border:1px solid rgba(255,255,255,.08)!important}.trash-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin-bottom:8px!important;color:#f5d07a!important;font-size:12px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.04em!important}.trash-title span:last-child{color:rgba(235,238,247,.62)!important;font-size:11px!important;text-transform:none!important;letter-spacing:0!important}.trash-list{display:grid!important;gap:6px!important;margin-bottom:8px!important}.trash-comment{display:grid!important;grid-template-columns:26px minmax(0,1fr)!important;gap:7px!important;align-items:start!important;padding:7px 8px!important;border-radius:12px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.055)!important}.trash-avatar{width:26px!important;height:26px!important;border-radius:50%!important;display:grid!important;place-items:center!important;background:linear-gradient(145deg,#f5d07a,#b98525)!important;color:#101827!important;font-size:12px!important;font-weight:1000!important}.trash-comment b{display:block!important;color:#fff!important;font-size:12px!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.trash-comment p{margin:2px 0 0!important;color:rgba(235,238,247,.82)!important;font-size:12px!important;line-height:1.25!important;word-break:break-word!important}.trash-empty{font-size:12px!important;color:rgba(235,238,247,.62)!important;font-weight:750!important;padding:2px 0 8px!important}.trash-form{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important}.trash-form input{width:100%!important;min-height:34px!important;border-radius:12px!important;padding:8px 10px!important;background:rgba(255,255,255,.07)!important;border:1px solid rgba(255,255,255,.10)!important;color:#fff!important;font-size:13px!important;outline:none!important}.trash-form button{min-height:34px!important;border-radius:12px!important;padding:0 12px!important;border:1px solid rgba(245,208,122,.36)!important;background:rgba(228,184,78,.12)!important;color:#f5d07a!important;font-size:12px!important;font-weight:950!important}`;document.head.appendChild(style)}
  function byMatch(matchId){return comments.filter(c=>c.matchId===matchId).sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0)).slice(0,3)}
  function renderBox(card,matchId){let box=card.querySelector('.trash-talk');if(!box){box=document.createElement('section');box.className='trash-talk';box.dataset.matchId=matchId;card.appendChild(box)}const rows=byMatch(matchId),ph=sample[Math.abs([...String(matchId)].reduce((a,ch)=>a+ch.charCodeAt(0),0))%sample.length];box.innerHTML=`<div class="trash-title"><span>💬 Trash talk</span><span>${rows.length}/3 siste</span></div><div class="trash-list">${rows.length?rows.map(c=>`<div class="trash-comment"><span class="trash-avatar">${esc((c.author||'S')[0]).toUpperCase()}</span><div><b>${esc(c.author||'Spiller')}</b><p>${esc(c.text)}</p></div></div>`).join(''):`<div class="trash-empty">Ingen kommentarer ennå. Start showet 👀</div>`}</div><form class="trash-form" data-trash-match="${esc(matchId)}"><input maxlength="140" placeholder="${esc(ph)}" autocomplete="off" /><button type="submit">Send</button></form>`}
  function inject(){addCss();[...document.querySelectorAll('#matchList .match-card')].forEach(card=>{const btn=card.querySelector('.odd[data-m]'),id=btn?.dataset?.m;if(id)renderBox(card,id)});hideTrashFromForum()}
  async function loadUserDoc(){try{const u=firebase.auth().currentUser;if(!u)return null;const s=await firebase.firestore().collection('users').doc(u.uid).get();userDoc=s.exists?{id:s.id,...s.data()}:null;return userDoc}catch(e){console.warn('Trash user failed',e);return null}}
  function listen(){if(!ready()||unsub)return;unsub=firebase.firestore().collection('forumPosts').where('kind','==','matchTrash').onSnapshot(s=>{comments=s.docs.map(d=>({id:d.id,...d.data()}));inject()},e=>console.warn('Trash listen failed',e))}
  async function send(matchId,text){if(!ready())return toast('Logg inn først');const clean=String(text||'').trim().slice(0,140);if(!clean)return;const u=firebase.auth().currentUser,profile=userDoc||await loadUserDoc(),author=profile?.name||u.displayName||u.email?.split('@')[0]||'Spiller';await firebase.firestore().collection('forumPosts').add({kind:'matchTrash',matchId,title:'matchTrash:'+matchId,text:clean,author,userId:u.uid,createdAtMs:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp()})}
  function bindSubmit(){document.addEventListener('submit',async e=>{const form=e.target.closest?.('.trash-form');if(!form)return;e.preventDefault();e.stopPropagation();const input=form.querySelector('input'),matchId=form.dataset.trashMatch;try{await send(matchId,input.value);input.value='';toast('Trash talk sendt')}catch(err){console.error('Trash send failed',err);toast((err?.code?err.code+': ':'')+(err?.message||'Kunne ikke sende kommentar'))}},true)}
  function watchMatches(){const box=document.getElementById('matchList');if(!box||observer)return;observer=new MutationObserver(()=>setTimeout(inject,60));observer.observe(box,{childList:true,subtree:true})}
  function hideTrashFromForum(){document.querySelectorAll('#posts .post').forEach(post=>{const h=post.querySelector('h3')?.textContent||'';if(h.startsWith('matchTrash:'))post.style.display='none'})}
  function boot(){addCss();watchMatches();inject();if(ready()){loadUserDoc();listen()}}
  window.VM_TRASH_TALK={boot,inject};bindSubmit();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();try{firebase.auth().onAuthStateChanged(u=>{if(u){loadUserDoc();listen();setTimeout(boot,400)}})}catch{}document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,300);if(e.target.closest?.('[data-page="forum"]'))setTimeout(hideTrashFromForum,300)});setInterval(()=>{inject();hideTrashFromForum()},5000);
})();
