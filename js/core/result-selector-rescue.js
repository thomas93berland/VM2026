(()=>{
  let admin=false;
  let matches=[];
  let unsub=null;
  let bound=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const ready=()=>{try{return window.firebase&&firebase.auth&&firebase.firestore&&firebase.auth().currentUser}catch{return false}};
  const toast=msg=>{try{const t=document.getElementById('toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>t.hidden=true,4200)}else alert(msg)}catch{alert(msg)}};
  const when=v=>{const d=new Date(v);return v&&!isNaN(d)?d.toLocaleString('nb-NO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'Ukjent tid'};
  const hasResult=m=>!!String(m?.result||'').trim();
  const title=m=>(m.home||'Hjemme')+' – '+(m.away||'Borte');
  const pickLabel=(m,p)=>p==='home'?(m.home||'Hjemme'):p==='away'?(m.away||'Borte'):'Uavgjort';
  const isPast=m=>{const ms=Date.parse(m.time||'');return Number.isFinite(ms)&&ms<Date.now()};

  async function checkAdmin(){
    if(!ready())return false;
    try{
      const u=firebase.auth().currentUser;
      const s=await firebase.firestore().collection('users').doc(u.uid).get();
      admin=!!(s.exists&&s.data()?.isAdmin===true);
      return admin;
    }catch(e){console.warn('result selector admin check failed',e);admin=false;return false}
  }

  function unresolved(){
    return matches.filter(m=>!hasResult(m)).sort((a,b)=>{
      const ap=isPast(a)?0:1,bp=isPast(b)?0:1;
      if(ap!==bp)return ap-bp;
      return String(a.time||'').localeCompare(String(b.time||''));
    });
  }

  function ensureStyles(){
    if(document.getElementById('resultSelectorRescueCss'))return;
    const style=document.createElement('style');
    style.id='resultSelectorRescueCss';
    style.textContent=`
      #resultSelectorRescue{display:grid!important;gap:10px!important;margin-top:12px!important;padding:12px!important;border-radius:18px!important;background:rgba(2,8,18,.35)!important;border:1px solid rgba(255,216,122,.18)!important;}
      #resultSelectorRescue .rescue-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#ffd77a!important;font-size:12px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.04em!important;}
      #resultSelectorRescue .rescue-count{color:rgba(235,238,247,.70)!important;text-transform:none!important;letter-spacing:0!important;font-weight:850!important;}
      #resultSelectorRescue .rescue-list{display:grid!important;gap:8px!important;max-height:360px!important;overflow:auto!important;padding-right:2px!important;}
      #resultSelectorRescue .rescue-row{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;padding:10px!important;border-radius:14px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.07)!important;}
      #resultSelectorRescue .rescue-row b{display:block!important;color:#fff!important;font-size:13px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      #resultSelectorRescue .rescue-row small{display:block!important;margin-top:3px!important;color:rgba(235,238,247,.62)!important;font-size:11px!important;font-weight:750!important;}
      #resultSelectorRescue .rescue-buttons{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:6px!important;}
      #resultSelectorRescue .rescue-buttons button{min-height:35px!important;border:1px solid rgba(255,216,122,.25)!important;border-radius:12px!important;background:rgba(228,184,78,.10)!important;color:#ffd77a!important;font-size:11px!important;font-weight:950!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
      #resultSelectorRescue .rescue-buttons button:active{transform:scale(.98)!important;}
      #resultSelectorRescue .rescue-empty{padding:10px!important;border-radius:14px!important;background:rgba(255,255,255,.04)!important;color:rgba(235,238,247,.68)!important;font-weight:850!important;font-size:12px!important;}
      #resultMatchSelect{min-height:46px!important;border-color:rgba(255,216,122,.30)!important;}
    `;
    document.head.appendChild(style);
  }

  function fillSelect(){
    const select=document.getElementById('resultMatchSelect');
    if(!select)return;
    const rows=unresolved();
    const current=select.value;
    select.innerHTML='<option value="">Velg kamp uten resultat</option>'+(rows.length?rows.map(m=>`<option value="${esc(m.id)}">${isPast(m)?'⏰ ':'🟢 '}${esc(when(m.time))} · ${esc(title(m))}</option>`).join(''):'<option value="" disabled>Ingen kamper uten resultat</option>');
    if(current&&[...select.options].some(o=>o.value===current))select.value=current;
  }

  function renderPanel(){
    ensureStyles();
    const form=document.getElementById('resultForm');
    if(!form)return;
    let panel=document.getElementById('resultSelectorRescue');
    if(!panel){
      panel=document.createElement('section');
      panel.id='resultSelectorRescue';
      form.insertAdjacentElement('afterend',panel);
    }
    const rows=unresolved();
    panel.innerHTML=`<div class="rescue-head"><span>⚡ Hurtig resultat</span><span class="rescue-count">${rows.length} uten resultat</span></div><div class="rescue-list">${rows.length?rows.map(m=>`<div class="rescue-row"><div><b>${esc(title(m))}</b><small>${isPast(m)?'Slutt / mangler resultat':'Ikke spilt ennå'} · ${esc(when(m.time))}</small></div><div class="rescue-buttons"><button type="button" data-rescue-id="${esc(m.id)}" data-rescue-result="home">${esc(m.home||'H')}</button><button type="button" data-rescue-id="${esc(m.id)}" data-rescue-result="draw">U</button><button type="button" data-rescue-id="${esc(m.id)}" data-rescue-result="away">${esc(m.away||'B')}</button></div></div>`).join(''):'<div class="rescue-empty">Ingen kamper mangler resultat akkurat nå.</div>'}</div>`;
    fillSelect();
  }

  async function setResult(id,result){
    if(!id||!result)return toast('Velg kamp og resultat');
    if(!(await checkAdmin()))return toast('Kun admin kan legge inn resultat');
    try{
      await firebase.firestore().collection('matches').doc(id).set({
        result,
        updatedAtMs:Date.now(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      toast('Resultat lagt inn');
      setTimeout(()=>window.VM_SAFE_BOOT?.settleBets?.({id,result}),700);
    }catch(e){console.error(e);toast((e?.code?e.code+': ':'')+(e?.message||'Kunne ikke legge inn resultat'))}
  }

  function bind(){
    if(bound)return;
    bound=true;
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-rescue-id][data-rescue-result]');
      if(!btn)return;
      e.preventDefault();
      setResult(btn.dataset.rescueId,btn.dataset.rescueResult);
    },true);
    document.addEventListener('submit',e=>{
      const form=e.target.closest?.('#resultForm');
      if(!form)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const fd=new FormData(form);
      setResult(fd.get('matchId'),fd.get('result'));
    },true);
  }

  function listen(){
    if(!ready()||unsub)return;
    unsub=firebase.firestore().collection('matches').onSnapshot(s=>{
      matches=s.docs.map(d=>({id:d.id,...d.data()}));
      renderPanel();
      setTimeout(renderPanel,300);
    },e=>console.warn('result selector rescue match listen failed',e));
  }

  async function boot(){
    if(!ready())return;
    bind();
    await checkAdmin();
    if(!admin)return;
    listen();
    renderPanel();
    setTimeout(renderPanel,500);
    setTimeout(renderPanel,1500);
  }

  window.VM_RESULT_SELECTOR_RESCUE={boot,renderPanel,setResult};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
  try{firebase.auth().onAuthStateChanged(u=>{if(u)setTimeout(boot,800)})}catch{}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="betting"]'))setTimeout(boot,250)});
  setInterval(()=>{if(admin)renderPanel()},2500);
})();
