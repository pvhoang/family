import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { SettingPage } from './setting/setting.page';
import { VERSION, CONTACT, ANCESTOR } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  title: any = '';
  contact: any = '';
  family: any;

  constructor(
    private alertController: AlertController,
    public modalCtrl: ModalController,
    private firebaseService: FirebaseService,
    private familyService: FamilyService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    let ancestor = ANCESTOR;
    this.familyService.readFamily(ancestor).then((family:any) => {
      this.family = family;
      let ancestorText = this.languageService.getTranslation(ancestor);
      console.log('ContactPage - ngOnInit - setting: ', ancestorText);
      this.title = ancestorText.tree + ' - ' + VERSION + ' - ' + family.version;
      this.contact = CONTACT[ancestor].name + ' - ' + CONTACT[ancestor].email;
    });
  }

  ionViewWillEnter() {
    console.log('ContactPage - ionViewWillEnter');
  } 
	
	ionViewWillLeave() {
    console.log('ContactPage - ionViewWillLeave');
	}

  async onSetting() {
    this.familyService.readSetting().then((setting:any) => {
      console.log('ContactPage - onSetting - setting: ', setting);

      this.openSettingModal(setting);
    });
  }

  async openSettingModal(setting) {
    console.log('ContactPage - openSettingModal');

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
        if (setting.ancestor != values.ancestor) {
          setting.ancestor = values.ancestor;
          this.familyService.saveSetting(setting);
        }
      }
    });
    return await modal.present();
  }
  
  async saveTree() {
		let confirm = await this.alertController.create({
      header: this.languageService.getTranslation('TREE_UPDATE_HEADER'),
			message: this.languageService.getTranslation('TREE_UPDATE_MESSAGE'),
      inputs: [
        {
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: this.languageService.getTranslation('CANCEL'),
          handler: (data: any) => {
          }
        },
        {
          text: this.languageService.getTranslation('CONTINUE'),
          handler: (data: any) => {
            let ancestor = this.family.ancestor;
            let text = '--- ' + ancestor + '.json --- \n' + JSON.stringify(this.family, null, 4);
            text += '\n';
            let id = this.getContentID();
            let email = data[0];
            this.firebaseService.saveContent({
              id: id,
              email: email,
              to: 'pvhoang940@gmail.com',
              message: {
                subject: 'Gia Pha - ' + id + ' - ' + email,
                text: text,
              }
            });
            // });
          }
        }
      ]
    });
    confirm.present();
	}

  getContentID() {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
		let hour = ''+d.getHours();		if (hour.length < 2) hour = '0' + hour;
		let min = ''+d.getMinutes();		if (min.length < 2) min = '0' + min;
		const id = ''+day+'-'+month+'-'+year+'_'+hour+'-'+min;
		return id;
  }

}
