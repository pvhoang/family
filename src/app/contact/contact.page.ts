import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';

const VERSION = '0.0.1';
const CONTACT = 'Phan Viết Hoàng - pvhoang940@gmail.com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  // filterFamily: any;
  translations: any;
  version: any;
  contact: any;
  
  constructor(
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
            this.familyService.readFamily().then(family => {
              let nodes = this.familyService.getNodes(family);
              this.utilService.savePeoplePlacesJSON(nodes);
              this.familyService.printFamily(family);
              // this.firebaseService.saveContent({ email: data['0'], text: JSON.stringify(family) });
            });
          }
        }
      ]
    });
    confirm.present();
	}

}
