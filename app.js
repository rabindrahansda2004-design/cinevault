const DEMO=[
  {title:"Avengers: Doomsday",vote_average:8.9,release_date:"16 Dec 2026",r:1,p:"https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500",b:"https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=900",overview:"Heroes from three distinct universes collide in an unprecedented battle."},
  {title:"The Odyssey",vote_average:8.4,release_date:"15 Jul 2026",r:1,p:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",b:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900",overview:"A mythic voyage across treacherous seas to return home."},
  {title:"Sunrise on the Reaping",vote_average:8.7,release_date:"18 Nov 2026",r:1,p:"https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",b:"https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900",overview:"Return to Panem for the 50th Hunger Games."},
  {title:"Ramayana: Legend",vote_average:9.1,release_date:"05 Nov 2026",r:2,p:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=500",b:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=900",overview:"An ancient epic following a young prince on a legendary journey."},
  {title:"Jailer 2",vote_average:8.2,release_date:"14 Oct 2026",r:2,p:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",b:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=900",overview:"A retired jailer unleashes a storm when his family is threatened."}
];
function initUI(list){
  curMovie=list[0];
  hero.style.backgroundImage=`url(${list[0].b})`;hTitle.textContent=list[0].title;
  hMeta.textContent=`★ ${list[0].vote_average} • ${list[0].release_date} • 4K HDR`;
  draw(list.filter(x=>x.r===1),r1);draw(list.filter(x=>x.r===2),r2);
}
function draw(list,el){
  el.innerHTML=list.map(m=>`<div class="card" onclick='openM(${JSON.stringify(m).replace(/'/g,"")})'><img src="${m.p}"><p>${m.title}</p></div>`).join('');
}
function openM(m){
  curMovie=m;mImg.src=m.p;mTit.textContent=m.title;mMet.textContent=`★ ${m.vote_average} • ${m.release_date}`;mDes.textContent=m.overview;mod.classList.add('open');
}
function openJoin(){jSheet.classList.add('open');}
async function pasteCode(){try{jCode.value=await navigator.clipboard.readText();}catch(e){jCode.focus();}}
function submitJoin(){if(!jCode.value.trim())return;jSheet.classList.remove('open');party.classList.add('open');pTitle.textContent="Friend's Room";initPeer(jCode.value.trim());}
function toggleSearch(){sBar.classList.toggle('open');bSearch.classList.toggle('on');bHome.classList.remove('on');sIn.focus();}
function goHome(){sBar.classList.remove('open');bHome.classList.add('on');bSearch.classList.remove('on');initUI(DEMO);}
function filterLocal(q){draw(DEMO.filter(m=>m.title.toLowerCase().includes(q.toLowerCase())),r1);}
initUI(DEMO);
