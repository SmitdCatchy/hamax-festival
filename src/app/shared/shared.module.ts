import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { HeaderComponent } from './components/header/header.component';
import { ClickSoundDirective } from './directives/click-sound.directive';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

const declarationsAndExports = [HeaderComponent, ClickSoundDirective, ConfirmDialogComponent];
const importsAndExports = [MaterialModule, TranslateModule];

@NgModule({
  declarations: [...declarationsAndExports],
  imports: [...importsAndExports, CommonModule],
  exports: [...declarationsAndExports, ...importsAndExports]
})
export class SharedModule {}
