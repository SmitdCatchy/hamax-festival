import Ammo from 'ammojs-typed';
import { Mesh, Object3D } from 'three';
import { WorldObject } from './world-object.model';

export interface CharacterState {
  animationState: string;
  info: any;
}

export class Character extends WorldObject {
  constructor(
    mesh: Object3D | Mesh,
    rigidBody: Ammo.btRigidBody,
    private state: CharacterState,
    type: string = 'Character'
  ) {
    super(mesh, rigidBody, type);
  }

  public get animation(): string {
    return this.state.animationState;
  }

  public set animation(animation: string) {
    this.state.animationState = animation;
  }

  public get info(): any {
    return this.state.info;
  }

  public set info(info: any) {
    this.state.info = info;
  }
}
