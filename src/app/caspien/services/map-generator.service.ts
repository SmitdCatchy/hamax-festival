import { Injectable } from '@angular/core';
import type Ammo from 'ammojs-typed';
import { tap } from 'rxjs';
import { DoubleSide, Mesh, MeshPhongMaterial, PlaneGeometry, Scene, Vector3 } from 'three';
import { STATE } from '../game-screen/game-screen.component';
import { AmmoGameEngineObjects } from '../interfaces/ammo-game-engine-objects.model';
import { PhysicSettings } from '../interfaces/physic-settings.model';

@Injectable({
  providedIn: 'root'
})
export class MapGeneratorService {

  private scene!: Scene;
  private Ammo!: typeof Ammo;
  private ammoObjects!: AmmoGameEngineObjects;
  private physicSettings!: PhysicSettings;

  constructor() { }

  public init(scene: Scene, ammoObjects: AmmoGameEngineObjects, physicSettings: PhysicSettings) {
    this.scene = scene;
    this.Ammo = ammoObjects.Ammo;
    this.ammoObjects = ammoObjects;
    this.physicSettings = physicSettings;
  }

  public generateMap() {
    let planeMesh = this.createTessalatedPlane();
    if (!planeMesh) return;
    this.modifyPlanesStructure(planeMesh);
    
  }

  private isInitHappened(): boolean {
    return !!this.scene && !!this.Ammo;
  }

  private modifyPlanesStructure(blockPlane: Mesh<PlaneGeometry, MeshPhongMaterial>) {
    const vertices = blockPlane.geometry.attributes['position'];
    const center = blockPlane.position;
    for (let i = 0; i < vertices.array.length/3; i+=1) {
      let x = vertices.getX(i);
      let y = vertices.getY(i);
      let z = vertices.getZ(i);
      vertices.setZ(i, z - Math.min(1/(Math.abs(x - 0.3) + Math.abs(y - 0.3) + 0.0001), 30));
    }
    vertices.needsUpdate = true;
    blockPlane.updateMatrix();
    //blockPlane.geometry.computeVertexNormals();
  }

  private createTessalatedPlane(
    scale: Vector3 = new Vector3(300, 300, 2),
    pos: Vector3 = new Vector3(0, -1, 0),
    color: number = 0x0a7a7a
  ): Mesh<PlaneGeometry, MeshPhongMaterial> | undefined {
    if (!this.isInitHappened()) return;
    const quat = { x: Math.PI / 3, y: 0, z: 0, w: 1 };
    const mass = 0;

    // Create Geometry
    const blockPlane = new Mesh(
      new PlaneGeometry(1, 1, 30, 30), // Tesszelált plane re van szükségünk ahol sok a vertice.
      new MeshPhongMaterial({ color: color, side: DoubleSide})
    );

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);
    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    this.scene.add(blockPlane);

    // Create Collision Box
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    this.ammoObjects.tmpVec.setValue(pos.x, pos.y, pos.z);
    transform.setOrigin(this.ammoObjects.tmpVec);
    transform.setRotation(
      new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    this.ammoObjects.tmpVec.setValue(scale.x*0.5, scale.y*0.5, scale.z*0.5);
    const boxShape = new this.Ammo.btBoxShape(this.ammoObjects.tmpVec);
    boxShape.setMargin(0.05);

    this.ammoObjects.tmpVec.setValue(0, 0, 0);
    const localInertia = this.ammoObjects.tmpVec;
    boxShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      boxShape,
      localInertia
    );
    const body = new this.Ammo.btRigidBody(rbInfo);
    body.setFriction(this.physicSettings.friction);
    body.setRollingFriction(this.physicSettings.rollingFriction);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);

    this.ammoObjects.physicsWorld.addRigidBody(
      body,
      this.physicSettings.colGroupPlane,
      this.physicSettings.colGroupBall | this.physicSettings.colGroupPlayer
    );

    blockPlane.userData['physicsBody'] = body;
    blockPlane.userData['type'] = 'plane';

    (body as any).threeObject = blockPlane;

    this.ammoObjects.rigidBodies.push(blockPlane);
    return blockPlane;
  }
}
