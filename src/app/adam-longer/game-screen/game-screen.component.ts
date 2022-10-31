import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener
} from '@angular/core';
import cloneDeep from 'lodash.clonedeep';
import { Character } from 'src/app/core/models/character.model';
import { AmmoService } from 'src/app/core/services/ammo.service';
import { CoreService } from 'src/app/core/services/core.service';
import { SoundService } from 'src/app/core/services/sound.service';
import {
  AmbientLight,
  AnimationClip,
  AnimationMixer,
  BoxBufferGeometry,
  Clock,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  FogExp2,
  Group,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import Ammo from '../../../../node_modules/ammojs-typed/ammo/ammo';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

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
  selector: 'smitd-game-screen',
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.scss']
})
export class GameScreenComponent implements AfterViewInit {
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private visionLight!: DirectionalLight;

  private physicsWorld!: Ammo.btDiscreteDynamicsWorld;
  private tmpTrans!: Ammo.btTransform;
  private tmpVec!: Ammo.btVector3;
  private clock!: Clock;
  private rigidBodies: any = [];
  private characters: Character[];

  private cameraMovement: {
    distance: number;
    distanceChange: number;
    up: number;
    down: number;
    left: number;
    right: number;
    shift: number;
    xBoundary: number;
    zBoundary: number;
    dragOrigin: Vector3 | null;
    dragOriginCameraPositon: Vector3;
    dragX: number;
    dragZ: number;
  } = {
    distance: 80,
    distanceChange: 0,
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    shift: 1,
    xBoundary: 0,
    zBoundary: 0,
    dragOrigin: null,
    dragOriginCameraPositon: new Vector3(),
    dragX: 0,
    dragZ: 0
  };
  private mapSize = {
    width: 2000,
    height: 2000
  };
  private friction = 10;
  private rollingFriction = 10;
  private gravity = -490;
  private colGroupPlayer = 1;
  private colGroupPlane = 2;
  private colGroupBall = 4;

  private lastKey: string | undefined;
  private Ammo: any;

  private raycaster!: Raycaster;
  private clickMouse!: Vector2;
  private moveMouse!: Vector2;

  private composer!: EffectComposer;
  private pixelPass!: ShaderPass;
  private outlinePass!: OutlinePass;

  private selectedObject: any;
  private character!: Character;

  private showInteractables = false;
  private pixelate = false;

  constructor(
    private readonly soundService: SoundService,
    private readonly coreService: CoreService,
    private ammoService: AmmoService,
    private element: ElementRef
  ) {
    this.characters = [];
  }

  public ngAfterViewInit(): void {
    this.ammoService.Ammo.subscribe((ammo) => {
      this.Ammo = ammo;
      this.tmpVec = new this.Ammo.btVector3(0, 0, 0);
      this.tmpTrans = new this.Ammo.btTransform();
      this.init();
      this.update();
    });
  }

  private init(): void {
    this.setupPhysicsWorld();
    this.setupGraphics();
    this.setupWorld();
    this.setupControls();
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
    this.scene.background = new Color('#DFE9F3');
    this.setupCamera();
    this.setupLights();
    this.setupFog();
    this.setupRenderer();
    this.setupAnimationMixer();
    this.setupComposer();
  }

  private setupCamera(): void {
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(
      0,
      this.cameraMovement.distance * 1.6,
      this.cameraMovement.distance
    );
    this.camera.lookAt(0, 0, 0);
    this.cameraMovement.xBoundary = this.mapSize.width / 2;
    this.cameraMovement.zBoundary = this.mapSize.height / 2;
  }

  private setupLights(): void {
    this.visionLight = new DirectionalLight(0xffffff, 0.8);
    this.visionLight.position.set(100, 400, 200);
    this.visionLight.target.position.set(0, 0, 0);
    this.visionLight.castShadow = true;
    this.visionLight.shadow.bias = -0.001;
    this.visionLight.shadow.mapSize.width = 4096;
    this.visionLight.shadow.mapSize.height = 4096;
    this.visionLight.shadow.camera.near = 1;
    this.visionLight.shadow.camera.far = 1000;
    (this.visionLight.shadow.camera as any).fov = 70;
    this.visionLight.shadow.camera.left = 1000;
    this.visionLight.shadow.camera.right = -1000;
    this.visionLight.shadow.camera.top = 1000;
    this.visionLight.shadow.camera.bottom = -1000;
    this.scene.add(this.visionLight);

    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }

