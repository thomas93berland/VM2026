(()=>{
  let auth=null,db=null,currentUid=null,meData=null,users=[];
  const MAX_SIZE=360;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function initFirebase(){
    if(!window.firebase||!window.VM_FIREBASE_CONFIG)return false;
    if(!firebase.apps.length)firebase.initializeApp(window.VM_FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();return true;
  }
  function injectStyles(){
    if(document.getElementById('profilePhotoStyles'))return;
    const s=document.createElement('style');s.id='profilePhotoStyles';s.textContent=`
      .avatar.has-photo,.public-profile-avatar.has-photo{background-size:cover!important;background-position:center!important;color:transparent!important;text-shadow:none!important;overflow:hidden!important}
      .profile-photo-actions{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .profile-photo-actions input{display:none!important}
      .photo-btn{min-height:38px;border-radius:14px;padding:0 12px;font-weight:900;background:rgba(228,184,78,.12);border:1px solid rgba(228,184,78,.24);color:var(--gold);display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}
      .photo-btn.secondary{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.09);color:#dfe5ef}
      .photo-hint{color:var(--muted);font-size:12px;font-weight:750;width:100%}
      .photo-uploading{opacity:.7;pointer-events:none}
    `;document.head.appendChild(s);
  }
  function toast(m){const e=document.getElementById('toast');if(!e)return alert(m);e.textContent=m;e.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(()=>e.hidden=true,3600)}
  function setAvatar(el,data,name){
    if(!el)return;
    if(data){el.classList.add('has-photo');el.style.backgroundImage=`url(${data})`;el.textContent='';}
    else{el.classList.remove('has-photo');el.style.backgroundImage='';if(!el.textContent.trim())el.textContent=(name||'S').slice(0,1).toUpperCase();}
  }
  function applyOwnPhoto(){
    if(!meData)return;
    setAvatar(document.getElementById('homeAvatar'),meData.photoData,meData.name);
    setAvatar(document.getElementById('profileAvatar'),meData.photoData,meData.name);
  }
  function addUploadUi(){
    const page=document.getElementById('page-profile');
    const card=page?.querySelector('.profile-detail');
    if(!card||document.getElementById('profilePhotoInput'))return;
    const wrap=document.createElement('div');
    wrap.className='profile-photo-actions';
    wrap.innerHTML=`
      <label class="photo-btn" for="profilePhotoInput">📷 Last opp profilbilde</label>
      <button class="photo-btn secondary" id="removeProfilePhotoBtn" type="button">Fjern bilde</button>
      <input id="profilePhotoInput" type="file" accept="image/*" />
      <span class="photo-hint">Bildet komprimeres automatisk før det lagres.</span>
    `;
    const textCol=card.querySelector('div:nth-of-type(2)')||card;
    textCol.appendChild(wrap);
    document.getElementById('profilePhotoInput').addEventListener('change',handleUpload);
    document.getElementById('removeProfilePhotoBtn').addEventListener('click',removePhoto);
  }
  function compressImage(file){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      const reader=new FileReader();
      reader.onload=()=>{img.onload=()=>{
        let w=img.width,h=img.height;
        const scale=Math.min(1,MAX_SIZE/Math.max(w,h));
        w=Math.round(w*scale);h=Math.round(h*scale);
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const ctx=c.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/jpeg',0.78));
      };img.onerror=reject;img.src=reader.result};
      reader.onerror=reject;reader.readAsDataURL(file);
    });
  }
  async function handleUpload(e){
    const file=e.target.files?.[0];
    if(!file||!currentUid)return;
    if(!file.type.startsWith('image/'))return toast('Velg et bilde.');
    if(file.size>8*1024*1024)return toast('Bildet er for stort. Velg maks 8 MB.');
    const card=document.querySelector('.profile-detail');
    try{
      card?.classList.add('photo-uploading');
      const data=await compressImage(file);
      await db.collection('users').doc(currentUid).update({photoData:data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      toast('Profilbilde oppdatert');
    }catch(err){console.error(err);toast('Kunne ikke laste opp bildet');}
    finally{card?.classList.remove('photo-uploading');e.target.value='';}
  }
  async function removePhoto(){
    if(!currentUid)return;
    try{await db.collection('users').doc(currentUid).update({photoData:firebase.firestore.FieldValue.delete(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});toast('Profilbilde fjernet')}catch(e){console.error(e);toast('Kunne ikke fjerne bildet')}
  }
  function patchPublicModal(){
    const modal=document.getElementById('publicProfileModal');
    if(!modal)return;
    const name=modal.querySelector('.public-profile-name h2')?.textContent?.trim();
    const avatar=modal.querySelector('.public-profile-avatar');
    if(!name||!avatar)return;
    const u=users.find(x=>x.name===name);
    if(u)setAvatar(avatar,u.photoData,u.name);
  }
  function boot(){
    if(!initFirebase())return;
    injectStyles();
    addUploadUi();
    setInterval(()=>{addUploadUi();applyOwnPhoto();patchPublicModal()},1200);
    auth.onAuthStateChanged(u=>{
      currentUid=u?.uid||null;
      meData=null;
      if(!u)return;
      db.collection('users').doc(u.uid).onSnapshot(s=>{meData=s.exists?{uid:s.id,...s.data()}:null;applyOwnPhoto();},console.warn);
    });
    db.collection('users').onSnapshot(s=>{users=s.docs.map(d=>({uid:d.id,...d.data()}));applyOwnPhoto();patchPublicModal();},console.warn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
