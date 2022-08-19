import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
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
    private alertController: AlertController,
    public modalCtrl: ModalController,
    private familyService: FamilyService,
    private utilService: UtilService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ContactPage - ngOnInit');
    let ancestor = ANCESTOR;
    this.familyService.readFamily().then((family:any) => {
      this.family = family;
      let ancestorText = this.languageService.getTranslation(ancestor);
      // console.log('ContactPage - ngOnInit - setting: ', ancestorText);
      // this.title = ancestorText.tree + ' - ' + VERSION + ' - ' + family.version;
      let msg1 = this.languageService.getTranslation('CONTACT_VERSION_1');
      let msg2 = this.languageService.getTranslation('CONTACT_VERSION_2');
      this.version = msg1 + VERSION + ' - ' + msg2 + family.version;
      this.title = ancestorText.tree;
      let jsonFile = './assets/data/' + ANCESTOR + '-contribution.json'
      this.utilService.getLocalJsonFile(jsonFile).then(json => {
        this.contResults = json.data;
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

  async resetTree() {
    this.utilService.alertConfirm(
      this.languageService.getTranslation('CONTACT_RESET_HEADER'),
      this.languageService.getTranslation('CONTACT_RESET_MESSAGE'),
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('CONTINUE')).then((res) => {
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

  uploadTree(event:any) {
    // console.log('ContactPage - uploadTree: ', event);
    var file: File = event.target.files[0];
    var myReader: FileReader = new FileReader();
    myReader.onloadend = ((e:any) => {
      let family = myReader.result;
      console.log('family: ', family);
      this.confirmUploadTree(family);
    });
    myReader.readAsText(file);
  }

  async confirmUploadTree(family) {
    this.utilService.alertConfirm(
      this.languageService.getTranslation('CONTACT_UPLOAD_HEADER'),
      this.languageService.getTranslation('CONTACT_UPLOAD_MESSAGE'),
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('CONTINUE')).then((res) => {
      console.log('confirmUploadTree - res:' , res)
      if (res) {
        this.familyService.saveFamily(JSON.parse(family));
      }
    });
  }

  downloadTree() {
    let text = JSON.stringify(this.family, null, 4);
    let fileName = ANCESTOR + '-family-' + this.getDateID() + '.tree';
    this.downloadString(text, 'text/tree', fileName);
    this.utilService.alertMsg(
      this.languageService.getTranslation('CONTACT_DOWNLOAD_HEADER'),
      this.languageService.getTranslation('CONTACT_DOWNLOAD_MESSAGE') + ' [' + fileName + ']'
    );
  }

  downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });
    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
  }
  
  getDateID() {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
    const id = ''+day+'-'+month+'-'+year;
		return id;
  }

}
