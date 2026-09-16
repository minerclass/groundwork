/* Voxel rendering, ray targeting, and the body that walks around in it.
   One mesh, rebuilt when a block changes. The world is small enough that this
   costs less than maintaining chunks would. */
window.createVoxelView = function(canvas){
  'use strict';
  const T=THREE, G=Groundwork;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(72,1,.08,260);camera.rotation.order='YXZ';scene.add(camera);
  const sky=new T.Color(), fog=new T.Fog(0x000000,18,90); scene.fog=fog;
  const hemi=new T.HemisphereLight(0xdfeaf4,0x8a8d86,1.6);scene.add(hemi);
  const sun=new T.DirectionalLight(0xfff0d4,1.5);sun.position.set(-30,50,20);scene.add(sun);

  const COLOR={
    [G.SOIL]   :0x6b563d, [G.GRASS]:0x6f9a4e, [G.STONE]:0xbcae8d,
    [G.HARDPAN]:0x4d483f, [G.TRUNK]:0x6d5638, [G.LEAF] :0x5d8f4e,
    [G.LANTERN]:0xffd27a, [G.PLACED]:0xd6c9a6, [G.ROCK] :0x7b7b83,
  };
  /* Faces are shaded by which way they point, so form reads without needing a
     light that moves. */
  const FACES=[
    {n:[ 1,0,0],s:.76,v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]},
    {n:[-1,0,0],s:.70,v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]},
    {n:[0, 1,0],s:1.0,v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]},
    {n:[0,-1,0],s:.64,v:[[0,0,1],[0,0,0],[1,0,0],[1,0,1]]},
    {n:[0,0, 1],s:.86,v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]},
    {n:[0,0,-1],s:.70,v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]},
  ];

  let world=null;
  const geo=new T.BufferGeometry();
  const mesh=new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true,flatShading:true}));
  scene.add(mesh);

  /* The block being worked on, and the face the crosshair is resting on. */
  const highlight=new T.Mesh(new T.BoxGeometry(1.008,1.008,1.008),
    new T.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.55}));
  highlight.visible=false;scene.add(highlight);
  /* Progress on the current cut, shown on the block itself. */
  const chip=new T.Mesh(new T.BoxGeometry(1,1,1),
    new T.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.35,depthWrite:false}));
  chip.visible=false;scene.add(chip);
  /* The sight line, drawn only while it is being checked. */
  const sightGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]);
  const sight=new T.Line(sightGeo,new T.LineBasicMaterial({color:0xffe9a8,transparent:true,opacity:.9}));
  sight.visible=false;scene.add(sight);

  function rebuild(){
    if(!world)return;
    const pos=[],col=[],idxs=[];const c=new T.Color();let n=0;
    for(let x=0;x<world.W;x++)for(let y=0;y<world.H;y++)for(let z=0;z<world.D;z++){
      const v=world.get(x,y,z);
      if(v===G.AIR)continue;
      const base=COLOR[v];if(base===undefined)continue;
      for(const f of FACES){
        const nx=x+f.n[0],ny=y+f.n[1],nz=z+f.n[2];
        const nb=G.inside(nx,ny,nz)?world.get(nx,ny,nz):G.AIR;
        /* A face is drawn only where it meets something you can see through. */
        if(nb!==G.AIR&&nb!==G.LANTERN&&G.BLOCKS[nb].solid)continue;
        c.setHex(base).multiplyScalar(f.s);
        for(const p of f.v){pos.push(x+p[0],y+p[1],z+p[2]);col.push(c.r,c.g,c.b);}
        idxs.push(n,n+1,n+2,n,n+2,n+3);n+=4;
      }
    }
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new T.Float32BufferAttribute(col,3));
    geo.setIndex(idxs);geo.computeVertexNormals();geo.computeBoundingSphere();
  }
  function load(w,light){
    world=w;rebuild();
    const dusk=new T.Color(0x22304a),day=new T.Color(0x9fc4dd);
    sky.copy(dusk).lerp(day,light);
    scene.background=sky.clone();fog.color.copy(sky);
    fog.near=10+light*16;fog.far=34+light*70;
    hemi.intensity=.45+light*1.3;sun.intensity=.25+light*1.5;
  }

  /* --- ray targeting -----------------------------------------------------
     Amanatides and Woo grid traversal. Returns the first solid cell the
     crosshair meets and the face it arrived through. */
  function raycast(ox,oy,oz,dx,dy,dz,max){
    let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);
    const step=[Math.sign(dx),Math.sign(dy),Math.sign(dz)];
    const inv=[Math.abs(1/dx),Math.abs(1/dy),Math.abs(1/dz)];
    const dist=[
      step[0]>0?(x+1-ox):(ox-x), step[1]>0?(y+1-oy):(oy-y), step[2]>0?(z+1-oz):(oz-z)];
    let t=[dist[0]*inv[0],dist[1]*inv[1],dist[2]*inv[2]];
    let face=[0,0,0],travelled=0;
    for(let i=0;i<160&&travelled<=max;i++){
      if(G.inside(x,y,z)){
        const v=world.get(x,y,z);
        if(v!==G.AIR&&G.BLOCKS[v].solid)return {x,y,z,block:v,face};
      }
      if(t[0]<t[1]&&t[0]<t[2]){x+=step[0];travelled=t[0];t[0]+=inv[0];face=[-step[0],0,0];}
      else if(t[1]<t[2]){y+=step[1];travelled=t[1];t[1]+=inv[1];face=[0,-step[1],0];}
      else {z+=step[2];travelled=t[2];t[2]+=inv[2];face=[0,0,-step[2]];}
      if(y<-2||y>world.H+2)break;
    }
    return null;
  }

  function setTarget(hit,progress){
    highlight.visible=!!hit;
    if(hit){
      highlight.position.set(hit.x+.5,hit.y+.5,hit.z+.5);
      chip.visible=progress>0;
      if(progress>0){chip.position.copy(highlight.position);chip.scale.setScalar(.2+progress*.85);
        chip.material.opacity=.15+progress*.45;}
    } else chip.visible=false;
  }
  function showSight(x,y,z,clearTo){
    sight.visible=true;
    const p=sightGeo.attributes.position;
    p.setXYZ(0,x+.5,y+.5,z+.5);p.setXYZ(1,clearTo,y+.5,z+.5);p.needsUpdate=true;
    sightGeo.computeBoundingSphere();
  }
  function hideSight(){sight.visible=false;}

  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize);

  function render(player){
    camera.position.set(player.x,player.y+1.62,player.z);
    camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
    renderer.render(scene,camera);
  }
  return {renderer,scene,camera,load,rebuild,raycast,setTarget,showSight,hideSight,render,resize};
};
