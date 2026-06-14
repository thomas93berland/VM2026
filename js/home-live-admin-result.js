(()=>{
  let db=null,auth=null,isAdmin=false,matches=[];
  const norm=s=>String(s||'').trim().toLowerCase();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function init(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }

  function score(m){
    const h=m?.homeScore??m?.scoreHome??m?.homeGoals;
    const a=m?.awayScore??m?.scoreAway??m?.awayGoals;
    return [h===undefined?'':Number(h)||0,a===undefined?'':Number(a)||0];
  }

  function currentFromCard(){
    const c=document.getElementById('homeLiveMatchCard');
    if(!c)return null;
    const teams=[...c.querySelectorAll('.home-live-team')].map(x=>norm(x.textContent));
    if(teams.length<2)return null;
    return matches.find(m=>norm(m.home)===teams[0]&&norm(m.away)===teams[1])||matches.find(m=>norm(m.home)===teams[1]&&norm(m.away)===teams[0])||null;
  }

  function pickMatch(){
    const fromCard=currentFromCard();
    if(fromCard)return fromCard;
    const now=Date.now();
    const timed=matches.filter(m=>m.time).sort((a,b)=>new Date(a.time)-new Date(b.time));
    const live=timed.find(m=>{const t=new Date(m.time).getTime();return t<=now&&now<=t+135*60000});
    return live||timed.find(m=>!m.result)||matches.find(m=>!m.result)||matches[0]||null;
  }

  function styles(){
    if(document.getElementById('homeLiveAdminResultStyle'))return;
    const s=document.createElement('style');
    s.id='homeLiveAdminResultStyle';
    s.textContent=`
      .home-admin-result{position:relative;z-index:5;margin-top:10px;padding:10px;border-radius:18px;background:rgba(2,7,14,.50);border:1px solid rgba(228,184,78,.22)}
      .home-admin-result-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;color:var(--gold);font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.07em}
      .home-admin-result-small{color:#cdd5e4;font-size:10px;font-weight:800;text-transform:none;letter-spacing:0;text-align:right}
      .home-admin-result-score{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:center;margin-bottom:8px}
      .home-admin-result-score input{width:100%;min-height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font-size:18px;font-weight:1000;text-align:center;outline:none}
      .home-admin-result-score span{color:var(--gold);font-size:18px;font-weight:1000}
      .home-admin-result-buttons{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:7px}
      .home-admin-result button{min-height:34px;border:1px solid rgba(228,184,78,.25);border-radius:12px;background:rgba(228,184,78,.11);color:var(--gold);font-size:11px;font-weight:1000;padding:0 7px}
      .home-admin-result button.save-score{width:100%;background:linear-gradient(135deg,rgba(228,184,78,.24),rgba(228,184,78,.10));color:#fff}
      .home-admin-result button:active{transform:scale(.98)}
      .home-admin-result-note{margin-top:6px;color:#8ef0bd;font-size:10px;font-weight:850;text-align:center;min-height:13px}
      @media(max-width:520px){.home-admin-result{padding:9px;border-radius:16px}.home-admin-result button{font-size:10px;min-height:33px}.home-admin-result-score input{min-height:34px;font-size:17px}}
    `;
    document.head.appendChild(s);
  }

  function flash(msg){
    const n=document.querySelector('.home-admin-result-note');
    if(n){n.textContent=msg;setTimeout(()=>{if(n.textContent===msg)n.textContent=''},1800)}
  }

  async function saveResult(result){
    const m=pickMatch();
    if(!m?.id)return flash('Fant ikke kamp');
    const h=document.getElementById('homeAdminScoreHome')?.value;
    const a=document.getElementById('homeAdminScoreAway')?.value;
    const patch={result,liveStatus:'Fulltid',resultUpdatedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    if(h!==''&&a!==''){patch.homeScore=Number(h)||0;patch.awayScore=Number(a)||0;}
    await db.collection('matches').doc(m.id).set(patch,{merge:true});
    flash('Resultat lagret');
  }

  async function saveScore(){
    const m=pickMatch();
    if(!m?.id)return flash('Fant ikke kamp');
    const h=Number(document.getElementById('homeAdminScoreHome')?.value)||0;
    const a=Number(document.getElementById('homeAdminScoreAway')?.value)||0;
    let result='draw';
    if(h>a)result='home';
    if(a>h)result='away';
    await db.collection('matches').doc(m.id).set({homeScore:h,awayScore:a,result,liveStatus:'Fulltid',resultUpdatedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    flash('Score og resultat lagret');
  }

  function render(){
    styles();
    const card=document.getElementById('homeLiveMatchCard');
    if(!card)return;
    if(!isAdmin){document.getElementById('homeLiveAdminResult')?.remove();return;}
    const m=pickMatch();
    if(!m)return;
    let box=document.getElementById('homeLiveAdminResult');
    const [h,a]=score(m);
    if(!box){
      box=document.createElement('div');
      box.id='homeLiveAdminResult';
      box.className='home-admin-result';
      card.appendChild(box);
    }
    box.innerHTML=`
      <div class="home-admin-result-head"><span>Admin resultat</span><span class="home-admin-result-small">${esc(m.home||'Hjemme')} – ${esc(m.away||'Borte')}</span></div>
      <div class="home-admin-result-score">
        <input id="homeAdminScoreHome" type="number" min="0" step="1" inputmode="numeric" value="${h}" aria-label="Hjemmescore">
        <span>–</span>
        <input id="homeAdminScoreAway" type="number" min="0" step="1" inputmode="numeric" value="${a}" aria-label="Bortescore">
      </div>
      <div class="home-admin-result-buttons">
        <button type="button" data-result="home">Hjemme</button>
        <button type="button" data-result="draw">Uavgjort</button>
        <button type="button" data-result="away">Borte</button>
      </div>
      <button type="button" class="save-score">Lagre score + avgjør</button>
      <div class="home-admin-result-note"></div>
    `;
    box.querySelectorAll('[data-result]').forEach(b=>b.onclick=async e=>{e.preventDefault();e.stopPropagation();try{await saveResult(b.dataset.result)}catch(err){console.warn(err);flash('Kunne ikke lagre')}});
    box.querySelector('.save-score').onclick=async e=>{e.preventDefault();e.stopPropagation();try{await saveScore()}catch(err){console.warn(err);flash('Kunne ikke lagre')}};
  }

  function stopCardClicks(){
    const card=document.getElementById('homeLiveMatchCard');
    if(!card||card.dataset.adminResultStop==='1')return;
    card.dataset.adminResultStop='1';
    card.addEventListener('click',e=>{if(e.target.closest('.home-admin-result')){e.stopImmediatePropagation();}},true);
    card.addEventListener('input',e=>{if(e.target.closest('.home-admin-result'))e.stopPropagation();},true);
  }

  function boot(){
    if(!init())return;
    auth.onAuthStateChanged(async u=>{
      isAdmin=false;
      if(u){
        try{const me=await db.collection('users').doc(u.uid).get();isAdmin=!!me.data()?.isAdmin}catch(e){isAdmin=false}
        db.collection('matches').onSnapshot(s=>{matches=s.docs.map(d=>({id:d.id,...d.data()}));setTimeout(()=>{stopCardClicks();render()},80)});
      }
      setTimeout(()=>{stopCardClicks();render()},150);
    });
    const obs=new MutationObserver(()=>{stopCardClicks();if(isAdmin)setTimeout(render,40)});
    obs.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
