import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const importsAndExports = [MatButtonModule, MatTooltipModule, MatSnackBarModule];

@NgModule({
  imports: [...importsAndExports],
  exports: [...importsAndExports]
})
export class MaterialModule {}
