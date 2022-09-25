import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    // path: 'tabs',
    path: '',
    // path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'tree',
        loadChildren: () => import('../tree/tree.module').then( m => m.TreePageModule)
      },
      {
        path: 'arch',
        loadChildren: () => import('../archive/archive.module').then( m => m.ArchivePageModule)
      },
      {
        path: 'info',
        loadChildren: () => import('../contact/contact.module').then( m => m.ContactPageModule)
      }
    ]
  }
  // {
  //   path: '',
  //   redirectTo: '/tabs/home',
  //   // redirectTo: '../tab1',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
