import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  // {
  //   path: 'admin/:mode',
  //   loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  // },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
