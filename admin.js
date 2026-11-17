function openAdmin(){
  let m=document.getElementById("admMod");
  if(!m){
    m=document.createElement("div");m.id="admMod";
    m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:9999;overflow-y:auto;padding:16px;color:#fff;font-family:sans-serif";
    document.body.appendChild(m);
  }
  m.style.display="block";
  return showAdmin();
}

function showAdmin(){
  const savedKey=localStorage.getItem("cv_tmdb_key")||"";
  document.getElementById("admMod").innerHTML=`<div style="max-width:520px;margin:0 auto;background:#16161d;padding:18px;border-radius:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>🎬 Cinevault Admin Desk</h3>
      <button onclick="document.getElementById('admMod').style.display='none'" style="background:#333;color:#fff;border:0;padding:6px 10px;border-radius:6px">✕</button>
    </div>

    <div style="background:#0d0d12;padding:12px;border-radius:10px;margin:10px 0;border:1px solid #262633">
      <div style="font-size:12px;color:#60a5fa;font-weight:bold;margin-bottom:6px">1. Auto-Fill Metadata (Year, Genre, Cast, Description & Trailer)</div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <input id="tmdbQ" placeholder="Type Movie Name (e.g. The Odyssey, Avengers)" style="flex:1;padding:9px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
        <button id="afBtn" onclick="autoFillMeta()" style="padding:9px 14px;background:#e50914;color:#fff;border:0;border-radius:6px;font-weight:bold;font-size:12px">Auto-Fill</button>
      </div>
      <input id="tmdbKey" value="${savedKey}" placeholder="Optional: Paste TMDB v3 API Key (for full cast & exact YouTube trailer)" style="width:100%;padding:7px;border-radius:6px;border:1px solid #262633;background:#16161d;color:#aaa;font-size:11px">
    </div>

    <input id="fTitle" placeholder="Movie Title" style="width:100%;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <div style="display:flex;gap:6px">
      <input id="fYear" placeholder="Release Year (2026)" style="flex:1;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fGenre" placeholder="Genre (Action, Adventure)" style="flex:1.4;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fRate" placeholder="Rating (8.0)" style="flex:0.8;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    </div>
    <input id="fCast" placeholder="Cast (Actors who acted in this film)" style="width:100%;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <input id="fPost" placeholder="Poster Image URL" style="width:100%;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <input id="fTrailer" placeholder="Official YouTube Trailer Embed URL (Separate Trailer Tab)" style="width:100%;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #f59e0b;background:#0d0d12;color:#fff">
    <textarea id="fDesc" placeholder="Movie Description" rows="3" style="width:100%;padding:9px;margin:4px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff"></textarea>

    <div style="font-size:12px;color:#10b981;font-weight:bold;margin-top:8px">2. Full Movie Stream Servers (Add Your Own .m3u8 / .mp4 / Embeds)</div>
    <div id="srvInputs"></div>
    <button onclick="addSrvRow()" style="width:100%;padding:8px;margin:6px 0;background:#1f2937;color:#93c5fd;border:1px dashed #3b82f6;border-radius:8px;font-size:12px">+ Add Another Server Link</button>

    <button onclick="saveMovie()" style="width:100%;padding:11px;margin-top:8px;background:#e50914;color:#fff;border:0;border-radius:8px;font-weight:bold">Save Movie</button>
    <button onclick="copyJSON()" style="width:100%;padding:10px;margin-top:8px;background:#10b981;color:#000;border:0;border-radius:8px;font-weight:bold">Copy movies.json (For Global Deploy)</button>
  </div>`;
  addSrvRow("Server 1","1080P","Original","");
}

