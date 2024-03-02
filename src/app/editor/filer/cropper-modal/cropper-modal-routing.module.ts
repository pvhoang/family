import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CropperModalPage } from './cropper-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CropperModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CropperModalPageRoutingModule {}
