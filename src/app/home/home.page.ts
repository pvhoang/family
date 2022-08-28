import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { CONTACT, ANCESTOR } from '../../environments/environment';

const BLUE_PRIMARY = '#3880ff';
const RED = '#C10100';
const YELLOW = '#FFFF00';
const ORANGE = '#ffc409';
const WHITE = '#FFFFFF';
const GREY = '#808080';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  title: any = '';
  contact: any = '';
  language = 'VI';
  introStr: string = '';
  guideStr: string = '';
  colorStyle: number = 1;

  constructor(
    public modalCtrl: ModalController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
  ) { }

  ngOnInit() {
    console.log('HomePage - ngOnInit');
    let ancestorText = this.languageService.getTranslation(ANCESTOR);
    this.title = ancestorText.tree;
    this.contact = CONTACT[ANCESTOR].name + ' - ' + CONTACT[ANCESTOR].email;
    this.utilService.getLocalTextFile('./assets/data/' + this.language.toLowerCase() + '-guide.txt').then(html => {
      this.guideStr = html;
    });
    this.utilService.getLocalTextFile('./assets/data/' + ANCESTOR + '-' + this.language.toLowerCase() + '-intro.txt').then(text => {
      this.introStr = text;
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
      '<b>' + this.languageService.getTranslation('MEMORIAL_TODAY') +'</b>: <b>' + today + '</b>' + '<br><br>';
      let msg = '';
      if (data.persons.length > 0) {
        msg = '<b>' + this.languageService.getTranslation('MEMORIAL_NAME') + 
        '</b>\t\t<b>' + this.languageService.getTranslation('MEMORIAL_GEN') + 
        '</b>\t<b>' + this.languageService.getTranslation('MEMORIAL_DOD') + '</b>' + '<br>';
        data.persons.forEach(person => {
          msg += person[0] + '\t' + person[1] + '\t' + person[2] + '<br>';
        })
      } else {
        msg = bullet + this.languageService.getTranslation('MEMORIAL_NO_DOD') + '<br><br>';
      }
      msg = header + msg + '</pre>';
      this.utilService.alertMsg('MEMORIAL_HEADER', msg, 'alert-small');
    });
  }

  onLanguage() {
    if (this.language == 'VI') {
      this.language = 'EN';
    } else {
      this.language = 'VI'
    }
    this.languageService.setLanguage(this.language.toLowerCase());
    this.utilService.getLocalTextFile('./assets/data/' + this.language.toLowerCase() + '-guide.txt').then(html => {
      this.guideStr = html;
    });
    this.utilService.getLocalTextFile('./assets/data/' + ANCESTOR + '-' + this.language.toLowerCase() + '-intro.txt').then(text => {
      this.introStr = text;
    });
  }

  onStyle() {
    let root = document.documentElement;

    // let app_color = root.style.getPropertyValue('--app-color');
    // let app_background_color = root.style.getPropertyValue('--app-background-color');
    // console.log('colors: ', this.colorStyle);
    // console.log('colors: ', app_color, app_background_color);

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