async function autoFillMeta(){
  const q=document.getElementById("tmdbQ").value.trim();
  const key=document.getElementById("tmdbKey").value.trim();
  if(!q)return alert("Type a movie name first.");
  if(key)localStorage.setItem("cv_tmdb_key",key);
  const btn=document.getElementById("afBtn");btn.textContent="Fetching...";
  try{
    if(key){
      const sr=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}`);
      const sd=await sr.json();
      if(sd.results&&sd.results.length){
        const m=sd.results[0];
        const dr=await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${encodeURIComponent(key)}&append_to_response=credits,videos`);
        const d=await dr.json();
        document.getElementById("fTitle").value=d.title||q;
        document.getElementById("fYear").value=(d.release_date||"2026").slice(0,4);
        document.getElementById("fGenre").value=(d.genres||[]).map(g=>g.name).slice(0,3).join(", ")||"Action";
        document.getElementById("fRate").value=(d.vote_average||8.0).toFixed(1);
        document.getElementById("fCast").value=((d.credits&&d.credits.cast)||[]).slice(0,5).map(c=>c.name).join(", ");
        document.getElementById("fDesc").value=d.overview||"";
        if(d.poster_path)document.getElementById("fPost").value=`https://image.tmdb.org/t/p/w500${d.poster_path}`; const yt=((d.videos&&d.videos.results)||[]).find(v=>v.site==="YouTube"&&(v.type==="Trailer"||v.type==="Teaser")); document.getElementById("fTrailer").value=yt?`https://www.youtube.com/embed/${yt.key}`:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((d.title||q)+" official trailer")}`; btn.textContent="Auto-Fill"; return alert(`Loaded "${d.title}" metadata, cast, and trailer!`);
      }
    }
    const ir=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=movie&limit=1`);
    const id=await ir.json();
    if(id.results&&id.results.length){
      const m=id.results[0];
      const yr=(m.releaseDate||"2026").slice(0,4);
      document.getElementById("fTitle").value=m.trackName||q;
      document.getElementById("fYear").value=yr;
      document.getElementById("fGenre").value=m.primaryGenreName||"Action";
      document.getElementById("fRate").value="8.5";
      document.getElementById("fCast").value=m.artistName?`Dir. ${m.artistName}`:""; document.getElementById("fDesc").value=m.longDescription||m.shortDescription||""; if(m.artworkUrl100)document.getElementById("fPost").value=m.artworkUrl100.replace("100x100bb","600x900bb"); document.getElementById("fTrailer").value=`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((m.trackName||q)+" "+yr+" official trailer")}`;
      btn.textContent="Auto-Fill";
      return alert(`Loaded "${m.trackName}" (${yr}) metadata & trailer! (Add TMDB key for full actor cast list)`);
    }
    alert("Movie not found.");
  }catch(e){alert("Network error fetching movie details.");}
  btn.textContent="Auto-Fill";
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
  <input class="s-url" value="${url}" placeholder="https://... (.m3u8, .mp4, or embed URL)" style="width:100%;padding:7px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">`;
  box.appendChild(row);
}

function saveMovie(){
  const t=document.getElementById("fTitle").value.trim();if(!t)return alert("Enter a title");
  const tr=document.getElementById("fTrailer").value.trim();
  const servers=[...document.querySelectorAll(".srv-row")].map(r=>({
    name:r.querySelector(".s-name").value.trim()||"Server",
    quality:r.querySelector(".s-qual").value.trim()||"1080P",
    lang:r.querySelector(".s-lang").value.trim()||"Original",
    url:r.querySelector(".s-url").value.trim()
  })).filter(s=>s.url);
  if(!servers.length&&!tr)return alert("Add at least one stream server or trailer URL");
  const genreStr=document.getElementById("fGenre").value||"Trending";
  DB.movies.unshift({
    id:"cv-"+Date.now(),title:t,
    year:document.getElementById("fYear").value||"2026",
    category:genreStr.split(",")[0].trim()||"Trending",
    genres:genreStr,
    cast:document.getElementById("fCast").value.trim(),
    rating:document.getElementById("fRate").value||"8.0",
    poster:document.getElementById("fPost").value||"https://placehold.co/400x600/111/fff?text="+encodeURIComponent(t),
    trailer:tr,
    description:document.getElementById("fDesc").value,
    servers
  });
  localStorage.setItem(KEY,JSON.stringify(DB));
  if(window.renderCatBar)renderCatBar();
  renderHome();
  alert("Saved! Tap 'Copy movies.json' to publish globally.");
}

function copyJSON(){
  navigator.clipboard.writeText(JSON.stringify(DB,null,2)).then(()=>alert("Copied movies.json! Paste it into ~/cinevault/movies.json and run wrangler deploy."));
}
