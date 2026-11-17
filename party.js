let peer,conn,myStream,curMovie={},syncLock=false;
const prevOpen=openM;
openM=function(m){curMovie=m;prevOpen(m);};
function startWatch(withFriends){
  mod.classList.remove('open');party.classList.add('open');
  pTitle.textContent=curMovie.title||"Watch Party";
  cams.style.display=withFriends?"flex":"none";
  document.querySelector('.ctrls').style.display=withFriends?"flex":"none";
  roomCode.textContent=withFriends?"Creating room...":"Solo Mode";
  if(withFriends)initPeer();
}
async function initPeer(targetId){
  try{myStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});myCam.srcObject=myStream;}
  catch(e){addChat("System","Camera/Mic permission blocked—chat & sync still work!");}
  peer=new Peer();
  peer.on('open',id=>{
    roomCode.textContent=targetId?"Connected":"Code: "+id.slice(0,8);
    if(!targetId)roomCode.dataset.full=id;
    if(targetId){conn=peer.connect(targetId);setupConn(conn);if(myStream)peer.call(targetId,myStream).on('stream',addRemote);}
  });
  peer.on('connection',c=>{conn=c;setupConn(c);addChat("System","Friend joined the party!");});
  peer.on('call',call=>{call.answer(myStream);call.on('stream',addRemote);});
}
function addRemote(st){
  if(document.getElementById('remVid'))return;
  const v=document.createElement('video');v.id='remVid';v.autoplay=true;v.playsInline=true;v.srcObject=st;cams.appendChild(v);
}
function setupConn(c){
  c.on('data',d=>{
    if(d.type==='chat')addChat("Friend",d.text);
    if(d.type==='react')popEmoji(d.emoji);
    if(d.type==='sync'){syncLock=true;player.currentTime=d.time;d.paused?player.pause():player.play();setTimeout(()=>syncLock=false,400);}
  });
}
function joinRoom(){
  const id=prompt("Paste your friend's full Room Code:");if(!id)return;
  party.classList.add('open');pTitle.textContent="Friend's Room";initPeer(id.trim());
}
function copyCode(){const c=roomCode.dataset.full;if(c){navigator.clipboard.writeText(c);alert("Copied Room Code:\n"+c);}}
function sendMsg(){if(!cIn.value)return;addChat("You",cIn.value);if(conn)conn.send({type:'chat',text:cIn.value});cIn.value="";}
function addChat(u,t){chatBox.innerHTML+=`<div class="msg"><b>${u}:</b> ${t}</div>`;chatBox.scrollTop=9999;}
function sendReact(e){popEmoji(e);if(conn)conn.send({type:'react',emoji:e});}
function popEmoji(e){const s=document.createElement('div');s.className='float-e';s.textContent=e;document.body.appendChild(s);setTimeout(()=>s.remove(),1500);}
function toggleMic(){if(!myStream)return;const t=myStream.getAudioTracks()[0];t.enabled=!t.enabled;micBtn.textContent=t.enabled?"Mic On":"Mic Off";micBtn.classList.toggle('off',!t.enabled);}
function toggleCam(){if(!myStream)return;const t=myStream.getVideoTracks()[0];t.enabled=!t.enabled;camBtn.textContent=t.enabled?"Cam On":"Cam Off";camBtn.classList.toggle('off',!t.enabled);}
function leaveParty(){if(myStream)myStream.getTracks().forEach(t=>t.stop());if(peer)peer.destroy();party.classList.remove('open');}
['play','pause','seeked'].forEach(ev=>player.addEventListener(ev,()=>{if(conn&&!syncLock)conn.send({type:'sync',paused:player.paused,time:player.currentTime});}));
