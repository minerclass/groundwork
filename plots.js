/* Plots, access conditions, and a shared signal criterion.

   The same builder does the same job three times. What differs between plots is
   never the person. Landscapes differ; interventions preserve the criterion
   while changing access. Tests cover modeled rules, not cognitive difficulty.
*/
(function(root){
'use strict';

/* ---------------------------------------------------------------------------
   Blocks
--------------------------------------------------------------------------- */
const AIR=0,SOIL=1,GRASS=2,STONE=3,HARDPAN=4,TRUNK=5,LEAF=6,LANTERN=7,PLACED=8,ROCK=9,SITE=10;
const BLOCKS={
  [AIR]    :{name:'air',             solid:false},
  [SOIL]   :{name:'soil',            solid:true,  hardness:1},
  [GRASS]  :{name:'turf',            solid:true,  hardness:1},
  [STONE]  :{name:'building stone',  solid:true,  hardness:3, material:true},
  [HARDPAN]:{name:'hardpan',         solid:true,  hardness:9},
  [TRUNK]  :{name:'trunk',           solid:true,  hardness:2},
  [LEAF]   :{name:'leaves',          solid:true,  hardness:1},
  [LANTERN]:{name:'signal lantern',  solid:false},
  [PLACED] :{name:'placed stone',    solid:true,  hardness:3, material:true},
  /* Landscape, not supply. Cutting it yields nothing you can build with. */
  [ROCK]   :{name:'outcrop',         solid:true,  hardness:8},
  [SITE]   :{name:'marked foundation',solid:true},
};

/* ---------------------------------------------------------------------------
   Tools
   A tool is a condition, not a skill. `reach` is the hardness a tool can cut at
   all; past it the block will not come out however long you work at it.
--------------------------------------------------------------------------- */
const TOOLS={
  hands:{name:'bare hands',  reach:2, rate:0.55},
  worn :{name:'a worn pick', reach:3, rate:0.5},
  good :{name:'a good pick', reach:3, rate:1.8},
  steel:{name:'a steel pick',reach:9, rate:2.2},
};
function canBreak(tool,block){
  const b=BLOCKS[block];
  if(!b||!b.solid||b.hardness===undefined)return false;
  return TOOLS[tool].reach>=b.hardness;
}
/* Seconds of sustained work to cut one block. Infinity means never. */
function breakSeconds(tool,block){
  if(!canBreak(tool,block))return Infinity;
  return BLOCKS[block].hardness/TOOLS[tool].rate;
}

/* ---------------------------------------------------------------------------
   The judgment
   Does the lantern carry to the valley? The valley lies west, at -x. The signal
   has to clear whatever stands between it and the opening, and it has to sit
   well above head height so it reads as a signal rather than a lamp.

   This takes geometry and nothing else. It cannot see a tool, a light level, a
   distance, or which plot it is on. Interventions preserve this criterion;
   that is not a claim that each landscape requires identical thinking.
--------------------------------------------------------------------------- */
const SIGNAL_MIN_Y=9;
function lanternCarries(isSolid,x,y,z){
  if(y<SIGNAL_MIN_Y)return {carries:false,reason:'low'};
  for(let step=Math.floor(x)-1;step>=-1;step--){
    if(isSolid(step,y,z))return {carries:false,reason:'blocked',at:step};
  }
  return {carries:true,reason:'clear'};
}

/* ---------------------------------------------------------------------------
   Plots
--------------------------------------------------------------------------- */
const W=40,H=22,D=20,GROUND=4,WORK_X=7;
const BUILD_SITE={minX:6,maxX:8,minZ:7,maxZ:13};
const inBuildSite=(x,z)=>x>=BUILD_SITE.minX&&x<=BUILD_SITE.maxX&&z>=BUILD_SITE.minZ&&z<=BUILD_SITE.maxZ;
const idx=(x,y,z)=>x+W*(y+H*z);
const inside=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<W&&y<H&&z<D;

const PLOTS=[
{ id:'near', name:'The near yard',
  blurb:'Stone at the edge of the yard, a pick that bites, and the light holding.',
  note:'Everything the job needs is within a few steps of the job.',
  conditions:{tool:'good', light:1, stoneAt:7} },
{ id:'far', name:'The far field',
  blurb:'The same job. The stone is across the field, the pick is worn, and the light is going.',
  note:'Nothing here is impossible. All of it costs more.',
  conditions:{tool:'worn', light:.42, stoneAt:24} },
{ id:'walled', name:'The walled lot',
  blurb:'The same job again. You can see the stone from where you are standing.',
  note:'Seeing the material and reaching it are not the same thing.',
  conditions:{tool:'worn', light:.72, stoneAt:16, walled:true} },
];

/* What can be changed about a plot. These are conditions on the work, never
   properties of the worker. Nothing here touches the judgment. */
const AFFORDANCES=[
  {id:'tool',      label:'A pick that cuts what is actually here', apply:c=>({...c,tool:'steel'})},
  {id:'materials', label:'Stone delivered to the work site',       apply:c=>({...c,stocked:true})},
  {id:'light',     label:'Light to work by',                       apply:c=>({...c,light:1})},
];

/* ---------------------------------------------------------------------------
   Terrain
   Deterministic and condition-aware, so the tests reason about the same ground
   the player walks on.
--------------------------------------------------------------------------- */
function buildPlot(id,conditions){
  const plot=PLOTS.find(p=>p.id===id);
  if(!plot)throw new Error('unknown plot: '+id);
  const cond=conditions||plot.conditions;
  const b=new Uint8Array(W*H*D);
  const set=(x,y,z,v)=>{if(inside(x,y,z))b[idx(x,y,z)]=v;};

  for(let x=0;x<W;x++)for(let z=0;z<D;z++){
    for(let y=0;y<GROUND;y++)set(x,y,z,SOIL);
    set(x,GROUND,z,GRASS);
  }
  for(let x=BUILD_SITE.minX;x<=BUILD_SITE.maxX;x++)for(let z=BUILD_SITE.minZ;z<=BUILD_SITE.maxZ;z++)set(x,GROUND,z,SITE);
  /* What stands between this plot and the valley. Each plot's obstruction has a
     different shape, so the answer has to be worked out here rather than
     carried over from the last plot. */
  if(id==='near'){
    /* A row of trees. The canopy is what closes the line, so the trunks can
       stand apart and the row still reads as a treeline rather than a wall. */
    for(let z=0;z<D;z++){
      if(z%3===1)for(let y=GROUND+1;y<=GROUND+3;y++)set(3,y,z,TRUNK);
      for(let x=2;x<=4;x++)for(let y=GROUND+4;y<=GROUND+5;y++)set(x,y,z,LEAF);
    }
  } else if(id==='far'){
    for(let z=0;z<D;z++)for(let x=1;x<=4;x++){
      const top=GROUND+9-(x-1);
      for(let y=GROUND+1;y<=top;y++)set(x,y,z,ROCK);
    }
  } else {
    /* A rock wall with one notch in it. On this plot the answer is sideways
       rather than upward. */
    for(let z=0;z<D;z++){
      if(z>=9&&z<=11)continue;
      for(let x=2;x<=3;x++)for(let y=GROUND+1;y<=GROUND+7;y++)set(x,y,z,ROCK);
    }
  }
  /* The material, and whatever stands in front of it. */
  /* A mound rather than a low patch, so it reads as a landmark from the work
     site. Finding the stone should not be the puzzle; reaching it is the point. */
  const sx=Math.min(W-5,WORK_X+cond.stoneAt);
  for(let x=sx;x<Math.min(W,sx+3);x++)for(let z=8;z<12;z++){
    const top=GROUND+5-(Math.abs(z-9.5)>1?1:0);
    for(let y=GROUND+1;y<=top;y++)set(x,y,z,STONE);
  }
  if(cond.walled){
    /* A wall that encloses, founded below grade so the way in is not under it.
       Seven courses of hardpan: one step will not clear it and a worn pick will
       not cut it. The stone stays in plain sight the whole time. */
    for(let x=sx-2;x<=sx+4;x++)for(let z=6;z<=13;z++){
      if(x!==sx-2&&x!==sx+4&&z!==6&&z!==13)continue;
      for(let y=0;y<=GROUND+6;y++)set(x,y,z,HARDPAN);
    }
  }
  if(cond.stocked){
    /* Stone delivered to the work site. It moves neither the wall nor the
       outcrop; it puts material within reach of the job. */
    for(let x=WORK_X+2;x<WORK_X+5;x++)for(let z=9;z<12;z++)for(let y=GROUND+1;y<=GROUND+2;y++)set(x,y,z,STONE);
  }
  const isSolid=(x,y,z)=>{
    x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
    if(!inside(x,y,z))return y<=GROUND&&y>=0;
    return !!BLOCKS[b[idx(x,y,z)]].solid;
  };
  return {id,plot,conditions:cond,W,H,D,GROUND,blocks:b,isSolid,
    get:(x,y,z)=>inside(x,y,z)?b[idx(x,y,z)]:AIR,
    set:(x,y,z,v)=>set(x,y,z,v),
    /* A few paces back from the work site, so the lot can be read on arrival. */
    spawn:{x:WORK_X+3.5,y:GROUND+1,z:D/2+.5}};
}

/* ---------------------------------------------------------------------------
   Reachability
   Can the intended construction route be completed under these conditions?
   Feasibility does not establish that every access cost is productive.
--------------------------------------------------------------------------- */
function reachableMaterial(world,conditions){
  const {blocks}=world, tool=conditions.tool;
  const at=(x,y,z)=>inside(x,y,z)?blocks[idx(x,y,z)]:(y<=GROUND&&y>=0?SOIL:AIR);
  const solid=(x,y,z)=>!!BLOCKS[at(x,y,z)].solid;
  const passable=(x,y,z)=>{const v=at(x,y,z);return v===AIR||v===LANTERN||canBreak(tool,v);};
  /* Somewhere the builder can stand: body and head clear, something underfoot. */
  const standable=(x,y,z)=>inside(x,y,z)&&passable(x,y,z)&&passable(x,y+1,z)&&solid(x,y-1,z);
  /* The player controller and this route model both step up one block. */
  const climb=1;

  const seen=new Set(), key=(x,y,z)=>x+','+y+','+z;
  const start=[Math.floor(world.spawn.x),world.spawn.y,Math.floor(world.spawn.z)];
  const queue=[start]; seen.add(key(start[0],start[1],start[2]));
  const counted=new Set();
  while(queue.length){
    const [x,y,z]=queue.pop();
    /* Material is taken from where you stand, within arm's length. */
    for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
      const nx=x+dx,ny=y+dy,nz=z+dz;
      if(inside(nx,ny,nz)&&at(nx,ny,nz)===STONE&&canBreak(tool,STONE))counted.add(key(nx,ny,nz));
    }
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,nz=z+dz;
      /* Take the highest level that can be stepped or climbed up to, else fall
         to whatever is below. Conservative: it answers only whether a route
         exists, not whether the route is pleasant. */
      for(let ny=y+climb;ny>=0;ny--){
        if(!standable(nx,ny,nz))continue;
        let clear=true;
        for(let c=Math.min(y,ny);c<=Math.max(y,ny)+1&&clear;c++)if(!passable(nx,c,nz))clear=false;
        if(!clear)continue;
        const k=key(nx,ny,nz);
        if(!seen.has(k)){seen.add(k);queue.push([nx,ny,nz]);}
        break;
      }
    }
  }
  return counted.size;
}
function assessment(plotId,conditions){
  const c=conditions||PLOTS.find(p=>p.id===plotId).conditions;
  const world=buildPlot(plotId,c);
  const stone=reachableMaterial(world,c);
  const cuts=canBreak(c.tool,STONE);
  let plan=null;
  for(let z=BUILD_SITE.minZ;z<=BUILD_SITE.maxZ;z++){
    const candidate=solveByColumn(plotId,c,z);
    if(candidate.finished&&(!plan||candidate.stoneNeeded<plan.stoneNeeded))plan=candidate;
  }
  return {
    plot:plotId,
    stoneWithinReach:stone,
    toolCutsStone:cuts,
    secondsPerBlock:breakSeconds(c.tool,STONE),
    /* Workable means the job can be finished at all. It says nothing about cost. */
    workable:!!plan,
    /* Why not, when not. Always a condition, never a person. */
    barrier:!cuts?'this tool will not cut stone':stone===0?'the stone is in sight and there is no way through to it':!plan?'there is not enough reachable stone for a carrying tower':null,
  };
}

