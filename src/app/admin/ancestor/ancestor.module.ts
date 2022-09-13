import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { IonicModule } from '@ionic/angular';
import { AncestorPageRoutingModule } from './ancestor-routing.module';
import { AncestorPage } from './ancestor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    AncestorPageRoutingModule
  ],
  declarations: [AncestorPage]
})
export class AncestorPageModule {}

