import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./viewer/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: ':mode',
    loadChildren: () => import('./editor/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: ':mode1/:mode2',
    loadChildren: () => import('./editor/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'node',
    loadChildren: () => import('./editor/node/node.module').then( m => m.NodePageModule)
  },
  {
    path: 'doc',
    loadChildren: () => import('./editor/doc/doc.module').then( m => m.DocPageModule)
  },
  {
    path: 'file',
    loadChildren: () => import('./editor/file/file.module').then( m => m.FilePageModule)
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
