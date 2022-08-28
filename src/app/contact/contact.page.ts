import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { FirebaseService } from '../services/firebase.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { Family, FAMILY} from '../services/family.model';
import { ANCESTOR, VERSION } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  title: any = '';
  family:Family = Object.create(FAMILY);
  compareResults: any[] = [];
  compareMode: any = false;
  contResults: any[] = [];
  contMode: any = false;
  version: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private familyService: FamilyService,
    private utilService: UtilService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    let ancestor = ANCESTOR;
    this.familyService.readFamily().then((family:any) => {
      this.family = family;
      this.familyService.getSourceFamilyVersion().then((srcVersion:any) => {
        let ancestorText = this.languageService.getTranslation(ancestor);
        let msg1 = this.languageService.getTranslation('CONTACT_VERSION_1');
        let msg2 = this.languageService.getTranslation('CONTACT_VERSION_2');
        let msg3 = this.languageService.getTranslation('CONTACT_VERSION_3');
        this.version = msg1 + VERSION + ' - ' + msg2 + srcVersion + ' - ' + msg3 + family.version;
        this.title = ancestorText.tree;
        let jsonFile = './assets/data/' + ANCESTOR + '-contribution.json'
        this.utilService.getLocalJsonFile(jsonFile).then(json => {
          this.contResults = this.getContribution(json.data);
        });
      });
    });
  }

  ionViewWillEnter() {
    console.log('ContactPage - ionViewWillEnter');
    this.compareMode = false;
    this.contMode = false;
  } 
	
	ionViewWillLeave() {
    console.log('ContactPage - ionViewWillLeave');
    this.compareMode = false;
    this.contMode = false;
	}

  onContribution() {
    if (this.contMode) {
      this.contMode = false;
      return;
    }
    this.contMode = true;
  }

  getContribution(data: any) {
    data.forEach((item: any) => {
      let str = '';
      item.detail.forEach((value: any) => {
        str += '&#8226;&ensp;' + value + '<br>';
      })
      item.message = str;
    })
    return data;
  }

  async resetTree() {
    this.utilService.alertConfirm('WARNING', 'CONTACT_RESET_MESSAGE', 'CANCEL', 'OK').then((res) => {
      console.log('resetTree - res:' , res)
      if (res) {
        this.familyService.startSourceFamily().then(status => {});
      }
    });
  }

  async compareTree() {
    if (this.compareMode) {
      this.compareMode = false;
      return;
    }
    this.compareMode = true;
    this.familyService.readFamily().then((localFamily:any) => {
      let jsonFile = './assets/data/' + ANCESTOR + '-family.json';
      console.log('jsonFile: ', jsonFile);
      this.utilService.getLocalJsonFile(jsonFile).then((srcFamily:any) => {
        this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
      });
    });
  }

  async saveTree() {

    // evaluate difference
    this.familyService.readFamily().then((localFamily:any) => {
      let jsonFile = './assets/data/' + ANCESTOR + '-family.json';
      this.utilService.getLocalJsonFile(jsonFile).then((srcFamily:any) => {
        let compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
        if (compareResults.length == 0) {
          this.utilService.alertMsg('ANNOUNCE', 'CONTACT_SEND_NO_CHANGE_MSG'
            // this.languageService.getTranslation('ANNOUNCE'),
            // this.languageService.getTranslation('CONTACT_SEND_NO_CHANGE_MSG')
          );
          return;
        }

        // let header = this.languageService.getTranslation('CONTACT_SEND_HEADER');
        let msg = this.languageService.getTranslation('CONTACT_SEND_HEADER_MSG') + '[' + compareResults.length + ']';
        // let texts = [
        //   this.languageService.getTranslation('CONTACT_SEND_INFO_PLACEHOLDER'),
        //   this.languageService.getTranslation('CANCEL'),
        //   this.languageService.getTranslation('OK')
        // ]
        this.utilService.alertSendTree('CONTACT_SEND_HEADER', msg, 'CONTACT_SEND_INFO_PLACEHOLDER', 'CANCEL', 'OK').then((res) => {
        // this.utilService.alertSendTree(header, msg, texts).then((res) => {
          console.log('alertSendTree - res:' , res)
          if (!res.data)
            return;
          let info = res.data.info;
          let text = '--- ' + ANCESTOR + '-family.json --- \n' + JSON.stringify(this.family, null, 4);
          text += '\n';
          let id = this.getContentID();
          let shortInfo = (info.length < 20) ? info : info.substring(0, 20);
          this.firebaseService.saveContent({
            id: id,
            info: info,
            to: 'pvhoang940@gmail.com',
            message: {
              subject: 'Gia Pha - ' + id + ' - ' + shortInfo,
              text: text,
            }
          });
          let header = this.languageService.getTranslation('ANNOUNCE');
          let message = this.languageService.getTranslation('CONTACT_SEND_ANSWER');
          let okText = this.languageService.getTranslation('OK');
          this.utilService.presentToastWait(header, message, okText);
        })
      });
    });
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
