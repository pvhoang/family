import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { HomePageRoutingModule } from './home-routing.module';
import { KeepHtmlPipe } from '../services/sanitize-html.pipe';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    KeepHtmlPipe
  ]
})
export class HomePageModule {}
