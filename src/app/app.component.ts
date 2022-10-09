import { Component, OnInit,  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment, DEBUG} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  ancestor:any = '';

  constructor(
    public platform: Platform,
  ) {
    if (DEBUG)
      console.log('AppComponent - constructor');
    this.initializeApp();
  }

  async ngOnInit(): Promise<any> {

    if (DEBUG)
      console.log('AppComponent - ngOnInit');

    let strings = window.location.href.split(window.location.host);
    let url = strings[strings.length-1];
    if (DEBUG)
      console.log('AppComponent - url2: ', url);
    let params = url.split('/');
    this.ancestor = params[1];
  }

  initializeApp() {
    environment.phabletDevice = this.platform.is('phablet');
  }
}