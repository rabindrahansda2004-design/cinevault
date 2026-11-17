let DB={settings:{announcement:"",adCode:""},movies:[]},curMovie=null,curSrvIdx=0,taps=0;
const KEY="cv_db_v1",PKEY="cv_pin";

async function initApp(){
  try{const r=await fetch("movies.json?v="+Date.now());if(r.ok)DB=await r.json();}catch(e){}
  const s=localStorage.getItem(KEY);if(s)try{DB=JSON.parse(s);}catch(e){}
  const a=document.getElementById("annBar");
  a.textContent=DB.settings.announcement||"";a.style.display=a.textContent?"block":"none";
  document.getElementById("adSlot").innerHTML=DB.settings.adCode||"";
  renderHome();
}
function renderHome(list=DB.movies){
  if(!list.length)return;curMovie=list[0];
  document.getElementById("hero").style.backgroundImage=`url('${curMovie.poster}')`;
  document.getElementById("hTitle").textContent=curMovie.title;
  document.getElementById("hMeta").textContent=`${curMovie.year||2026} • ⭐ ${curMovie.rating||8.8} • ${(curMovie.servers||[]).length} Servers`;
  const r1=document.getElementById("r1"),r2=document.getElementById("r2");r1.innerHTML=r2.innerHTML="";
  list.forEach((m,i)=>{
    const c=`<div class="card" onclick="openMovie('${m.id}')"><img src="${m.poster}" loading="lazy"><p>${m.title}</p></div>`;
    if((m.category||"").toLowerCase().includes("india")||i%2)r2.innerHTML+=c;
    if(!(m.category||"").toLowerCase().includes("india")||list.length<3)r1.innerHTML+=c;
  });
}
function openMovie(id){
  curMovie=DB.movies.find(x=>x.id===id);if(!curMovie)return;curSrvIdx=0;
  document.getElementById("mImg").src=curMovie.poster;
  document.getElementById("mTit").textContent=curMovie.title;
  document.getElementById("mMet").textContent=`${curMovie.year||2026} • ⭐ ${curMovie.rating||8.8}`;
  document.getElementById("mDes").textContent=curMovie.description||"";
  document.getElementById("mSrvs").innerHTML=(curMovie.servers||[]).map((s,i)=>`<button class="srv-pill ${i?'':'on'}" onclick="curSrvIdx=${i};document.querySelectorAll('#mSrvs .srv-pill').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${s.name}</button>`).join("");
  document.getElementById("mod").classList.add("open");
}
function loadServer(i,sync=false){
  if(!curMovie||!curMovie.servers[i])return;curSrvIdx=i;
  const s=curMovie.servers[i],v=document.getElementById("player"),f=document.getElementById("extPlayer");
  if(/\.(mp4|webm|m3u8)(\?|$)/i.test(s.url)){f.style.display="none";f.src="";v.style.display="block";v.src=s.url;v.play().catch(()=>{});}
  else{v.pause();v.style.display="none";v.src="";f.style.display="block";f.src=s.url;}
  document.getElementById("srvBar").innerHTML=curMovie.servers.map((x,idx)=>`<button class="srv-pill ${idx===i?'on':''}" onclick="loadServer(${idx})">${x.name}</button>`).join("");
  if(!sync&&window.broadcastServer)broadcastServer(curMovie.id,i);
}
function filterLocal(q){if(q.trim()==="WhoisRabi@1234"){document.getElementById("sIn").value="";toggleSearch();openAdmin();return;}q=q.toLowerCase();renderHome(q?DB.movies.filter(m=>m.title.toLowerCase().includes(q)):DB.movies);}
function toggleSearch(){const s=document.getElementById("sBar");s.classList.toggle("open");if(s.classList.contains("open"))document.getElementById("sIn").focus();}
function goHome(){document.getElementById("mod").classList.remove("open");document.getElementById("sBar").classList.remove("open");renderHome();}
window.addEventListener("DOMContentLoaded",initApp);
