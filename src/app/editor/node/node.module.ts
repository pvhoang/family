import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { PopoverComponent } from '../../components/popover/popover.component';

import { NodePageRoutingModule } from './node-routing.module';

import { NodePage } from './node.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    FamilyTreeModule,
    TranslateModule,
    NodePageRoutingModule
  ],
  declarations: [NodePage, PopoverComponent]
})
export class NodePageModule {}
