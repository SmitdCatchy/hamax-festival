"use strict";(self.webpackChunksmitd_game_poc=self.webpackChunksmitd_game_poc||[]).push([[913],{5913:(J,C,p)=>{p.r(C),p.d(C,{GameModule:()=>Q});var D=p(9808),V=p(1589),B=p(5861),O=p(7013),o=p(6682),R=p(4237),P=p.n(R),G=p(1509),I=p(5096),T=p(9018),L=p(321),j=p(9263),H=p(3386),F=p(4938),r=p(5e3),k=p(967),W=p(4214),E=p(9601);const z=["*","*"];let N=(()=>{class c{constructor(){}ngOnInit(){}onClick(t){t.stopPropagation()}onClickEnd(t){t.stopPropagation()}onMouseMove(t){t.stopPropagation()}onWheel(t){t.stopPropagation()}}return c.\u0275fac=function(t){return new(t||c)},c.\u0275cmp=r.Xpm({type:c,selectors:[["smitd-game-hud"]],hostBindings:function(t,e){1&t&&r.NdJ("mousedown",function(n){return e.onClick(n)})("mouseup",function(n){return e.onClickEnd(n)})("mousemove",function(n){return e.onMouseMove(n)})("wheel",function(n){return e.onWheel(n)})},ngContentSelectors:z,decls:4,vars:0,consts:[[1,"top"],[1,"bottom"]],template:function(t,e){1&t&&(r.F$t(z),r.TgZ(0,"div",0),r.Hsn(1,0,["#top",""]),r.qZA(),r.TgZ(2,"div",1),r.Hsn(3,1,["#bottom",""]),r.qZA())},styles:["[_nghost-%COMP%]{display:contents}.top[_ngcontent-%COMP%]{position:fixed;z-index:10;top:0;left:0;right:0;height:40px;background-color:#6b604c;display:flex;justify-content:space-between;align-items:center}.bottom[_ngcontent-%COMP%]{position:fixed;z-index:10;bottom:0;left:0;right:0;height:80px;background-color:#6b604c;display:flex;justify-content:space-between;align-items:flex-end}"]}),c})();var Z=p(7423),X=p(678),A=(()=>{return(c=A||(A={}))[c.ACTIVE=1]="ACTIVE",c[c.ISLAND_SLEEPING=2]="ISLAND_SLEEPING",c[c.WANTS_DEACTIVATION=3]="WANTS_DEACTIVATION",c[c.DISABLE_DEACTIVATION=4]="DISABLE_DEACTIVATION",c[c.DISABLE_SIMULATION=5]="DISABLE_SIMULATION",A;var c})();const Y=[{path:"",component:(()=>{class c{constructor(t,e,s,n){this.soundService=t,this.coreService=e,this.ammoService=s,this.element=n,this.rigidBodies=[],this.cameraMovement={distance:80,distanceChange:0,up:0,down:0,left:0,right:0,shift:1,xBoundary:0,zBoundary:0,dragOrigin:null,dragOriginCameraPositon:new o.Pa4,dragX:0,dragZ:0},this.mapSize={width:2e3,height:2e3},this.friction=10,this.rollingFriction=10,this.gravity=-490,this.colGroupPlayer=1,this.colGroupPlane=2,this.colGroupBall=4,this.showInteractables=!1,this.pixelate=!1,this.characters=[]}ngAfterViewInit(){this.ammoService.Ammo.subscribe(t=>{this.Ammo=t,this.tmpVec=new this.Ammo.btVector3(0,0,0),this.tmpTrans=new this.Ammo.btTransform,this.init(),this.update()})}init(){this.setupPhysicsWorld(),this.setupGraphics(),this.setupWorld(),this.setupControls()}setupPhysicsWorld(){const t=new this.Ammo.btDefaultCollisionConfiguration,e=new this.Ammo.btCollisionDispatcher(t),s=new this.Ammo.btDbvtBroadphase,n=new this.Ammo.btSequentialImpulseConstraintSolver;this.physicsWorld=new this.Ammo.btDiscreteDynamicsWorld(e,s,n,t),this.tmpVec.setValue(0,this.gravity,0),this.physicsWorld.setGravity(this.tmpVec)}setupGraphics(){this.clock=new o.SUY,this.scene=new o.xsS,this.scene.background=new o.Ilk("#DFE9F3"),this.setupCamera(),this.setupLights(),this.setupFog(),this.setupRenderer(),this.setupAnimationMixer(),this.setupComposer()}setupCamera(){this.camera=new o.cPb(70,window.innerWidth/window.innerHeight,1,2e3),this.camera.position.set(0,1.6*this.cameraMovement.distance,this.cameraMovement.distance),this.camera.lookAt(0,0,0),this.cameraMovement.xBoundary=this.mapSize.width/2,this.cameraMovement.zBoundary=this.mapSize.height/2}setupLights(){this.visionLight=new o.Ox3(16777215,.8),this.visionLight.position.set(100,400,200),this.visionLight.target.position.set(0,0,0),this.visionLight.castShadow=!0,this.visionLight.shadow.bias=-.001,this.visionLight.shadow.mapSize.width=4096,this.visionLight.shadow.mapSize.height=4096,this.visionLight.shadow.camera.near=1,this.visionLight.shadow.camera.far=1e3,this.visionLight.shadow.camera.fov=70,this.visionLight.shadow.camera.left=1e3,this.visionLight.shadow.camera.right=-1e3,this.visionLight.shadow.camera.top=1e3,this.visionLight.shadow.camera.bottom=-1e3,this.scene.add(this.visionLight);const t=new o.Mig(16777215,.5);this.scene.add(t)}setupFog(){this.scene.fog=new o.ybr(14674419,400,550)}setupRenderer(){this.renderer=new o.CP7({antialias:!1}),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=o._iA,this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setClearColor("#000"),this.renderer.shadowMap.enabled=!0,this.renderer.domElement.id="game-canvas",this.element.nativeElement.appendChild(this.renderer.domElement)}setupAnimationMixer(){}setupComposer(){this.composer=new T.xC(this.renderer),this.composer.addPass(new L.C(this.scene,this.camera)),this.outlinePass=new H.f(new o.FM8(window.innerWidth,window.innerHeight),this.scene,this.camera),this.composer.addPass(this.outlinePass),this.pixelPass=new j.T(F.g),this.pixelPass.uniforms.resolution.value=new o.FM8(window.innerWidth,window.innerHeight),this.pixelPass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio),this.pixelPass.uniforms.pixelSize.value=2,this.composer.addPass(this.pixelPass)}setupControls(){this.raycaster=new o.iMs,this.clickMouse=new o.FM8,this.moveMouse=new o.FM8}setupWorld(){this.createPlane(new o.Pa4(this.mapSize.width+1400,2,this.mapSize.height+1e3),new o.Pa4(0,-2,0),4473924),this.createPlane(new o.Pa4(this.mapSize.width,2,this.mapSize.height),new o.Pa4(0,-1,0),6728294),this.createCharacter(4,10,new o.Pa4(-10,40,0),3355443,3),this.createBungalo(),this.createSign(),this.createUnitCube(new o.Pa4(10,0,0)),this.createUnitCube(new o.Pa4(10,0,-10)),this.createUnitCube(new o.Pa4(0,0,-10)),this.createNord(4,10,new o.Pa4(-10,0,0))}createUnitCube(t=new o.Pa4(0,0,0),e=new o.Pa4(5,5,5),s=0){var n=this;return(0,B.Z)(function*(){const a=yield(new I.L).loadAsync("assets/models/unit.obj"),d=(new o.dpR).load("assets/textures/placeholder_64.png");a.position.set(t.x,t.y,t.z),a.rotation.set(0,0,0),a.scale.set(e.x,e.y,e.z);const m=new n.Ammo.btTransform;m.setIdentity(),n.tmpVec.setValue(t.x,t.y+e.y,t.z),m.setOrigin(n.tmpVec),m.setRotation(new n.Ammo.btQuaternion(0,0,0,1));const l=new n.Ammo.btDefaultMotionState(m);n.tmpVec.setValue(e.x,e.y,e.z);const g=new n.Ammo.btBoxShape(n.tmpVec);g.setMargin(.05),n.tmpVec.setValue(0,0,0);const w=n.tmpVec;g.calculateLocalInertia(s,w);const y=new n.Ammo.btRigidBodyConstructionInfo(s,l,g,w),u=new n.Ammo.btRigidBody(y);u.setFriction(n.friction),u.setRollingFriction(n.rollingFriction),u.setActivationState(A.DISABLE_DEACTIVATION),n.tmpVec.setValue(0,1,0),u.setAngularFactor(n.tmpVec),n.physicsWorld.addRigidBody(u,n.colGroupBall,n.colGroupBall|n.colGroupPlane),a.traverse(f=>{f instanceof o.Kj0&&(f.userData.physicsBody=u,f.userData.type="unit",f.castShadow=!0,f.receiveShadow=!0,f.material.map=d)}),n.scene.add(a)})()}createSign(t=4,e=10,s=new o.Pa4(0,0,0),n=8026746,h=0){var i=this;return(0,B.Z)(function*(){const m=yield(new I.L).loadAsync("assets/models/sign.obj"),l=(new o.dpR).load("assets/textures/sign.png");m.position.set(s.x,s.y,s.z),m.rotation.set(0,Math.PI/180*0,0),m.scale.set(5,5,5);const g=new i.Ammo.btTransform;g.setIdentity(),i.tmpVec.setValue(s.x,s.y,s.z),g.setOrigin(i.tmpVec),g.setRotation(new i.Ammo.btQuaternion(0,0,0,1));const w=new i.Ammo.btDefaultMotionState(g);i.tmpVec.setValue(t,e,t);const y=new i.Ammo.btCylinderShape(i.tmpVec);y.setMargin(.05),i.tmpVec.setValue(0,0,0);const u=i.tmpVec;y.calculateLocalInertia(h,u);const f=new i.Ammo.btRigidBodyConstructionInfo(h,w,y,u),v=new i.Ammo.btRigidBody(f);v.setFriction(i.friction),v.setRollingFriction(i.rollingFriction),v.setActivationState(A.DISABLE_DEACTIVATION),i.tmpVec.setValue(0,1,0),v.setAngularFactor(i.tmpVec),i.physicsWorld.addRigidBody(v,i.colGroupBall,i.colGroupBall|i.colGroupPlane),m.traverse(b=>{b instanceof o.Kj0&&(b.userData.physicsBody=v,b.userData.type="sign",b.userData.interactable=!0,b.castShadow=!0,b.receiveShadow=!0,b.material.map=l)}),i.scene.add(m)})()}createNord(t=4,e=10,s=new o.Pa4(0,0,0),n=8026746,h=0){var i=this;return(0,B.Z)(function*(){const m=yield(new G.E).loadAsync("assets/models/nord_animated.glb"),l=m.scene;l.scale.set(5,5,5);const g=(new o.dpR).load("assets/textures/nord.png");l.position.set(s.x,s.y,s.z),l.rotation.set(0,0,0);const w=new i.Ammo.btTransform;w.setIdentity(),i.tmpVec.setValue(s.x,s.y,s.z),w.setOrigin(i.tmpVec),w.setRotation(new i.Ammo.btQuaternion(0,0,0,1));const y=new i.Ammo.btDefaultMotionState(w);i.tmpVec.setValue(t,2*e,t);const u=new i.Ammo.btCylinderShape(i.tmpVec);u.setMargin(.05),i.tmpVec.setValue(0,0,0);const f=i.tmpVec;u.calculateLocalInertia(h,f);const v=new i.Ammo.btRigidBodyConstructionInfo(h,y,u,f),b=new i.Ammo.btRigidBody(v);b.setFriction(i.friction),b.setRollingFriction(i.rollingFriction),b.setActivationState(A.DISABLE_DEACTIVATION),i.tmpVec.setValue(0,1,0),b.setAngularFactor(i.tmpVec),i.physicsWorld.addRigidBody(b,i.colGroupBall,i.colGroupBall|i.colGroupPlane);const M=new o.Xcj(l);l.traverse(x=>{x instanceof o.Kj0&&(x.userData.physicsBody=b,x.userData.type="sign",x.userData.interactable=!0,x.castShadow=!0,x.receiveShadow=!0,x.material.map=g)}),l.userData.mixer=M,l.userData.mixer=M,m.animations.forEach(x=>{M.clipAction(x).play()}),i.scene.add(l)})()}createCharacter(t=4,e=10,s=new o.Pa4(100,5,0),n=8026746,h=1){const a=new o.Kj0(new o.fHI(t,t,e,20,20),new o.xoR({color:n}));a.position.set(s.x,s.y,s.z),a.castShadow=!0,a.receiveShadow=!0;const d=new this.Ammo.btTransform;d.setIdentity(),this.tmpVec.setValue(s.x,s.y,s.z),d.setOrigin(this.tmpVec),d.setRotation(new this.Ammo.btQuaternion(0,0,0,1));const m=new this.Ammo.btDefaultMotionState(d);this.tmpVec.setValue(t,e/2,t);const l=new this.Ammo.btCylinderShape(this.tmpVec);l.setMargin(.05),this.tmpVec.setValue(0,0,0);const g=this.tmpVec;l.calculateLocalInertia(h,g);const w=new this.Ammo.btRigidBodyConstructionInfo(h,m,l,g),y=new this.Ammo.btRigidBody(w);y.setFriction(this.friction),y.setRollingFriction(this.rollingFriction),y.setActivationState(A.DISABLE_DEACTIVATION),this.tmpVec.setValue(0,1,0),y.setAngularFactor(this.tmpVec),this.physicsWorld.addRigidBody(y,this.colGroupBall,this.colGroupBall|this.colGroupPlane);const u=new O.z(a,y,{animationState:"idle",info:{}},"Character");this.scene.add(u.model),this.characters.push(u),this.character=u}createPlane(t=new o.Pa4(400,2,400),e=new o.Pa4(0,-1,0),s=8026746){const i=new o.Kj0(new o.nvb(1,1,1),new o.xoR({color:s}));i.position.set(e.x,e.y,e.z),i.scale.set(t.x,t.y,t.z),i.castShadow=!0,i.receiveShadow=!0,this.scene.add(i);const a=new this.Ammo.btTransform;a.setIdentity(),this.tmpVec.setValue(e.x,e.y,e.z),a.setOrigin(this.tmpVec),a.setRotation(new this.Ammo.btQuaternion(0,0,0,1));const d=new this.Ammo.btDefaultMotionState(a);this.tmpVec.setValue(.5*t.x,.5*t.y,.5*t.z);const m=new this.Ammo.btBoxShape(this.tmpVec);m.setMargin(.05),this.tmpVec.setValue(0,0,0);const l=this.tmpVec;m.calculateLocalInertia(0,l);const g=new this.Ammo.btRigidBodyConstructionInfo(0,d,m,l),w=new this.Ammo.btRigidBody(g);w.setFriction(this.friction),w.setRollingFriction(this.rollingFriction),w.setActivationState(A.DISABLE_DEACTIVATION),this.physicsWorld.addRigidBody(w,this.colGroupPlane,this.colGroupBall|this.colGroupPlayer),i.userData.physicsBody=w,i.userData.type="plane",w.threeObject=i,this.rigidBodies.push(i)}createBungalo(t=new o.Pa4(0,10,-100),e=65280){const n=new o.Wid({metalness:.1,roughness:1,color:13421772}),h=new o.YBo({color:e,emissive:e}),i=new o.Tme,a=new o.Kj0(new o.fHI(20,20,20,20,20),n);a.castShadow=!0,a.receiveShadow=!0,i.add(a);const d=new o.Kj0(new o.fHI(20,20,4,20,20),h);d.position.set(0,12,0),d.castShadow=!0,d.receiveShadow=!0,i.add(d);const m=new o.Kj0(new o.fHI(0,22,10,8,8),n);m.position.set(0,19,0),m.castShadow=!0,m.receiveShadow=!0,i.add(m),i.position.set(t.x,t.y,t.z),i.position.set(t.x,t.y,t.z),i.castShadow=!0,i.receiveShadow=!0,this.scene.add(i);const g=new this.Ammo.btTransform;g.setIdentity(),this.tmpVec.setValue(t.x,t.y,t.z),g.setOrigin(this.tmpVec),g.setRotation(new this.Ammo.btQuaternion(0,0,0,1));const w=new this.Ammo.btDefaultMotionState(g);this.tmpVec.setValue(20,17,20);const y=new this.Ammo.btCylinderShape(this.tmpVec);y.setMargin(.05),this.tmpVec.setValue(0,0,0);const u=this.tmpVec;y.calculateLocalInertia(0,u);const f=new this.Ammo.btRigidBodyConstructionInfo(0,w,y,u),v=new this.Ammo.btRigidBody(f);v.setFriction(this.friction),v.setRollingFriction(this.rollingFriction),v.setActivationState(A.DISABLE_DEACTIVATION),this.physicsWorld.addRigidBody(v,this.colGroupBall,this.colGroupBall|this.colGroupPlane),i.userData.physicsBody=v,i.userData.type="bungalo",a.userData=i.userData,d.userData=i.userData,m.userData=i.userData,v.threeObject=i,this.rigidBodies.push(i)}update(){const t=this.clock.getDelta();if(this.moveCharacter(this.character),this.updatePhysics(t),this.updateCamera(),this.scene.traverse(e=>{e.userData.mixer&&e.userData.mixer.update(t)}),this.showInteractables){this.outlinePass.selectedObjects=[];for(let e of this.scene.children)this.getDistance(e.position,this.character.model.position)>400||e instanceof o.ZAu&&e.children[0]&&("Armature"===e.children[0].name?e.children[0].children.forEach(s=>{s.userData.interactable&&this.outlinePass.selectedObjects.push(e)}):e.children[0].userData.interactable&&this.outlinePass.selectedObjects.push(e))}this.render(),requestAnimationFrame(()=>this.update())}updateCamera(){this.camera.position.setX(this.character.model.position.x),this.camera.position.setZ(this.character.model.position.z+.8*this.cameraMovement.distance),this.camera.position.setY(this.cameraMovement.distance<80?this.cameraMovement.distance:this.cameraMovement.distance<100?1.2*this.cameraMovement.distance:this.cameraMovement.distance<120?1.4*this.cameraMovement.distance:1.6*this.cameraMovement.distance),this.pixelPass.uniforms.pixelSize.value=4,this.camera.lookAt(this.character.model.position.x,.8*-this.cameraMovement.distance,this.character.model.position.z-this.cameraMovement.distance),this.cameraMovement.distanceChange=0}updatePhysics(t){this.physicsWorld.stepSimulation(t,10);for(let e=0;e<this.rigidBodies.length;e++){const s=this.rigidBodies[e],h=s.userData.physicsBody.getMotionState();if(h){h.getWorldTransform(this.tmpTrans);const i=this.tmpTrans.getOrigin(),a=this.tmpTrans.getRotation();s.position.set(i.x(),i.y(),i.z()),s.quaternion.set(a.x(),a.y(),a.z(),a.w())}s.position.x<-1*this.cameraMovement.xBoundary&&setTimeout(()=>{this.rigidBodies.splice(e,1),this.scene.remove(s)},1e3),s.position.x>this.cameraMovement.xBoundary&&setTimeout(()=>{this.rigidBodies.splice(e,1),this.scene.remove(s)},1e3),s.position.z<-1*this.cameraMovement.zBoundary&&setTimeout(()=>{this.rigidBodies.splice(e,1),this.scene.remove(s)},1e3),s.position.z>this.cameraMovement.zBoundary&&setTimeout(()=>{this.rigidBodies.splice(e,1),this.scene.remove(s)},1e3)}for(let e=0;e<this.characters.length;e++){const s=this.characters[e],n=s.model,i=s.physicsBody.getMotionState();if(i){i.getWorldTransform(this.tmpTrans);const a=this.tmpTrans.getOrigin(),d=this.tmpTrans.getRotation();n.position.set(a.x(),a.y(),a.z()),n.quaternion.set(d.x(),d.y(),d.z(),d.w())}}this.detectCollision()}detectCollision(){const t=this.physicsWorld.getDispatcher(),e=t.getNumManifolds();for(let s=0;s<e;s++){const n=t.getManifoldByIndexInternal(s),h=this.Ammo.castObject(n.getBody0(),P().btRigidBody),i=this.Ammo.castObject(n.getBody1(),P().btRigidBody),a=h.threeObject,d=i.threeObject;if(!a&&!d)continue;const m=a?a.userData:null,l=d?d.userData:null,g=m?m.type:"none",w=l?l.type:"none";if("plane"==g||"plane"==w)continue;console.log("COLLISION",g,w);const y=n.getNumContacts();for(let u=0;u<y;u++){const f=n.getContactPoint(u),v=f.getDistance();v>.01||v<-.01||(h.getLinearVelocity(),i.getLinearVelocity(),f.get_m_positionWorldOnA(),f.get_m_positionWorldOnB(),f.get_m_localPointA(),f.get_m_localPointB())}}}render(){this.pixelate||(this.pixelPass.uniforms.pixelSize.value=1),this.composer.render()}getCursorPosition(t){const e=new o.Pa4,s=new o.Pa4;e.set(t.clientX/window.innerWidth*2-1,-t.clientY/window.innerHeight*2+1,.5),e.unproject(this.camera),e.sub(this.camera.position).normalize();const n=-this.camera.position.y/e.y;return s.copy(this.camera.position).add(e.multiplyScalar(n)),s}onResize(){this.renderer.setSize(window.innerWidth,window.innerHeight),this.pixelPass.uniforms.resolution.value.set(window.innerWidth,window.innerHeight).multiplyScalar(window.devicePixelRatio),this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix()}relocate(t,e={x:0,y:0,z:0},s={x:0,y:0,z:0}){this.physicsWorld.removeRigidBody(t),this.tmpVec.setValue(0,0,0),t.setLinearVelocity(this.tmpVec),t.setAngularVelocity(this.tmpVec);const n=t.getWorldTransform();this.tmpVec.setValue(e.x,e.y,e.z);const h=new this.Ammo.btQuaternion(s.x,s.y,s.z,1);n.setOrigin(this.tmpVec),n.setRotation(h),t.setWorldTransform(n),this.physicsWorld.addRigidBody(t)}moveThere(t,e={x:0,y:0,z:0},s=2){t.animation="move",t.info=t.info||{},t.info.move=!0,t.info.targetPosition={x:e.x,z:e.z},t.info.moveAcceptanceRange=s}moveCharacter(t){var e;if(!(null===(e=null==t?void 0:t.info)||void 0===e?void 0:e.move))return;t.physicsBody.setFriction(0),t.physicsBody.setRollingFriction(0),this.tmpVec.setX(t.physicsBody.getLinearVelocity().x()),this.tmpVec.setY(t.physicsBody.getLinearVelocity().y()),this.tmpVec.setZ(t.physicsBody.getLinearVelocity().z());const s=t.info.targetPosition.x-t.model.position.x,n=t.info.targetPosition.z-t.model.position.z,h=(Math.abs(s)>Math.abs(n)?Math.abs(s):Math.abs(n))/80,i=t.info.moveAcceptanceRange||4,a=this.getDistance(t.info.targetPosition,t.model.position);a<i?(t.physicsBody.setFriction(this.friction),t.physicsBody.setRollingFriction(this.rollingFriction),t.info.move=!1,t.info.targetPosition=void 0,t.info.moveAcceptanceRange=void 0,this.tmpVec.setX(0),this.tmpVec.setZ(0),t.info.runWhenStopped&&(t.info.runWhenStopped(),t.info.runWhenStopped=void 0)):a>i+1?(this.tmpVec.setX(s/h),this.tmpVec.setZ(n/h)):(this.tmpVec.setX(s/(2*h)),this.tmpVec.setZ(n/(2*h))),t.physicsBody.setLinearVelocity(this.tmpVec)}getDistance(t,e){return Math.sqrt(Math.pow(Math.abs(t.x-e.x),2)+Math.pow(Math.abs(t.z-e.z),2))}onClick(t){switch(this.character.info.runWhenStopped=void 0,t.which){case 1:this.clickMouse.setX(t.clientX/window.innerWidth*2-1),this.clickMouse.setY(t.clientY/window.innerHeight*-2+1),this.raycaster.setFromCamera(this.clickMouse,this.camera);const e=this.raycaster.intersectObjects(this.scene.children)[0].object;switch(this.selectedObject&&"Character"===this.selectedObject.type&&(this.tmpVec.setValue(0,0,0),this.selectedObject.object.info.move=!1,this.selectedObject.object.info.targetPosition=void 0,this.selectedObject.object.physicsBody.setLinearVelocity(this.tmpVec),this.selectedObject.object.physicsBody.setFriction(this.friction),this.selectedObject.object.physicsBody.setRollingFriction(this.rollingFriction)),this.selectedObject=e.userData,this.selectedObject.type){case"bungalo":Math.random()>.5?this.soundService.sound("nord/no_1.mp3"):this.soundService.sound("nord/no_2.mp3");break;case"Character":Math.random()>.5?this.soundService.sound("nord/select_1.mp3"):this.soundService.sound("nord/select_2.mp3");break;case"sign":if(Math.random()>.5?this.soundService.sound("nord/yes_1.mp3"):this.soundService.sound("nord/yes_2.mp3"),this.getDistance(e.position,this.character.model.position)<20){let l;l=this.selectedObject.broken?(new o.dpR).load("assets/textures/sign.png"):(new o.dpR).load("assets/textures/sign_broken.png"),this.selectedObject.broken=!this.selectedObject.broken,setTimeout(()=>{e.material.map=l,this.soundService.sound("click.wav")},5)}else this.moveThere(this.character,e.position,18),this.character.info.runWhenStopped=()=>{let l;l=this.selectedObject.broken?(new o.dpR).load("assets/textures/sign.png"):(new o.dpR).load("assets/textures/sign_broken.png"),this.selectedObject.broken=!this.selectedObject.broken,setTimeout(()=>{e.material.map=l,this.soundService.sound("click.wav")},5)};break;default:this.clickMouse.setX(t.clientX/window.innerWidth*2-1),this.clickMouse.setY(t.clientY/window.innerHeight*-2+1),this.raycaster.setFromCamera(this.clickMouse,this.camera);const a=new o.Pa4,d=new o.Pa4;a.set(t.clientX/window.innerWidth*2-1,-t.clientY/window.innerHeight*2+1,.5),a.unproject(this.camera),a.sub(this.camera.position).normalize();const m=-this.camera.position.y/a.y;d.copy(this.camera.position).add(a.multiplyScalar(m)),d.setY(5),this.moveThere(this.character,d)}break;case 2:this.cameraMovement.dragOrigin||(this.cameraMovement.dragOrigin=this.getCursorPosition(t),this.cameraMovement.dragOriginCameraPositon=this.camera.position);break;case 3:this.clickMouse.setX(t.clientX/window.innerWidth*2-1),this.clickMouse.setY(t.clientY/window.innerHeight*-2+1),this.raycaster.setFromCamera(this.clickMouse,this.camera);const s=new o.Pa4,n=new o.Pa4;s.set(t.clientX/window.innerWidth*2-1,-t.clientY/window.innerHeight*2+1,.5),s.unproject(this.camera),s.sub(this.camera.position).normalize();const h=-this.camera.position.y/s.y;n.copy(this.camera.position).add(s.multiplyScalar(h)),n.setY(5),this.moveThere(this.character,n)}}onClickEnd(t){switch(t.which){case 1:case 3:break;case 2:this.cameraMovement.dragOrigin=null,this.cameraMovement.dragX=0,this.cameraMovement.dragZ=0}}onMouseMove(t){if(!this.moveMouse||!this.raycaster)return;this.moveMouse.setX(t.clientX/window.innerWidth*2-1),this.moveMouse.setY(t.clientY/window.innerHeight*-2+1),this.raycaster.setFromCamera(this.moveMouse,this.camera);const e=this.raycaster.intersectObjects(this.scene.children)[0].object;this.outlinePass.selectedObjects=e&&e.userData.interactable?[e]:[]}onScroll(t){t.wheelDelta>0&&this.cameraMovement.distance>60?(this.cameraMovement.distance-=10,this.cameraMovement.distanceChange-=10):t.wheelDelta<0&&this.cameraMovement.distance<80&&(this.cameraMovement.distance+=10,this.cameraMovement.distanceChange+=10)}onKeyDown(t){if(this.lastKey!==t.key)switch(this.lastKey=t.key,t.key){case"Alt":t.preventDefault(),this.showInteractables=!this.showInteractables,this.showInteractables||(this.outlinePass.selectedObjects=[]);break;case"Control":t.preventDefault(),this.pixelate=!this.pixelate;break;case"Tab":t.preventDefault(),this.cameraMovement.distance=140}}onKeyUp(t){switch(this.lastKey=void 0,t.key){case"Alt":break;case"Shift":this.cameraMovement.shift=1}}}return c.\u0275fac=function(t){return new(t||c)(r.Y36(k.y),r.Y36(W.p),r.Y36(E.k),r.Y36(r.SBq))},c.\u0275cmp=r.Xpm({type:c,selectors:[["smitd-game-screen"]],hostBindings:function(t,e){1&t&&r.NdJ("resize",function(n){return e.onResize(n)},!1,r.Jf7)("mousedown",function(n){return e.onClick(n)})("mouseup",function(n){return e.onClickEnd(n)})("mousemove",function(n){return e.onMouseMove(n)})("wheel",function(n){return e.onScroll(n)})("keydown",function(n){return e.onKeyDown(n)},!1,r.evT)("keyup",function(n){return e.onKeyUp(n)},!1,r.evT)},decls:9,vars:0,consts:[["mat-raised-button","","smitd-click-sound","","color","warn"],["mat-raised-button","","smitd-click-sound","","color","primary"],[1,"canvas-container"],["canvasContainer",""]],template:function(t,e){1&t&&(r.TgZ(0,"smitd-game-hud"),r.ynx(1),r.TgZ(2,"button",0),r._uU(3,"top"),r.qZA(),r.BQk(),r.ynx(4),r.TgZ(5,"button",1),r._uU(6,"bottom"),r.qZA(),r.BQk(),r.qZA(),r._UZ(7,"div",2,3))},directives:[N,Z.lW,X.O],styles:[".canvas-container[_ngcontent-%COMP%]{position:absolute;top:40px;left:0;right:0;bottom:80px}"]}),c})()}];let K=(()=>{class c{}return c.\u0275fac=function(t){return new(t||c)},c.\u0275mod=r.oAB({type:c}),c.\u0275inj=r.cJS({imports:[[V.Bz.forChild(Y)],V.Bz]}),c})();var U=p(3226);let Q=(()=>{class c{}return c.\u0275fac=function(t){return new(t||c)},c.\u0275mod=r.oAB({type:c}),c.\u0275inj=r.cJS({imports:[[D.ez,K,U.m]]}),c})()}}]);