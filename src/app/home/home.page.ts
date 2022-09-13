import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
import { FirebaseService } from '../services/firebase.service';

const BLUE_PRIMARY = '#3880ff';
const RED = '#C10100';
const YELLOW = '#FFFF00';
const ORANGE = '#ffc409';
const WHITE = '#FFFFFF';
const GREY = '#808080';

declare var ancestor;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  title: any = '';
  language = 'VI';
  introStr: string = '';
  guideStr: string = '';
  colorStyle: number = 1;

  constructor(
    public modalCtrl: ModalController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private dataService: DataService,
    private fbService: FirebaseService,
  ) { }

  ngOnInit() {
    console.log('HomePage - ngOnInit');
    this.familyService.startFamily().then(status => {
    this.dataService.readFamily().then((family:any) => {
      // console.log('HomePage - ngOnInit - family: ', family);
      this.title = this.languageService.getTranslation('HOME_HEADER_TITLE') + ' ' + family.info.family_name;
      // this.tooltipMemorial = this.languageService.getTranslation('HOME_HEADER_TOOLTIP_MEMORIAL') + ' ' + family.info.family_name;
      
      const guideFile = './assets/common/' + this.language.toLowerCase() + '-guide.txt';
      this.utilService.getLocalTextFile(guideFile).then(html => {
        this.guideStr = html;
        // console.log('HomePage - ngOnInit - this.guideStr: ', this.guideStr);
      });
      const introFile = './assets/' + ancestor + '/' + this.language.toLowerCase() + '-intro.txt';
      this.utilService.getLocalTextFile(introFile).then((html:any) => {
        // let lang = this.language.toLowerCase();
        // this.introStr = res[lang];
        this.introStr = html;
        // console.log('HomePage - ngOnInit - this.introStr: ', this.introStr);
      });

      // const introFile = this.language.toLowerCase() + '-intro.txt';
      // this.fbService.readDocument(ancestor, 'intro').subscribe((res:any) => {
      //   let lang = this.language.toLowerCase();
      //   this.introStr = res[lang];
      // });
    });
    });
  }

  ionViewWillEnter() {
    console.log('HomePage - ionViewWillEnter');
  } 
	
	ionViewWillLeave() {
    console.log('HomePage - ionViewWillLeave');
	}

  onMemorial() {
    this.familyService.passAwayFamily().then((data:any) => {
      // console.log('data: ', data);
      let today = data.today;
      let bullet = '&#8226;&nbsp;';
      let header = '<pre style="margin-left: 2.0em;">' +
      // '<b>' + this.languageService.getTranslation('MEMORIAL_TODAY') +'</b>:\t<b>' + today + '</b>' + '<br><br>';
      '<b>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_TODAY') +'</b>: <b>' + today + '</b>' + '<br><br>';
      let msg = '';
      if (data.persons.length > 0) {
        msg = '<b>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_NAME') + 
        '</b>\t\t<b>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_GENERATION') + 
        '</b>\t<b>' + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_DOD') + '</b>' + '<br>';
        data.persons.forEach(person => {
          msg += person[0] + '\t' + person[1] + '\t' + person[2] + '<br>';
        })
      } else {
        msg = bullet + this.languageService.getTranslation('HOME_ALERT_MEMORIAL_NO_DOD') + '<br><br>';
      }
      msg = header + msg + '</pre>';
      this.utilService.alertMsg('HOME_ALERT_MEMORIAL_HEADER', msg, 'alert-small');
    });
  }

  onLanguage() {
    if (this.language == 'VI') {
      this.language = 'EN';
    } else {
      this.language = 'VI'
    }

    this.languageService.setLanguage(this.language.toLowerCase());

    const guideFile = './assets/common/' + this.language.toLowerCase() + '-guide.txt';
    this.utilService.getLocalTextFile(guideFile).then(html => {
      this.guideStr = html;
    });
    const introFile = './assets/' + ancestor + '/' + this.language.toLowerCase() + '-intro.txt';
    this.utilService.getLocalTextFile(introFile).then((html:any) => {
      this.introStr = html;
    });

    // this.utilService.getLocalTextFile('./assets/data/' + this.language.toLowerCase() + '-guide.txt').then(html => {
    //   this.guideStr = html;
    // });
    // this.utilService.getLocalTextFile('./assets/data/' + ancestor + '-' + this.language.toLowerCase() + '-intro.txt').then(text => {
    //   this.introStr = text;
    // });
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
