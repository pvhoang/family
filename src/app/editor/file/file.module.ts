import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
// import { CropperModalPageModule } from './../node/edit/cropper-modal/cropper-modal.module';

import { FilePageRoutingModule } from './file-routing.module';

import { FilePage } from './file.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    // CropperModalPageModule,
    FilePageRoutingModule
  ],
  declarations: [FilePage]
})
export class FilePageModule {}
