import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { FirebaseService } from '../services/firebase.service';
import { DataService } from '../services/data.service';
import { NodeService } from '../services/node.service';
import { VERSION, FONTS_FOLDER, DEBUG_CONTACT } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  compareResults: any[] = [];
  compareMode: any = false;
  contResults: any[] = [];
  contMode: any = false;
  versionResults: any[] = [];
  versionMode: any = false;
  version: string = '';
  summary: string = '';
  contact: any = '';
  ancestor: any = '';

  constructor(
    private fbService: FirebaseService,
    private familyService: FamilyService,
    private utilService: UtilService,
    private dataService: DataService,
    private nodeService: NodeService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    if (DEBUG_CONTACT)
      console.log('ContactPage - ngOnInit');
    this.start();
  }

  ionViewWillEnter() {
    if (DEBUG_CONTACT)
      console.log('ContactPage - ionViewWillEnter');
    this.start();
    // this.compareMode = false;
    // this.contMode = false;
    this.resetModes();
  } 
	
	ionViewWillLeave() {
    if (DEBUG_CONTACT)
      console.log('ContactPage - ionViewWillLeave');
	}

  resetModes() {
    this.compareMode = false;
    this.contMode = false;
    this.versionMode = false;
  }

  start() {
    this.dataService.readFamily().then((family:any) => {
      console.log('ContactPage - ngOnInit - family: ', family);
      this.familyService.getSourceFamilyVersion(family.info.id).then((srcVersion:any) => {
        this.title = family.info.description;
        this.contact = this.languageService.getTranslation('CONTACT_EDITOR') + family.info.email;
        this.ancestor = family.info.id;
        this.versionResults = this.getVersion(family, srcVersion);
        this.fbService.readJsonDocument(this.ancestor, 'contribution').subscribe((data:any) => {
          this.contResults = this.getContribution(data);
        });
        this.compareMode = false;
      });
    });
  }

  getVersion(family: any, srcVersion):any {
    let nodes = this.nodeService.getFamilyNodes(family);
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
    this.contMode = false;
    this.compareMode = false;
    if (this.versionMode) {
      this.versionMode = false;
      return;
    }
    this.versionMode = true;
  }

  onContribution() {
    this.compareMode = false;
    this.versionMode = false;
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
    this.resetModes();
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'CONTACT_RESET_MESSAGE'},
    ]);
    this.utilService.alertConfirm('WARNING', msg, 'CANCEL', 'OK').then((res) => {
      console.log('resetTree - res:' , res)
      if (res.data) {
        this.familyService.startSourceFamily(this.ancestor).then(status => {
          let message = this.languageService.getTranslation('CONTACT_RESET_MESSAGE_TOAST');
          this.utilService.presentToast(message);
        });
      }
    });
  }

  async compareTree() {
    this.contMode = false;
    this.versionMode = false;
    if (this.compareMode) {
      this.compareMode = false;
      return;
    }
    this.compareMode = true;
    this.dataService.readFamily().then((localFamily:any) => {
      this.fbService.readJsonDocument(this.ancestor, 'family').subscribe((srcFamily:any) => {
        this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
      });
    });
  }

  async saveTree() {
    this.resetModes();

    // evaluate difference
    this.dataService.readFamily().then((localFamily:any) => {
      this.fbService.readJsonDocument(this.ancestor, 'family').subscribe((srcFamily:any) => {
        let compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
        if (compareResults.length == 0) {
          this.utilService.alertMsg('ANNOUNCE', 'CONTACT_SEND_NO_CHANGE_MSG');
          return;
        }
        let msg = this.utilService.getAlertMessage([
          {name: 'msg', label: 'CONTACT_SEND_HEADER_MSG'},
          {name: 'data', label: compareResults.length},
        ]);
        this.utilService.alertSendTree('CONTACT_SEND_HEADER', msg, 'CONTACT_SEND_INFO_PLACEHOLDER', 'CANCEL', 'OK').then((res) => {
          console.log('alertSendTree - res:' , res)
          if (!res.data)
            return;
          let id = this.utilService.getDateID(true);
          let data = { id: id, info: res.data.info, data: JSON.stringify(this.familyService.getFilterFamily(localFamily))};
          this.fbService.saveAncestorFamily(this.ancestor, data);
          let message = this.languageService.getTranslation('CONTACT_SEND_ANSWER');
          this.utilService.presentToast(message);
        });
      });
    });
  }
}
