let peer=null,conns=[],myStream=null,roomId="",isHost=false,syncLock=false;
function openJoin(){document.getElementById("joinMod").classList.add("open");}
function closeJoin(){document.getElementById("joinMod").classList.remove("open");}
async function pasteCode(){try{document.getElementById("jCode").value=(await navigator.clipboard.readText()).trim();}catch(e){}}
function submitJoin(){const c=document.getElementById("jCode").value.trim().toUpperCase();if(!c)return;closeJoin();startParty(c);}
function startWatch(withFriends){if(!withFriends){startParty(null,true);return;}startParty(null,false);}
async function startParty(joinId,solo=false){
  document.getElementById("party").classList.add("open");
  document.getElementById("pTitle").textContent=curMovie?curMovie.title:"Watch Room";
  if(curMovie)loadServer(curSrvIdx||0,true);
  bindVideoSync();
  if(solo){document.getElementById("roomCode").textContent="SOLO";return;}
  try{myStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});document.getElementById("myCam").srcObject=myStream;}catch(e){}
  isHost=!joinId;roomId=joinId||"CV-"+Math.random().toString(36).slice(2,7).toUpperCase();
  document.getElementById("roomCode").textContent=roomId;
  peer=new Peer(isHost?roomId:undefined);
  peer.on("open",()=>{if(!isHost){const c=peer.connect(roomId);setupConn(c);if(myStream)peer.call(roomId,myStream).on("stream",addCam);}});
  peer.on("connection",c=>{setupConn(c);setTimeout(()=>{const v=document.getElementById("player");c.send({t:"srv",m:curMovie?.id,s:curSrvIdx});if(v&&!v.paused)c.send({t:"sync",act:"play",time:v.currentTime});},600);});
  peer.on("call",call=>{call.answer(myStream);call.on("stream",addCam);});
}
function bindVideoSync(){
  const v=document.getElementById("player");
  if(!v||v.dataset.synced)return;
  v.dataset.synced="1";
  ["play","pause","seeked"].forEach(ev=>v.addEventListener(ev,()=>{
    if(syncLock||!conns.length)return;
    conns.forEach(c=>c.open&&c.send({t:"sync",act:ev,time:v.currentTime}));
  }));
}
function setupConn(c){
  conns.push(c);
  c.on("data",d=>{
    if(d.t==="msg")addChat(d.u||"Friend",d.m);
    if(d.t==="react")addChat("✨",d.r);
    if(d.t==="srv"){const m=DB.movies.find(x=>x.id===d.m);if(m){curMovie=m;document.getElementById("pTitle").textContent=m.title;loadServer(d.s,true);}}
    if(d.t==="sync"){
      const v=document.getElementById("player");if(!v)return;
      syncLock=true;
      if(Math.abs(v.currentTime-d.time)>1.2)v.currentTime=d.time;
      if(d.act==="play")v.play().catch(()=>{});
      if(d.act==="pause")v.pause();
      setTimeout(()=>{syncLock=false;},350);
    }
  });
}
function addCam(st){const v=document.createElement("video");v.autoplay=true;v.playsInline=true;v.srcObject=st;document.getElementById("cams").appendChild(v);}
function broadcastServer(m,s){conns.forEach(c=>c.open&&c.send({t:"srv",m,s}));}
function sendMsg(){const i=document.getElementById("cIn"),m=i.value.trim();if(!m)return;addChat("You",m);conns.forEach(c=>c.open&&c.send({t:"msg",u:"Friend",m}));i.value="";}
function sendReact(r){addChat("You",r);conns.forEach(c=>c.open&&c.send({t:"react",r}));}
function addChat(u,m){const b=document.getElementById("chatBox");b.innerHTML+=`<div class="msg"><b>${u}:</b> ${m}</div>`;b.scrollTop=b.scrollHeight;}
function toggleMic(){if(myStream){const t=myStream.getAudioTracks()[0];if(t){t.enabled=!t.enabled;document.getElementById("micBtn").textContent=t.enabled?"Mic On":"Mic Off";}}}
function toggleCam(){if(myStream){const t=myStream.getVideoTracks()[0];if(t){t.enabled=!t.enabled;document.getElementById("camBtn").textContent=t.enabled?"Cam On":"Cam Off";}}}
function copyCode(){navigator.clipboard.writeText(roomId).then(()=>alert("Room Code Copied: "+roomId));}
function leaveParty(){if(myStream)myStream.getTracks().forEach(t=>t.stop());if(peer)peer.destroy();conns=[];document.getElementById("player").pause();document.getElementById("extPlayer").src="";document.getElementById("party").classList.remove("open");}
