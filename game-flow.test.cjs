const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const G=require('./plots.js');

/* Exercise the real controller and rule set with a small DOM/rendering adapter.
   Geometry/target fixtures arrange scenarios; they are not browser playthroughs. */
function session(){
  const elements=new Map(), events=new Map();
  let document, frame;
  const state={world:null,player:null,hit:null,picked:null,now:0};
  function element(id,tag='button',value=''){
    const listeners=new Map();
    return {id,tagName:tag.toUpperCase(),dataset:{},value,open:false,disabled:false,
      textContent:'',innerHTML:'',
      addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},
      emit(type,event={}){for(const fn of listeners.get(type)||[])fn(event);},
      focus(){document.activeElement=this;},
      showModal(){this.open=true;},
      close(){this.open=false;this.emit('close');},
      hasPointerCapture(){return false;},setPointerCapture(){},releasePointerCapture(){},
      querySelector(){return null;}
    };
  }
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  for(const match of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
    elements.set(match[3],element(match[3],match[1],match[2].match(/\bvalue="([^"]*)"/)?.[1]||''));
  }
  const held=[...html.matchAll(/<button\b[^>]*data-key="([^"]+)"[^>]*>/g)].map((m,i)=>{
    const el=element('held-'+i);el.dataset.key=m[1];return el;
  });
  const dialogs=[...elements.values()].filter(e=>e.tagName==='DIALOG');
  document={activeElement:null,hidden:false,pointerLockElement:null,
    getElementById:id=>elements.get(id),
    querySelectorAll:selector=>selector==='dialog'?dialogs:selector==='[data-key]'?held:[],
    querySelector:()=>state.picked?{value:state.picked}:null,
    addEventListener(){},exitPointerLock(){}
  };
  const view={load:w=>{state.world=w;},render:p=>{state.player=p;},
    raycast:()=>state.hit,rebuild(){},hideSight(){},showSight(){},setTarget(){}};
  const context={Groundwork:G,GroundworkStory:require('./story.js'),document,THREE:{},createVoxelView:()=>view,
    requestAnimationFrame:fn=>{frame=fn;},
    addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn);}
  };
  context.window=context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'game.js'),'utf8'),context,{filename:'game.js'});
  const api={state,document,e:id=>elements.get(id),
    click(id){const e=elements.get(id);e.focus();e.onclick();},
    explore(){this.click('chapter-explore');this.tick();},
    tick(ms=16){state.now+=ms;frame(state.now);},
    key(key,focused='world'){
      elements.get(focused).focus();let prevented=false;
      const event={key,repeat:false,preventDefault(){prevented=true;}};
      for(const fn of events.get('keydown')||[])fn(event);
      return prevented;
    },
    tower(height){
      for(let y=G.GROUND+1;y<height;y++)state.world.set(7,y,10,G.PLACED);
      Object.assign(state.player,{x:7.5,y:height,z:10.5,onGround:true,vy:0});
      state.hit={x:7,y:height-1,z:10,face:[0,1,0],block:G.PLACED};
    },
    finish(height){this.tower(height);if(elements.get('holding').textContent!=='signal lantern')this.click('btn-swap');this.click('btn-place');}
  };
  api.tick();api.click('begin');api.explore();
  return api;
}

test('a low lantern can be recovered and the same lot completed',()=>{
  const s=session();s.finish(6);
  assert.equal(s.e('plot-done').open,false);
  assert.equal(s.e('lantern-state').textContent,'up at 6');
  assert.equal(s.e('btn-pickup').disabled,false);
  s.click('btn-pickup');
  assert.equal(s.state.world.get(7,6,10),G.AIR);
  assert.equal(s.state.world.get(7,5,10),G.PLACED);
  assert.equal(s.e('lantern-state').textContent,'in your pack');
  s.finish(10);assert.equal(s.e('plot-done').open,true);
});

test('Tab remains native, shortcuts only act on the canvas, and T swaps',()=>{
  const s=session();
  assert.equal(s.key('Tab'),false);
  assert.equal(s.e('holding').textContent,'building stone');
  assert.equal(s.key('t','btn-impossible'),false);
  assert.equal(s.e('holding').textContent,'building stone');
  assert.equal(s.key('t'),true);
  assert.equal(s.e('holding').textContent,'signal lantern');
});

test('planning checks geometry without physical reach, material, or active time cost',()=>{
  const s=session();s.state.hit=null;
  s.click('btn-check');assert.equal(s.e('signal-plan').open,true);
  s.e('plan-lane').value='10';s.e('plan-height').value='9';s.click('preview-plan');
  assert.match(s.e('plan-result').textContent,/blocked/);
  s.e('plan-height').value='10';s.click('preview-plan');
  assert.match(s.e('plan-result').textContent,/would carry/);
  assert.equal(s.e('carried').textContent,'0');
  const elapsed=s.e('elapsed').textContent;s.tick(5000);
  assert.equal(s.e('elapsed').textContent,elapsed);
  s.e('plan-height').value='9.5';s.click('preview-plan');
  assert.match(s.e('plan-result').textContent,/whole-number/);
  s.click('close-plan');s.finish(10);
  assert.match(s.e('done-body').innerHTML,/Planning previews<\/dt><dd>2/);
});

