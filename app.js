let DB={settings:{announcement:"",adCode:""},movies:[]},curMovie=null,curSrvIdx=0,activeCat="All",hlsInst=null;
const KEY="cv_db_v2",PKEY="cv_pin",PROG_KEY="cv_prog_v1";

async function initApp(){
  try{const r=await fetch("movies.json?v="+Date.now());if(r.ok)DB=await r.json();}catch(e){}
  const s=localStorage.getItem(KEY);
  if(s)try{const loc=JSON.parse(s);if(loc.movies&&loc.movies.length){const ids=new Set(DB.movies.map(m=>m.id));loc.movies.forEach(m=>{if(!ids.has(m.id))DB.movies.unshift(m);});}}catch(e){}
  const a=document.getElementById("annBar");
  if(a){a.textContent=DB.settings.announcement||"";a.style.display=a.textContent?"block":"none";}
  const ad=document.getElementById("adSlot");
  if(ad)ad.innerHTML=DB.settings.adCode||"";
  renderCatBar();
  renderHome();
  initProgressTracker();
}

function renderCatBar(){
  const r1=document.getElementById("r1");if(!r1)return;
  let bar=document.getElementById("catBar");
  if(!bar){
    bar=document.createElement("div");bar.id="catBar";
    bar.style.cssText="display:flex;gap:8px;overflow-x:auto;padding:10px 14px 4px;scrollbar-width:none";
    r1.parentNode.insertBefore(bar,r1);
  }
  const cats=["All",...new Set(DB.movies.map(m=>m.category||"Trending").filter(Boolean))];
  bar.innerHTML=cats.map(c=>`<button class="srv-pill ${activeCat===c?'on':''}" onclick="setCat('${c.replace(/'/g,"\\'")}')">${c}</button>`).join("");
}

function setCat(c){
  activeCat=c;
  renderCatBar();
  renderHome(c==="All"?DB.movies:DB.movies.filter(m=>(m.category||"Trending").toLowerCase()===c.toLowerCase()));
}

function getProg(){try{return JSON.parse(localStorage.getItem(PROG_KEY)||"{}");}catch(e){return{};}}
function initProgressTracker(){
  const v=document.getElementById("player");if(!v||v.dataset.prog)return;
  v.dataset.prog="1";
  v.addEventListener("timeupdate",()=>{
    if(!curMovie||v.paused||v.currentTime<5)return;
    const p=getProg();p[curMovie.id]={t:Math.floor(v.currentTime),d:Math.floor(v.duration||0)};
    localStorage.setItem(PROG_KEY,JSON.stringify(p));
  });
}

function renderHome(list=DB.movies){
  if(!list.length)return;
  curMovie=list[0];
  document.getElementById("hero").style.backgroundImage=`url('${curMovie.poster}')`;
  document.getElementById("hTitle").textContent=curMovie.title;
  document.getElementById("hMeta").textContent=`${curMovie.year||2026} • ⭐ ${curMovie.rating||8.8} • ${(curMovie.servers||[]).length} Servers`;
  const r1=document.getElementById("r1"),r2=document.getElementById("r2"),prog=getProg();
  r1.innerHTML=r2.innerHTML="";
  list.forEach((m,i)=>{
    const sv=prog[m.id],pct=sv&&sv.d>0?Math.min(100,Math.round((sv.t/sv.d)*100)):0;
    const badge=pct>2?`<div style="height:3px;background:#333;border-radius:2px;margin-top:4px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#e50914"></div></div>`:"";
    const c=`<div class="card" onclick="openMovie('${m.id}')"><img src="${m.poster}" loading="lazy"><p>${m.title}</p>${badge}</div>`;
    if((m.category||"").toLowerCase().includes("india")||i%2)r2.innerHTML+=c;
    if(!(m.category||"").toLowerCase().includes("india")||list.length<3)r1.innerHTML+=c;
  });
}

function openMovie(id){
  curMovie=DB.movies.find(x=>x.id===id);if(!curMovie)return;curSrvIdx=0;
  document.getElementById("mImg").src=curMovie.poster;
  document.getElementById("mTit").textContent=curMovie.title;
  const sv=getProg()[curMovie.id];
  const resTxt=sv&&sv.t>10?` • Resume ${Math.floor(sv.t/60)}m ${sv.t%60}s`:"";
  document.getElementById("mMet").textContent=`${curMovie.year||2026} • ⭐ ${curMovie.rating||8.8}${resTxt}`;
  document.getElementById("mDes").textContent=curMovie.description||"";
  document.getElementById("mSrvs").innerHTML=(curMovie.servers||[]).map((s,i)=>`<button class="srv-pill ${i?'':'on'}" onclick="curSrvIdx=${i};document.querySelectorAll('#mSrvs .srv-pill').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${s.name}</button>`).join("");
  document.getElementById("mod").classList.add("open");
}

function loadServer(i,sync=false){
  if(!curMovie||!curMovie.servers[i])return;curSrvIdx=i;
  const s=curMovie.servers[i],v=document.getElementById("player"),f=document.getElementById("extPlayer");
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  if(/\.(mp4|webm|m3u8)(\?|$)/i.test(s.url)){
    f.style.display="none";f.src="";v.style.display="block";
    if(/\.m3u8(\?|$)/i.test(s.url)&&window.Hls&&Hls.isSupported()){
      hlsInst=new Hls();hlsInst.loadSource(s.url);hlsInst.attachMedia(v);
    }else{v.src=s.url;}
    const sv=getProg()[curMovie.id];
    v.onloadedmetadata=()=>{if(sv&&sv.t>10&&(!sv.d||sv.t<sv.d-15))v.currentTime=sv.t;v.play().catch(()=>{});};
  }else{
    v.pause();v.style.display="none";v.src="";f.style.display="block";f.src=s.url;
  }
  document.getElementById("srvBar").innerHTML=curMovie.servers.map((x,idx)=>`<button class="srv-pill ${idx===i?'on':''}" onclick="loadServer(${idx})">${x.name}</button>`).join("");
  if(!sync&&window.broadcastServer)broadcastServer(curMovie.id,i);
}

function filterLocal(q){
  if(q.trim()==="2004"){document.getElementById("sIn").value="";toggleSearch();openAdmin();return;}
  q=q.toLowerCase();
  renderHome(q?DB.movies.filter(m=>m.title.toLowerCase().includes(q)):DB.movies);
}
function toggleSearch(){const s=document.getElementById("sBar");s.classList.toggle("open");if(s.classList.contains("open"))document.getElementById("sIn").focus();}
function goHome(){activeCat="All";renderCatBar();document.getElementById("mod").classList.remove("open");document.getElementById("sBar").classList.remove("open");renderHome();}
window.addEventListener("DOMContentLoaded",initApp);