/* ---------------------------------------------------------------------------
   Placement rules
   Kept here rather than in the game loop so they can be reasoned about without
   a browser, and so the completability proof below uses the same rules the
   player does.
--------------------------------------------------------------------------- */
const BODY=1.8;
function canPlace(world,tx,ty,tz,player,holding,carried,lanternUp){
  if(!inside(tx,ty,tz))return {ok:false,reason:'outside the lot'};
  if(world.get(tx,ty,tz)!==AIR)return {ok:false,reason:'something is already there'};
  if(holding==='lantern'){
    if(lanternUp)return {ok:false,reason:'pick up the lantern before moving it'};
    if(!inBuildSite(tx,tz))return {ok:false,reason:'build the signal on the marked foundation'};
    if(ty<=GROUND+1)return {ok:false,reason:'the lantern needs a stone tower on the marked foundation'};
    for(let y=GROUND+1;y<ty;y++)if(world.get(tx,y,tz)!==PLACED)
      return {ok:false,reason:'the lantern needs an unbroken stone tower beneath it'};
  }
  else if(carried<=0)return {ok:false,reason:'no building stone in hand'};
  /* The guard exists so nobody seals themselves inside solid stone. The lantern
     is not solid: you climb the tower and set it down where you are standing. */
  if(player&&holding!=='lantern'){
    const px=Math.floor(player.x),pz=Math.floor(player.z);
    if(tx===px&&tz===pz&&ty>=Math.floor(player.y)&&ty<=Math.floor(player.y+BODY-.001))
      return {ok:false,reason:'you are standing there'};
  }
  return {ok:true,reason:null};
}

