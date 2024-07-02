import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgJsonEditorModule } from '../../components/jsoneditor/jsoneditor.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FilerPageRoutingModule } from './filer-routing.module';
import { FilerPage } from './filer.page';

@NgModule({
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
		NgJsonEditorModule,
		ReactiveFormsModule,
    FilerPageRoutingModule
  ],
  declarations: [FilerPage]
})
export class FilerPageModule {}