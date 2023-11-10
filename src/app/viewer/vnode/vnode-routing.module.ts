import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VnodePage } from './vnode.page';

const routes: Routes = [
  {
    path: '',
    component: VnodePage
  },
  {
    path: 'tree',
    loadChildren: () => import('./tree/tree.module').then( m => m.TreePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VnodePageRoutingModule {}
