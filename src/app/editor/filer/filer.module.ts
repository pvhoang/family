import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FilerPageRoutingModule } from './filer-routing.module';
import { FilerPage } from './filer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    FilerPageRoutingModule
  ],
  declarations: [FilerPage]
})
export class FilerPageModule {}