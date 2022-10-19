import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { NgFamilyTreeModule } from '../tree/ng-family-tree/ng-family-tree.module';

import { HilitePageRoutingModule } from './hilite-routing.module';

import { HilitePage } from './hilite.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    TranslateModule,
    NgFamilyTreeModule,
    HilitePageRoutingModule
  ],
  declarations: [HilitePage]
})
export class HilitePageModule {}