  private setupFog(): void {
    this.scene.fog = new Fog(0xdfe9f3, 400, 550);
  }

  private setupRenderer(): void {
    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor('#000');
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.id = 'game-canvas';
    this.element.nativeElement.appendChild(this.renderer.domElement);
  }

  private setupAnimationMixer(): void {}

  private setupComposer(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.composer.addPass(this.outlinePass);

    this.pixelPass = new ShaderPass(PixelShader);
    this.pixelPass.uniforms['resolution'].value = new Vector2(
      window.innerWidth,
      window.innerHeight
    );
    this.pixelPass.uniforms['resolution'].value.multiplyScalar(
      window.devicePixelRatio
    );
    this.pixelPass.uniforms['pixelSize'].value = 2;
    this.composer.addPass(this.pixelPass);
  }

  private setupControls(): void {
    this.raycaster = new Raycaster();
    this.clickMouse = new Vector2();
    this.moveMouse = new Vector2();
  }

  private setupWorld(): void {
    this.createPlane(
      new Vector3(this.mapSize.width + 1400, 2, this.mapSize.height + 1000),
      new Vector3(0, -2, 0),
      0x444444
    );
    this.createPlane(
      new Vector3(this.mapSize.width, 2, this.mapSize.height),
      new Vector3(0, -1, 0),
      0x66aa66
    );
    // this.createPlane(new Vector3(10, 10, 10), new Vector3(0, 5, 0), 0x00ff00);
    this.createCharacter(4, 10, new Vector3(-10, 40, 0), 0x333333, 3);
    this.createBungalo();
    this.createSign();
    this.createUnitCube(new Vector3(10, 0, 0));
    this.createUnitCube(new Vector3(10, 0, -10));
    this.createUnitCube(new Vector3(0, 0, -10));
    this.createNord(4, 10, new Vector3(-10, 0, 0));
  }

