import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':mode',
    loadChildren: () => import('./viewer/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: ':ancestor/:admin_code',
    loadChildren: () => import('./editor/filer/filer.module').then(m => m.FilerPageModule)
    // loadChildren: () => import('./editor/tabs/tabs.module').then(m => m.TabsPageModule)
  },
	{
    path: 'filer',
    loadChildren: () => import('./editor/filer/filer.module').then( m => m.FilerPageModule)
  },
  {
    path: 'person',
    loadChildren: () => import('./viewer/person/person.module').then( m => m.PersonPageModule)
  },
  {
    path: 'vnode',
    loadChildren: () => import('./viewer/vnode/vnode.module').then( m => m.VnodePageModule)
  },
  {
    path: 'tree',
    loadChildren: () => import('./viewer/vnode/tree/tree.module').then( m => m.TreePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
