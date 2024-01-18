import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PinchZoomModule } from '../../components/pinch-zoom/pinch-zoom.module';
import { FamilyTreeModule } from '../../components/family-tree/family-tree.module';
import { PersonPageRoutingModule } from './person-routing.module';
import { PersonPage } from './person.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
		PinchZoomModule,
    FamilyTreeModule,
    TranslateModule,
    PersonPageRoutingModule
  ],
  declarations: [PersonPage]
})
export class PersonPageModule {}
