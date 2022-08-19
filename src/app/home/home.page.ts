import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { CONTACT, ANCESTOR } from '../../environments/environment';

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
      console.log('data: ', data);
      if (data) {
        let today = data.today;
        let header = '<pre style="margin-left: 2.0em;">' +
        '<b>Hôm nay (âm lịch)</b>:\t<b>' + today + '</b>' + '<br><br>' +
        '<b>Tên</b>\t\t<b>Đời</b>\t<b>Ngày mất</b>' + '<br>';
        let msg = '';
        data.persons.forEach(person => {
          msg += person[0] + '\t' + person[1] + '\t' + person[2] + '<br>';
        })
        msg = header + msg + '</pre>';
        this.utilService.alertMsg('MEMORIAL', msg, 'alert-small');
      }
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
}
