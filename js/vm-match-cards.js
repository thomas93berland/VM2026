(()=>{
  const flagMap={
    norge:'🇳🇴',norway:'🇳🇴',frankrike:'🇫🇷',france:'🇫🇷',brasil:'🇧🇷',brazil:'🇧🇷',argentina:'🇦🇷',tyskland:'🇩🇪',germany:'🇩🇪',england:'🏴',spania:'🇪🇸',spain:'🇪🇸',portugal:'🇵🇹',nederland:'🇳🇱',netherlands:'🇳🇱',belgia:'🇧🇪',belgium:'🇧🇪',uruguay:'🇺🇾',mexico:'🇲🇽',canada:'🇨🇦',usa:'🇺🇸','united states':'🇺🇸',japan:'🇯🇵',sweden:'🇸🇪',sverige:'🇸🇪',croatia:'🇭🇷',kroatia:'🇭🇷',morocco:'🇲🇦',marokko:'🇲🇦',scotland:'🏴',skottland:'🏴',qatar:'🇶🇦',switzerland:'🇨🇭',sveits:'🇨🇭',australia:'🇦🇺',turkey:'🇹🇷',tyrkia:'🇹🇷',paraguay:'🇵🇾',senegal:'🇸🇳',iraq:'🇮🇶',iran:'🇮🇷',egypt:'🇪🇬',egypten:'🇪🇬',ghana:'🇬🇭',panama:'🇵🇦',colombia:'🇨🇴',ecuador:'🇪🇨',tunisia:'🇹🇳',haiti:'🇭🇹','curacao':'🇨🇼','curaçao':'🇨🇼','ivory coast':'🇨🇮','elfenbenskysten':'🇨🇮','cape verde':'🇨🇻','kapp verde':'🇨🇻','south africa':'🇿🇦','sør-afrika':'🇿🇦','south korea':'🇰🇷','sør-korea':'🇰🇷','czechia':'🇨🇿','tsjekkia':'🇨🇿','bosnia and herzegovina':'🇧🇦','bosnia':'🇧🇦','new zealand':'🇳🇿','saudi arabia':'🇸🇦','uzbekistan':'🇺🇿','dr congo':'🇨🇩','algeria':'🇩🇿','austria':'🇦🇹','jordan':'🇯🇴'};
  const codeMap={
    norge:'NOR',norway:'NOR',frankrike:'FRA',france:'FRA',brasil:'BRA',brazil:'BRA',argentina:'ARG',tyskland:'GER',germany:'GER',england:'ENG',spania:'ESP',spain:'ESP',portugal:'POR',nederland:'NED',netherlands:'NED',belgia:'BEL',belgium:'BEL',uruguay:'URU',mexico:'MEX',canada:'CAN',usa:'USA','united states':'USA',japan:'JPN',sweden:'SWE',sverige:'SWE',croatia:'CRO',kroatia:'CRO',morocco:'MAR',marokko:'MAR',scotland:'SCO',skottland:'SCO',qatar:'QAT',switzerland:'SUI',sveits:'SUI',australia:'AUS',turkey:'TUR',tyrkia:'TUR',paraguay:'PAR',senegal:'SEN',iraq:'IRQ',iran:'IRI',egypt:'EGY',egypten:'EGY',ghana:'GHA',panama:'PAN',colombia:'COL',ecuador:'ECU',tunisia:'TUN',haiti:'HTI','curacao':'CUW','curaçao':'CUW','ivory coast':'CIV','elfenbenskysten':'CIV','cape verde':'CPV','kapp verde':'CPV','south africa':'RSA','sør-afrika':'RSA','south korea':'KOR','sør-korea':'KOR','czechia':'CZE','tsjekkia':'CZE','bosnia and herzegovina':'BIH','bosnia':'BIH','new zealand':'NZL','saudi arabia':'KSA','uzbekistan':'UZB','dr congo':'COD','algeria':'DZA','austria':'AUT','jordan':'JOR'};
  const upcoming=[
    {id:'wc2026-ger-cuw',home:'Germany',away:'Curacao',time:'2026-06-14T19:00',group:'Gruppe E',odds:{home:1.25,draw:5.80,away:10.50}},
    {id:'wc2026-ned-jpn',home:'Netherlands',away:'Japan',time:'2026-06-14T22:00',group:'Gruppe F',odds:{home:1.85,draw:3.55,away:4.20}},
    {id:'wc2026-civ-ecu',home:'Ivory Coast',away:'Ecuador',time:'2026-06-15T01:00',group:'Gruppe E',odds:{home:2.65,draw:3.15,away:2.70}},
    {id:'wc2026-swe-tun',home:'Sweden',away:'Tunisia',time:'2026-06-15T04:00',group:'Gruppe F',odds:{home:1.95,draw:3.30,away:3.95}},
    {id:'wc2026-esp-cpv',home:'Spain',away:'Cape Verde',time:'2026-06-15T18:00',group:'Gruppe H',odds:{home:1.18,draw:6.40,away:13.00}},
    {id:'wc2026-bel-egy',home:'Belgium',away:'Egypt',time:'2026-06-15T21:00',group:'Gruppe G',odds:{home:1.72,draw:3.70,away:4.80}},
    {id:'wc2026-ksa-uru',home:'Saudi Arabia',away:'Uruguay',time:'2026-06-16T00:00',group:'Gruppe H',odds:{home:6.20,draw:4.20,away:1.48}},
    {id:'wc2026-irq-nor',home:'Iraq',away:'Norway',time:'2026-06-17T00:00',group:'Gruppe I',odds:{home:5.60,draw:3.90,away:1.58}}
  ];
  const norm=s=>String(s||'').trim().toLowerCase();
  const code=s=>codeMap[norm(s)]||String(s||'').replace(/[^A-Za-zÆØÅæøå]/g,'').slice(0,3).toUpperCase()||'VM';
  const flag=s=>flagMap[norm(s)]||'🏆';
  function hideRules(){
    document.querySelectorAll('.rules-card').forEach(e=>e.remove());
    document.querySelectorAll('.admin-note').forEach(e=>{if(e.textContent.includes('demoen'))e.textContent='Kun Thomas kan legge inn og avgjøre kamper.'});
  }
  function seedFallback(){
    try{
      if(typeof state==='undefined'||!Array.isArray(state.matches))return;
      const box=document.getElementById('matchList');
      const empty=box&&/Ingen kamper/.test(box.textContent||'');
      if(state.matches.length||!empty)return;
      state.matches=upcoming.map(m=>({...m,result:null,localUpcoming:true}));
      if(typeof render==='function')render();
    }catch(e){console.warn('VM upcoming fallback',e)}
  }
  async function seedFirestore(){
    try{
      if(typeof firebase==='undefined'||!firebase.apps.length)return;
      if(typeof state==='undefined'||!state.me?.isAdmin)return;
      const db=firebase.firestore();
      const snap=await db.collection('matches').limit(1).get();
      if(!snap.empty)return;
      const batch=db.batch();
      upcoming.forEach(m=>batch.set(db.collection('matches').doc(m.id),{...m,result:null,createdBy:'system-upcoming',createdAtMs:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp()}));
      await batch.commit();
      if(typeof t==='function')t('Kommende VM-kamper lagt inn');
    }catch(e){console.warn('VM upcoming seed',e)}
  }
  function injectStyles(){
    const old=document.getElementById('vmMatchCardStyles');
    if(old)old.remove();
    const css=document.createElement('style');
    css.id='vmMatchCardStyles';
    css.textContent=`
      .rules-card{display:none!important}
      .match-list:before{content:"Kommende kamper";display:block;margin:0 0 10px;color:var(--gold);font-weight:950;text-transform:uppercase;letter-spacing:.08em;font-size:12px}
      .match-card{position:relative;overflow:hidden;border-color:rgba(228,184,78,.16)!important;background:linear-gradient(145deg,rgba(9,24,45,.94),rgba(3,9,18,.96))!important}
      .match-card:before{content:"";position:absolute;right:-55px;top:-55px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(228,184,78,.20),transparent 66%);pointer-events:none}
      .match-card:after{content:"VM 2026";position:absolute;right:16px;top:14px;color:rgba(228,184,78,.13);font-weight:950;font-size:28px;letter-spacing:-.06em;pointer-events:none}
      .match-top{position:relative;z-index:1;margin-bottom:12px!important}
      .match-top small:first-child{display:inline-flex;align-items:center;gap:7px;min-height:28px;padding:0 10px;border-radius:999px;background:rgba(228,184,78,.12);border:1px solid rgba(228,184,78,.26);color:var(--gold)!important;font-weight:950;text-transform:uppercase;letter-spacing:.06em}
      .match-top small:first-child:before{content:"🏆";font-size:13px}
      .match-top small:last-child{color:#d7dbe4!important;font-weight:800}
      .teams{position:relative;z-index:1;display:grid!important;grid-template-columns:1fr auto 1fr!important;gap:12px!important;align-items:stretch!important;margin:10px 0 12px!important}
      .teams>strong{min-width:0;border-radius:20px;padding:14px 12px!important;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);display:flex!important;align-items:center!important;gap:10px!important;font-size:18px!important;line-height:1.1!important}
      .teams>strong:last-child{justify-content:flex-end;text-align:right}
      .teams>span{align-self:center;display:grid!important;place-items:center;width:42px;height:42px;border-radius:50%;background:rgba(228,184,78,.12);border:1px solid rgba(228,184,78,.25);color:var(--gold)!important;font-weight:950;text-transform:uppercase;font-size:12px!important}
      .vm-team-flag{font-size:30px;line-height:1;filter:drop-shadow(0 5px 10px rgba(0,0,0,.35))}
      .vm-team-name{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:950}
      .vm-team-code{display:block;margin-top:4px;color:var(--gold);font-size:11px;letter-spacing:.12em;font-weight:950}
      .vm-match-status{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;padding:8px 10px;border-radius:15px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);color:#d9dfeb;font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.055em}
      .vm-match-status b{color:var(--gold)}
      .odds-row{position:relative;z-index:1;gap:7px!important}
      .odd{border-radius:14px!important;border:1px solid rgba(228,184,78,.18)!important;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.022))!important;min-height:50px!important;padding:7px 6px!important;transition:transform .12s ease,border-color .12s ease,background .12s ease!important}
      .odd:not(:disabled):active{transform:scale(.98)}
      .odd small{font-size:9.5px!important;text-transform:uppercase!important;letter-spacing:.045em!important;color:#cfd5df!important;font-weight:850!important;line-height:1!important}
      .odd strong{font-size:18px!important;color:var(--gold)!important;letter-spacing:-.035em!important;line-height:1!important;margin-top:3px!important}
      .odd.selected{border-color:rgba(242,201,106,.75)!important;background:linear-gradient(180deg,rgba(228,184,78,.20),rgba(228,184,78,.06))!important;box-shadow:0 0 18px rgba(228,184,78,.12)!important}
      @media(max-width:520px){.teams{grid-template-columns:1fr!important}.teams>span{width:100%;height:30px;border-radius:14px}.teams>strong:last-child{justify-content:flex-start;text-align:left}.vm-team-flag{font-size:26px}.odds-row{gap:6px!important}.odd{min-height:46px!important;border-radius:13px!important;padding:6px 4px!important}.odd small{font-size:9px!important}.odd strong{font-size:16px!important}}
    `;
    document.head.appendChild(css);
  }
  function enhance(){
    hideRules();
    seedFallback();
    document.querySelectorAll('.match-card').forEach(card=>{
      if(card.dataset.vmEnhanced==='1')return;
      const teams=card.querySelector('.teams');
      if(!teams)return;
      const strong=[...teams.querySelectorAll('strong')];
      if(strong.length<2)return;
      const home=strong[0].textContent.trim();
      const away=strong[1].textContent.trim();
      strong[0].innerHTML=`<span class="vm-team-flag">${flag(home)}</span><span><span class="vm-team-name">${home}</span><span class="vm-team-code">${code(home)}</span></span>`;
      strong[1].innerHTML=`<span><span class="vm-team-name">${away}</span><span class="vm-team-code">${code(away)}</span></span><span class="vm-team-flag">${flag(away)}</span>`;
      const odds=card.querySelector('.odds-row');
      if(odds&&!card.querySelector('.vm-match-status')){
        const status=document.createElement('div');
        status.className='vm-match-status';
        status.innerHTML='<span>Åpen for spill</span><b>1X2</b>';
        odds.parentNode.insertBefore(status,odds);
      }
      card.dataset.vmEnhanced='1';
    });
  }
  function boot(){injectStyles();hideRules();setTimeout(seedFirestore,1800);enhance();setInterval(enhance,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
