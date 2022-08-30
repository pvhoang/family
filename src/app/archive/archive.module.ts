import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchivePageRoutingModule } from './archive-routing.module';

import { ArchivePage } from './archive.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    TranslateModule,
    ArchivePageRoutingModule
  ],
  providers: [
    InAppBrowser,
  ],
  declarations: [ArchivePage]
})
export class ArchivePageModule {}
