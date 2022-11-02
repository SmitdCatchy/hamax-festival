import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

const importsAndExports = [
  MatButtonModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
  MatSnackBarModule
];

@NgModule({
  imports: [...importsAndExports],
  exports: [...importsAndExports]
})
export class MaterialModule {}