test('failed intervention can be followed by a fresh successful intervention',()=>{
  const s=session();s.finish(10);s.click('next-plot');s.explore();
  s.finish(14);s.click('next-plot');s.explore();
  s.click('btn-impossible');assert.equal(s.e('plot-gaveup').open,true);
  s.click('next-plot-2');assert.equal(s.e('debrief').open,true);
  s.click('apply-change');assert.match(s.e('change-error').textContent,/Choose/);
  s.state.picked='light';s.click('apply-change');s.explore();s.click('btn-impossible');
  s.click('next-plot-2');assert.equal(s.e('ending').open,true);
  assert.match(s.e('end-title').innerHTML,/still there/);
  s.click('try-another');assert.equal(s.e('debrief').open,true);
  s.state.picked='materials';s.click('apply-change');s.explore();
  assert.equal(s.state.world.conditions.light,G.PLOTS.find(p=>p.id==='walled').conditions.light);
  assert.equal(s.state.world.conditions.stocked,true);
  s.finish(9);s.click('next-plot');
  assert.equal(s.e('ending').open,true);
  assert.match(s.e('end-title').innerHTML,/Access changed/);
});

test('active time does not use the capped physics delta',()=>{
  const s=session();s.tick(2000);s.click('btn-swap');
  assert.equal(s.e('elapsed').textContent,'0:02');
});

test('chapter briefings follow the story and field notes pause the clock',()=>{
  const s=session();s.click('btn-notebook');
  assert.equal(s.e('chapter').open,true);
  assert.match(s.e('chapter-title').textContent,/read the land/);
  const elapsed=s.e('elapsed').textContent;s.tick(10000);
  assert.equal(s.e('elapsed').textContent,elapsed);
  s.click('chapter-plan');
  assert.equal(s.e('chapter').open,false);
  assert.equal(s.e('signal-plan').open,true);
  s.click('close-plan');s.finish(10);s.click('next-plot');
  assert.equal(s.e('chapter').open,true);
  assert.match(s.e('chapter-title').textContent,/effort/);
  s.explore();s.finish(14);s.click('next-plot');
  assert.match(s.e('chapter-title').textContent,/gate/);
  s.explore();s.click('btn-impossible');s.click('next-plot-2');
  s.state.picked='materials';s.click('apply-change');
  assert.match(s.e('chapter-title').textContent,/Help without taking over/);
  assert.match(s.e('chapter-mission').textContent,/Your change:/);
});

test('predictions receive explanatory feedback without changing geometry or materials',()=>{
  const s=session();s.click('btn-check');
  s.e('plan-lane').value='10';s.e('plan-height').value='9';s.e('plan-prediction').value='clear';
  s.click('preview-plan');assert.match(s.e('prediction-feedback').textContent,/differs/);
  assert.match(s.e('plan-result').textContent,/blocked/);
  s.e('plan-prediction').value='blocked';s.click('preview-plan');
  assert.match(s.e('prediction-feedback').textContent,/matches/);
  s.e('plan-prediction').value='unsure';s.click('preview-plan');
  assert.match(s.e('prediction-feedback').textContent,/example to reason/);
  assert.equal(s.e('carried').textContent,'0');
});

test('reflection is optional, contextual, unscored, and clears between chapters',()=>{
  const s=session();s.finish(10);s.click('done-discuss');
  assert.match(s.e('done-feedback').textContent,/continue without answering/);
  s.e('done-choice').value='recipe';s.click('done-discuss');
  assert.match(s.e('done-feedback').textContent,/next obstruction/);
  s.click('next-plot');s.explore();s.finish(14);
  assert.equal(s.e('done-choice').value,'');assert.equal(s.e('done-feedback').textContent,'');
  s.e('done-choice').value='answer';s.click('done-discuss');
  assert.match(s.e('done-feedback').textContent,/worked example can support learning/);
  s.click('next-plot');s.explore();s.click('btn-impossible');
  s.e('gaveup-choice').value='grit';s.click('gaveup-discuss');
  assert.match(s.e('gaveup-feedback').textContent,/cannot open this wall/);
  s.click('next-plot-2');s.state.picked='light';s.click('apply-change');s.explore();
  s.click('btn-impossible');s.e('gaveup-choice').value='barrier';s.click('gaveup-discuss');
  assert.match(s.e('gaveup-feedback').textContent,/Brighter light/);
  s.click('next-plot-2');s.e('transfer-choice').value='answer';s.click('transfer-discuss');
  assert.match(s.e('transfer-feedback').textContent,/example to critique/);
});
