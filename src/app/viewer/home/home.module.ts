import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomePage } from './home.page';
// import { PersonPage } from '../person/person.page';
// import { NodePage } from '../node/vnode.page';

import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    FamilyTreeModule,
    HomePageRoutingModule
  ],
  // declarations: [HomePage, VnodePage, PersonPage]
  declarations: [HomePage]
})
export class HomePageModule {}
