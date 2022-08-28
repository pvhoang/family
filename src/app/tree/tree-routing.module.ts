import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreePage } from './tree.page';

const routes: Routes = [
  {
    path: '',
    component: TreePage
  },
  {
    path: 'node',
    loadChildren: () => import('./node/node.module').then( m => m.NodePageModule)
  },
  {
    path: 'child',
    loadChildren: () => import('./child/child.module').then( m => m.ChildPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreePageRoutingModule {}
