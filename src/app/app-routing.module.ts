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
  },
<<<<<<< Updated upstream
  // {
  //   path: 'hilite',
  //   loadChildren: () => import('./hilite/hilite.module').then( m => m.HilitePageModule)
  // }
=======
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
>>>>>>> Stashed changes
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
