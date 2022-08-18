import { Component } from '@angular/core';
import { FamilyService } from './services/family.service';
// import { SETTING, ANCESTOR } from '../environments/environment';
import { ANCESTOR } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private familyService: FamilyService,
  ) {
    console.log('AppComponent - ANCESTOR: ', ANCESTOR);
    this.initializeApp();
  }

  initializeApp() {
    this.familyService.startFamily().then(status => {});
    // this.familyService.deleteSetting();
    // this.familyService.deleteSetting();
  }
}