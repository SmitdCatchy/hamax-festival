import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { GameRoutingModule } from './game-routing.module';
import { GameHudComponent } from './game-hud/game-hud.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [GameScreenComponent, GameHudComponent],
  imports: [CommonModule, GameRoutingModule, SharedModule]
})
export class CatchyGameModule {}
