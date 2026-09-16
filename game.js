/* The job, three times over, and the record of what each one cost. */
(() => {
'use strict';
const $=id=>document.getElementById(id), G=Groundwork, canvas=$('world');
let view;
try{ if(!window.THREE)throw new Error('The local 3D renderer did not load.'); view=createVoxelView(canvas); }
catch(error){$('load-error').hidden=false;$('error-message').textContent=error.message;return;}

const HW=.3, BODY=1.8, EYE=1.62, REACH=5, WALK=4.3, GRAV=22, JUMP=7.4;
const dialogs=[...document.querySelectorAll('dialog')];
const paused=()=>dialogs.some(d=>d.open);
const keys=new Set();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const setText=(id,v)=>{const el=$(id);if(el&&el.textContent!==v)el.textContent=v;};

let world=null, plot=null, conditions=null, player=null, lost=false;
let carried=0, holding='stone', lanternAt=null, cutting=null, cutProgress=0;
let clock=0, mined=0, placed=0, walked=0, checks=0, lastFrame=0, sightUntil=0;
let records=[], order=G.PLOTS.map(p=>p.id), stage=0, replayOf=null, chosenAffordance=null;
let drag=null, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function say(text,seconds=6){$('caption').textContent=text;sightUntil=Math.max(sightUntil,0);$('caption').dataset.until=String(clock+seconds);}
function modal(id){keys.clear();drag=null;if(document.pointerLockElement)document.exitPointerLock();
  dialogs.forEach(d=>d.open&&d.close());$(id).showModal();}
function closeModal(id){$(id).close();if(!paused())canvas.focus({preventScroll:true});}

/* --- loading a plot ------------------------------------------------------ */
function startPlot(id,cond,isReplay){
  plot=G.PLOTS.find(p=>p.id===id);
  conditions=cond||plot.conditions;
  world=G.buildPlot(id,conditions);
  view.load(world,conditions.light);
  player={x:world.spawn.x,y:world.spawn.y,z:world.spawn.z,vx:0,vy:0,vz:0,yaw:Math.PI/2,pitch:-.1,onGround:true};
  carried=0;holding='stone';lanternAt=null;cutting=null;cutProgress=0;
  clock=0;mined=0;placed=0;walked=0;checks=0;replayOf=isReplay?id:null;
  view.hideSight();
  setText('plot-name',plot.name);
  setText('plot-note',plot.note);
  updateConditionsPanel();
  updateHUD();
  say(plot.blurb,9);
}
function updateConditionsPanel(){
  const c=conditions;
  const rows=[
    ['Tool',G.TOOLS[c.tool].name],
    ['Stone',c.stocked?'delivered to the work site':c.walled?'in sight, behind the wall':c.stoneAt+' paces off'],
    ['Light',c.light>.9?'full daylight':c.light>.6?'overcast':'going'],
    ['Ladder',c.ladder?'on site':'none'],
  ];
  $('conditions').innerHTML=rows.map(r=>'<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>').join('');
}

/* --- body ---------------------------------------------------------------- */
function blocked(px,py,pz){
  for(let x=Math.floor(px-HW);x<=Math.floor(px+HW);x++)
  for(let y=Math.floor(py);y<=Math.floor(py+BODY-.001);y++)
  for(let z=Math.floor(pz-HW);z<=Math.floor(pz+HW);z++)
    if(world.isSolid(x,y,z))return true;
  return false;
}
function move(dt){
  const f=(keys.has('w')?1:0)-(keys.has('s')?1:0);
  const s=(keys.has('d')?1:0)-(keys.has('a')?1:0);
  if(keys.has('arrowleft'))player.yaw+=dt*1.9;
  if(keys.has('arrowright'))player.yaw-=dt*1.9;
  if(keys.has('arrowup'))player.pitch=clamp(player.pitch+dt*1.4,-1.45,1.45);
  if(keys.has('arrowdown'))player.pitch=clamp(player.pitch-dt*1.4,-1.45,1.45);
  /* yaw 0 faces -Z, matching the camera. */
  let dx=(-Math.sin(player.yaw)*f)+(Math.cos(player.yaw)*s);
  let dz=(-Math.cos(player.yaw)*f)-(Math.sin(player.yaw)*s);
  const len=Math.hypot(dx,dz);
  if(len>0){dx/=len;dz/=len;}
  const before={x:player.x,z:player.z};
  const nx=player.x+dx*WALK*dt;
  if(!blocked(nx,player.y,player.z))player.x=nx; else {
    /* A single block is a step, which is what makes a staircase walkable. */
    if(player.onGround&&!blocked(nx,player.y+1,player.z)){player.x=nx;player.y+=1;}
  }
  const nz=player.z+dz*WALK*dt;
  if(!blocked(player.x,player.y,nz))player.z=nz; else {
    if(player.onGround&&!blocked(player.x,player.y+1,nz)){player.z=nz;player.y+=1;}
  }
  player.vy-=GRAV*dt;
  const ny=player.y+player.vy*dt;
  if(!blocked(player.x,ny,player.z)){player.y=ny;player.onGround=false;}
  else {
    if(player.vy<0)player.onGround=true;
    player.vy=0;
  }
  if(player.y<-6)goHome();
  walked+=Math.hypot(player.x-before.x,player.z-before.z);
}

/* A pit you cut yourself and cannot step out of is a trap, not a lesson. This
   returns the builder to the work site and takes nothing away from them. */
function goHome(){
  if(!player||!world)return;
  player.x=world.spawn.x;player.y=world.spawn.y;player.z=world.spawn.z;
  player.vx=player.vy=player.vz=0;player.onGround=true;
}

/* --- working ------------------------------------------------------------- */
function aim(){
  const cp=Math.cos(player.pitch);
  const dx=-Math.sin(player.yaw)*cp, dy=Math.sin(player.pitch), dz=-Math.cos(player.yaw)*cp;
  return view.raycast(player.x,player.y+EYE,player.z,dx,dy,dz,REACH);
}
function work(dt){
  const hit=aim();
  if(!hit){cutting=null;cutProgress=0;view.setTarget(null,0);return;}
  const working=keys.has('f')||keys.has('mouse');
  if(!working){cutting=null;cutProgress=0;view.setTarget(hit,0);return;}
  const seconds=G.breakSeconds(conditions.tool,hit.block);
  if(seconds===Infinity){
    view.setTarget(hit,0);
    const tool=G.TOOLS[conditions.tool].name;
    say('The '+G.BLOCKS[hit.block].name+' does not give. '+tool.charAt(0).toUpperCase()+tool.slice(1)+' will not cut it.',3);
    return;
  }
  const key=hit.x+','+hit.y+','+hit.z;
  if(cutting!==key){cutting=key;cutProgress=0;}
  cutProgress+=dt/seconds;
  view.setTarget(hit,Math.min(1,cutProgress));
  if(cutProgress>=1){
    const was=hit.block;
    world.set(hit.x,hit.y,hit.z,G.AIR);
    if(lanternAt&&lanternAt.x===hit.x&&lanternAt.y===hit.y&&lanternAt.z===hit.z)lanternAt=null;
    view.rebuild();
    cutting=null;cutProgress=0;mined++;
    if(G.BLOCKS[was].material)carried++;
    updateHUD();
  }
}
function place(){
  const hit=aim();
  if(!hit){say('Nothing within reach to build against.',3);return;}
  const tx=hit.x+hit.face[0], ty=hit.y+hit.face[1], tz=hit.z+hit.face[2];
  /* One rule set, shared with the completability proof in the tests. */
  const allowed=G.canPlace(world,tx,ty,tz,player,holding,carried,!!lanternAt);
  if(!allowed.ok){say(allowed.reason.charAt(0).toUpperCase()+allowed.reason.slice(1)+'.',3);return;}
  if(holding==='lantern'){
    world.set(tx,ty,tz,G.LANTERN);lanternAt={x:tx,y:ty,z:tz};
    view.rebuild();checkSignal(true);
  } else {
    carried--;placed++;
    world.set(tx,ty,tz,G.PLACED);view.rebuild();
  }
  updateHUD();
}
/* Building a tower means putting stone under your own feet and rising with it.
   Doing that by jumping and placing mid-air is a timing trick, and timing tricks
   are not the difficulty this game is about, so it gets its own action. */
function raise(){
  if(holding!=='stone'){say('Swap back to building stone first.',3);return;}
  if(carried<=0){say('No building stone in hand.',3);return;}
  if(!player.onGround){say('You have to be standing to build under yourself.',3);return;}
  const fx=Math.floor(player.x),fy=Math.floor(player.y),fz=Math.floor(player.z);
  if(world.get(fx,fy,fz)!==G.AIR){say('No room at your feet.',3);return;}
  if(blocked(player.x,player.y+1,player.z)){say('No headroom to rise.',3);return;}
  world.set(fx,fy,fz,G.PLACED);carried--;placed++;
  player.y=fy+1;player.vy=0;player.onGround=true;
  view.rebuild();updateHUD();
}

/* Checking the judgment is free and repeatable. Acting on it costs material.
   That asymmetry is deliberate: the thinking is never the scarce thing here. */
function checkSignal(afterPlacing){
  const target=lanternAt||(()=>{const h=aim();return h?{x:h.x+h.face[0],y:h.y+h.face[1],z:h.z+h.face[2]}:null;})();
  if(!target){say('Look at where the lantern would go, then check again.',4);return;}
  if(!afterPlacing)checks++;
  const verdict=G.lanternCarries(world.isSolid,target.x,target.y,target.z);
  let stopAt=-1;
  for(let x=target.x-1;x>=-1;x--){if(world.isSolid(x,target.y,target.z)){stopAt=x+1;break;}}
  view.showSight(target.x,target.y,target.z,verdict.carries?-2:stopAt);
  sightUntil=clock+4;
  if(verdict.carries){
    if(lanternAt)finishPlot(true);
    else say('From there it would carry. Nothing stands between that spot and the valley.',6);
  } else if(verdict.reason==='low'){
    say('Too low to read as a signal. It has to sit at least '+G.SIGNAL_MIN_Y+' up.',6);
  } else {
    say('The line is stopped by what is standing at '+verdict.at+'. Higher, or further along.',6);
  }
  updateHUD();
}
function finishPlot(done){
  records.push({plot:plot.id,name:plot.name,conditions,seconds:clock,mined,placed,walked,checks,
    finished:done,replay:!!replayOf});
  view.hideSight();
  if(done)modal('plot-done'); else modal('plot-gaveup');
  renderPlotSummary(done);
}
function declareImpossible(){
  const a=G.assessment(plot.id,conditions);
  if(a.workable){
    say('There is a way through here. It costs more than it should, but the job can be finished.',8);
    return;
  }
  finishPlot(false);
}

/* --- reporting ------------------------------------------------------------ */
const mmss=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function renderPlotSummary(done){
  const r=records[records.length-1];
  const id=done?'done-body':'gaveup-body';
  $(id).innerHTML=
    '<p>'+(done
      ? (records.length>1
         ? 'The lantern carries. The same judgment as the last lot, worked out again from where you were standing.'
         : 'The lantern carries. Remember what that took, because the job does not change from here.')
      : 'Correct. With the conditions on this lot, the job could not be finished at all. That is not the same as hard.')+'</p>'+
    '<dl class="tally">'+
    tally('Time on the lot',mmss(r.seconds))+
    tally('Stone cut',String(r.mined))+
    tally('Ground covered',Math.round(r.walked)+' m')+
    tally('Sight checks',String(r.checks))+
    '</dl>';
}
const tally=(k,v)=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>';
function nextStage(){
  const last=records[records.length-1];
  const open=dialogs.find(d=>d.open); if(open)closeModal(open.id);
  /* The replay of the walled lot is the last thing that happens. */
  if(last&&last.replay){endGame();return;}
  stage++;
  if(stage<order.length){startPlot(order[stage]);return;}
  buildDebrief();modal('debrief');
}
function buildDebrief(){
  const rows=records.filter(r=>!r.replay).map(r=>
    '<tr><th scope="row">'+r.name+'</th><td>'+mmss(r.seconds)+'</td><td>'+r.mined+'</td><td>'+
    Math.round(r.walked)+' m</td><td>'+r.checks+'</td><td>'+(r.finished?'yes':'no')+'</td></tr>').join('');
  $('debrief-table').innerHTML=
    '<thead><tr><th scope="col">Lot</th><th scope="col">Time</th><th scope="col">Stone cut</th>'+
    '<th scope="col">Walked</th><th scope="col">Sight checks</th><th scope="col">Finished</th></tr></thead><tbody>'+rows+'</tbody>';
  $('affordance-list').innerHTML=G.AFFORDANCES.map(a=>
    '<label><input type="radio" name="affordance" value="'+a.id+'"> '+a.label+'</label>').join('');
}
function applyChange(){
  const picked=document.querySelector('input[name=affordance]:checked');
  if(!picked){say('Choose one thing to change.',4);return;}
  chosenAffordance=G.AFFORDANCES.find(a=>a.id===picked.value);
  const cond=chosenAffordance.apply(G.PLOTS.find(p=>p.id==='walled').conditions);
  const a=G.assessment('walled',cond);
  closeModal('debrief');
  startPlot('walled',cond,true);
  say(a.workable
    ? 'Changed: '+chosenAffordance.label.toLowerCase()+'. The job is now possible here. The judgment has not moved.'
    : 'Changed: '+chosenAffordance.label.toLowerCase()+'. It did not touch what was actually stopping the work.',11);
}
function endGame(){
  const walled=records.filter(r=>r.plot==='walled');
  const first=walled[0], second=walled[walled.length-1];
  const worked=!!(second&&second.finished);
  const changed=chosenAffordance?chosenAffordance.label.toLowerCase():'one condition';
  $('end-body').innerHTML=
    '<p>'+(worked
      ? 'The walled lot did not get easier. It got possible. You changed one condition, '+changed+
        ', and the judgment it asks for is the one it always asked for.'
      : 'You changed one condition, '+changed+', and the lot is still not workable. That is worth as much as '+
        'the other answer: a real resource that does not touch the actual barrier leaves the barrier exactly '+
        'where it was.')+'</p>'+
    (first&&second&&second!==first
      ? '<dl class="tally">'+tally('Before the change',first.finished?'finished':'could not be finished')+
        tally('After',second.finished?'finished':'still could not be finished')+'</dl>' : '');
  $('end-title').innerHTML=worked
    ? 'It did not get easier.<br><em>It got possible.</em>'
    : 'The barrier<br><em>is still there.</em>';
  modal('ending');
}

/* --- HUD ----------------------------------------------------------------- */
function updateHUD(){
  setText('carried',String(carried));
  setText('holding',holding==='lantern'?'signal lantern':'building stone');
  setText('lantern-state',lanternAt?'up at '+lanternAt.y:'in your pack');
  setText('elapsed',mmss(clock));
  setText('mined',String(mined));
  setText('walked',Math.round(walked)+' m');
  const hit=aim();
  if(!hit){setText('target','—');$('target-note').textContent='';return;}
  const b=G.BLOCKS[hit.block];
  setText('target',b.name);
  const sec=G.breakSeconds(conditions.tool,hit.block);
  /* Saying which face is under the crosshair is the difference between building
     a tower and building a path by accident. */
  const f=hit.face, where=f[1]>0?'on top':f[1]<0?'underneath':'against the side';
  const cut=sec===Infinity
    ? G.TOOLS[conditions.tool].name+' will not cut this'
    : sec.toFixed(1)+'s with '+G.TOOLS[conditions.tool].name;
  $('target-note').textContent=cut+'  ·  E builds '+where;
}

/* --- input --------------------------------------------------------------- */
const HELD=['w','a','s','d','f','arrowup','arrowdown','arrowleft','arrowright'];
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!paused()&&world)modal('pause');return;}
  if(paused()||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const k=e.key.toLowerCase();
  if(HELD.includes(k)||[' ','e','c','r','q','tab'].includes(k)){e.preventDefault();keys.add(k);}
  if(e.repeat)return;
  if(k===' '&&player&&player.onGround){player.vy=JUMP;player.onGround=false;}
  if(k==='e')place();
  if(k==='c')checkSignal(false);
  if(k==='q')raise();
  if(k==='tab'){holding=holding==='stone'?'lantern':'stone';updateHUD();}
  if(k==='r'){goHome();say('Back at the work site.',3);}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&world&&!paused())modal('pause');});
