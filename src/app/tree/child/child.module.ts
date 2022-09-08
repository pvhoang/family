import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { IonicModule } from '@ionic/angular';

import { ChildPageRoutingModule } from './child-routing.module';

import { ChildPage } from './child.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    ChildPageRoutingModule
  ],
  declarations: [ChildPage]
})
export class ChildPageModule {}
