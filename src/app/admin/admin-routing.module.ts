import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('./editor/editor.module').then( m => m.EditorPageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('./file/file.module').then( m => m.FilePageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/admin/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
