import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingPage } from './setting.page';

const routes: Routes = [
  {
    path: '',
    component: SettingPage
  },
  {
    path: 'ancestor',
    loadChildren: () => import('../ancestor/ancestor.module').then( m => m.AncestorPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingPageRoutingModule {}
