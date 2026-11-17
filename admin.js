function tapLogo(){if(++taps>=5){taps=0;openAdmin();}setTimeout(()=>taps=0,1800);}
function openAdmin(){document.getElementById("adminDesk").classList.add("open");if(sessionStorage.getItem("adm")==="1")showAdmin();}
function closeAdmin(){document.getElementById("adminDesk").classList.remove("open");}
function unlockAdmin(){if(document.getElementById("pinIn").value===(localStorage.getItem(PKEY)||"WhoisRabi@1234")){sessionStorage.setItem("adm","1");showAdmin();}else alert("Wrong PIN");}
function showAdmin(){
  document.getElementById("adminLock").style.display="none";document.getElementById("adminBody").style.display="block";
  document.getElementById("sAnn").value=DB.settings.announcement||"";document.getElementById("sAd").value=DB.settings.adCode||"";
  if(!document.getElementById("srvInputs").children.length)addSrvRow("Server 1","");renderAdminList();
}
function addSrvRow(n="",u=""){
  const d=document.createElement("div");d.className="srv-row";
  d.innerHTML=`<input class="adm-in s-n" placeholder="Name" value="${n}" style="flex:1"><input class="adm-in s-u" placeholder="3rd-Party Player URL" value="${u}" style="flex:2"><button class="btn glass" style="flex:0;padding:7px 10px" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById("srvInputs").appendChild(d);
}
function saveMovie(){
  const t=document.getElementById("fTitle").value.trim(),p=document.getElementById("fPoster").value.trim(),servers=[];
  document.querySelectorAll("#srvInputs .srv-row").forEach((r,i)=>{const u=r.querySelector(".s-u").value.trim();if(u)servers.push({name:r.querySelector(".s-n").value.trim()||`Server ${i+1}`,url:u});});
  if(!t||!p||!servers.length)return alert("Fill Title, Poster & 1+ Server URL");
  const id=document.getElementById("editId").value||"cv-"+Date.now();
  const obj={id,title:t,year:document.getElementById("fYear").value||"WhoisRabi@1234",category:document.getElementById("fCat").value||"Trending",rating:document.getElementById("fRate").value||"8.8",poster:p,description:document.getElementById("fDesc").value,servers};
  const i=DB.movies.findIndex(x=>x.id===id);if(i>-1)DB.movies[i]=obj;else DB.movies.unshift(obj);
  localStorage.setItem(KEY,JSON.stringify(DB));resetForm();renderAdminList();renderHome();alert("Saved!");
}
function editMovie(id){
  const m=DB.movies.find(x=>x.id===id);if(!m)return;
  ["editId","fTitle","fYear","fCat","fRate","fPoster","fDesc"].forEach((k,i)=>document.getElementById(k).value=[m.id,m.title,m.year,m.category,m.rating,m.poster,m.description][i]||"");
  document.getElementById("srvInputs").innerHTML="";(m.servers||[]).forEach(s=>addSrvRow(s.name,s.url));
}
function deleteMovie(id){if(confirm("Delete?")){DB.movies=DB.movies.filter(x=>x.id!==id);localStorage.setItem(KEY,JSON.stringify(DB));renderAdminList();renderHome();}}
function resetForm(){["editId","fTitle","fYear","fCat","fRate","fPoster","fDesc"].forEach(k=>document.getElementById(k).value="");document.getElementById("srvInputs").innerHTML="";addSrvRow("Server 1","");}
function renderAdminList(){
  document.getElementById("mCount").textContent=DB.movies.length;
  document.getElementById("adminMovieList").innerHTML=DB.movies.map(m=>`<div class="adm-item"><b>${m.title} (${(m.servers||[]).length})</b><div><button class="btn glass" style="padding:4px 8px" onclick="editMovie('${m.id}')">Edit</button> <button class="btn glass" style="padding:4px 8px;color:#f87171" onclick="deleteMovie('${m.id}')">Del</button></div></div>`).join("");
}
function saveSettings(){
  DB.settings.announcement=document.getElementById("sAnn").value.trim();DB.settings.adCode=document.getElementById("sAd").value.trim();
  const np=document.getElementById("sPin").value.trim();if(np)localStorage.setItem(PKEY,np);
  localStorage.setItem(KEY,JSON.stringify(DB));initApp();alert("Settings Saved!");
}
function copyCatalogJSON(){navigator.clipboard.writeText(JSON.stringify(DB,null,2)).then(()=>alert("Copied! Paste into movies.json & git push"));}
