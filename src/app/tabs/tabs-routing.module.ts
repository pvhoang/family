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
        loadChildren: () => import('../home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tree/tree.module').then( m => m.TreePageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../archive/archive.module').then( m => m.ArchivePageModule)
      },
      {
        path: 'tab4',
        loadChildren: () => import('../contact/contact.module').then( m => m.ContactPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
