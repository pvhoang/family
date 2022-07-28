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
        // loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
        loadChildren: () => import('../tree/tree.module').then( m => m.TreePageModule)
      },
      {
        path: 'tab2',
        // loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
        loadChildren: () => import('../info/info.module').then( m => m.InfoPageModule)
      },
      {
        path: 'tab3',
        // loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
        loadChildren: () => import('../contact/contact.module').then( m => m.ContactPageModule)
      },

      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      },
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
