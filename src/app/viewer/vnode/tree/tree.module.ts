import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FamilyTreeModule } from '../../../components/family-tree/family-tree.module';
import { TranslateModule } from '@ngx-translate/core';

import { PinchZoomModule } from '../../../components/pinch-zoom/pinch-zoom.module';
import { TreePageRoutingModule } from './tree-routing.module';

import { TreePage } from './tree.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FamilyTreeModule,
		PinchZoomModule,
    TranslateModule,
    TreePageRoutingModule
  ],
  declarations: [TreePage]
})
export class TreePageModule {}
