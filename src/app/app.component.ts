import { Component } from '@angular/core';
import { FamilyService } from './services/family.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private familyService: FamilyService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // const id = '30-07-2022_09-26';
    // const id = 'phan';
    // this.familyService.loadFamily('phan');
    // this.familyService.deleteFamily();
    // this.familyService.loadFamily2();
  }

  
}