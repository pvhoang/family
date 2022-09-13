import { Component, OnInit } from '@angular/core';
import { FamilyService } from '../../services/family.service';
// import { NgSelectComponent } from '@ng-select/ng-select';
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
  // contents: Array<any>;
  contents: any[] = [];
  // content: string = null;
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

    // this.getContents().then(() => {});
    // for (let i = 0; i < 10; i++)
    //   this.contents.push({ id: '' + i, name: 'test' + i });
    // console.log('contents: ', this.contents);

    // this.fbService.readDocument(ancestor, 'images').subscribe((res:any) => {
    // this.fbService.getContents().subscribe((contents:any) => {
    //   console.log('FilePage - getContents');
    //   for (let i = 0; i < 10; i++)
    //     this.contents.push({ id: '' + i, name: 'test' + i });
    //   this.content = null;
    // });

  }

  ionViewWillEnter() {
    console.log('EditorPage - ionViewWillEnter');
    this.onContent();

  }
	
	ionViewWillLeave() {
    console.log('EditorPage - ionViewWillLeave');
	}

  async onClose() {
    this.router.navigateByUrl(`/admin`);
  }

  async getContents() {
    this.fbService.getContents().subscribe((contents:any) => {
    // this.fbService.readDocument(ancestor, 'family').subscribe((res:any) => {
      this.dataService.readLocalJson(ancestor, 'family').then((family:any) => {
      // this.srcFamily = JSON.parse(res.data);
      this.srcFamily = family;
      
      contents.sort((doc1:any, doc2: any) => {
        let time1 = this.utilService.getDateTime(doc1.id);
        let time2 = this.utilService.getDateTime(doc2.id);
        return time2 - time1;
      });
      contents.forEach((document:any) => {
        // console.log('document: ', document);
        // console.log('document: ', document.message.subject);
        // let id = document.id;
        // let id = document.id;
        // let subject = document.message.subject;
        // let text = JSON.parse(document.message.text);
        
        // take contents with an ancestor heading only
        // if (document.id.indexOf(ancestor) == 0)
          this.contents.push({ id: document.id, info: document.info, subject: document.message.subject, text: document.message.text });
      })
      // this.fbService.readDocument(ancestor, 'family').subscribe((res:any) => {
      //   this.srcFamily = JSON.parse(res.data);
      // });
      this.srcVersion = this.languageService.getTranslation('FILE_SRC_VERSION') + this.srcFamily.version;
    });
  });
  }

  // close() {
    // console.log('close - content: ', this.content);
  // }

  onContent() {

    this.contentMode = true;
    this.compareMode = false;

    // if (this.contentMode) {
    //   this.contentMode = false;
    //   return;
    // }
    // if (this.compareMode) {
    //   this.compareMode = false;
    //   return;
    // }

    // this.dataService.readFamily().then((localFamily:any) => {
    //   this.fbService.readDocument(ancestor, 'family').subscribe((res:any) => {
    //     let srcFamily = JSON.parse(res.data);
    //     srcFamily.info = localFamily.info;
    //     this.compareResults = this.familyService.compareFamilies(srcFamily, localFamily);
    //   });
    // });
  }

  onCompare(content) {
    console.log('onCompare - content: ', content);

    this.contentMode = false;
    this.compareMode = true;

    let modFamily = JSON.parse(content.text);
    console.log('onCompare - modFamily: ', modFamily)
    this.compareResults = this.familyService.compareFamilies(this.srcFamily, modFamily);
    console.log('onCompare - compareResults: ', this.compareResults)
    if (this.compareResults.length == 0)
      this.utilService.alertMsg('WARNING', 'FILE_FILES_ARE_THE_SAME', 'OK').then((status) => {})
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

  // onReplaceSource(content: any) {
  //   let version = this.srcFamily.version;
  //   let newVersion = (parseFloat(version) + 0.1).toFixed(1);

  //   let message = this.languageService.getTranslation('DELETE_PEOPLE_MESSAGE') + ': ' + content.id;
  //   this.utilService.alertConfirm('DELETE_PEOPLE_HEADER', message, 'CANCEL', 'CONTINUE').then((res) => {
  //     console.log('onReplaceSource - res:' , res)
  //     if (res.data) {
  //       console.log('onReplaceSource - version, newVersion:' , version, newVersion);
  //       let text = content.text;
  //       text = text.replace('"'+version+'"', '"'+newVersion+'"');
  //       console.log('onReplaceSource - text:' , text)
  //       // archive current version and make a new version
  //       this.fbService.saveDocument(ancestor, {
  //         id: 'family-' + version,
  //         data: JSON.stringify(this.srcFamily)
  //       });
  //       // this.fbService.saveDocument(ancestor, {
  //       //   id: 'family',
  //       //   data: text,
  //       // });
  //     }
  //   });
  // }
}
