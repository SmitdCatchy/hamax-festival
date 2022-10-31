import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { HeaderComponent } from './components/header/header.component';
import { ClickSoundDirective } from './directives/click-sound.directive';

const declarationsAndExports = [HeaderComponent, ClickSoundDirective];
const importsAndExports = [MaterialModule];

@NgModule({
  declarations: [...declarationsAndExports],
  imports: [...importsAndExports, CommonModule],
  exports: [...declarationsAndExports, ...importsAndExports]
})
export class SharedModule {}
