import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
import { from } from 'rxjs';
import { AmmoService } from 'src/app/core/services/ammo.service';
import Ammo from '../../../../node_modules/ammojs-typed/ammo/ammo';

import { SoundService, Tracks } from 'src/app/core/services/sound.service';
import THREE, {
  AmbientLight,
  BoxBufferGeometry,
  CircleBufferGeometry,
  Clock,
  Color,
  ConeBufferGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereBufferGeometry,
  SphereGeometry,
  SpotLight,
  Vector3,
  WebGLRenderer
} from 'three';
// import * as Stats from 'stats-js';

export enum STATE {
  ACTIVE = 1,
  ISLAND_SLEEPING = 2,
  WANTS_DEACTIVATION = 3,
  DISABLE_DEACTIVATION = 4,
  DISABLE_SIMULATION = 5
}

export interface PlayerMovement {
  left: number;
  right: number;
  forward: number;
  back: number;
  up: number;
  isJumping: boolean;
}
@Component({
  selector: 'smitd-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements AfterViewInit {
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private player!: Object3D;
  private visionLight!: DirectionalLight;

  private physicsWorld!: Ammo.btDiscreteDynamicsWorld;
  private tmpTrans!: Ammo.btTransform;
  private tmpVec!: Ammo.btVector3;
  private clock!: Clock;
  private rigidBodies: any = [];

  private cameraDistance = 140;
  private friction = 4;
  private rollingFriction = 10;
  private gravity = -1000;
  private colGroupPlayer = 1;
  private colGroupPlane = 2;
  private colGroupBall = 4;

  // private stats!: Stats;new this.Ammo

  private lastKey: number | undefined;
  private tetrasites: Mesh[] = [];
  private destinationPoint!: Vector3;
  public started: boolean = false;
  private Ammo: any;

  constructor(
    private readonly soundService: SoundService,
    private ammoService: AmmoService,
    private element: ElementRef
  ) {}

  public ngAfterViewInit(): void {
    this.ammoService.Ammo.subscribe((ammo) => {
      this.Ammo = ammo;
      this.tmpVec = new this.Ammo.btVector3(0, 0, 0);
      this.tmpTrans = new this.Ammo.btTransform();
      this.init();
      this.update();
    });
  }

  public start(): void {
    this.soundService.initTracks();
    this.started = true;
  }

  public fight(): void {
    this.soundService.toggleTrack(Tracks.danger);
  }

  private init(): void {
    this.setupPhysicsWorld();
    this.setupGraphics();
    this.setupWorld();
    this.createPlayer();
    this.camera.lookAt(this.player.position);
  }

  private update(): void {
    const deltaTime = this.clock.getDelta();
    this.movePlayer();
    if (this.player.position.y < -400) {
      this.resetPlayer();
    }
    this.visionLight.position.set(
      this.player.position.x + 100,
      this.player.position.y + 1000,
      this.player.position.z -200
    );
    this.updatePhysics(deltaTime);
    requestAnimationFrame(() => this.update());
    // if (this.stats) {
    //   this.stats.begin();
    // }
    this.render();
    // if (this.stats) {
    //   this.stats.end();
    // }
  }

  private setupPhysicsWorld() {
    const collisionConfiguration =
      new this.Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new this.Ammo.btCollisionDispatcher(
      collisionConfiguration
    );
    const overlappingPairCache = new this.Ammo.btDbvtBroadphase();
    const solver = new this.Ammo.btSequentialImpulseConstraintSolver();

    this.physicsWorld = new this.Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      overlappingPairCache,
      solver,
      collisionConfiguration
    );
    this.tmpVec.setValue(0, this.gravity, 0);
    this.physicsWorld.setGravity(this.tmpVec);
  }

  private setupGraphics() {
    this.clock = new Clock();
    this.scene = new Scene();
    this.scene.background = new Color('#000');
    this.setupCamera();
    this.setupLights();
    this.setupRenderer();
  }

  private setupCamera(): void {
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );
    this.camera.position.set(0, 70, this.cameraDistance);
    // this.camera.updateProjectionMatrix();
    // this.camera.lookAt(0, 0, 0);
  }

  private setupLights(): void {
    // this.visionLight = new SpotLight(0x003355, 0.8, 300);
    // this.visionLight.position.set(0, 150, 0);
    // this.visionLight.castShadow = true;
    // this.visionLight.shadow.mapSize.width = 2048;
    // this.visionLight.shadow.mapSize.height = 2048;
    // this.scene.add(this.visionLight);

    this.visionLight = new DirectionalLight(0xffffff, 0.6);
    this.visionLight.position.set(100,1000,-200);
    this.visionLight.target.position.set(0,0,0);
    this.visionLight.castShadow = true;
    this.visionLight.shadow.bias = -0.01;
    this.visionLight.shadow.mapSize.width = 4096;
    this.visionLight.shadow.mapSize.height = 4096;
    this.visionLight.shadow.camera.near= 0.01;
    this.visionLight.shadow.camera.far = 1600;
    (this.visionLight.shadow.camera as any).fov = 70;
    this.visionLight.shadow.camera.left = 1000;
    this.visionLight.shadow.camera.right = -1000;
    this.visionLight.shadow.camera.top = 1000;
    this.visionLight.shadow.camera.bottom = -1000;
    this.scene.add(this.visionLight);
    this.scene.add(new DirectionalLightHelper(this.visionLight, 10));

    const ambientLight = new AmbientLight(0x404040, 0.8);
    this.scene.add(ambientLight);



    // const pointLight = new PointLight(0xff8800, 0.6, 100, 0.8);
    // pointLight.position.set(0, 10, 0);
    // this.scene.add(pointLight);
  }

  private setupRenderer(): void {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor('#000');
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.id = 'TEST'
    this.element.nativeElement.appendChild(this.renderer.domElement);
  }

  private setupWorld(): void {
    this.createPlane(new Vector3(10, 10, 10), new Vector3(0, 0, 0));
    this.createPlane();
    this.createPlane(new Vector3(4, 20, 400), new Vector3(202, 8, 0));
    this.createPlane(new Vector3(4, 20, 400), new Vector3(-202, 8, 0));
    this.createPlane(new Vector3(408, 60, 4), new Vector3(0, -30, 198));
    this.createPlane(new Vector3(408, 20, 4), new Vector3(0, 8, -202));
    this.createPlane(new Vector3(6000, 4, 6000), new Vector3(0, -60, 0));

    this.createBall(10, new Vector3(50, 10, 7), 0x808080, 4);
    this.createBall(10, new Vector3(5, 10, 70), 0x808080, 4);
    this.createBall(10, new Vector3(60, 10, 10), 0x808080, 4);
    // this.createObstacle(40, 300, new Vector3(0, 0, 0), 0x808080);
  }

  private darkenColor(color: number, intensity: number) {
    const tmpColor = new Color(color);
    const colorHSL = { h: 0, s: 0, l: 0 };
    tmpColor.getHSL(colorHSL);
    colorHSL.l = colorHSL.l * intensity;
    tmpColor.setHSL(colorHSL.h, colorHSL.s, colorHSL.l);

    return tmpColor;
  }

  private createLeg(
    player: Object3D,
    playerMaterial: any,
    count: number,
    radius: number,
    faces: number = 50
  ): void {
    const leg = new Object3D();
    const legGeometry = new SphereGeometry(
      radius,
      faces,
      faces,
      0,
      (Math.PI * 2) / 3,
      0,
      Math.PI / 2
    );
    legGeometry.rotateX(Math.PI);
    legGeometry.rotateY((Math.PI * 4) / 3);

    const legMaterial = new Mesh(legGeometry, playerMaterial);
    legMaterial.castShadow = true;
    legMaterial.receiveShadow = true;

    leg.add(legMaterial);

    const legCapGeometry1 = new CircleBufferGeometry(
      radius,
      faces,
      0,
      (Math.PI * 2) / 3
    );
    legCapGeometry1.rotateX(-Math.PI / 2);
    legCapGeometry1.rotateY(-Math.PI / 3);

    const capMaterial1 = new Mesh(legCapGeometry1, playerMaterial);
    capMaterial1.castShadow = true;
    capMaterial1.receiveShadow = true;
    leg.add(capMaterial1);

    const legCapGeometry2 = new CircleBufferGeometry(
      radius,
      faces,
      0,
      Math.PI / 2
    );
    legCapGeometry2.rotateZ(-Math.PI / 2);
    legCapGeometry2.rotateY(-Math.PI / 3);

    const capMaterial2 = new Mesh(legCapGeometry2, playerMaterial);
    capMaterial2.castShadow = true;
    capMaterial2.receiveShadow = true;
    leg.add(capMaterial2);

    const legCapGeometry3 = new CircleBufferGeometry(
      radius,
      faces,
      0,
      Math.PI / 2
    );
    legCapGeometry3.rotateY(-Math.PI / 3);
    legCapGeometry3.rotateX(Math.PI);

    const capMaterial3 = new Mesh(legCapGeometry3, playerMaterial);
    capMaterial3.castShadow = true;
    capMaterial3.receiveShadow = true;
    leg.add(capMaterial3);
    leg.rotateY(((Math.PI * 2) / 3) * count);

    player.add(leg);
  }

  private createHeadBop(
    player: Object3D,
    primaryMaterial: any,
    accentMaterial: any,
    radius: number,
    faces: number = 50
  ): void {
    const headTopGeometry = new SphereGeometry(
      radius,
      faces,
      faces,
      0,
      Math.PI * 2,
      0,
      Math.PI / 6
    );
    const headTopMaterial = new Mesh(headTopGeometry, primaryMaterial);
    headTopMaterial.castShadow = true;
    headTopMaterial.receiveShadow = true;
    player.add(headTopMaterial);

    const headMidGeometry = new SphereGeometry(
      radius,
      faces,
      faces,
      0,
      Math.PI * 2,
      Math.PI / 6,
      Math.PI / 6
    );
    const headMidMaterial = new Mesh(headMidGeometry, accentMaterial);
    headMidMaterial.castShadow = true;
    headMidMaterial.receiveShadow = true;
    player.add(headMidMaterial);

    const headBotGeometry = new SphereGeometry(
      radius,
      faces,
      faces,
      (Math.PI * 2) / 3 + Math.PI / 12,
      Math.PI * 2 - Math.PI / 6,
      Math.PI / 3,
      Math.PI / 6
    );
    const headBotMaterial = new Mesh(headBotGeometry, primaryMaterial);
    headBotMaterial.castShadow = true;
    headBotMaterial.receiveShadow = true;
    player.add(headBotMaterial);

    const headBotMidGeometry = new SphereGeometry(
      radius,
      faces,
      faces,
      (Math.PI * 2) / 3 - Math.PI / 12,
      Math.PI / 6,
      Math.PI / 3,
      Math.PI / 6
    );
    const headBotMidMaterial = new Mesh(headBotMidGeometry, accentMaterial);
    headBotMidMaterial.castShadow = true;
    headBotMidMaterial.receiveShadow = true;
    player.add(headBotMidMaterial);
  }

  private createPlayer(pos: Vector3 = new Vector3(0, 330, 0)): void {
    let radius = 20;
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 100;

    const grayMaterial = new MeshStandardMaterial({
      metalness: 0.5,
      roughness: 0.5,
      color: 0x8a8a8a
    });
    const glowGreenMaterial = new MeshLambertMaterial({
      color: 0x000000,
      emissive: this.darkenColor(0x00ff00, 1)
    });


    this.player = new Object3D();
    this.createHeadBop(this.player, grayMaterial, glowGreenMaterial, radius);
    this.createLeg(this.player, grayMaterial, 1, radius, 50);
    this.createLeg(this.player, grayMaterial, 2, radius, 50);
    this.createLeg(this.player, grayMaterial, 3, radius, 50);

    this.player.position.set(pos.x, pos.y, pos.z);
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.scene.add(this.player);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    const colShape = new this.Ammo.btSphereShape(radius);
    colShape.setMargin(0.05);
    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupPlayer,
      this.colGroupPlane | this.colGroupBall
    );

    this.player.userData['physicsBody'] = body;
    this.player.userData['tag'] = 'player';
    this.player.userData['energy'] = 14000;

    this.player.userData['movement'] = {};
    (this.player.userData['movement'] as PlayerMovement) = {
      left: 0,
      right: 0,
      forward: 0,
      back: 0,
      up: 0,
      isJumping: false
    };

    (body as any).threeObject = this.player;
    this.rigidBodies.push(this.player);

    this.visionLight.target = this.player;
  }

  private createPlane(
    scale: Vector3 = new Vector3(400, 4, 400),
    pos: Vector3 = new Vector3(0, 0, 0),
    color: number = 0x7a7a7a
  ) {
    const quat = { x: 0, y: 0, z: 0, w: 1 };
    const mass = 0;

    // Create Geometry
    const blockPlane = new Mesh(
      new BoxBufferGeometry(1, 1, 1),
      new MeshPhongMaterial({ color: color })
    );

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    this.scene.add(blockPlane);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5);
    const colShape = new this.Ammo.btBoxShape(this.tmpVec);
    colShape.setMargin(0.05);

    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupPlane,
      this.colGroupBall | this.colGroupPlayer
    );

    blockPlane.userData['physicsBody'] = body;
    blockPlane.userData['tag'] = 'plane';

    (body as any).threeObject = blockPlane;

    this.rigidBodies.push(blockPlane);
  }

  private createBall(
    radius = 2,
    pos: Vector3 = new Vector3(0, 20, 0),
    color: number = 0x7a7a7a,
    mass = 1
  ) {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    const ball = new Mesh(
      new SphereBufferGeometry(radius),
      new MeshPhongMaterial({ color })
    );

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    this.scene.add(ball);

    // Create Cllision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    const colShape = new this.Ammo.btSphereShape(radius);
    colShape.setMargin(0.05);
    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupPlayer | this.colGroupPlane | this.colGroupBall
    );

    ball.userData['physicsBody'] = body;
    ball.userData['tag'] = 'ball';
    (body as any).threeObject = ball;

    this.rigidBodies.push(ball);
  }

  private createObstacle(
    radius = 2,
    height = 100,
    pos: Vector3 = new Vector3(0, 20, 0),
    color: number = 0x7a7a7a,
    mass = 0
  ) {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    const ball = new Mesh(
      new ConeBufferGeometry(radius, height, 20, 20),
      new MeshPhongMaterial({ color })
    );

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    this.scene.add(ball);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    const colShape = new this.Ammo.btConeShape(radius, height);
    colShape.setMargin(0.05);
    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    colShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupPlayer | this.colGroupPlane
    );

    ball.userData['physicsBody'] = body;
    ball.userData['tag'] = 'ball';
    (body as any).threeObject = ball;

    this.rigidBodies.push(ball);
  }

  private movePlayer(): void {
    const speed = 100 * (this.player.userData['energy'] / 10000);
    const jumpSpeed = 400;

    this.tmpVec.setX(
      this.player.userData['physicsBody'].getLinearVelocity().x()
    );
    this.tmpVec.setY(
      this.player.userData['physicsBody'].getLinearVelocity().y()
    );
    this.tmpVec.setZ(
      this.player.userData['physicsBody'].getLinearVelocity().z()
    );

    const moveX =
      this.player.userData['movement'].right -
      this.player.userData['movement'].left;
    const moveZ =
      this.player.userData['movement'].back -
      this.player.userData['movement'].forward;

    const moveY = this.player.userData['movement'].up;
    if (Math.round(this.tmpVec.y()) === 0) {
      if (moveY) {
        this.player.userData['movement'].isJumping = true;
        this.tmpVec.setY(moveY * jumpSpeed);
        this.player.userData['movement'].up = 0;
      } else {
        this.player.userData['movement'].isJumping = false;
      }
    } else {
      this.player.userData['movement'].isJumping = true;
    }

    if (moveX == 0) {
      this.tmpVec.setX(0);
    }

    if (moveZ == 0) {
      this.tmpVec.setZ(0);
    }

    this.tmpVec.setX(moveX * speed);
    this.tmpVec.setZ(moveZ * speed);

    this.player.userData['physicsBody'].setLinearVelocity(this.tmpVec);
  }

  private updatePhysics(deltaTime: number) {
    this.physicsWorld.stepSimulation(deltaTime, 10);

    for (let i = 0; i < this.rigidBodies.length; i++) {
      const objThree = this.rigidBodies[i];
      const objAmmo = objThree.userData.physicsBody;
      const ms = objAmmo.getMotionState();

      if (ms) {
        ms.getWorldTransform(this.tmpTrans);
        const p = this.tmpTrans.getOrigin();
        const q = this.tmpTrans.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
    this.detectCollision();
  }

  private detectCollision() {
    const dispatcher = this.physicsWorld.getDispatcher();
    const numManifolds = dispatcher.getNumManifolds();

    for (let i = 0; i < numManifolds; i++) {
      const contactManifold = dispatcher.getManifoldByIndexInternal(i);

      const rb0 = this.Ammo.castObject(
        contactManifold.getBody0(),
        Ammo.btRigidBody
      );
      const rb1 = this.Ammo.castObject(
        contactManifold.getBody1(),
        Ammo.btRigidBody
      );
      const threeObject0 = rb0.threeObject;
      const threeObject1 = rb1.threeObject;

      if (!threeObject0 && !threeObject1) continue;

      const userData0 = threeObject0 ? threeObject0.userData : null;
      const userData1 = threeObject1 ? threeObject1.userData : null;

      const tag0 = userData0 ? userData0.tag : 'none';
      const tag1 = userData1 ? userData1.tag : 'none';

      if (tag0 == 'plane' || tag1 == 'plane') continue;

      const numContacts = contactManifold.getNumContacts();

      for (let j = 0; j < numContacts; j++) {
        const contactPoint = contactManifold.getContactPoint(j);
        const distance = contactPoint.getDistance();

        if (distance > 0.01) continue;
        if (distance < -0.01) continue;
        const velocity0 = rb0.getLinearVelocity();
        const velocity1 = rb1.getLinearVelocity();

        const worldPos0 = contactPoint.get_m_positionWorldOnA();
        const worldPos1 = contactPoint.get_m_positionWorldOnB();

        const localPos0 = contactPoint.get_m_localPointA();
        const localPos1 = contactPoint.get_m_localPointB();
      }
    }
  }

  private render(): void {
    this.camera.position.setX(this.player.position.x);
    this.camera.position.setY(this.player.position.y + this.cameraDistance * 2);
    this.camera.position.setZ(this.player.position.z + this.cameraDistance);
    this.camera.lookAt(this.player.position);
    this.renderer.render(this.scene, this.camera);
  }

  private resetPlayer() {
    this.player.userData['energy'] = 20000;
    this.relocate(
      this.player.userData['physicsBody'],
      { x: 0, y: 10, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
  }

  private relocate(
    body: Ammo.btRigidBody,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ) {
    this.physicsWorld.removeRigidBody(body);

    /// movement todo

    this.tmpVec.setValue(0, 0, 0);
    this.player.userData['physicsBody'].setLinearVelocity(this.tmpVec);
    this.player.userData['physicsBody'].setAngularVelocity(this.tmpVec);

    const localTransform = body.getWorldTransform();
    this.tmpVec.setValue(position.x, position.y, position.z);
    const quaternion = new this.Ammo.btQuaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      1
    );
    localTransform.setOrigin(this.tmpVec);
    localTransform.setRotation(quaternion);

    body.setWorldTransform(localTransform);
    this.physicsWorld.addRigidBody(body);
  }

  private getCursorPosition(event: MouseEvent) {
    const vec = new Vector3();
    const pos = new Vector3();

    vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    vec.unproject(this.camera);

    vec.sub(this.camera.position).normalize();

    const distance = -this.camera.position.y / vec.y;

    pos.copy(this.camera.position).add(vec.multiplyScalar(distance));
    return pos;
  }

  //
  // Listeners
  //
  @HostListener('window:resize', ['$event']) public onResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  @HostListener('window:mousemove', ['$event']) public onCursorMove(
    event: MouseEvent
  ): void {}

  @HostListener('window:mousedown', ['$event']) public onClick(
    event: any
  ): void {
    if (event.path[0].localName === 'canvas') {
      this.destinationPoint = this.getCursorPosition(event);
      console.log(this.destinationPoint);
    }
  }

  @HostListener('document:keydown', ['$event']) public onKeyDown(
    event: KeyboardEvent
  ): void {
    // if (!this.started) return;
    if (this.lastKey === event.keyCode) {
      return;
    }
    this.lastKey = event.keyCode;

    switch (event.key) {
      case 'w':
        this.player.userData['movement'].forward = 1;
        break;

      case 's':
        this.player.userData['movement'].back = 1;
        break;

      case 'a':
        this.player.userData['movement'].left = 1;
        break;

      case 'd':
        this.player.userData['movement'].right = 1;
        break;

      case ' ':
        this.player.userData['movement'].up = 1;
        break;

      case 'Backspace':
        this.resetPlayer();
        break;
      case '0':
        this.soundService.muteTrack();
        this.soundService.muteTrack(Tracks.danger);
        break;
      case '1':
        this.soundService.toggleTrack(Tracks.idle);
        break;
      case '2':
        this.soundService.toggleTrack(Tracks.danger);
        break;
      default:
        break;
    }
  }

  @HostListener('document:keyup', ['$event']) public onKeyUp(
    event: KeyboardEvent
  ): void {
    this.lastKey = undefined;
    switch (event.key) {
      case 'w':
        this.player.userData['movement'].forward = 0;
        break;
      case 's':
        this.player.userData['movement'].back = 0;
        break;
      case 'a':
        this.player.userData['movement'].left = 0;
        break;
      case 'd':
        this.player.userData['movement'].right = 0;
        break;
      case ' ':
        this.player.userData['movement'].up = 0;
        break;
    }
  }
}
