import { Component } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private dataService: DataService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    const id = '30-07-2022_09-26';
    this.dataService.loadFamily(id);
  }

  
}