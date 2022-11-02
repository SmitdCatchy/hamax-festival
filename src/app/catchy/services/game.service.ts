import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class CatchyGameService {
  private _gameState!: any;
  private _gameStateChanged!: Subject<undefined>;

  constructor() {
    this.initializeGameState();
    console.log(this._gameState);
  }

  private initializeGameState(): void {
    this._gameStateChanged = new Subject();
    this._gameState = {
      asd: 'asd'
    };
    this._gameStateChanged.next(undefined);
  }
}
