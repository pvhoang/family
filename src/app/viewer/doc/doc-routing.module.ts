import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocPage } from './doc.page';

const routes: Routes = [
  {
    path: '',
    component: DocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocPageRoutingModule {}
