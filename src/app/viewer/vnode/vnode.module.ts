import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { PinchZoomModule } from '../../components/pinch-zoom/pinch-zoom.module';

import { VnodePageRoutingModule } from './vnode-routing.module';
import { VnodePage } from './vnode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
		PinchZoomModule,
    FamilyTreeModule,
    TranslateModule,
    VnodePageRoutingModule
  ],
  declarations: [VnodePage]
})
export class VnodePageModule {}
