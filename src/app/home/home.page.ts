import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
import { FirebaseService } from '../services/firebase.service';
import { environment, FONTS_FOLDER, DEBUG_HOME } from '../../environments/environment';

const ORANGE = '#fee8b9';
const BLUE_PRIMARY = '#063970';
const WHITE = '#FFFFFF';
const GREY = '#808080';
const RED = '#C10100';
const YELLOW = '#FFFF00';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  language = 'VI';
  introStr: string = '';
  guideStr: string = '';
  colorStyle: number = 1;
  ancestor: string = '';
  introMode = false;
  guideMode = false;
  guideCol1 = 2;
  guideCol2 = 10;

  constructor(
    public modalCtrl: ModalController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private dataService: DataService,
    private fbService: FirebaseService,
  ) { }

  ngOnInit() {
    if (DEBUG_HOME)
      console.log('HomePage - ngOnInit');
    this.familyService.startFamily().then(status => {
      this.dataService.readFamily().then((family:any) => {
        console.log('HomePage - ngOnInit - family: ', family);
        this.title = family.info.description;
        this.ancestor = family.info.id;
        this.start();
      });
    });
  }

  ionViewWillEnter() {
    if (DEBUG_HOME)
      console.log('HomePage - ionViewWillEnter');
    this.start();
  } 
	
	ionViewWillLeave() {
    if (DEBUG_HOME)
      console.log('HomePage - ionViewWillLeave');
	}

  start() {
    this.setGuide();
    if (environment.phabletDevice) {
      this.guideCol1 = 4;
      this.guideCol2 = 8;
    }
    this.introMode = false;
    this.guideMode = false;
  }

  onMemorial() {
    this.familyService.passAwayFamily().then((data:any) => {
      if (DEBUG_HOME)
        console.log('HomePage - onMemorial - data: ', data);
      let today = data.today;
      let header =
      '<b>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_TODAY') + '</b>: &emsp;' + today + '<br/><br/>';
      let msg = '';
      if (data.persons.length > 0) {
        msg = '<i>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_NAME') + 
        '</i>\t\t\t<i>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_DOD') + '</i>' + '<br/>';
        data.persons.forEach(person => {
          let str = '';
          // check number of words in name
          let words = person[0].split(' ');
          if (words.length > 3) {
            str = person[0] + '\t' + person[1]
          } else {
            str = person[0] + '\t\t' + person[1];
          }
          msg += str + '<br/>';
        })
      } else {
        msg = this.languageService.getTranslation('HOME_ALERT_MEMORIAL_NO_DOD');
      }
      msg += '<br/><br/>';
      msg = header + msg;
      this.utilService.alertMsg('HOME_ALERT_MEMORIAL_HEADER', msg, 'alert-small');
    });
  }

  onIntro() {
    this.introMode = (this.introMode) ? false : true;
  }

  onGuide() {
    this.guideMode = (this.guideMode) ? false : true;
  }

  onLanguage() {
    if (this.language == 'VI') {
      this.language = 'EN';
    } else {
      this.language = 'VI'
    }
    this.languageService.setLanguage(this.language.toLowerCase());
    this.setGuide();
  }

  setGuide() {
    const guideFile = './assets/common/' + this.language.toLowerCase() + '-guide.txt';
    this.utilService.getLocalTextFile(guideFile).then(html => {
      this.guideStr = html;
    });
    this.fbService.readJsonDocument(this.ancestor, 'introduction').subscribe((data:any) => {
      this.introStr = data[this.language.toLowerCase()];
    });
  }

  onStyle() {
    let root = document.documentElement;
    if (this.colorStyle == 1) {
      this.colorStyle = 2;
      root.style.setProperty('--app-color', ORANGE);
      root.style.setProperty('--app-background-color', BLUE_PRIMARY);
      root.style.setProperty('--ion-color-medium', BLUE_PRIMARY);
    } else if (this.colorStyle == 2) {
      this.colorStyle = 3;
      root.style.setProperty('--app-color', WHITE);
      root.style.setProperty('--app-background-color', GREY);
      root.style.setProperty('--ion-color-medium', GREY);

    } else if (this.colorStyle == 3) {
      this.colorStyle = 1;
      root.style.setProperty('--app-color', YELLOW);
      root.style.setProperty('--app-background-color', RED);
      root.style.setProperty('--ion-color-medium', RED);
    }
  }
}
