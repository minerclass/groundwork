const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('./plots.js');

const plotIds=G.PLOTS.map(p=>p.id);
const conditionsFor=id=>G.PLOTS.find(p=>p.id===id).conditions;
/* Every combination of the available interventions. */
function everyConditionSet(id){
  const base=conditionsFor(id), out=[base];
  for(let mask=1;mask<(1<<G.AFFORDANCES.length);mask++){
    let c=base;
    G.AFFORDANCES.forEach((a,i)=>{if(mask&(1<<i))c=a.apply(c);});
    out.push(c);
  }
  return out;
}
/* The lowest height at which a lantern in a given column carries to the valley. */
function lowestCarryingHeight(world,x,z){
  for(let y=0;y<G.H;y++)if(G.lanternCarries(world.isSolid,x,y,z).carries)return y;
  return null;
}

/* The central guarantee. Infrastructure decides whether the builder ever gets
   to the judgment. It must never decide how hard the judgment is. */
test('no change to the conditions makes the judgment easier',()=>{
  for(const id of plotIds){
    const baseline=G.buildPlot(id,conditionsFor(id));
    for(const z of [4,7,10,13,16]){
      const want=lowestCarryingHeight(baseline,G.WORK_X,z);
      for(const c of everyConditionSet(id)){
        const world=G.buildPlot(id,c);
        assert.equal(lowestCarryingHeight(world,G.WORK_X,z),want,
          `${id} at z=${z}: changing conditions moved the answer`);
      }
    }
  }
});

test('the judgment cannot see a tool, a light level, or a plot',()=>{
  /* Structural, not incidental: the function takes geometry and nothing else. */
  assert.equal(G.lanternCarries.length,4);
  const flat=()=>false;
  for(const tool of Object.keys(G.TOOLS)){
    assert.equal(G.lanternCarries(flat,10,G.SIGNAL_MIN_Y,5).carries,true,`tool ${tool} should be irrelevant`);
  }
});

test('each plot asks a different question of the builder',()=>{
  const answers=plotIds.map(id=>lowestCarryingHeight(G.buildPlot(id),G.WORK_X,G.D/2));
  assert.equal(new Set(answers).size,answers.length,
    'two plots share an answer, so the second one can be solved from memory');
  for(const a of answers)assert.ok(a!==null&&a>=G.SIGNAL_MIN_Y);
});

test('the signal always has to be built up to, never reached from the ground',()=>{
  for(const id of plotIds){
    const world=G.buildPlot(id);
    for(let z=0;z<G.D;z++){
      const y=lowestCarryingHeight(world,G.WORK_X,z);
      if(y===null)continue;
      assert.ok(y>G.GROUND+3,
        `${id} at z=${z}: the lantern carries from ${y}, close enough to standing height to skip building`);
    }
  }
});

/* Feasibility is not a claim that every access cost is productive. */
test('the near yard and the far field are both workable, at very different cost',()=>{
  const near=G.assessment('near'), far=G.assessment('far');
  assert.equal(near.workable,true);
  assert.equal(far.workable,true);
  assert.equal(near.barrier,null);
  assert.equal(far.barrier,null);
  assert.ok(far.secondsPerBlock>near.secondsPerBlock*2,
    'the far field should cost substantially more per block, or the plots make no point');
  assert.ok(conditionsFor('far').stoneAt>conditionsFor('near').stoneAt*2);
});

test('the walled lot cannot be finished as it stands',()=>{
  const a=G.assessment('walled');
  assert.equal(a.workable,false);
  assert.equal(a.stoneWithinReach,0);
  /* The tool cuts stone perfectly well. The barrier is the wall, not the pick,
     and not the builder. */
  assert.equal(a.toolCutsStone,true);
  assert.ok(/no way through/.test(a.barrier));
});