canvas.addEventListener('pointerdown',e=>{
  if(paused())return;canvas.focus({preventScroll:true});
  if(document.pointerLockElement===canvas||e.button===0)keys.add('mouse');
  if(e.button===2){place();return;}
  drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
  if(paused()||!player)return;
  let dx=0,dy=0;
  if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY;}
  else if(drag){dx=e.clientX-drag.x;dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;}
  if(dx||dy){player.yaw-=dx*.0032;player.pitch=clamp(player.pitch-dy*.0032,-1.45,1.45);}
});
for(const ev of ['pointerup','pointercancel'])canvas.addEventListener(ev,e=>{
  keys.delete('mouse');drag=null;
  if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
for(const b of document.querySelectorAll('[data-key]')){
  const k=b.dataset.key;
  b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId);
    if(k===' '&&player&&player.onGround){player.vy=JUMP;player.onGround=false;}});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(k));
}
$('btn-place').onclick=()=>place();
$('btn-check').onclick=()=>checkSignal(false);
$('btn-swap').onclick=()=>{holding=holding==='stone'?'lantern':'stone';updateHUD();};
$('btn-home').onclick=()=>{goHome();say('Back at the work site.',3);};
$('btn-raise').onclick=()=>raise();
$('btn-impossible').onclick=()=>declareImpossible();
$('begin').onclick=()=>{closeModal('intro');stage=0;records=[];startPlot(order[0]);};
$('next-plot').onclick=()=>nextStage();
$('next-plot-2').onclick=()=>nextStage();
$('apply-change').onclick=()=>applyChange();
$('resume').onclick=()=>closeModal('pause');
$('restart').onclick=()=>{closeModal('pause');stage=0;records=[];chosenAffordance=null;startPlot(order[0]);};
$('lock').onclick=async()=>{closeModal('pause');try{await canvas.requestPointerLock();}catch{say('Drag to look instead.',4);}};
$('again').onclick=()=>{closeModal('ending');stage=0;records=[];chosenAffordance=null;startPlot(order[0]);};
$('motion').checked=reduced;$('motion').onchange=e=>{reduced=e.target.checked;};

/* --- loop ---------------------------------------------------------------- */
function frame(now){
  const dt=Math.min(.05,(now-lastFrame)/1000||.016);lastFrame=now;
  if(world&&!paused()){
    clock+=dt;move(dt);work(dt);
    if(clock*4%1<dt*4)updateHUD();
    const until=Number($('caption').dataset.until||0);
    if(clock>until&&$('caption').textContent)$('caption').textContent='';
    if(sightUntil&&clock>sightUntil){view.hideSight();sightUntil=0;}
    /* Once the lantern is up and carrying, the lot is done. */
    if(lanternAt&&G.lanternCarries(world.isSolid,lanternAt.x,lanternAt.y,lanternAt.z).carries&&!paused())finishPlot(true);
  }
  if(world)view.render(player);
  if(!lost)requestAnimationFrame(frame);
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;keys.clear();
  dialogs.forEach(d=>d.open&&d.close());
  $('error-message').textContent='The graphics connection was interrupted. Reload the page to start again.';
  $('load-error').hidden=false;$('load-error').querySelector('a')?.focus();});
modal('intro');requestAnimationFrame(frame);
})();
