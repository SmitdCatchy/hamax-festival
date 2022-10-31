import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuModule)
  },
  {
    path: 'game',
    loadChildren: () => import('./game/game.module').then(m => m.GameModule)
  },
  {
    path: 'adam-longer',
    loadChildren: () => import('./adam-longer/game.module').then(m => m.AdamLongerGameModule)
  },
  {
    path: 'caspien',
    loadChildren: () => import('./caspien/game.module').then(m => m.CaspienGameModule)
  },
  {
    path: 'catchy',
    loadChildren: () => import('./catchy/game.module').then(m => m.CatchyGameModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