test('the walled lot opens to a change in conditions, and only the right ones',()=>{
  const base=conditionsFor('walled');
  const results={};
  for(const aff of G.AFFORDANCES)results[aff.id]=G.assessment('walled',aff.apply(base)).workable;
  const unlock=Object.keys(results).filter(k=>results[k]);
  assert.ok(unlock.length>0,'nothing unlocks it, so the plot is a dead end rather than a point');
  assert.ok(unlock.length<G.AFFORDANCES.length,
    'everything unlocks it, so matching the intervention to the barrier carries no weight');
  /* A pick that cuts the wall, or material that never needed to come through it. */
  assert.equal(results.tool,true);
  assert.equal(results.materials,true);
});

test('a barrier is reported exactly when the job cannot be finished',()=>{
  for(const id of plotIds)for(const c of everyConditionSet(id)){
    const a=G.assessment(id,c);
    assert.equal(a.barrier===null,a.workable,`${id}: barrier and workability disagree`);
  }
});

test('no plot is a dead end once its conditions are addressed',()=>{
  for(const id of plotIds){
    const any=everyConditionSet(id).some(c=>G.assessment(id,c).workable);
    assert.ok(any,`${id} cannot be finished under any conditions`);
  }
});

test('a tool cuts what its reach allows and nothing past it',()=>{
  assert.equal(G.canBreak('worn',G.STONE),true);
  assert.equal(G.canBreak('worn',G.HARDPAN),false);
  assert.equal(G.canBreak('steel',G.HARDPAN),true);
  assert.equal(G.canBreak('hands',G.STONE),false);
  assert.equal(G.breakSeconds('worn',G.HARDPAN),Infinity);
  assert.ok(G.breakSeconds('worn',G.STONE)>G.breakSeconds('good',G.STONE));
  /* Landscape is not supply: cutting an outcrop yields nothing to build with. */
  assert.equal(G.BLOCKS[G.ROCK].material,undefined);
  assert.equal(G.BLOCKS[G.STONE].material,true);
});

test('the builder starts outside the wall, on ground that holds',()=>{
  for(const id of plotIds){
    const w=G.buildPlot(id);
    const {x,y,z}=w.spawn;
    assert.equal(w.isSolid(x,y-1,z),true,`${id}: nothing underfoot at the spawn`);
    assert.equal(w.isSolid(x,y,z),false,`${id}: the spawn is inside a block`);
    assert.equal(w.isSolid(x,y+1,z),false,`${id}: no head room at the spawn`);
  }
});

/* The plain column solution: stack stone from the ground, put the lantern on
   top. Proving this completes means the job is finishable without a person
   having to discover it in a browser first. */
test('the near yard and the far field can both actually be finished',()=>{
  for(const id of ['near','far']){
    const r=G.solveByColumn(id);
    assert.equal(r.finished,true,`${id} could not be finished: ${r.reason}`);
    assert.ok(r.stoneNeeded>0,`${id} needs no building at all`);
    assert.ok(r.available>=r.stoneNeeded,
      `${id} needs ${r.stoneNeeded} stone and only ${r.available} can be reached`);
  }
  assert.ok(G.solveByColumn('far').stoneNeeded>G.solveByColumn('near').stoneNeeded,
    'the far field should demand more building, or its ridge makes no difference');
});

test('the walled lot cannot be finished until a condition changes',()=>{
  assert.equal(G.solveByColumn('walled').finished,false);
  const base=conditionsFor('walled');
  const after=Object.fromEntries(G.AFFORDANCES.map(a=>[a.id,G.solveByColumn('walled',a.apply(base),10).finished]));
  assert.equal(after.tool,true);
  assert.equal(after.materials,true);
  assert.equal(after.light,false,'light does not address a wall around the stone');
});

test('changing conditions never changes how high the lantern has to go',()=>{
  const base=conditionsFor('walled');
  const heights=G.AFFORDANCES.map(a=>G.solveByColumn('walled',a.apply(base),10))
    .filter(r=>r.height!==undefined&&r.height!==null).map(r=>r.height);
  assert.ok(heights.length>=2);
  assert.equal(new Set(heights).size,1,'a change to the conditions moved the answer');
});

