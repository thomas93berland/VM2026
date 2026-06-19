(()=>{
  let busy=false;
  let autoLast3Started=false;
  let autoStatusStarted=false;
  let matchObserver=null;
  const OPEN=['Aktiv','Venter resultat'];
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const money=n=>Number(n||0).toLocaleString('nb-NO');

  function ready(){
    try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}
    catch{return false}
  }

  function isOpenStatus(status){
    return OPEN.includes(String(status||'Aktiv'));
  }

  function isPastTime(v){
    const ms=Date.parse(v||'');
    return Number.isFinite(ms)&&ms<Date.now();
  }

  function addStatusCss(){
    if(document.getElementById('safeMatchStatusCss'))return;
    const css=document.createElement('style');
    css.id='safeMatchStatusCss';
    css.textContent=`
      #matchList .match-card{position:relative!important;}
      #matchList .safe-match-status{
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
        width:max-content!important;margin:8px auto 2px!important;padding:4px 9px!important;
        border-radius:999px!important;font-size:11px!important;font-weight:900!important;letter-spacing:.02em!important;
        border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.06)!important;color:rgba(245,247,251,.82)!important;
      }
      #matchList .safe-match-status.waiting{background:rgba(255,191,73,.13)!important;border-color:rgba(255,191,73,.32)!important;color:#ffd27a!important;}
      #matchList .safe-match-status.done{background:rgba(79,225,159,.12)!important;border-color:rgba(79,225,159,.28)!important;color:#7ff0bd!important;}
      #matchList .match-card.safe-waiting-result .odd,
      #matchList .match-card.safe-finished .odd{opacity:.48!important;filter:saturate(.7)!important;cursor:not-allowed!important;}
    `;
    document.head.appendChild(css);
  }

  async function isAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u)return false;
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      return s.exists&&s.data()?.isAdmin===true;
    }catch{return false}
  }

  async function getMatchInfo(id,fallback){
    if(fallback&&id===fallback.id)return {id,result:fallback.result,time:fallback.time||null,missing:false};
    const s=await firebase.firestore().collection('matches').doc(id).get();
    if(!s.exists)return {id,result:null,time:null,missing:true};
    const d=s.data()||{};
    return {id,result:d.result||null,time:d.time||null,missing:false};
  }

  function statusNode(card,text,kind){
    let node=card.querySelector('.safe-match-status');
    if(!node){
      node=document.createElement('div');
      node.className='safe-match-status';
      const teams=card.querySelector('.teams');
      if(teams)teams.insertAdjacentElement('afterend',node);
      else card.prepend(node);
    }
    node.textContent=text;
    node.className='safe-match-status '+(kind||'');
  }

  async function updateMatchCard(card){
    try{
      const btn=card.querySelector('.odd[data-m]');
      if(!btn)return;
      const id=btn.dataset.m;
      const info=await getMatchInfo(id,null);
      const odds=[...card.querySelectorAll('.odd[data-m]')];

      card.classList.remove('safe-waiting-result','safe-finished','safe-open');

      if(info.missing){
        card.classList.add('safe-finished');
        odds.forEach(b=>b.disabled=true);
        statusNode(card,'Kamp slettet','done');
        return;
      }

      if(info.result){
        card.classList.add('safe-finished');
        odds.forEach(b=>b.disabled=true);
        statusNode(card,'Ferdig','done');
        return;
      }

      if(isPastTime(info.time)){
        card.classList.add('safe-waiting-result');
        odds.forEach(b=>b.disabled=true);
        statusNode(card,'Venter resultat','waiting');
        return;
      }

      card.classList.add('safe-open');
      const existing=card.querySelector('.safe-match-status');
      if(existing)existing.remove();
    }catch(e){console.warn('Match status update skipped',e)}
  }

  function refreshMatchCards(){
    addStatusCss();
    document.querySelectorAll('#matchList .match-card').forEach(card=>updateMatchCard(card));
  }

  function watchMatchList(){
    const list=document.getElementById('matchList');
    if(!list||matchObserver)return;
    matchObserver=new MutationObserver(()=>setTimeout(refreshMatchCards,80));
    matchObserver.observe(list,{childList:true,subtree:true});
  }

  async function voidBetForDeletedMatch(betId,bet){
    const db=firebase.firestore();
    const stake=Number(bet.stake||0);
    const userId=bet.userId;
    if(!userId||!isOpenStatus(bet.status))return {settled:false,voided:false};

    const batch=db.batch();
    const betRef=db.collection('bets').doc(betId);
    const userRef=db.collection('users').doc(userId);

    batch.update(betRef,{
      status:'Kamp slettet',
      voidReason:'Minst én kamp i bettet er slettet',
      refundedStake:stake,
      settledAtMs:Date.now(),
      settledAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.update(userRef,{
      coins:firebase.firestore.FieldValue.increment(stake),
      placedBets:firebase.firestore.FieldValue.increment(-1),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    return {settled:true,voided:true,amount:stake};
  }

  async function settleBet(betId,bet,forcedMatch){
    const db=firebase.firestore();
    const selections=Array.isArray(bet.selections)?bet.selections:[];
    if(!selections.length||!isOpenStatus(bet.status))return {settled:false,waiting:false,voided:false};

    let lost=false;
    let pendingFuture=false;
    let pendingPast=false;
    let hasMissing=false;

    for(const sel of selections){
      const info=await getMatchInfo(sel.matchId,forcedMatch);
      if(info.missing){hasMissing=true;continue}
      if(!info.result){
        if(isPastTime(info.time))pendingPast=true;
        else pendingFuture=true;
        continue;
      }
      if(info.result!==sel.pick)lost=true;
    }

    if(hasMissing){
      return await voidBetForDeletedMatch(betId,bet);
    }

    const betRef=db.collection('bets').doc(betId);

    if(pendingFuture&&!lost)return {settled:false,waiting:false,voided:false};

    if(pendingPast&&!lost){
      if(bet.status!=='Venter resultat'){
        await betRef.update({status:'Venter resultat',waitingResultAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      }
      return {settled:false,waiting:true,voided:false};
    }

    const stake=Number(bet.stake||0);
    const win=Number(bet.possibleWin||Math.floor(stake*Number(bet.totalOdds||1)));
    const userId=bet.userId;
    if(!userId)return {settled:false,waiting:false,voided:false};

    const batch=db.batch();
    const userRef=db.collection('users').doc(userId);

    if(lost){
      batch.update(betRef,{status:'Tapt',settledAtMs:Date.now(),settledAt:firebase.firestore.FieldValue.serverTimestamp()});
      batch.update(userRef,{completedBets:firebase.firestore.FieldValue.increment(1),netProfit:firebase.firestore.FieldValue.increment(-stake),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      await batch.commit();
      return {settled:true,won:false,amount:0,waiting:false,voided:false};
    }

    batch.update(betRef,{status:'Vunnet',payout:win,settledAtMs:Date.now(),settledAt:firebase.firestore.FieldValue.serverTimestamp()});
    batch.update(userRef,{coins:firebase.firestore.FieldValue.increment(win),wonBets:firebase.firestore.FieldValue.increment(1),completedBets:firebase.firestore.FieldValue.increment(1),netProfit:firebase.firestore.FieldValue.increment(win-stake),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    await batch.commit();
    return {settled:true,won:true,amount:win,waiting:false,voided:false};
  }

  async function activeBetDocs(){
    const snap=await firebase.firestore().collection('bets').get();
    return snap.docs.filter(doc=>isOpenStatus(doc.data()?.status));
  }

  async function settleAll(forcedMatch=null){
    if(busy)return;
    if(!ready())return;
    busy=true;
    try{
      if(!(await isAdmin())){toast('Kun admin kan utbetale gevinster');return}
      const docs=await activeBetDocs();
      let settled=0,waiting=0,voided=0,refunded=0,won=0,paid=0;
      for(const doc of docs){
        const res=await settleBet(doc.id,doc.data(),forcedMatch);
        if(res.waiting)waiting++;
        if(res.voided){voided++;refunded+=res.amount||0}
        if(res.settled&&!res.voided){settled++;if(res.won){won++;paid+=res.amount}}
      }
      toast(settled||waiting||voided?`Oppdatert: ${won} vinnere, ${waiting} venter resultat, ${voided} slettet/refundert, ${money(paid)} VM Coins betalt`:'Ingen ferdige bets å oppdatere ennå');
      refreshMatchCards();
    }catch(e){
      console.error('Payout error',e);
      toast('Kunne ikke oppdatere bets. Sjekk admin/rettigheter.');
    }finally{busy=false}
  }

  async function settleLast3PerPlayer(){
    if(busy)return;
    if(!ready())return;
    busy=true;
    try{
      if(!(await isAdmin())){toast('Kun admin kan utbetale gevinster');return}
      const db=firebase.firestore();
      const snap=await db.collection('bets').get();
      const groups={};
      snap.docs.forEach(doc=>{
        const b=doc.data();
        const uid=b.userId||'unknown';
        if(!groups[uid])groups[uid]=[];
        groups[uid].push({id:doc.id,data:b});
      });

      let checked=0,settled=0,waiting=0,voided=0,refunded=0,won=0,paid=0,players=0;
      for(const uid of Object.keys(groups)){
        const latest=groups[uid]
          .sort((a,b)=>Number(b.data.createdAtMs||0)-Number(a.data.createdAtMs||0))
          .slice(0,3);
        if(latest.length)players++;
        for(const item of latest){
          checked++;
          const res=await settleBet(item.id,item.data,null);
          if(res.waiting)waiting++;
          if(res.voided){voided++;refunded+=res.amount||0}
          if(res.settled&&!res.voided){
            settled++;
            if(res.won){won++;paid+=res.amount}
          }
        }
      }
      toast(settled||waiting||voided?`Siste 3 per spiller: ${won} vinnere, ${waiting} venter resultat, ${voided} slettet/refundert, ${money(paid)} VM Coins utbetalt`:`Sjekket ${checked} bets hos ${players} spillere. Ingen nye gevinster å betale.`);
      refreshMatchCards();
    }catch(e){
      console.error('Last 3 payout error',e);
      toast('Kunne ikke oppdatere siste 3 bets. Sjekk admin/rettigheter.');
    }finally{busy=false}
  }

  function addPayoutButton(){
    const panel=document.getElementById('adminPanel');
    if(!panel)return;
    if(!document.getElementById('safePayoutBtn')){
      const btn=document.createElement('button');
      btn.id='safePayoutBtn';
      btn.type='button';
      btn.className='btn secondary compact';
      btn.textContent='Oppdater/utbetal bets';
      btn.style.marginTop='10px';
      btn.onclick=()=>settleAll();
      panel.appendChild(btn);
    }
    if(!document.getElementById('safePayoutLast3Btn')){
      const btn=document.createElement('button');
      btn.id='safePayoutLast3Btn';
      btn.type='button';
      btn.className='btn primary compact';
      btn.textContent='Utbetal siste 3 bets per spiller';
      btn.style.marginTop='10px';
      btn.style.marginLeft='8px';
      btn.onclick=()=>settleLast3PerPlayer();
      panel.appendChild(btn);
    }
  }

  function hookResultForm(){
    const form=document.getElementById('resultForm');
    if(!form||form.dataset.payoutHooked==='1')return;
    form.dataset.payoutHooked='1';
    form.addEventListener('submit',async()=>{
      try{
        const data=new FormData(form);
        const id=data.get('matchId');
        const result=data.get('result');
        if(!id||!result)return;
        await wait(1200);
        await settleAll({id,result});
      }catch(e){console.warn('Auto payout skipped',e)}
    });
  }

  function maybeAutoLast3(){
    if(autoLast3Started)return;
    const params=new URLSearchParams(location.search);
    if(!params.has('paylast3'))return;
    autoLast3Started=true;
    setTimeout(()=>settleLast3PerPlayer(),1800);
  }

  function maybeAutoStatus(){
    if(autoStatusStarted)return;
    const params=new URLSearchParams(location.search);
    if(!params.has('checkstatus'))return;
    autoStatusStarted=true;
    setTimeout(()=>settleAll(),1800);
  }

  function boot(){
    addPayoutButton();
    hookResultForm();
    watchMatchList();
    refreshMatchCards();
    maybeAutoLast3();
    maybeAutoStatus();
    setTimeout(addPayoutButton,700);
    setTimeout(hookResultForm,700);
    setTimeout(watchMatchList,700);
    setTimeout(refreshMatchCards,900);
    setTimeout(maybeAutoLast3,900);
    setTimeout(maybeAutoStatus,900);
    setTimeout(addPayoutButton,1600);
    setTimeout(hookResultForm,1600);
    setTimeout(watchMatchList,1600);
    setTimeout(refreshMatchCards,1900);
    setTimeout(maybeAutoLast3,1800);
    setTimeout(maybeAutoStatus,1800);
  }

  window.VM_SAFE_BOOT={startAll:boot,settleBets:settleAll,settleLast3PerPlayer,refreshMatchCards};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u)boot()})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page]'))setTimeout(boot,300)});
  setInterval(refreshMatchCards,8000);
})();

(()=>{
  let unsub=null;
  let built=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,3600)}else alert(msg)}catch{alert(msg)}};

  function ready(){
    try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}
    catch{return false}
  }

  async function isAdmin(){
    try{
      const u=firebase.auth().currentUser;
      if(!u)return false;
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      return s.exists&&s.data()?.isAdmin===true;
    }catch{return false}
  }

  function addCss(){
    if(document.getElementById('dailyTipsCss'))return;
    const css=document.createElement('style');
    css.id='dailyTipsCss';
    css.textContent=`
      #page-betting .rules-card.daily-tips-card{padding:16px!important;border-radius:20px!important;background:linear-gradient(145deg,rgba(12,23,42,.86),rgba(6,12,26,.94))!important;border:1px solid rgba(228,184,78,.22)!important;box-shadow:0 14px 34px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.04)!important;}
      .daily-tips-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
      .daily-tips-head small{display:block;color:rgba(228,184,78,.86);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.09em;}
      .daily-tips-head h2{margin:3px 0 0;font-size:18px;line-height:1.1;color:#fff;}
      #dailyTipsUpdated{font-size:11px;color:rgba(215,219,228,.66);white-space:nowrap;}
      #dailyTipsView{min-height:54px;margin:0;padding:12px 13px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);color:rgba(245,247,251,.90);font-size:14px;line-height:1.45;white-space:pre-wrap;}
      #dailyTipsView.empty{color:rgba(215,219,228,.60);font-style:italic;}
      #dailyTipsForm{margin-top:12px;display:grid;gap:9px;}
      #dailyTipsInput{min-height:92px;resize:vertical;}
      .daily-tips-actions{display:flex;justify-content:flex-end;gap:8px;}
      @media(max-width:520px){.daily-tips-head{display:block}.daily-tips-head h2{font-size:17px}#dailyTipsUpdated{display:block;margin-top:6px}.daily-tips-actions .btn{width:100%}}
    `;
    document.head.appendChild(css);
  }

  async function build(){
    const card=document.querySelector('#page-betting .rules-card');
    if(!card||built)return;
    built=true;
    addCss();
    card.classList.add('daily-tips-card');
    card.innerHTML=`
      <div class="daily-tips-head">
        <div><small>Thomas sitt tips</small><h2>Dagens tippetips</h2></div>
        <span id="dailyTipsUpdated">Ikke oppdatert</span>
      </div>
      <p id="dailyTipsView" class="empty">Ingen tips lagt inn ennå.</p>
      <form id="dailyTipsForm" hidden>
        <textarea id="dailyTipsInput" class="input" rows="4" placeholder="Skriv dagens tips her, f.eks. Norge vinner, Brazil over 2.5 mål, trygg dobbel osv."></textarea>
        <div class="daily-tips-actions"><button class="btn primary compact" type="submit">Lagre dagens tips</button></div>
      </form>
    `;
    bind();
    await load();
  }

  function setText(data){
    const view=document.getElementById('dailyTipsView');
    const input=document.getElementById('dailyTipsInput');
    const updated=document.getElementById('dailyTipsUpdated');
    const text=String(data?.text||'').trim();
    if(view){
      view.textContent=text||'Ingen tips lagt inn ennå.';
      view.classList.toggle('empty',!text);
    }
    if(input)input.value=text;
    if(updated){
      const ms=Number(data?.updatedAtMs||0);
      updated.textContent=ms?new Date(ms).toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ikke oppdatert';
    }
  }

  async function load(){
    if(!ready())return;
    const form=document.getElementById('dailyTipsForm');
    const admin=await isAdmin();
    if(form)form.hidden=!admin;
    if(unsub)try{unsub()}catch{}
    const ref=firebase.firestore().collection('siteSettings').doc('dailyTips');
    unsub=ref.onSnapshot(s=>setText(s.exists?s.data():{}),e=>console.warn('Daily tips load failed',e));
  }

  function bind(){
    const form=document.getElementById('dailyTipsForm');
    if(!form||form.dataset.bound==='1')return;
    form.dataset.bound='1';
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      try{
        if(!(await isAdmin()))return toast('Kun admin kan lagre tips');
        const text=document.getElementById('dailyTipsInput')?.value?.trim()||'';
        await firebase.firestore().collection('siteSettings').doc('dailyTips').set({
          text,
          updatedAtMs:Date.now(),
          updatedBy:firebase.auth().currentUser?.uid||'',
          updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        },{merge:true});
        toast('Dagens tippetips lagret');
      }catch(err){
        console.error('Daily tips save failed',err);
        toast('Kunne ikke lagre tips. Sjekk admin/rettigheter.');
      }
    });
  }

  function boot(){
    build();
    setTimeout(build,600);
    setTimeout(build,1500);
  }

  window.VM_DAILY_TIPS={boot,load};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  try{firebase.auth().onAuthStateChanged(u=>{if(u){built=false;boot()}})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(()=>{built=false;boot()},300)});
})();
