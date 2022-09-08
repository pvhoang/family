import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../setting/setting.module').then( m => m.SettingPageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../editor/editor.module').then( m => m.EditorPageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../file/file.module').then( m => m.FilePageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/admin/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