test('a block cannot be placed into the builder, the ground, or outside the lot',()=>{
  const world=G.buildPlot('near');
  const at=G.WORK_X, lane=10;
  /* Standing one column over, which is where a builder stacking a tower stands. */
  const beside={x:G.WORK_X+1.5,y:G.GROUND+1,z:lane+.5};
  assert.equal(G.canPlace(world,at,G.GROUND+1,lane,beside,'stone',5,false).ok,true);
  assert.equal(G.canPlace(world,-1,6,lane,beside,'stone',5,false).reason,'outside the lot');
  assert.equal(G.canPlace(world,at,G.GROUND,lane,beside,'stone',5,false).reason,'something is already there');
  /* The cells the builder occupies are refused, so nobody seals themselves in. */
  const inTheWay={x:at+.5,y:G.GROUND+1,z:lane+.5};
  assert.equal(G.canPlace(world,at,G.GROUND+1,lane,inTheWay,'stone',5,false).reason,'you are standing there');
  assert.equal(G.canPlace(world,at,G.GROUND+2,lane,inTheWay,'stone',5,false).reason,'you are standing there');
  assert.equal(G.canPlace(world,at,G.GROUND+1,lane,inTheWay,'lantern',0,false).ok,false);
  /* Above the builder's head is fair game. */
  assert.equal(G.canPlace(world,at,G.GROUND+4,lane,inTheWay,'stone',5,false).ok,true);
  /* Material is required, and only one lantern exists. */
  assert.equal(G.canPlace(world,at,G.GROUND+1,lane,beside,'stone',0,false).reason,'no building stone in hand');
  assert.equal(G.canPlace(world,at,G.GROUND+1,lane,beside,'lantern',0,true).reason,'pick up the lantern before moving it');
  world.set(at,G.GROUND+1,lane,G.PLACED);
  const atop={x:at+.5,y:G.GROUND+2,z:lane+.5};
  assert.equal(G.canPlace(world,at,G.GROUND+2,lane,atop,'lantern',0,false).ok,true);
});

test('existing landscape never supplies a zero-material winning placement',()=>{
  for(const id of plotIds){
    const world=G.buildPlot(id);
    for(let x=0;x<G.W;x++)for(let y=G.SIGNAL_MIN_Y;y<G.H;y++)for(let z=0;z<G.D;z++){
      if(world.get(x,y,z)!==G.AIR)continue;
      assert.equal(G.canPlace(world,x,y,z,null,'lantern',0,false).ok,false,
        `${id}: landscape placement accepted at ${x},${y},${z}`);
    }
  }
});

test('the notch-side exploit is rejected without changing the geometry judgment',()=>{
  const world=G.buildPlot('walled');
  assert.equal(world.get(3,9,8),G.ROCK);
  assert.equal(G.lanternCarries(world.isSolid,3,9,9).carries,true);
  assert.equal(G.canPlace(world,3,9,9,{x:3.5,y:5,z:10.5},'lantern',0,false).ok,false);
  assert.equal(G.assessment('walled').workable,false);
});

test('a tower needs a continuous built support rooted in the marked foundation',()=>{
  const world=G.buildPlot('near');
  world.set(7,9,10,G.PLACED);
  assert.equal(G.canPlace(world,7,10,10,null,'lantern',0,false).ok,false);
  for(let y=G.GROUND+1;y<10;y++)world.set(7,y,10,G.PLACED);
  assert.equal(G.canPlace(world,7,10,10,null,'lantern',0,false).ok,true);
  world.set(7,7,10,G.AIR);
  assert.equal(G.canPlace(world,7,10,10,null,'lantern',0,false).ok,false);
});

test('the foundation is marked and cannot be accidentally removed',()=>{
  const world=G.buildPlot('near');
  for(let x=G.BUILD_SITE.minX;x<=G.BUILD_SITE.maxX;x++)for(let z=G.BUILD_SITE.minZ;z<=G.BUILD_SITE.maxZ;z++){
    assert.equal(world.get(x,G.GROUND,z),G.SITE);
    for(const tool of Object.keys(G.TOOLS))assert.equal(G.canBreak(tool,G.SITE),false);
  }
});