/* Build the plain column solution and report what it took. This is the same
   sequence a player performs: stack stone from the ground, put the lantern on
   top, and check the line. It exists so completability is a fact the tests can
   check rather than something only a person can find out. */
function solveByColumn(plotId,conditions,z){
  const c=conditions||PLOTS.find(p=>p.id===plotId).conditions;
  const world=buildPlot(plotId,c);
  const lane=(z===undefined)?Math.floor(D/2):z;
  let height=null;
  for(let y=0;y<H;y++)if(lanternCarries(world.isSolid,WORK_X,y,lane).carries){height=y;break;}
  if(height===null)return {finished:false,reason:'no carrying height in this lane'};
  const stoneNeeded=height-(GROUND+1);
  const available=reachableMaterial(world,c);
  if(!canBreak(c.tool,STONE))return {finished:false,reason:'the tool will not cut stone',stoneNeeded,available};
  if(available<stoneNeeded)return {finished:false,reason:'not enough stone within reach',stoneNeeded,available};
  /* Stack the column, obeying the same placement rules the player is held to. */
  /* The builder rises with the column, a course at a time, and ends standing on
     top of it. This is the sequence the Q action performs in the game. */
  const builder={x:WORK_X+.5,y:GROUND+1,z:lane+.5};
  let carried=stoneNeeded;
  for(let y=GROUND+1;y<height;y++){
    const check=canPlace(world,WORK_X,y,lane,{...builder,y:y+1},'stone',carried,false);
    if(!check.ok)return {finished:false,reason:'could not place at '+y+': '+check.reason,stoneNeeded,available};
    world.set(WORK_X,y,lane,PLACED);carried--;builder.y=y+1;
  }
  const lamp=canPlace(world,WORK_X,height,lane,builder,'lantern',0,false);
  if(!lamp.ok)return {finished:false,reason:'could not place the lantern: '+lamp.reason,stoneNeeded,available};
  world.set(WORK_X,height,lane,LANTERN);
  const verdict=lanternCarries(world.isSolid,WORK_X,height,lane);
  return {finished:verdict.carries,height,stoneNeeded,available,stoneLeft:carried,reason:verdict.reason};
}

const api={AIR,SOIL,GRASS,STONE,HARDPAN,TRUNK,LEAF,LANTERN,PLACED,ROCK,BLOCKS,TOOLS,
  SITE,BUILD_SITE,inBuildSite,W,H,D,GROUND,WORK_X,SIGNAL_MIN_Y,PLOTS,AFFORDANCES,
  idx,inside,canBreak,breakSeconds,lanternCarries,buildPlot,reachableMaterial,assessment,
  BODY,canPlace,solveByColumn};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Groundwork=api;
})(typeof window!=='undefined'?window:this);
