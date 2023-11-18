import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'node',
        loadChildren: () => import('../node/node.module').then( m => m.NodePageModule)
      },
      {
        path: 'branch',
        loadChildren: () => import('../branch/branch.module').then( m => m.BranchPageModule)
      },
      {
        path: 'doc',
        loadChildren: () => import('../doc/doc.module').then( m => m.DocPageModule)
      },
      {
        path: 'file',
        loadChildren: () => import('../file/file.module').then( m => m.FilePageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
