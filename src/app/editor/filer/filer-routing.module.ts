import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilerPage } from './filer.page';

const routes: Routes = [
  {
    path: '',
    component: FilerPage
  },
  {
    path: 'cropper-modal',
    loadChildren: () => import('./cropper-modal/cropper-modal.module').then( m => m.CropperModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilerPageRoutingModule {}
