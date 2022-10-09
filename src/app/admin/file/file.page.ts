import { Component, OnInit } from '@angular/core';
import { FamilyService } from '../../services/family.service';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FONTS_FOLDER, DEBUG_FILE } from '../../../environments/environment';

import * as $ from 'jquery';

@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class FilePage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  title = '';
  srcVersion = '';
  compareResults = [];
  compareDocumentId:any = '';
  viewMode = false;
  compareMode = false;
  contents: any[] = [];
  contentMode = false;
  srcFamily: any;
  msgCompare: any;
  ancestor: any;
  ancestor_info: any;
  fileExtension: any = '';
  fileName: any = '';
  uploadMode = false;
  selectedFiles:File[] = [];
  percentage = 0;
  previewImageMode = false;
  previewTextMode = false;
  storageMode = false;
  storageFiles: any[] = [];
  storageViewMode = false;

  constructor(
    private familyService: FamilyService,
    private languageService: LanguageService,
    private dataService: DataService,
    private fbService: FirebaseService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    if (DEBUG_FILE)
      console.log('FilePage - ngOnInit');
    this.dataService.readFamily().then((family:any) => {
      this.title = family.info.description;
      this.ancestor = family.info.id;
      this.ancestor_info = family.info;
      // this.getContents();
    });
  }

  ionViewWillEnter() {
    if (DEBUG_FILE)
      console.log('EditorPage - ionViewWillEnter');
    this.getContents();
    this.resetModes();
  }
	
	ionViewWillLeave() {
    if (DEBUG_FILE)
      console.log('EditorPage - ionViewWillLeave');
	}

  resetModes() {
    this.viewMode = false;
    this.compareMode = false;
    this.contentMode = false;
    this.uploadMode = false;
    this.previewImageMode = false;
    this.previewTextMode = false;
    this.storageMode = false;
    this.storageViewMode = false;
  }

  async getContents() {

    this.fbService.getAncestorFamilies(this.ancestor).subscribe((contents:any) => {
      this.viewMode = false;
      this.compareMode = false;
      // console.log('FilePage - contents: ', contents);
      this.fbService.readJsonDocument(this.ancestor, 'family').subscribe((srcFamily:any) => {
        this.srcFamily = srcFamily;
        // console.log('srcFamily: ',  JSON.stringify(srcFamily, null, 4));
        contents.sort((doc1:any, doc2: any) => {
          let time1 = this.utilService.getDateTime(doc1.id);
          let time2 = this.utilService.getDateTime(doc2.id);
          return time2 - time1;
        });
        this.contents = [];
        contents.forEach((document:any) => {
          // console.log('EditorPage - getContents - document: ', document);
          let family = JSON.parse(document.data);
          // add info
          family.info = this.ancestor_info;
          let sender = document.info ? document.info : '';
          // console.log('family: ',  family);
          let results = this.familyService.compareFamilies(srcFamily, family);
          // console.log('EditorPage - getContents - srcFamily: ', srcFamily);
          // console.log('EditorPage - getContents - family: ', family);
          // console.log('EditorPage - getContents - results: ', results);
          this.contents.push({ id: document.id, sender: sender, version: family.version, diff: results.length, compareResults: results, family: family });
        })
        this.msgCompare = this.languageService.getTranslation('FILE_COMPARE_TREE') + ' (' + this.srcFamily.version + ')';
      });
    });
  }

  async getStorageFiles() {

    this.fbService.getAncestorFamilies(this.ancestor).subscribe((contents:any) => {

      this.fbService.readJsonDocument(this.ancestor, 'family').subscribe((srcFamily:any) => {
        this.srcFamily = srcFamily;
        // console.log('srcFamily: ',  JSON.stringify(srcFamily, null, 4));
        contents.sort((doc1:any, doc2: any) => {
          let time1 = this.utilService.getDateTime(doc1.id);
          let time2 = this.utilService.getDateTime(doc2.id);
          return time2 - time1;
        });
        this.contents = [];
        contents.forEach((document:any) => {
          // console.log('EditorPage - getContents - document: ', document);
          let family = JSON.parse(document.data);
          // add info
          family.info = this.ancestor_info;
          let sender = document.info ? document.info : '';
          // console.log('family: ',  family);
          let results = this.familyService.compareFamilies(srcFamily, family);
          this.storageFiles.push({ id: document.id, sender: sender, version: family.version, diff: results.length, compareResults: results, family: family });
        })
        this.msgCompare = this.languageService.getTranslation('FILE_COMPARE_TREE') + ' (' + this.srcFamily.version + ')';
      });
    });
  }

  onView() {
    if (this.viewMode) {
      this.viewMode = false;
      this.compareMode = false;
      return;
    }
    this.resetModes();
    this.viewMode = true;
  }

  onCompare(content) {
    if (this.compareMode) {
      this.compareMode = false;
      return;
    }
    if (DEBUG_FILE)
      console.log('onCompare - content: ', content);
    this.compareMode = true;
    this.compareDocumentId = this.languageService.getTranslation('FILE_ID') + ': ' + content.id;
    this.compareResults = content.compareResults;
    if (this.compareResults.length == 0) {
      this.utilService.alertMsg('WARNING', 'FILE_FILES_ARE_THE_SAME', 'OK').then((status) => {
      })
    }
  }

  onDelete(content: any) {
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'FILE_DELETE_MESSAGE'},
      {name: 'data', label: content.id},
    ]);
    // let message = this.languageService.getTranslation('FILE_DELETE_MESSAGE') + ': ' + content.id;
    this.utilService.alertConfirm('FILE_DELETE_HEADER', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (DEBUG_FILE)
        console.log('onDelete - res:' , res)
      if (res.data) {
        this.fbService.deleteAncestorFamily(this.ancestor, content.id);
        this.getContents();
        this.contentMode = false;
      }
    });
  }

  onReplaceSource(content: any) {
    let version = this.srcFamily.version;
    let newVersion = (parseFloat(version) + 0.1).toFixed(1);
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'FILE_REPLACE_MESSAGE_1'},
      {name: 'data', label: content.id},
      {name: 'msg', label: 'FILE_REPLACE_MESSAGE_2'},
      {name: 'data', label: version},
      {name: 'msg', label: 'FILE_REPLACE_MESSAGE_3'},
      {name: 'data', label: newVersion},
    ]);
    this.utilService.alertConfirm('FILE_REPLACE_HEADER', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (DEBUG_FILE)
        console.log('onReplaceSource - res:' , res)
      if (res.data) {
        console.log('onReplaceSource - version, newVersion:' , version, newVersion);
        // filter family
        let family = this.familyService.getFilterFamily(content.family);
        family.version = newVersion;
        family.info = {};
        if (DEBUG_FILE)
          console.log('onReplaceSource - family:' , family)
      	this.fbService.updateJsonDocument(this.ancestor, 'family', family);
        this.utilService.presentToast('FILE_REPLACE_MESSAGE_4');
      }
    });
  }

  onFileLocal() {
    if (this.uploadMode) {
      this.uploadMode = false;
      return;
    }
    this.resetModes();
    this.uploadMode = true;
  }

  onFileSelect(event: any): void {
    this.resetModes();
    this.uploadMode = true;
    const files = [...event.target.files]
    if (this.selectedFiles.length == 0) {
        this.selectedFiles = files;
    } else {
      files.forEach((file:File) => {
        let index = this.selectedFiles.findIndex((f:File) => f.name == file.name);
        if (index == -1)
          this.selectedFiles.push(file);
      });
    }
  }

  onFileDelete(file:File) {
    if (DEBUG_FILE)
      console.log('FilePage - onFileDelete');
    let index = this.selectedFiles.findIndex((f:File) => f.name == file.name);
    if (index != -1) {
      const files:File[] = [];
      for (let i = 0; i < this.selectedFiles.length; i++) {
        if (i != index)
          files.push(this.selectedFiles[i])
      }
      this.selectedFiles = files;
      // this.selectedFiles = this.selectedFiles.splice(index, 1);
    }
    // console.log('FilePage - selectFile - this.selectedFiles: ', this.selectedFiles);
  }

  onFileView(file:File) {
    if (this.previewImageMode) {
      this.previewImageMode = false;
      return;
    }
    if (this.previewTextMode) {
      this.previewTextMode = false;
      return;
    }
    this.resetModes();

    if (DEBUG_FILE)
      console.log('FilePage - onFileView');
    this.fileName = file.name;
    const name:string = file.name;
    // get extension
    const type = name.substring(name.lastIndexOf('.')+1);
    const reader = new FileReader();

    if (type == 'jpeg' || type == 'jpg') {
      this.previewImageMode = true;

      reader.readAsDataURL(file);
      reader.onload = ((event:any) => {
        $('#preview-image').attr('src', event.target.result);
      });

    } else {
      this.previewTextMode = true;

      reader.readAsText(file);
      reader.onload = ((event:any) => {
        let text = event.target.result;

        if (DEBUG_FILE)
          console.log('onFileView - type: ', type);
        if (DEBUG_FILE)
          console.log('onFileView - text: ', text);

        if (type == 'json') {
          let json = JSON.parse(text);
          text = JSON.stringify(json, null, 4);
          // console.log('text: ', text);
          text = text.replace(/\n/g, '<br/>')
          text = text.replace(/    /g, '&nbsp;&nbsp;&nbsp;&nbsp;')
        }
        $('#preview-text').html(text);
      });
    }
    
  }

  onFileUpload(file:File) {
    console.log('FilePage - onFileUpload');
    const name:string = file.name;
    // get extension
    const type = name.substring(name.lastIndexOf('.')+1);

    this.uploadFile(file, this.ancestor, type).then((res: any) => {
      if (DEBUG_FILE)
        console.log('onFileUpload - res: ', res);
      if (res.text) {
        // validate json file
        let json = JSON.parse(res.text);
        const id = name.substring(0, name.lastIndexOf('.'));
        if (this.validateJsonFile(id, json)) {

          console.log('FilePage - onFileUpload - json: ', json);
          console.log('FilePage - onFileUpload - id: ', id);

          if (id == 'family')
            // must filter data for proper format
            json = this.familyService.getFilterFamily(json);
          this.fbService.updateJsonDocument(this.ancestor, id, json);
          let message = this.languageService.getTranslation('FILE_UPLOAD_FILE') + ': ' + name;
          this.utilService.presentToast(message);
        }
      } else {
        let message = this.languageService.getTranslation('FILE_UPLOAD_FILE') + ': ' + name;
          this.utilService.presentToast(message);
      }
    });
  }

  validateJsonFile(id: string, json: any) {
    // console.log('FilePage - validateFile - json: ', json);
    if (json.id == id) {
      // console.log('FilePage - validateFile - json is ok!');
      return true;
    }
    return false;
  }

  uploadFile(file:File, ancestor, type) {
    return new Promise((resolve) => {
      const name = file.name;
      var myReader: FileReader = new FileReader();

      if (type == 'jpeg' || type == 'jpg') {
        myReader.readAsDataURL(file);
        myReader.onload = ((event:any) => {
          let base64 = event.target.result;
          base64 = base64.replace("data:", "").replace(/^.+,/, "");
          // const id = name.substring(0, name.lastIndexOf('.'));
          // const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
          // const storageId = ancestor + '/' + id;
          const storageId = name;
          console.log('uploadLocalImage - storageId: ', storageId);
          this.fbService.addImage(base64, ancestor, storageId).then(urlStorage => {
            resolve({storageId: storageId, urlStorage: 'urlStorage'});
          });
        });
        
      } else {
        myReader.readAsText(file);
        myReader.onload = ((event:any) => {
          let text:any = event.target.result;
          // always parse json (string) to object
          if (type == 'json') {
            resolve({text: text});
          } else {
            // const id = name.substring(0, name.lastIndexOf('.'));
            const storageId = name;
            this.fbService.addText(text, ancestor, storageId).then(urlStorage => {
              resolve({storageId: storageId, urlStorage: 'urlStorage'});
            });
          }
        });
      }
    });
  }

  onStorageFile(): void {
    if (DEBUG_FILE)
      console.log('onStorageFile');
    if (this.storageMode) {
      this.storageMode = false;
      return;
    }
    this.resetModes();
    this.storageMode = true;
    this.fbService.getFileList(this.ancestor).then((res:any) => {
      this.storageFiles = res;
      if (DEBUG_FILE)
        console.log('onStorageFile - res: ', res);
    });

  }

  onStorageDelete(file: any) {
    if (DEBUG_FILE)
      console.log('onStorageDelete');
    this.fbService.deleteImage(this.ancestor, file.name).then((status:any) => {
      this.fbService.getFileList(this.ancestor).then((res:any) => {
        this.storageFiles = res;
        console.log('FilePage - res: ', res);
      });
    });
  }

  onStorageView(file: any) {
    if (DEBUG_FILE)
      console.log('onStorageView - file: ', file);
    this.storageViewMode = true;
    if (file.type.indexOf("image") >= 0) {
      const img = document.getElementById('storage-image');
      img.setAttribute('src', file.url);
    } else {
      window.open(file.url);
    }
  }

}


