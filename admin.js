const QUICK_PRESETS=[
  {
    id:"cv-doomsday",
    tmdbId:1003596,
    title:"Avengers: Doomsday",
    year:"2026",
    category:"Trending",
    rating:"9.2",
    poster:"https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    description:"The Avengers assemble once again to face Doctor Doom in a multiversal threat.",
    servers:[
      {name:"Official YouTube Trailer",quality:"1080P",lang:"English",url:"https://www.youtube.com/embed/eOrNdBpGMv8"}
    ]
  }
];

function openAdmin(){
  let m=document.getElementById("admMod");
  if(!m){
    m=document.createElement("div");m.id="admMod";
    m.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;overflow-y:auto;padding:16px;color:#fff;font-family:sans-serif";
    document.body.appendChild(m);
  }
  m.style.display="block";
  return showAdmin();
}

function showAdmin(){
  const savedKey=localStorage.getItem("cv_tmdb_key")||"";
  document.getElementById("admMod").innerHTML=`<div style="max-width:520px;margin:0 auto;background:#16161d;padding:18px;border-radius:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>🎬 Cinevault Multi-Source Auto-Admin</h3>
      <button onclick="document.getElementById('admMod').style.display='none'" style="background:#333;color:#fff;border:0;padding:6px 10px;border-radius:6px">✕</button>
    </div>

    <div style="background:#1c1917;padding:12px;border-radius:10px;margin:10px 0;border:1px solid #f59e0b">
      <div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-bottom:6px">⚡ 1-Click Blockbuster Trailer Presets</div>
      <button onclick="quickAddPreset(0)" style="width:100%;padding:10px;background:#e50914;color:#fff;border:0;border-radius:8px;font-weight:bold;font-size:13px">+ 1-Click Publish: Avengers: Doomsday (Official Trailer)</button>
    </div>

    <div style="background:#0d0d12;padding:12px;border-radius:10px;margin:10px 0;border:1px solid #262633">
      <div style="font-size:12px;color:#60a5fa;font-weight:bold;margin-bottom:6px">1. Multi-Source Auto-Fill (YouTube Trailers + Internet Archive + Apple HD)</div>
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <input id="tmdbQ" placeholder="Type ANY Title (e.g. Night of the Living Dead, Dune)" style="flex:1;padding:9px;border-radius:6px;border:1px solid #333;background:#16161d;color:#fff;font-size:12px">
        <button id="afBtn" onclick="autoFillEverything()" style="padding:9px 14px;background:#2563eb;color:#fff;border:0;border-radius:6px;font-weight:bold;font-size:12px">Auto-Fill</button>
      </div>
      <input id="tmdbKey" value="${savedKey}" placeholder="Optional: Paste TMDB v3 API Key for exact trailer keys" style="width:100%;padding:7px;border-radius:6px;border:1px solid #262633;background:#16161d;color:#aaa;font-size:11px">
    </div>

    <input id="fTitle" placeholder="Movie Title" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <div style="display:flex;gap:6px">
      <input id="fYear" placeholder="Year (2026)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fCat" placeholder="Category (Trending)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
      <input id="fRate" placeholder="Rating (8.8)" style="flex:1;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    </div>
    <input id="fPost" placeholder="Poster Image URL" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff">
    <textarea id="fDesc" placeholder="Description" rows="2" style="width:100%;padding:9px;margin:5px 0;border-radius:8px;border:1px solid #333;background:#0d0d12;color:#fff"></textarea>

    <div style="font-size:12px;color:#10b981;font-weight:bold;margin-top:8px">2. Auto-Discovered Public Video Servers (YouTube Preferred for Trailers)</div>
    <div id="srvInputs"></div>
    <button onclick="addSrvRow()" style="width:100%;padding:8px;margin:6px 0;background:#1f2937;color:#93c5fd;border:1px dashed #3b82f6;border-radius:8px;font-size:12px">+ Add Another Server Link</button>

    <button onclick="saveMovie()" style="width:100%;padding:11px;margin-top:8px;background:#e50914;color:#fff;border:0;border-radius:8px;font-weight:bold">Save Movie</button>
    <button onclick="copyJSON()" style="width:100%;padding:10px;margin-top:8px;background:#10b981;color:#000;border:0;border-radius:8px;font-weight:bold">Copy movies.json (For Global Deploy)</button>
  </div>`;
  addSrvRow("YouTube Trailer","1080P","English","");
}

