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
    path: 'node',
    loadChildren: () => import('./editor/node/node.module').then( m => m.NodePageModule)
  },
	{
    path: 'edit',
    loadChildren: () => import('./editor/node/edit/edit.module').then( m => m.EditPageModule)
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
    path: 'doc',
    loadChildren: () => import('./viewer/doc/doc.module').then( m => m.DocPageModule)
  },
  {
    path: 'tree',
    loadChildren: () => import('./viewer/vnode/tree/tree.module').then( m => m.TreePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./viewer/search/search.module').then( m => m.SearchPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
