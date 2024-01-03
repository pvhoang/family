import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
// import { CropperModalPageModule } from './cropper-modal/cropper-modal.module';

import { EditPageRoutingModule } from './edit-routing.module';

import { EditPage } from './edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    // CropperModalPageModule,
    EditPageRoutingModule
  ],
  declarations: [EditPage]
})
export class EditPageModule {}
