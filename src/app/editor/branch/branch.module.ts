import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { PopoverComponent } from '../../components/popover/popover.component';

import { BranchPageRoutingModule } from './branch-routing.module';

import { BranchPage } from './branch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    FamilyTreeModule,
    TranslateModule,
    BranchPageRoutingModule
  ],
  declarations: [BranchPage, PopoverComponent]
})
export class BranchPageModule {}
