import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgFamilyTreeModule } from './ng-family-tree/ng-family-tree.module';
import { TranslateModule } from '@ngx-translate/core';
import { TreePageRoutingModule } from './tree-routing.module';
import { TreePage } from './tree.page';
import { NgxSmoothScrollModule } from '@eunsatio/ngx-smooth-scroll';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    NgxSmoothScrollModule,
    NgFamilyTreeModule,
    TranslateModule,
    TreePageRoutingModule
  ],
  declarations: [TreePage]
})
export class TreePageModule {}
