import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  //   // loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
  // {
  //   path: 'admin/:mode',
  //   loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  // },
  // {
  //   path: 'admin1',
  //   loadChildren: () => import('./admin-1/admin.module').then( m => m.AdminPageModule)
  // },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: ':mode',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  // {
  //   path: 'test/:mode',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  //   // loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  // },
  // {
  //   path: 'admin5/:mode',
  //   loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  // },
  {
    path: 'admin/:mode',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