async function autoFillEverything(){
  const q=document.getElementById("tmdbQ").value.trim();
  const key=document.getElementById("tmdbKey").value.trim();
  if(!q)return alert("Type a movie name first.");
  if(key)localStorage.setItem("cv_tmdb_key",key);
  const btn=document.getElementById("afBtn");btn.textContent="Scanning...";
  const foundServers=[];
  let meta={title:q,year:"2026",cat:"Trending",rate:"8.8",poster:"",desc:""};

  try{
    // 1. Metadata + Official YouTube Trailers (TMDB if key provided, else iTunes/Apple Movies)
    if(key){
      const sr=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}`);
      const sd=await sr.json();
      if(sd.results&&sd.results.length){
        const m=sd.results[0];
        meta.title=m.title||q;
        meta.year=(m.release_date||"2026").slice(0,4);
        meta.rate=(m.vote_average||8.8).toFixed(1);
        meta.desc=m.overview||"";
        if(m.poster_path)meta.poster=`https://image.tmdb.org/t/p/w500${m.poster_path}`;
        const vr=await fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${encodeURIComponent(key)}`);
        const vd=await vr.json();
        (vd.results||[]).filter(v=>v.site==="YouTube"&&(v.type==="Trailer"||v.type==="Teaser")).slice(0,2)
          .forEach((v,i)=>foundServers.push({name:`YouTube ${v.type} ${i+1}`,qual:"1080P",lang:"YouTube",url:`https://www.youtube.com/embed/${v.key}`}));
      }
    }

    // 2. Apple/iTunes Public Movie Metadata & HD Trailer Preview
    const ir=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=movie&limit=1`);
    const id=await ir.json();
    if(id.results&&id.results.length){
      const m=id.results[0];
      if(!meta.desc){
        meta.title=m.trackName||meta.title;
        meta.year=(m.releaseDate||meta.year).slice(0,4);
        meta.cat=m.primaryGenreName||meta.cat;
        meta.desc=m.longDescription||m.shortDescription||"";
        if(m.artworkUrl100)meta.poster=m.artworkUrl100.replace("100x100bb","600x900bb");
      }
      if(!foundServers.length){
        foundServers.push({name:"YouTube Official Trailer",qual:"1080P",lang:"YouTube",url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(meta.title+" "+meta.year+" official trailer")}`});
      }
      if(m.previewUrl)foundServers.push({name:"Apple HD Trailer",qual:"1080P",lang:"Original",url:m.previewUrl});
    }else if(!foundServers.length){
      foundServers.push({name:"YouTube Official Trailer",qual:"1080P",lang:"YouTube",url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q+" official trailer")}`});
    }

    // 3. Internet Archive Public-Domain Full Movie Discovery
    const ar=await fetch(`https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(meta.title)})+AND+mediatype:(movies)&fl[]=identifier,title,year,description&rows=2&output=json`);
    const ad=await ar.json();
    const docs=(ad.response&&ad.response.docs)||[];
    docs.forEach((doc,idx)=>{
      if(doc.identifier){
        if(!meta.poster)meta.poster=`https://archive.org/services/img/${doc.identifier}`;
        if(!meta.desc&&doc.description)meta.desc=Array.isArray(doc.description)?doc.description[0]:doc.description;
        foundServers.push({name:`Archive Full Stream ${idx+1}`,qual:"HD",lang:"Public Domain",url:`https://archive.org/embed/${doc.identifier}`});
      }
    });

    document.getElementById("fTitle").value=meta.title;
    document.getElementById("fYear").value=meta.year;
    document.getElementById("fCat").value=meta.cat;
    document.getElementById("fRate").value=meta.rate;
    document.getElementById("fPost").value=meta.poster;
    document.getElementById("fDesc").value=meta.desc;

    document.getElementById("srvInputs").innerHTML="";
    foundServers.forEach(s=>addSrvRow(s.name,s.qual,s.lang,s.url));
    alert(`Auto-filled "${meta.title}" with ${foundServers.length} public source(s) (YouTube trailer prioritized)!`);
  }catch(e){alert("Error scanning public sources. Check your internet connection.");}
  btn.textContent="Auto-Fill";
}

async function quickAddPreset(idx){
  const p=JSON.parse(JSON.stringify(QUICK_PRESETS[idx]));
  DB.movies=DB.movies.filter(m=>m.id!==p.id);
  DB.movies.unshift(p);
  localStorage.setItem(KEY,JSON.stringify(DB));
  if(window.renderCatBar)renderCatBar();
  renderHome();
  document.getElementById("admMod").style.display="none";
  alert(`"${p.title}" published to your home screen!`);
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
  if(window.renderCatBar)renderCatBar();
  renderHome();
  alert("Saved! Tap 'Copy movies.json' to publish globally.");
}

function copyJSON(){
  navigator.clipboard.writeText(JSON.stringify(DB,null,2)).then(()=>alert("Copied movies.json! Paste it into ~/cinevault/movies.json and run wrangler deploy."));
}
