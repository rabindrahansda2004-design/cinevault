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
  const hero=document.getElementById("hero");
  hero.style.backgroundImage=`linear-gradient(to top,#0b0b0f 12%,rgba(11,11,15,.45) 60%,rgba(11,11,15,.7)),url('${curMovie.poster}')`;
  document.getElementById("hTitle").innerHTML=`<span style="display:inline-block;font-size:10px;letter-spacing:1.5px;color:#e50914;font-weight:800;margin-bottom:4px">● MOVIE</span><br>${curMovie.title.toUpperCase()}`;
  const gList=(curMovie.genres||curMovie.category||"Trending").split(",").slice(0,3).map(g=>`<span style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);padding:3px 9px;border-radius:99px;font-size:11px;margin-right:5px">${g.trim()}</span>`).join("");
  document.getElementById("hMeta").innerHTML=`<div style="margin:6px 0"><span style="background:rgba(229,9,20,.18);border:1px solid rgba(229,9,20,.4);color:#fca5a5;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:bold">★ ${curMovie.rating||8.0} • ${curMovie.year||2026}</span></div><div style="margin-top:6px">${gList}</div>`;
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
  const mod=document.getElementById("mod");
  const gPills=(curMovie.genres||curMovie.category||"Movie").split(",").map(g=>`<span style="background:#1c1c24;border:1px solid #2e2e3a;color:#d1d5db;padding:4px 11px;border-radius:99px;font-size:11px">${g.trim()}</span>`).join("");
  const castHtml=curMovie.cast?`<div style="font-size:12px;color:#9ca3af;margin:8px 0"><b style="color:#fff">Cast:</b> ${curMovie.cast}</div>`:"";
  const desc=curMovie.description||"No description available.";
  const shortDesc=desc.length>135?desc.slice(0,135)+"...":desc;
  const trUrl=curMovie.trailer||`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(curMovie.title+" "+(curMovie.year||"")+" official trailer")}`;
  const srvsHtml=(curMovie.servers||[]).length?(curMovie.servers||[]).map((s,i)=>`<button class="srv-pill ${i?'':'on'}" onclick="curSrvIdx=${i};document.querySelectorAll('#mSrvs .srv-pill').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${s.name}</button>`).join(""):`<span style="font-size:12px;color:#9ca3af">Trailer-only title (Add movie servers in Admin)</span>`;

  mod.innerHTML=`<div style="max-width:520px;margin:0 auto;padding:16px;color:#fff;position:relative">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <button onclick="document.getElementById('mod').classList.remove('open')" style="background:#1c1c24;color:#fff;border:1px solid #333;width:36px;height:36px;border-radius:50%;font-size:16px">←</button>
      <span style="font-weight:800;letter-spacing:1px;font-size:13px;color:#e50914">CINEVAULT</span>
      <div style="width:36px"></div>
    </div>

    <div style="display:flex;gap:14px;align-items:flex-start;background:linear-gradient(180deg,rgba(229,9,20,.12),transparent);padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,.08)">
      <img id="mImg" src="${curMovie.poster}" style="width:112px;height:165px;object-fit:cover;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.6)">
      <div style="flex:1">
        <div style="font-size:11px;font-weight:800;color:#e50914;letter-spacing:1px;margin-bottom:4px">● MOVIE</div>
        <h2 id="mTit" style="margin:0 0 8px;font-size:20px;line-height:1.15;text-transform:uppercase">${curMovie.title}</h2>
        <div id="mMet" style="display:inline-flex;align-items:center;gap:6px;background:rgba(229,9,20,.16);border:1px solid rgba(229,9,20,.35);padding:4px 10px;border-radius:99px;font-size:12px;font-weight:bold;color:#fca5a5">
          <span>★ ${curMovie.rating||8.0}</span><span>•</span><span>${curMovie.year||2026}</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">${gPills}</div>
    ${castHtml}
    <p id="mDes" style="font-size:13px;line-height:1.5;color:#d1d5db;margin:8px 0">${shortDesc} ${desc.length>135?`<span onclick="document.getElementById('mDes').textContent=curMovie.description" style="color:#e50914;font-weight:bold;cursor:pointer">Read more</span>`:""}</p>

    <div id="mSrvs" style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0">${srvsHtml}</div>

    <button onclick="startWatch(false)" style="width:100%;padding:13px;background:#e50914;color:#fff;border:0;border-radius:99px;font-weight:bold;font-size:15px;box-shadow:0 6px 20px rgba(229,9,20,.45);margin-top:6px">▶ Play</button>

    <div style="display:flex;gap:8px;margin-top:9px">
      <button onclick="openTrailerTab('${trUrl.replace(/'/g,"\\'")}')" style="flex:1;padding:11px;background:#16161d;color:#fff;border:1px solid #333;border-radius:99px;font-weight:bold;font-size:13px">📹 Trailer</button>
      <button onclick="startWatch(true)" style="flex:1;padding:11px;background:#16161d;color:#fff;border:1px solid #333;border-radius:99px;font-weight:bold;font-size:13px">👥 Watch Party</button>
    </div>
  </div>`;
  mod.classList.add("open");
}

function openTrailerTab(url){
  let tm=document.getElementById("trMod");
  if(!tm){
    tm=document.createElement("div");tm.id="trMod";
    tm.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9998;display:flex;flex-direction:column;justify-content:center;padding:16px";
    document.body.appendChild(tm);
  }
  tm.style.display="flex";
  tm.innerHTML=`<div style="max-width:640px;width:100%;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;color:#fff">
      <b>📹 ${curMovie?curMovie.title:""} — Official Trailer</b>
      <button onclick="document.getElementById('trMod').innerHTML='';document.getElementById('trMod').style.display='none'" style="background:#e50914;color:#fff;border:0;padding:6px 12px;border-radius:99px;font-weight:bold">Close ✕</button>
    </div>
    <div style="position:relative;padding-top:56.25%;background:#000;border-radius:12px;overflow:hidden;border:1px solid #333">
      <iframe src="${url}" allowfullscreen allow="autoplay;encrypted-media" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
    </div>
  </div>`;
}

function loadServer(i,sync=false){
  if(!curMovie||!curMovie.servers||!curMovie.servers[i])return;curSrvIdx=i;
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