  private async createUnitCube(
    pos: Vector3 = new Vector3(0, 0, 0),
    scale: Vector3 = new Vector3(5, 5, 5),
    mass = 0
  ): Promise<void> {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    const loaderObj = new OBJLoader();
    const unit = await loaderObj.loadAsync('assets/models/unit.obj');
    const texture = new TextureLoader().load(
      'assets/textures/placeholder_64.png'
    );
    unit.position.set(pos.x, pos.y, pos.z);
    unit.rotation.set(0, 0, 0);
    unit.scale.set(scale.x, scale.y, scale.z);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y + scale.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(scale.x, scale.y, scale.z);
    const boxShape = new this.Ammo.btBoxShape(this.tmpVec);
    boxShape.setMargin(0.05);

    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    boxShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      boxShape,
      localInertia
    );
    const body: Ammo.btRigidBody = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    this.tmpVec.setValue(0, 1, 0);
    body.setAngularFactor(this.tmpVec);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupBall | this.colGroupPlane
    );
    unit.traverse((object) => {
      if (object instanceof Mesh) {
        object.userData['physicsBody'] = body;
        object.userData['type'] = 'unit';
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.map = texture;
      }
    });

    this.scene.add(unit);
    // this.rigidBodies.push(unit);
  }

  private async createSign(
    radius = 4,
    height = 10,
    pos: Vector3 = new Vector3(0, 0, 0),
    color: number = 0x7a7a7a,
    mass = 0
  ): Promise<void> {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    // const loader =  new GLTFLoader();
    // const GLTF = await loader.loadAsync('assets/models/sign.glb');
    const loaderObj = new OBJLoader();
    const sign = await loaderObj.loadAsync('assets/models/sign.obj');
    const texture = new TextureLoader().load('assets/textures/sign.png');
    sign.position.set(pos.x, pos.y, pos.z);
    sign.rotation.set(0, 0 * (Math.PI / 180), 0);
    // sign.rotation.set(0, 0 * (Math.PI/180), 0);
    sign.scale.set(5, 5, 5);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(radius, height, radius);
    const colShape = new this.Ammo.btCylinderShape(this.tmpVec);
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
    const body: Ammo.btRigidBody = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    this.tmpVec.setValue(0, 1, 0);
    body.setAngularFactor(this.tmpVec);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupBall | this.colGroupPlane
    );
    sign.traverse((object) => {
      if (object instanceof Mesh) {
        object.userData['physicsBody'] = body;
        object.userData['type'] = 'sign';
        object.userData['interactable'] = true;
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.map = texture;
      }
    });

    this.scene.add(sign);
    // this.rigidBodies.push(sign);
  }

  private async createNord(
    radius = 4,
    height = 10,
    pos: Vector3 = new Vector3(0, 0, 0),
    color: number = 0x7a7a7a,
    mass = 0
  ): Promise<void> {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    const loader = new GLTFLoader();
    const GLTF = await loader.loadAsync('assets/models/nord_animated.glb');
    const nord = GLTF.scene;
    nord.scale.set(5, 5, 5);
    const texture = new TextureLoader().load('assets/textures/nord.png');

    nord.position.set(pos.x, pos.y, pos.z);
    nord.rotation.set(0, 0, 0);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(radius, height * 2, radius);
    const colShape = new this.Ammo.btCylinderShape(this.tmpVec);
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
    const body: Ammo.btRigidBody = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    this.tmpVec.setValue(0, 1, 0);
    body.setAngularFactor(this.tmpVec);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupBall | this.colGroupPlane
    );
    const animationMixer = new AnimationMixer(nord);
    nord.traverse((object) => {
      if (object instanceof Mesh) {
        object.userData['physicsBody'] = body;
        object.userData['type'] = 'sign';
        object.userData['interactable'] = true;
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.map = texture;
      }
    });

    nord.userData['mixer'] = animationMixer;
    nord.userData['mixer'] = animationMixer;
    GLTF.animations.forEach((animation) => {
      animationMixer.clipAction(animation).play();
    });

    this.scene.add(nord);
    // this.rigidBodies.push(sign);
  }

  private createCharacter(
    radius = 4,
    height = 10,
    pos: Vector3 = new Vector3(100, 5, 0),
    color: number = 0x7a7a7a,
    mass = 1
  ): void {
    const quat = { x: 0, y: 0, z: 0, w: 1 };

    // Create Geometry
    const cylinder = new Mesh(
      new CylinderGeometry(radius, radius, height, 20, 20),
      new MeshPhongMaterial({ color })
    );
    cylinder.position.set(pos.x, pos.y, pos.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(radius, height / 2, radius);
    const colShape = new this.Ammo.btCylinderShape(this.tmpVec);
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
    const body: Ammo.btRigidBody = new this.Ammo.btRigidBody(rbInfo);

    body.setFriction(this.friction);
    body.setRollingFriction(this.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    this.tmpVec.setValue(0, 1, 0);
    body.setAngularFactor(this.tmpVec);

    this.physicsWorld.addRigidBody(
      body,
      this.colGroupBall,
      this.colGroupBall | this.colGroupPlane
    );

    const newCharacter = new Character(
      cylinder,
      body,
      {
        animationState: 'idle',
        info: {}
      },
      'Character'
    );

    this.scene.add(newCharacter.model);
    this.characters.push(newCharacter);
    this.character = newCharacter;
    // this.rigidBodies.push(newCharacter);
  }

  private createPlane(
    scale: Vector3 = new Vector3(400, 2, 400),
    pos: Vector3 = new Vector3(0, -1, 0),
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
    const boxShape = new this.Ammo.btBoxShape(this.tmpVec);
    boxShape.setMargin(0.05);

    this.tmpVec.setValue(0, 0, 0);
    const localInertia = this.tmpVec;
    boxShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      boxShape,
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
    blockPlane.userData['type'] = 'plane';

    (body as any).threeObject = blockPlane;

    this.rigidBodies.push(blockPlane);
  }

  private createBungalo(
    pos: Vector3 = new Vector3(0, 10, -100),
    color: number = 0x00ff00
  ): void {
    const quat = { x: 0, y: 0, z: 0, w: 1 };
    const grayMaterial = new MeshStandardMaterial({
      metalness: 0.1,
      roughness: 1,
      color: 0xcccccc
    });
    const colorMaterial = new MeshLambertMaterial({
      color: color,
      emissive: color
    });
    const bungalo = new Object3D();
    const body = new Mesh(
      new CylinderGeometry(20, 20, 20, 20, 20),
      grayMaterial
    );
    body.castShadow = true;
    body.receiveShadow = true;
    bungalo.add(body);
    const ring = new Mesh(
      new CylinderGeometry(20, 20, 4, 20, 20),
      colorMaterial
    );
    ring.position.set(0, 12, 0);
    ring.castShadow = true;
    ring.receiveShadow = true;
    bungalo.add(ring);
    const roof = new Mesh(new CylinderGeometry(0, 22, 10, 8, 8), grayMaterial);
    roof.position.set(0, 19, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    bungalo.add(roof);
    bungalo.position.set(pos.x, pos.y, pos.z);

    bungalo.position.set(pos.x, pos.y, pos.z);
    bungalo.castShadow = true;
    bungalo.receiveShadow = true;
    this.scene.add(bungalo);

    //
    // Create Collision Box
    const mass = 0;
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.tmpVec.setValue(20, 17, 20);
    const colShape = new this.Ammo.btCylinderShape(this.tmpVec);
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
    const rigidBody: Ammo.btRigidBody = new this.Ammo.btRigidBody(rbInfo);

    rigidBody.setFriction(this.friction);
    rigidBody.setRollingFriction(this.rollingFriction);
    rigidBody.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.physicsWorld.addRigidBody(
      rigidBody,
      this.colGroupBall,
      this.colGroupBall | this.colGroupPlane
    );

    bungalo.userData['physicsBody'] = rigidBody;
    bungalo.userData['type'] = 'bungalo';
    body.userData = bungalo.userData;
    ring.userData = bungalo.userData;
    roof.userData = bungalo.userData;
    (rigidBody as any).threeObject = bungalo;

    this.rigidBodies.push(bungalo);
  }

  private update(): void {
    const deltaTime = this.clock.getDelta();
    this.moveCharacter(this.character);
    this.updatePhysics(deltaTime);
    this.updateCamera();
    this.scene.traverse((object) => {
      if (object.userData['mixer']) {
        (object.userData['mixer'] as AnimationMixer).update(deltaTime);
      }
    });
    if (this.showInteractables) {
      this.outlinePass.selectedObjects = [];
      for (let object of this.scene.children) {
        if (
          this.getDistance(object.position, this.character.model.position) > 400
        )
          continue;
        if (object instanceof Group && object.children[0]) {
          if (object.children[0].name === 'Armature') {
            object.children[0].children.forEach((children) => {
              if (children.userData['interactable']) {
                this.outlinePass.selectedObjects.push(object);
              }
            });
          } else if (object.children[0].userData['interactable']) {
            this.outlinePass.selectedObjects.push(object);
          }
        }
      }
    }
    this.render();
    requestAnimationFrame(() => this.update());
  }

  private updateCamera(): void {
    let newX = this.camera.position.x;
    let newZ = this.camera.position.z;

    this.camera.position.setX(this.character.model.position.x);
    this.camera.position.setZ(
      this.character.model.position.z + this.cameraMovement.distance * 0.8
    );
    this.camera.position.setY(
      this.cameraMovement.distance < 80
        ? this.cameraMovement.distance
        : this.cameraMovement.distance < 100
        ? this.cameraMovement.distance * 1.2
        : this.cameraMovement.distance < 120
        ? this.cameraMovement.distance * 1.4
        : this.cameraMovement.distance * 1.6
    );

    this.pixelPass.uniforms['pixelSize'].value = 4;
    this.camera.lookAt(
      this.character.model.position.x,
      -this.cameraMovement.distance * 0.8,
      this.character.model.position.z - this.cameraMovement.distance
    );
    this.cameraMovement.distanceChange = 0;
  }

  private updatePhysics(deltaTime: number) {
    this.physicsWorld.stepSimulation(deltaTime, 10);

    for (let i = 0; i < this.rigidBodies.length; i++) {
      const objThree = this.rigidBodies[i];
      const objAmmo = (objThree.userData as any).physicsBody;
      const ms = objAmmo.getMotionState();

      if (ms) {
        ms.getWorldTransform(this.tmpTrans);
        const p = this.tmpTrans.getOrigin();
        const q = this.tmpTrans.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
      if (objThree.position.x < this.cameraMovement.xBoundary * -1) {
        setTimeout(() => {
          this.rigidBodies.splice(i, 1);
          this.scene.remove(objThree);
        }, 1000);
      }
      if (objThree.position.x > this.cameraMovement.xBoundary) {
        setTimeout(() => {
          this.rigidBodies.splice(i, 1);
          this.scene.remove(objThree);
        }, 1000);
      }
      if (objThree.position.z < this.cameraMovement.zBoundary * -1) {
        setTimeout(() => {
          this.rigidBodies.splice(i, 1);
          this.scene.remove(objThree);
        }, 1000);
      }
      if (objThree.position.z > this.cameraMovement.zBoundary) {
        setTimeout(() => {
          this.rigidBodies.splice(i, 1);
          this.scene.remove(objThree);
        }, 1000);
      }
    }

    for (let index = 0; index < this.characters.length; index++) {
      const character = this.characters[index];
      const objThree = character.model;
      const objAmmo = character.physicsBody;
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

      const type0 = userData0 ? userData0.type : 'none';
      const type1 = userData1 ? userData1.type : 'none';

      if (type0 == 'plane' || type1 == 'plane') continue;

      console.log('COLLISION', type0, type1);

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
    if (!this.pixelate) {
      this.pixelPass.uniforms['pixelSize'].value = 1;
    }
    this.composer.render();
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

  @HostListener('window:resize', ['$event']) public onResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.pixelPass.uniforms['resolution'].value
      .set(window.innerWidth, window.innerHeight)
      .multiplyScalar(window.devicePixelRatio);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private relocate(
    body: Ammo.btRigidBody,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ) {
    this.physicsWorld.removeRigidBody(body);

    /// movement todo

    this.tmpVec.setValue(0, 0, 0);
    body.setLinearVelocity(this.tmpVec);
    body.setAngularVelocity(this.tmpVec);

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

  private moveThere(
    character: Character,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    moveAcceptanceRange: number = 2
  ): void {
    character.animation = 'move';
    character.info = character.info || {};
    character.info.move = true;
    character.info.targetPosition = { x: position.x, z: position.z };
    character.info.moveAcceptanceRange = moveAcceptanceRange;
  }

  private moveCharacter(character: Character): void {
    if (!character?.info?.move) return;
    character.physicsBody.setFriction(0);
    character.physicsBody.setRollingFriction(0);

    this.tmpVec.setX(character.physicsBody.getLinearVelocity().x());
    this.tmpVec.setY(character.physicsBody.getLinearVelocity().y());
    this.tmpVec.setZ(character.physicsBody.getLinearVelocity().z());

    const moveX = character.info.targetPosition.x - character.model.position.x;
    const moveZ = character.info.targetPosition.z - character.model.position.z;
    const speed =
      (Math.abs(moveX) > Math.abs(moveZ) ? Math.abs(moveX) : Math.abs(moveZ)) /
      80;
    const precision = character.info.moveAcceptanceRange || 4;
    const distance = this.getDistance(
      character.info.targetPosition,
      character.model.position
    );
    if (distance < precision) {
      character.physicsBody.setFriction(this.friction);
      character.physicsBody.setRollingFriction(this.rollingFriction);
      character.info.move = false;
      character.info.targetPosition = undefined;
      character.info.moveAcceptanceRange = undefined;
      this.tmpVec.setX(0);
      this.tmpVec.setZ(0);
      if (character.info.runWhenStopped) {
        character.info.runWhenStopped();
        character.info.runWhenStopped = undefined;
      }
    } else if (distance > precision + 1) {
      this.tmpVec.setX(moveX / speed);
      this.tmpVec.setZ(moveZ / speed);
    } else {
      this.tmpVec.setX(moveX / (speed * 2));
      this.tmpVec.setZ(moveZ / (speed * 2));
    }

    character.physicsBody.setLinearVelocity(this.tmpVec);
  }

  private getDistance(a: Vector3, b: Vector3): number {
    return Math.sqrt(
      Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.z - b.z), 2)
    );
  }

  @HostListener('mousedown', ['$event']) public onClick(event: any): void {
    this.character.info.runWhenStopped = undefined;
    switch (event.which) {
      case 1: // left mouse button
        this.clickMouse.setX((event.clientX / window.innerWidth) * 2 - 1);
        this.clickMouse.setY((event.clientY / window.innerHeight) * -2 + 1);
        this.raycaster.setFromCamera(this.clickMouse, this.camera);
        const clickedObject = this.raycaster.intersectObjects(
          this.scene.children
        )[0].object;
        if (
          this.selectedObject &&
          this.selectedObject['type'] === 'Character'
        ) {
          this.tmpVec.setValue(0, 0, 0);
          (this.selectedObject.object as Character).info.move = false;
          (this.selectedObject.object as Character).info.targetPosition =
            undefined;
          (
            this.selectedObject.object as Character
          ).physicsBody.setLinearVelocity(this.tmpVec);

          (this.selectedObject.object as Character).physicsBody.setFriction(
            this.friction
          );
          (
            this.selectedObject.object as Character
          ).physicsBody.setRollingFriction(this.rollingFriction);
        }
        this.selectedObject = clickedObject.userData;

        switch (this.selectedObject['type']) {
          case 'bungalo':
            if (Math.random() > 0.5) {
              this.soundService.sound('nord/no_1.mp3');
            } else {
              this.soundService.sound('nord/no_2.mp3');
            }
            break;
          case 'Character':
            if (Math.random() > 0.5) {
              this.soundService.sound('nord/select_1.mp3');
            } else {
              this.soundService.sound('nord/select_2.mp3');
            }
            break;
          case 'sign':
            if (Math.random() > 0.5) {
              this.soundService.sound('nord/yes_1.mp3');
            } else {
              this.soundService.sound('nord/yes_2.mp3');
            }
            const distance = this.getDistance(
              clickedObject.position,
              this.character.model.position
            );

            if (distance < 20) {
              let texture: any;
              if (this.selectedObject.broken) {
                texture = new TextureLoader().load('assets/textures/sign.png');
              } else {
                texture = new TextureLoader().load(
                  'assets/textures/sign_broken.png'
                );
              }
              this.selectedObject.broken = !this.selectedObject.broken;
              setTimeout(() => {
                (clickedObject as any).material.map = texture;
                this.soundService.sound('click.wav');
              }, 5);
            } else {
              this.moveThere(this.character, clickedObject.position, 18);
              this.character.info.runWhenStopped = () => {
                let texture: any;
                if (this.selectedObject.broken) {
                  texture = new TextureLoader().load(
                    'assets/textures/sign.png'
                  );
                } else {
                  texture = new TextureLoader().load(
                    'assets/textures/sign_broken.png'
                  );
                }
                this.selectedObject.broken = !this.selectedObject.broken;
                setTimeout(() => {
                  (clickedObject as any).material.map = texture;
                  this.soundService.sound('click.wav');
                }, 5);
              };
            }

            break;
          default:
            this.clickMouse.setX((event.clientX / window.innerWidth) * 2 - 1);
            this.clickMouse.setY((event.clientY / window.innerHeight) * -2 + 1);
            this.raycaster.setFromCamera(this.clickMouse, this.camera);
            const vec = new Vector3();
            const pos = new Vector3();

            vec.set(
              (event.clientX / window.innerWidth) * 2 - 1,
              -(event.clientY / window.innerHeight) * 2 + 1,
              0.5
            );

            vec.unproject(this.camera);

            vec.sub(this.camera.position).normalize();

            const distanceY = -this.camera.position.y / vec.y;

            pos.copy(this.camera.position).add(vec.multiplyScalar(distanceY));
            pos.setY(5);
            this.moveThere(this.character, pos);
            break;
        }
        break;
      case 2: // middle mouse button
        if (!this.cameraMovement.dragOrigin) {
          this.cameraMovement.dragOrigin = this.getCursorPosition(event);
          this.cameraMovement.dragOriginCameraPositon = this.camera.position;
          // this.cameraMovement.dragOriginCameraPositon = cloneDeep(this.camera.position);
        }
        break;
      case 3: // right mouse button
        this.clickMouse.setX((event.clientX / window.innerWidth) * 2 - 1);
        this.clickMouse.setY((event.clientY / window.innerHeight) * -2 + 1);
        this.raycaster.setFromCamera(this.clickMouse, this.camera);
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
        pos.setY(5);
        this.moveThere(this.character, pos);
        break;
    }
  }

  @HostListener('mouseup', ['$event']) public onClickEnd(event: any): void {
    switch (event.which) {
      case 1: // left mouse button
        break;
      case 2: // middle mouse button
        this.cameraMovement.dragOrigin = null;
        this.cameraMovement.dragX = 0;
        this.cameraMovement.dragZ = 0;
        break;
      case 3: // right mouse button
        break;
    }
  }

  @HostListener('mousemove', ['$event']) public onMouseMove(event: any): void {
    if (!this.moveMouse || !this.raycaster) return;
    this.moveMouse.setX((event.clientX / window.innerWidth) * 2 - 1);
    this.moveMouse.setY((event.clientY / window.innerHeight) * -2 + 1);
    this.raycaster.setFromCamera(this.moveMouse, this.camera);
    const hoveredObject = this.raycaster.intersectObjects(
      this.scene.children
    )[0].object;

    if (hoveredObject && hoveredObject.userData['interactable']) {
      this.outlinePass.selectedObjects = [hoveredObject];
    } else {
      this.outlinePass.selectedObjects = [];
    }
  }

  @HostListener('wheel', ['$event']) public onScroll(event: any): void {
    if (event.wheelDelta > 0 && this.cameraMovement.distance > 60) {
      this.cameraMovement.distance -= 10;
      this.cameraMovement.distanceChange -= 10;
    } else if (event.wheelDelta < 0 && this.cameraMovement.distance < 80) {
      this.cameraMovement.distance += 10;
      this.cameraMovement.distanceChange += 10;
    }
  }

  @HostListener('document:keydown', ['$event']) public onKeyDown(
    event: KeyboardEvent
  ): void {
    if (this.lastKey === event.key) {
      return;
    }
    this.lastKey = event.key;

    switch (event.key) {
      case 'Alt':
        event.preventDefault();
        this.showInteractables = !this.showInteractables;
        if (!this.showInteractables) {
          this.outlinePass.selectedObjects = [];
        }
        break;
      case 'Control':
        event.preventDefault();
        this.pixelate = !this.pixelate;
        break;
      case 'Tab':
        event.preventDefault();
        this.cameraMovement.distance = 140;
        break;
    }
  }

  @HostListener('document:keyup', ['$event']) public onKeyUp(
    event: KeyboardEvent
  ): void {
    this.lastKey = undefined;
    switch (event.key) {
      case 'Alt':
        break;
      case 'Shift':
        this.cameraMovement.shift = 1;
        break;
    }
  }
}
