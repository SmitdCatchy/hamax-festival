import Ammo from 'ammojs-typed';
import { Mesh, Object3D } from 'three';

export interface RigidBody extends Ammo.btRigidBody {
  userData: any;
}

export class WorldObject {
  constructor(
    private mesh: Object3D | Mesh,
    private rigidBody: Ammo.btRigidBody,
    type: string = 'WorldObject'
  ) {
    mesh.userData['type'] = type;
    mesh.userData['object'] = this;
    (rigidBody as RigidBody).userData = {};
    (rigidBody as RigidBody).userData['type'] = type;
    (rigidBody as RigidBody).userData['object'] = this;
  }

  public get model(): Object3D | Mesh {
    return this.mesh;
  }

  public get physicsBody(): RigidBody {
    return this.rigidBody as RigidBody;
  }
}
