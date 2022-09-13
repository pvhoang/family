import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AncestorPage } from './ancestor.page';

const routes: Routes = [
  {
    path: '',
    component: AncestorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AncestorPageRoutingModule {}
