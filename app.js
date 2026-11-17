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
  hero.style.cssText="position:relative;min-height:430px;display:flex;flex-direction:column;justify-content:flex-end;padding:20px 16px 22px;background-position:center 18%;background-size:cover;background-repeat:no-repeat;border-bottom:1px solid rgba(255,255,255,0.06)";
  hero.style.backgroundImage=`linear-gradient(to top,#0b0b0f 8%,rgba(11,11,15,0.62) 48%,rgba(11,11,15,0.35) 100%),url('${curMovie.poster}')`;
  document.getElementById("hTitle").style.cssText="margin:0 0 6px;font-size:26px;font-weight:900;line-height:1.1;letter-spacing:0.4px;text-shadow:0 4px 16px rgba(0,0,0,0.9)";
  document.getElementById("hTitle").innerHTML=`<span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;letter-spacing:1.6px;color:#e50914;font-weight:800;margin-bottom:6px;text-transform:uppercase">● FEATURED MOVIE</span><br>${curMovie.title.toUpperCase()}`;
  const gList=(curMovie.genres||curMovie.category||"Trending").split(",").slice(0,3).map(g=>`<span style="background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.16);padding:3px 10px;border-radius:99px;font-size:11px;margin-right:5px;color:#e5e7eb">${g.trim()}</span>`).join("");
  document.getElementById("hMeta").innerHTML=`<div style="margin:6px 0 8px;display:flex;align-items:center;gap:8px"><span style="background:rgba(229,9,20,0.24);border:1px solid rgba(229,9,20,0.5);color:#fca5a5;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:bold">★ ${curMovie.rating||8.0} • ${curMovie.year||2026}</span></div><div>${gList}</div>`;
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
  mod.style.padding="0";
  mod.style.background="#0b0b0f";
  mod.scrollTop=0;

  const curGenres=(curMovie.genres||curMovie.category||"").toLowerCase().split(",").map(s=>s.trim()).filter(Boolean);
  let similars=DB.movies.filter(m=>m.id!==curMovie.id&&curGenres.some(g=>(m.genres||m.category||"").toLowerCase().includes(g)));
  if(!similars.length)similars=DB.movies.filter(m=>m.id!==curMovie.id);

  const simHtml=similars.length?`<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="width:4px;height:18px;background:#e50914;border-radius:2px;display:inline-block"></span>
      <h3 style="margin:0;font-size:16px;font-weight:800;letter-spacing:0.3px">You may like</h3>
    </div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none">
      ${similars.slice(0,10).map(m=>`<div onclick="openMovie('${m.id}')" style="min-width:108px;max-width:108px;cursor:pointer;flex-shrink:0">
        <img src="${m.poster}" loading="lazy" style="width:108px;height:156px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 6px 14px rgba(0,0,0,0.5)">
        <div style="font-size:11px;font-weight:700;color:#e5e7eb;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.title}</div>
        <div style="font-size:10px;color:#9ca3af">★ ${m.rating||8.0} • ${m.year||2026}</div>
      </div>`).join("")}
    </div>
  </div>`:"";

  const gPills=(curMovie.genres||curMovie.category||"Movie").split(",").map(g=>`<span style="background:rgba(255,255,255,0.07);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.14);color:#e5e7eb;padding:5px 12px;border-radius:99px;font-size:11px">${g.trim()}</span>`).join("");
  const castHtml=curMovie.cast?`<div style="font-size:12px;color:#9ca3af;margin:10px 0"><b style="color:#fff">Cast:</b> ${curMovie.cast}</div>`:"";
  const desc=curMovie.description||"No description available.";
  const shortDesc=desc.length>135?desc.slice(0,135)+"...":desc;
  const trUrl=curMovie.trailer||`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(curMovie.title+" "+(curMovie.year||"")+" official trailer")}`;
  const srvsHtml=(curMovie.servers||[]).length?(curMovie.servers||[]).map((s,i)=>`<button class="srv-pill ${i?'':'on'}" onclick="curSrvIdx=${i};document.querySelectorAll('#mSrvs .srv-pill').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${s.name}</button>`).join(""):`<span style="font-size:12px;color:#9ca3af">Trailer-only title (Add movie servers in Admin)</span>`;

  mod.innerHTML=`<div style="position:relative;min-height:100vh;overflow-x:hidden;padding-bottom:28px">
    <div style="position:absolute;top:0;left:0;right:0;height:390px;background:url('${curMovie.poster}') center 20%/cover no-repeat;opacity:0.35;filter:blur(14px) saturate(1.35);transform:scale(1.1);pointer-events:none"></div>
    <div style="position:absolute;top:0;left:0;right:0;height:395px;background:linear-gradient(to bottom,rgba(11,11,15,0.2) 0%,rgba(11,11,15,0.78) 62%,#0b0b0f 100%);pointer-events:none"></div>

    <div style="position:relative;max-width:520px;margin:0 auto;padding:16px;color:#fff">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <button onclick="document.getElementById('mod').classList.remove('open')" style="background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.18);width:38px;height:38px;border-radius:50%;font-size:16px">←</button>
        <span style="font-weight:900;letter-spacing:1.4px;font-size:13px;color:#e50914">CINEVAULT</span>
        <div style="width:38px"></div>
      </div>

      <div style="display:flex;gap:16px;align-items:center;padding:4px 0 12px">
        <img id="mImg" src="${curMovie.poster}" style="width:118px;height:174px;object-fit:cover;border-radius:14px;box-shadow:0 14px 30px rgba(0,0,0,0.85);border:1px solid rgba(255,255,255,0.16);flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:800;color:#e50914;letter-spacing:1.2px;margin-bottom:6px">● MOVIE</div>
          <h2 id="mTit" style="margin:0 0 10px;font-size:21px;font-weight:900;line-height:1.15;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,0.85)">${curMovie.title}</h2>
          <div id="mMet" style="display:inline-flex;align-items:center;gap:6px;background:rgba(229,9,20,0.22);backdrop-filter:blur(8px);border:1px solid rgba(229,9,20,0.45);padding:4px 11px;border-radius:99px;font-size:12px;font-weight:bold;color:#fca5a5">
            <span>★ ${curMovie.rating||8.0}</span><span>•</span><span>${curMovie.year||2026}</span>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">${gPills}</div>
      ${castHtml}
      <p id="mDes" style="font-size:13px;line-height:1.55;color:#d1d5db;margin:10px 0">${shortDesc} ${desc.length>135?`<span onclick="document.getElementById('mDes').textContent=curMovie.description" style="color:#e50914;font-weight:bold;cursor:pointer">Read more</span>`:""}</p>

      <div id="mSrvs" style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">${srvsHtml}</div>

      <button onclick="startWatch(false)" style="width:100%;padding:14px;background:#e50914;color:#fff;border:0;border-radius:99px;font-weight:bold;font-size:15px;box-shadow:0 8px 24px rgba(229,9,20,0.5);margin-top:6px">▶ Play</button>

      <div style="display:flex;gap:10px;margin-top:10px">
        <button onclick="openTrailerTab('${trUrl.replace(/'/g,"\\'")}')" style="flex:1;padding:12px;background:rgba(255,255,255,0.07);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.14);border-radius:99px;font-weight:bold;font-size:13px">📹 Trailer</button>
        <button onclick="startWatch(true)" style="flex:1;padding:12px;background:rgba(255,255,255,0.07);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.14);border-radius:99px;font-weight:bold;font-size:13px">👥 Watch Party</button>
      </div>

      ${simHtml}
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
