import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'editor',
    loadChildren: () => import('./editor/editor.module').then( m => m.EditorPageModule)
  },
  {
    path: 'file',
    loadChildren: () => import('./file/file.module').then( m => m.FilePageModule)
  }
  // {
  //   path: 'tab2',
  //   loadChildren: () => import('../editor/editor.module').then( m => m.EditorPageModule)
  // },
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  // }
  // {
  //   path: 'ancestor',
  //   loadChildren: () => import('./ancestor/ancestor.module').then( m => m.AncestorPageModule)
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
