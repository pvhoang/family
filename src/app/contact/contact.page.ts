import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';

const VERSION = '0.0.2';
const CONTACT = 'Phan Viết Hoàng - pvhoang940@gmail.com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  translations: any;
  version: any;
  contact: any;
  family: any;

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private familyService: FamilyService,
    private utilService: UtilService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ngOnInit');
    this.version = VERSION;
    this.contact = CONTACT;
    this.translations = this.languageService.getTrans();

    this.familyService.readFamily().then(family => {
      this.family = family;
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
            // console.log('data:' , data );
            // this.familyService.readFamily().then(family => {
              // console.log('family:' , family );
            // this.familyService.printPeople(family);
            // this.familyService.printFamily(family);
              // this.firebaseService.saveContent({ email: data['0'], text: JSON.stringify(family) });
            let id = this.getContentID();
            let email = data[0];
            this.firebaseService.saveContent({
              id: id,
              email: email,
              to: 'pvhoang940@gmail.com',
              message: {
                subject: 'Gia Pha - ' + id + ' - ' + email,
                text: JSON.stringify(this.family),
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
