import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PinchZoomModule } from '../../components/pinch-zoom/pinch-zoom.module';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
// import { PopoverComponent } from '../../components/popover/popover.component';

import { NodePageRoutingModule } from './node-routing.module';

import { NodePage } from './node.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    FamilyTreeModule,
		PinchZoomModule,
    TranslateModule,
    NodePageRoutingModule
  ],
  // declarations: [NodePage, PopoverComponent]
  declarations: [NodePage]
})
export class NodePageModule {}
