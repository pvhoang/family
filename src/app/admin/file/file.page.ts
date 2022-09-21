import { Component, OnInit } from '@angular/core';
import { FamilyService } from '../../services/family.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';

declare var ancestor:any;

@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class FilePage implements OnInit {

  title = '';
  srcVersion = '';
  compareResults = [];
  compareMode = false;
  contents: any[] = [];
  contentMode = false;
  srcFamily: any;

  constructor(
    private router: Router,
    private familyService: FamilyService,
    private languageService: LanguageService,
    private dataService: DataService,
    private fbService: FirebaseService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    console.log('FilePage - ngOnInit');
    this.title = this.languageService.getTranslation('FILE_TITLE');
    this.getContents();
    this.onContent();
  }

  ionViewWillEnter() {
    console.log('EditorPage - ionViewWillEnter');
    this.onContent();
  }
	
	ionViewWillLeave() {
    console.log('EditorPage - ionViewWillLeave');
	}

  async getContents() {
    this.fbService.getContents().subscribe((contents:any) => {
      this.dataService.readLocalJson(ancestor, 'family').then((family:any) => {
      this.srcFamily = family;
      contents.sort((doc1:any, doc2: any) => {
        let time1 = this.utilService.getDateTime(doc1.id);
        let time2 = this.utilService.getDateTime(doc2.id);
        return time2 - time1;
      });
      contents.forEach((document:any) => {
        this.contents.push({ id: document.id, info: document.info, subject: document.message.subject, text: document.message.text });
      })
      this.srcVersion = this.languageService.getTranslation('FILE_SRC_VERSION') + this.srcFamily.version;
    });
  });
  }

  onContent() {
    this.contentMode = true;
    this.compareMode = false;
  }

  onCompare(content) {
    console.log('onCompare - content: ', content);
    this.contentMode = false;
    this.compareMode = true;

    let modFamily = JSON.parse(content.text);
    console.log('onCompare - modFamily: ', modFamily)
    this.compareResults = this.familyService.compareFamilies(this.srcFamily, modFamily);
    console.log('onCompare - compareResults: ', this.compareResults)
    if (this.compareResults.length == 0) {
      this.utilService.alertMsg('WARNING', 'FILE_FILES_ARE_THE_SAME', 'OK').then((status) => {
        this.onContent();
      })
    }
  }

  onDelete(content: any) {
    let message = this.languageService.getTranslation('FILE_DELETE_MESSAGE') + ': ' + content.id;
    this.utilService.alertConfirm('FILE_DELETE_HEADER', message, 'CANCEL', 'CONTINUE').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.fbService.deleteContent(content.id);
        this.getContents();
        this.contentMode = false;
      }
    });
  }
}
