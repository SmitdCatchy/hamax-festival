import Ammo from "ammojs-typed";
import { Scene } from "three";

export interface AmmoGameEngineObjects {
    physicsWorld: Ammo.btDiscreteDynamicsWorld;
    tmpTrans: Ammo.btTransform;
    tmpVec: Ammo.btVector3;
    Ammo: typeof Ammo;
    rigidBodies: any[];
}