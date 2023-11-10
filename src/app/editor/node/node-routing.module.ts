import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NodePage } from './node.page';

const routes: Routes = [
  {
    path: '',
    component: NodePage
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then( m => m.EditPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NodePageRoutingModule {}
