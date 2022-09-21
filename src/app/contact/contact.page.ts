import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { FirebaseService } from '../services/firebase.service';
import { DataService } from '../services/data.service';
import { NodeService } from '../services/node.service';
// import { Family, FAMILY} from '../services/family.model';
import { VERSION } from '../../environments/environment';



declare var ancestor;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  title: any = '';
  compareResults: any[] = [];
  compareMode: any = false;
  contResults: any[] = [];
  contMode: any = false;
  versionResults: any[] = [];
  versionMode: any = false;
  version: string = '';
  summary: string = '';

  constructor(
    private fbService: FirebaseService,
    private familyService: FamilyService,
    private utilService: UtilService,
    private dataService: DataService,
    private nodeService: NodeService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    this.dataService.readFamily().then((family:any) => {
      // let version = family.version;
      this.familyService.getSourceFamilyVersion().then((srcVersion:any) => {
        // console.log('ContactPage - ngOnInit - srcVersion: ', srcVersion);
        this.title = this.languageService.getTranslation('CONTACT_HEADER_TITLE') + ' ' + family.info.family_name;
        
        // let msg1 = this.languageService.getTranslation('CONTACT_VERSION_1');
        // let msg2 = this.languageService.getTranslation('CONTACT_VERSION_2');
        // let msg3 = this.languageService.getTranslation('CONTACT_VERSION_3');
        // this.version = msg1 + version + ' - ' + msg2 + srcVersion + ' - ' + msg3 + family.version;
        // this.summary = this.getSummary(family);
        this.versionResults = this.getVersion(family, srcVersion);
        this.dataService.readLocalJson(ancestor, 'contribution').then((data:any) => {
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

  getVersion(family: any, srcVersion):any {
    let nodes = this.nodeService.getFamilyNodes(family);
    // console.log('ContactPage - getSummary - nodes: ', nodes[0]);
    let results = [];
    results.push({item: this.languageService.getTranslation('CONTACT_VERSION_APP'), data: VERSION});
    results.push({item: this.languageService.getTranslation('CONTACT_VERSION_SRC_TREE'), data: srcVersion});
    results.push({item: this.languageService.getTranslation('CONTACT_VERSION_EDIT_TREE'), data: family.version});
    results.push({item: this.languageService.getTranslation('CONTACT_VERSION_NODES'), data: nodes.length });

    let lowGen = 100;
    let highGen = 0;
    nodes.forEach(node => {
      if (node.level < lowGen)
        lowGen = node.level;
      if (node.level > highGen)
        highGen = node.level;
    })
    let genData = '' + (highGen-lowGen+1) + ' (' + lowGen + ', ' + highGen + ')';
    results.push({item: this.languageService.getTranslation('CONTACT_VERSION_GENERATION'), data: genData});
    return results;
  }

  onVersion() {
    if (this.versionMode) {
      this.versionMode = false;
      return;
    }
    this.versionMode = true;
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
      this.dataService.readLocalJson(ancestor, 'family').then((srcFamily:any) => {
        this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
      });
    });
  }

  async saveTree() {
    // evaluate difference
    this.dataService.readFamily().then((localFamily:any) => {
      this.dataService.readLocalJson(ancestor, 'family').then((srcFamily:any) => {
        let compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
        if (compareResults.length == 0) {
          this.utilService.alertMsg('ANNOUNCE', 'CONTACT_SEND_NO_CHANGE_MSG');
          return;
        }
        let msg = this.languageService.getTranslation('CONTACT_SEND_HEADER_MSG') + '[' + compareResults.length + ']';
        this.utilService.alertSendTree('CONTACT_SEND_HEADER', msg, 'CONTACT_SEND_INFO_PLACEHOLDER', 'CANCEL', 'OK').then((res) => {
          console.log('alertSendTree - res:' , res)
          if (!res.data)
            return;
          let email = localFamily.info.email;
          // reset info in family
          localFamily.info = {};
          let info = res.data.info;
          let t = { id: "family", data: localFamily };
          const text = JSON.stringify(t, null, 4);
          let id = ancestor + '-' + this.utilService.getDateID(true);
          // let shortInfo = (info.length < 20) ? info : info.substring(0, 20);
          let filename = id + '.json'
          this.fbService.saveContent({
            id: id,
            info: info,
            to: email,
            message: {
              // subject: 'Phả đồ - (' + id + ') - ' + shortInfo,
              subject: 'Gia Pha - (' + id + ')',
              // text: text,
              text: info,
              attachments: [
                { 
                    // filename: 'text1.txt',
                    filename: filename,
                    content: text
                }
              ]
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
