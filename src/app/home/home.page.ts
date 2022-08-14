import { Component, OnInit } from '@angular/core';
// import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { Pipe, PipeTransform } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { SettingPage } from './setting/setting.page';

// import { VERSION, CONTACT, ANCESTOR } from '../../environments/environment';
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
  guideStr: SafeHtml = '';

  constructor(
    public modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
  ) { }

  ngOnInit() {
    // console.log('HomePage - ngOnInit');
    let ancestorText = this.languageService.getTranslation(ANCESTOR);
    // console.log('HomePage - ngOnInit - ancestorText: ', ancestorText);
    this.title = ancestorText.tree;
    this.contact = CONTACT[ANCESTOR].name + ' - ' + CONTACT[ANCESTOR].email;
    // this.introStr = this.languageService.getTranslation('HOME_INTRO_CONTENT');

    // this.guideStr = this.languageService.getTranslation('HOME_USER_GUIDE_CONTENT');

    this.utilService.getLocalTextFile('./assets/data/guide.txt').then(html => {
      // this.guideStr = this.sanitizer.bypassSecurityTrustHtml(html);
      // console.log('HomePage - guideStr: ', this.guideStr);
      this.guideStr = html;
      // this.guideStr = '<h1>Hello Angular 14!</h1>';
    });
    
    this.utilService.getLocalTextFile('./assets/data/intro.txt').then(text => {
      // console.log('HomePage - text: ', text);
      this.introStr = text;
    });

  }

  ionViewWillEnter() {
    // console.log('HomePage - ionViewWillEnter');
  } 
	
	ionViewWillLeave() {
    // console.log('HomePage - ionViewWillLeave');
	}

  onLanguage() {
    if (this.language == 'VI') {
      this.language = 'EN';
      // this.languageIcon = '../../assets/icon/usa.png';
    } else {
      this.language = 'VI'
      // this.languageIcon = '../../assets/icon/vietnam.png';
    }
    this.languageService.setLanguage(this.language.toLowerCase());
    this.introStr = this.languageService.getTranslation('HOME_INTRO_CONTENT');
    // this.guideStr = this.languageService.getTranslation('HOME_USER_GUIDE_CONTENT');
  }

  async onSetting() {
    console.log('HomePage - onSetting');
    this.familyService.readSetting().then((setting:any) => {
      console.log('HomePage - onSetting - setting: ', setting);
      this.openSettingModal(setting);
    });
  }

  async openSettingModal(setting:any) {
    const modal = await this.modalCtrl.create({
      component: SettingPage,
      componentProps: {
        'name': 'Setting',
        'setting': setting
      }
    });
    modal.onDidDismiss().then((resp) => {
      console.log('ContactPage - openSettingModal - onDidDismiss : ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        console.log('values: ', resp.data.values);
        let values = resp.data.values;
        if (setting.language != values.language) {
          setting.language = values.language;
          this.languageService.setLanguage(setting.language);
          this.familyService.saveSetting(setting);
        }
      }
    });
    return await modal.present();
  }

}
