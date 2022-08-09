import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { VERSION, CONTACT } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  translations: any;
  appVersion: any;
  familyVersion: any;
  contact: any;
  family: any;

  constructor(
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private familyService: FamilyService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    this.appVersion = VERSION;
    this.contact = CONTACT;
    this.translations = this.languageService.getTrans();
    this.familyVersion = '';

    this.familyService.readFamily().then((family:any) => {
      this.family = family;
      this.familyVersion = family.version;
      // console.log('ContactPage - family: ', family);
    });
  }

  ionViewWillEnter() {
    console.log('ContactPage - ionViewWillEnter');
  } 
	
	ionViewWillLeave() {
    console.log('ContactPage - ionViewWillLeave');
	}

  async saveTree() {
		let confirm = await this.alertController.create({
      header: this.translations.TREE_UPDATE_HEADER,
			message: this.translations.TREE_UPDATE_MESSAGE,
      inputs: [
        {
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: this.translations.CANCEL,
          handler: (data: any) => {
          }
        },
        {
          text: this.translations.CONTINUE,
          handler: (data: any) => {
            let text = '--- phan.json --- \n' + JSON.stringify(this.family, null, 4);
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
