function openAdmin(){
  let m=document.getElementById("admMod");
  if(!m){
    m=document.createElement("div");m.id="admMod";
    m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;overflow-y:auto;padding:16px;color:#fff;font-family:sans-serif";
    document.body.appendChild(m);
  }
  m.style.display="block";
  if(sessionStorage.getItem("adm")==="1")showAdmin();
  else m.innerHTML=`<div style="max-width:400px;margin:60px auto;background:#16161d;padding:20px;border-radius:14px">
    <h3>🔒 Admin Desk</h3>
    <input id="pinIn" type="password" placeholder="Enter Admin PIN" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <button onclick="unlockAdmin()" style="width:100%;padding:10px;background:#e50914;color:#fff;border:0;border-radius:8px;font-weight:bold">Unlock Admin Desk</button>
    <button onclick="document.getElementById('admMod').style.display='none'" style="width:100%;padding:8px;margin-top:8px;background:transparent;color:#aaa;border:0">Close</button>
  </div>`;
}
function unlockAdmin(){
  if(document.getElementById("pinIn").value===(localStorage.getItem(PKEY)||"WhoisRabi@1234")){
    sessionStorage.setItem("adm","1");showAdmin();
  }else alert("Wrong PIN");
}
function showAdmin(){
  const savedKey=localStorage.getItem("cv_tmdb_key")||"";
  document.getElementById("admMod").innerHTML=`<div style="max-width:520px;margin:0 auto;background:#16161d;padding:18px;border-radius:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>🎬 Cinevault Legal Multi-Source Admin</h3>
      <button onclick="document.getElementById('admMod').style.display='none'" style="background:#333;color:#fff;border:0;padding:6px 10px;border-radius:6px">✕</button>
    </div>

    <div style="background:#0d0d12;padding:12px;border-radius:10px;margin:10px 0;border:1px solid #262633">
      <div style="font-size:12px;color:#f59e0b;font-weight:bold;margin-bottom:6px">1. TMDB API Auto-Fill (Metadata + Official YouTube Embeds)</div>
      <input id="tmdbKey" value="${savedKey}" placeholder="Paste Free TMDB v3 API Key" style="width:100%;padding:8px;margin-bottom:6px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
      <div style="display:flex;gap:6px">
        <input id="tmdbQ" placeholder="Search Movie Title (e.g. Interstellar)" style="flex:1;padding:8px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
        <button onclick="fetchTMDB()" style="padding:8px 12px;background:#2563eb;color:#fff;border:0;border-radius:6px;font-weight:bold;font-size:12px">Auto-Fill</button>
      </div>
    </div>

    <input id="fTitle" placeholder="Movie Title" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <div style="display:flex;gap:6px">
      <input id="fYear" placeholder="Year (2026)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fCat" placeholder="Category (Trending)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fRate" placeholder="Rating (8.8)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    </div>
    <input id="fPost" placeholder="Poster Image URL" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <textarea id="fDesc" placeholder="Description" rows="2" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff"></textarea>

    <div style="font-size:12px;color:#10b981;font-weight:bold;margin-top:8px">2. Video Servers (.m3u8 HLS, .mp4 CDN, or Legal Embed URLs)</div>
    <div id="srvInputs"></div>
    <button onclick="addSrvRow()" style="width:100%;padding:8px;margin:6px 0;background:#1f2937;color:#93c5fd;border:1px dashed #3b82f6;border-radius:8px;font-size:12px">+ Add Another Server Link</button>

    <button onclick="saveMovie()" style="width:100%;padding:11px;margin-top:8px;background:#e50914;color:#fff;border:0;border-radius:8px;font-weight:bold">Save Movie</button>
    <button onclick="copyJSON()" style="width:100%;padding:10px;margin-top:8px;background:#10b981;color:#000;border:0;border-radius:8px;font-weight:bold">Copy movies.json (For Global Deploy)</button>
  </div>`;
  addSrvRow("HLS Cloud 1","1080P","Multi","");
}
function addSrvRow(name="",qual="1080P",lang="Original",url=""){
  const box=document.getElementById("srvInputs");
  const row=document.createElement("div");
  row.className="srv-row";
  row.style.cssText="background:#0d0d12;padding:8px;border-radius:8px;margin-top:6px;border:1px solid #262633";
  row.innerHTML=`<div style="display:flex;gap:5px;margin-bottom:5px">
    <input class="s-name" value="${name}" placeholder="Server Name" style="flex:2;padding:7px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
    <input class="s-qual" value="${qual}" placeholder="1080P" style="flex:1;padding:7px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
    <input class="s-lang" value="${lang}" placeholder="Lang" style="flex:1;padding:7px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
  </div>
  <input class="s-url" value="${url}" placeholder="https://... (.m3u8, .mp4, or YouTube/Archive embed URL)" style="width:100%;padding:7px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">`;
  box.appendChild(row);
}
async function fetchTMDB(){
  const key=document.getElementById("tmdbKey").value.trim(),q=document.getElementById("tmdbQ").value.trim();
  if(!key||!q)return alert("Enter both your TMDB API key and a movie title.");
  localStorage.setItem("cv_tmdb_key",key);
  try{
    const sr=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}`);
    const sd=await sr.json();
    if(!sd.results||!sd.results.length)return alert("No movie found on TMDB.");
    const m=sd.results[0];
    document.getElementById("fTitle").value=m.title||"";
    document.getElementById("fYear").value=(m.release_date||"2026").slice(0,4);
    document.getElementById("fRate").value=(m.vote_average||8.5).toFixed(1);
    document.getElementById("fDesc").value=m.overview||"";
    if(m.poster_path)document.getElementById("fPost").value=`https://image.tmdb.org/t/p/w500${m.poster_path}`;
    const vr=await fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${encodeURIComponent(key)}`);
    const vd=await vr.json();
    const yt=(vd.results||[]).filter(v=>v.site==="YouTube"&&(v.type==="Trailer"||v.type==="Teaser")).slice(0,2);
    if(yt.length){
      document.getElementById("srvInputs").innerHTML="";
      yt.forEach((v,idx)=>addSrvRow(`Official ${v.type} ${idx+1}`,"1080P","YouTube",`https://www.youtube.com/embed/${v.key}`));
    }
    alert(`Loaded "${m.title}" + ${yt.length} official YouTube embed(s)!`);
  }catch(e){alert("TMDB fetch failed. Check your API key.");}
}
function saveMovie(){
  const t=document.getElementById("fTitle").value.trim();if(!t)return alert("Enter a title");
  const servers=[...document.querySelectorAll(".srv-row")].map(r=>({
    name:r.querySelector(".s-name").value.trim()||"Server",
    quality:r.querySelector(".s-qual").value.trim()||"1080P",
    lang:r.querySelector(".s-lang").value.trim()||"Original",
    url:r.querySelector(".s-url").value.trim()
  })).filter(s=>s.url);
  if(!servers.length)return alert("Add at least one valid server URL");
  DB.movies.unshift({
    id:"cv-"+Date.now(),title:t,
    year:document.getElementById("fYear").value||"2026",
    category:document.getElementById("fCat").value||"Trending",
    rating:document.getElementById("fRate").value||"8.8",
    poster:document.getElementById("fPost").value||"https://placehold.co/400x600/111/fff?text="+encodeURIComponent(t),
    description:document.getElementById("fDesc").value,
    servers
  });
  localStorage.setItem(KEY,JSON.stringify(DB));
  renderHome();
  alert("Saved locally! Tap 'Copy movies.json' to publish globally.");
}
function copyJSON(){
  navigator.clipboard.writeText(JSON.stringify(DB,null,2)).then(()=>alert("Copied movies.json! Paste it into ~/cinevault/movies.json and run wrangler deploy."));
}
