import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { FirebaseService } from '../services/firebase.service';
import { DataService } from '../services/data.service';
import { Family, FAMILY} from '../services/family.model';

declare var ancestor;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  title: any = '';
  // family:Family = Object.create(FAMILY);
  compareResults: any[] = [];
  compareMode: any = false;
  contResults: any[] = [];
  contMode: any = false;
  version: string = '';
  // ancestorInfo: any;
  
  // ancestor: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private familyService: FamilyService,
    private utilService: UtilService,
    private dataService: DataService,
    private languageService: LanguageService,
    private fbService: FirebaseService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    this.dataService.readFamily().then((family:any) => {
    // this.dataService.readItem('ANCESTOR').then((data:any) => {
      // let data = this.dataService.readAncestor();
      let version = family.version;
      // this.family = family;
      // console.log('ContactPage - ngOnInit -  ', family);
      // this.ancestorInfo = data;
      this.familyService.getSourceFamilyVersion().then((srcVersion:any) => {
        // console.log('ContactPage - ngOnInit - srcVersion: ', srcVersion);
        this.title = this.languageService.getTranslation('TITLE_TREE') + ' ' + family.info.family_name;
        let msg1 = this.languageService.getTranslation('CONTACT_VERSION_1');
        let msg2 = this.languageService.getTranslation('CONTACT_VERSION_2');
        let msg3 = this.languageService.getTranslation('CONTACT_VERSION_3');
        this.version = msg1 + version + ' - ' + msg2 + srcVersion + ' - ' + msg3 + family.version;
        this.fbService.readDocument(ancestor, 'contribution').subscribe((res:any) => {
          let d = JSON.parse(res.data);
          let data = d.data;
          this.contResults = this.getContribution(data);
        });
      });
    });
    // });
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
      if (res.data) {
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
    this.dataService.readFamily().then((localFamily:any) => {
      this.fbService.readDocument(ancestor, 'family').subscribe((res:any) => {
        let srcFamily = JSON.parse(res.data);
        srcFamily.info = localFamily.info;
        this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
      });
    });

    // this.dataService.readFamily().then((localFamily:any) => {
    //   let ancestor = localFamily.info.ancestor;
    //   let jsonFile = './assets/data/' + ancestor + '-family.json';
    //   console.log('jsonFile: ', jsonFile);
    //   this.utilService.getLocalJsonFile(jsonFile).then((srcFamily:any) => {
    //     this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
    //   });
    // });
  }

  async saveTree() {

    // evaluate difference
    this.dataService.readFamily().then((localFamily:any) => {
      this.fbService.readDocument(ancestor, 'family').subscribe((res:any) => {
        let srcFamily = JSON.parse(res.data);
        // srcFamily.info = localFamily.info;
        let compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
        // let compareResults = this.familyService.compareFamilies(srcFamily, localFamily);

        if (compareResults.length == 0) {
          this.utilService.alertMsg('ANNOUNCE', 'CONTACT_SEND_NO_CHANGE_MSG');
          return;
        }
        console.log('saveTree - compareResults:' , compareResults)
        // console.log('saveTree - ancestorInfo:' , this.family)
        // remove info before send

        let msg = this.languageService.getTranslation('CONTACT_SEND_HEADER_MSG') + '[' + compareResults.length + ']';
        this.utilService.alertSendTree('CONTACT_SEND_HEADER', msg, 'CONTACT_SEND_INFO_PLACEHOLDER', 'CANCEL', 'OK').then((res) => {
          console.log('alertSendTree - res:' , res)
          if (!res.data)
            return;
          let email = localFamily.info.email;
          // reset info in family
          localFamily.info = {};
          let info = res.data.info;
          let text = JSON.stringify(localFamily, null, 4);
          let id = this.utilService.getDateID(true);
          let shortInfo = (info.length < 20) ? info : info.substring(0, 20);
          this.firebaseService.saveContent({
            id: id,
            info: info,
            to: email,
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
}
