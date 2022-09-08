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
    // this.familyService.deleteSetting();
  }
}