import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HilitePage } from './hilite.page';

const routes: Routes = [
  {
    path: '',
    component: HilitePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HilitePageRoutingModule {}
