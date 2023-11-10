import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TranslateModule } from '@ngx-translate/core';

import { CropperModalPageRoutingModule } from './cropper-modal-routing.module';

import { CropperModalPage } from './cropper-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ImageCropperModule,
    CropperModalPageRoutingModule
  ],
  declarations: [CropperModalPage]
})
export class CropperModalPageModule {}
