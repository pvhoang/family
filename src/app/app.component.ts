import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FamilyService } from './services/family.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    public platform: Platform,
    private familyService: FamilyService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // this.familyService.deleteSetting();
    // phablet: small smartphone, !phablet: tablet, laptop
    environment.phabletDevice = this.platform.is('phablet');
    console.log('platform: ', this.platform.platforms());
    
    // let plt = this.platform.platforms();
    // this.detail1 = plt.join(',');
    // if (this.platform.is('hybrid')) {
    // // }
  }
}