import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { PersonPageRoutingModule } from './person-routing.module';
import { PersonPage } from './person.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    FamilyTreeModule,
    TranslateModule,
    EditorModule,
    PersonPageRoutingModule
  ],
	providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ],
  declarations: [PersonPage]
})
export class PersonPageModule {}
