party.innerHTML=`
<div class="p-top"><b id="pTitle">Theater</b><span id="roomCode" style="color:#f59e0b"></span><button class="btn glass" style="flex:0;padding:5px 12px" onclick="leaveParty()">✕ Close</button></div>
<div class="v-wrap" id="vWrap" onclick="toggleHud()">
  <video id="player" playsinline src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"></video>
  <div class="v-hud" id="vHud" onclick="event.stopPropagation()">
    <div style="font-size:11px;color:#f59e0b;font-weight:700">4K HDR • DOLBY</div>
    <div class="v-mid">
      <button onclick="skip(-10)">-10s</button>
      <button class="play-big" id="pBtn" onclick="togglePlay()">▶</button>
      <button onclick="skip(10)">+10s</button>
    </div>
    <div class="v-bot">
      <span id="tCur">0:00</span>
      <input type="range" id="seek" value="0" min="0" max="100" oninput="scrub(this.value)">
      <span id="tDur">0:00</span>
      <button id="spdBtn" onclick="nextSpeed()">1x</button>
      <button onclick="vWrap.requestFullscreen?.()">⛶</button>
    </div>
  </div>
</div>
<div class="solo-info" id="soloBox">
  <div class="tag">SOLO CINEMA</div><h2 id="sTitle" style="border:none;padding:0;margin:6px 0"></h2>
  <p id="sDesc" style="color:#94a3b8;font-size:13.5px;line-height:1.5"></p>
</div>
<div class="cams" id="cams"><video id="myCam" autoplay muted playsinline></video></div>
<div class="ctrls" id="pCtrls"><button id="micBtn" onclick="toggleMic()">Mic On</button><button id="camBtn" onclick="toggleCam()">Cam On</button><button onclick="sendReact('🔥')">🔥</button><button onclick="sendReact('😂')">😂</button><button onclick="copyCode()">Copy Code</button></div>
<div class="chat" id="chatBox"></div>
<div class="c-bar" id="cBar"><input id="cIn" placeholder="Comment..."><button class="btn gold" style="flex:0;padding:10px 16px" onclick="sendMsg()">Send</button></div>`;

let hudT;
function toggleHud(){vHud.classList.toggle('hide');clearTimeout(hudT);if(!vHud.classList.contains('hide'))hudT=setTimeout(()=>vHud.classList.add('hide'),3000);}
function togglePlay(){player.paused?player.play():player.pause();pBtn.textContent=player.paused?"▶":"❚❚";}
function skip(s){player.currentTime=Math.max(0,player.currentTime+s);}
function scrub(v){if(player.duration)player.currentTime=(v/100)*player.duration;}
function nextSpeed(){const s=[1,1.25,1.5,2],n=s[(s.indexOf(player.playbackRate)+1)%s.length];player.playbackRate=n;spdBtn.textContent=n+"x";}
const fmt=t=>isNaN(t)?"0:00":Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
player.ontimeupdate=()=>{if(player.duration)seek.value=(player.currentTime/player.duration)*100;tCur.textContent=fmt(player.currentTime);tDur.textContent=fmt(player.duration);};
player.onplay=()=>pBtn.textContent="❚❚";player.onpause=()=>pBtn.textContent="▶";

startWatch=function(withFriends){
  mod.classList.remove('open');party.classList.add('open');
  pTitle.textContent=curMovie.title||"Cinema";
  soloBox.style.display=withFriends?"none":"block";
  sTitle.textContent=curMovie.title||"";sDesc.textContent=curMovie.overview||"";
  ['cams','pCtrls','chatBox','cBar'].forEach(id=>document.getElementById(id).style.display=withFriends?"flex":"none");
  roomCode.textContent=withFriends?"Creating room...":"Solo Cinema";
  player.play();toggleHud();
  if(withFriends)initPeer();
};
