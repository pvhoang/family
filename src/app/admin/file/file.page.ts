import { Component, OnInit } from '@angular/core';
import { FamilyService } from '../../services/family.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { environment, VERSION } from '../../../environments/environment';

// declare var ancestor:any;

@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class FilePage implements OnInit {

  title = '';
  srcVersion = '';
  compareResults = [];
  viewMode = false;
  compareMode = false;
  contents: any[] = [];
  contentMode = false;
  srcFamily: any;
  msgCompare: any;

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
    this.dataService.readFamily().then((family:any) => {
      this.title = family.info.description;
    });

    this.getContents();
    // this.onContent();
  }

  ionViewWillEnter() {
    console.log('EditorPage - ionViewWillEnter');
    // this.onContent();
  }
	
	ionViewWillLeave() {
    console.log('EditorPage - ionViewWillLeave');
	}

  async getContents() {

    this.fbService.getAncestorFamilies(environment.ancestor).subscribe((contents:any) => {

      console.log('EditorPage - contents: ', contents);

      // this.fbService.getContents().subscribe((contents:any) => {
      // this.dataService.readLocalJson(ancestor, 'family').then((family:any) => {
      this.fbService.readJsonDocument(environment.ancestor, 'family').subscribe((srcFamily:any) => {
        this.srcFamily = srcFamily;
        contents.sort((doc1:any, doc2: any) => {
          let time1 = this.utilService.getDateTime(doc1.id);
          let time2 = this.utilService.getDateTime(doc2.id);
          return time2 - time1;
        });
        contents.forEach((document:any) => {
          let family = JSON.parse(document.data);
          let results = this.familyService.compareFamilies(srcFamily, family);
          // this.contents.push({ id: document.id, info: document.info, subject: document.message.subject, text: document.message.text });
          this.contents.push({ id: document.id, version: family.version, diff: results.length });
        })
        // this.srcVersion = this.languageService.getTranslation('FILE_SRC_VERSION') + this.srcFamily.version;
        this.msgCompare = this.languageService.getTranslation('FILE_COMPARE_TREE') + ' (' + this.srcFamily.version + ')';
        // this.title = this.srcFamily.info.description;

      });
    });
  }

  onView() {
    if (this.viewMode) {
      this.viewMode = false;
      this.compareMode = false;
      return;
    }
    this.viewMode = true;
  }

  // onContent() {
  //   if (this.contentMode) {
  //     this.contentMode = false;
  //     return;
  //   }
  //   this.contentMode = true;
  // }

  // onContent() {
  //   this.contentMode = true;
  //   this.compareMode = false;
  // }

  onCompare(content) {
    console.log('onCompare - content: ', content);
    // this.contentMode = false;
    this.compareMode = true;

    let modFamily = JSON.parse(content.text);
    console.log('onCompare - modFamily: ', modFamily)
    this.compareResults = this.familyService.compareFamilies(this.srcFamily, modFamily);
    console.log('onCompare - compareResults: ', this.compareResults)
    if (this.compareResults.length == 0) {
      this.utilService.alertMsg('WARNING', 'FILE_FILES_ARE_THE_SAME', 'OK').then((status) => {
        // this.onContent();
      })
    }
  }

  onDelete(content: any) {
    let message = this.languageService.getTranslation('FILE_DELETE_MESSAGE') + ': ' + content.id;
    this.utilService.alertConfirm('FILE_DELETE_HEADER', message, 'CANCEL', 'CONTINUE').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.fbService.deleteAncestorFamily(environment.ancestor, content.id);
        this.getContents();
        this.contentMode = false;
      }
    });
  }

  onUpload(event:any) {
    var file: File = event.target.files[0];
    // console.log('ContactPage - uploadTree - event: ', event);
    var myReader: FileReader = new FileReader();
    myReader.onloadend = ((e:any) => {
      let json:any = myReader.result;
      // console.log('onUpload - json: ', json);
      // this.confirmUploadTree(family);
      // let fileName = file.name;
      // console.log('ContactPage - onUpload - file: ', file.name);
      // console.log('ContactPage - onUpload - json: ', json.toString());

      // always parse json (string) to object
      this.confirmFileType(JSON.parse(json));
    });
    myReader.readAsText(file);
  }

  async confirmFileType(json?: any) {

    let inputs = [
      { type: 'radio', label: 'ancestor.json', value: 'ancestor' },
      { type: 'radio', label: 'archive.json', value: 'archive' },
      { type: 'radio', label: 'contribution.json', value: 'contribution' },
      { type: 'radio', label: 'family.json', value: 'family' },
      { type: 'radio', label: 'introduction.json', value: 'introduction' },
    ];

    // validate json data
    if (json) {
      let id = json.id;
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == id) {
          inputs[i]['checked'] = true;
          break;
        }
      }
      console.log('confirmFileType - inputs:' , inputs)
    }

    
    this.utilService.alertRadio('FILE_JSON_HEADER', 'FILE_JSON_MESSAGE', inputs , 'CANCEL', 'OK').then((res) => {
      console.log('confirmFileType - res:' , res)
      if (res.data) {
        let type = res.data;
        console.log('confirmFileType - type: ', type);
        if (json) {
          // upload
          if (type == 'archive') {
            console.log('confirmFileType - json.data: ', json.data);
            this.uploadArchive(json.data).then(data => {
              console.log('confirmFileType - data: ', data);
              this.fbService.saveDocument(environment.ancestor, {
                id: 'archive',
                data: JSON.stringify(data),
              });
              this.utilService.alertMsg(
                this.languageService.getTranslation('FILE_UPLOAD_HEADER'),
                this.languageService.getTranslation('FILE_UPLOAD_MESSAGE') + ': ' +  type + '.json.'
              );
            });
          } else {
            this.fbService.updateJsonDocument(environment.ancestor, type, json.data);
            this.utilService.alertMsg(
              this.languageService.getTranslation('FILE_UPLOAD_HEADER'),
              this.languageService.getTranslation('FILE_UPLOAD_MESSAGE') + ': ' +  type + '.json.'
            );
          }

        } else {
          // download
          this.fbService.readJsonDocument(environment.ancestor, type).subscribe(
            (data:any) => {
              let fileName = type + '.json';
              let text = JSON.stringify(data, null, 4);
              this.download(fileName, text);
            },
            (error:any) => {
              // throw error;
              console.log('Error: ', error)
            }
          )
        }
      }
    });
  }

  onDownload() {
    this.confirmFileType();
  }

  download(fileName: any, text: any) {
    this.downloadString(text, 'text/json', fileName);
    this.utilService.alertMsg(
      this.languageService.getTranslation('FILE_DOWNLOAD_HEADER'),
      this.languageService.getTranslation('FILE_DOWNLOAD_MESSAGE') + ' [' + fileName + ']'
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

  uploadArchive(data: any) {
    return new Promise((resolve) => {
      let promises = [];
      console.log('SettingPage - processArchive - data: ', data);
      
      for (var key of Object.keys(data)) {
        const type = data[key].type;
        console.log('SettingPage - processArchive - key, type: ', key, type);
        const src = data[key].src;
        // create only if a local file from /assets
        // if src is a http link, ignore
        if (src.indexOf('http') >= 0) {
          if (type == 'image') {
            promises.push(this.uploadLocalImage(key, src));
          } else if (type == 'people') {
            promises.push(this.uploadLocalImage(key, src));
          } else if (type == 'html') {
            promises.push(this.uploadLocalHtml(key, src));
          }
        }
      }
      if (promises.length == 0) {
        // nothing to change
        resolve(data);
      } else {
        Promise.all(promises).then(resolves => {
          console.log('resolves = ', resolves);
          for (let i = 0; i < resolves.length; i++) {
            let key = resolves[i].key;
            let urlStorage = resolves[i].urlStorage;
            // add local src
            data[key].src_local = data[key].src;
            data[key].src = urlStorage;
          }
          resolve(data);
        });
      }
    });
  }

  uploadLocalImage(key, url) {
    return new Promise((resolve) => {
      this.utilService.getLocalImageFile(url).then((blob) => {
        var myReader: FileReader = new FileReader();
        myReader.readAsDataURL(blob);
        myReader.onload = ((event:any) => {
          let base64 = event.target.result;
          base64 = base64.replace("data:", "").replace(/^.+,/, "");
          const id = url.substring(url.lastIndexOf('/')+1);

          const storageId = environment.ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
          console.log('uploadLocalImage - storageId: ', storageId);
          
          this.fbService.addImage(base64, storageId).then(urlStorage => {
            resolve({key: key, urlStorage: urlStorage});
          });
        });
      });
    });
  }

  uploadLocalHtml(key, url) {
    return new Promise((resolve) => {
      this.utilService.getLocalTextFile(url).then((data) => {
        console.log('uploadLocalHtml - data: ', data);
        const id = url.substring(url.lastIndexOf('/')+1);
        const storageId = environment.ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
        console.log('uploadLocalHtml - storageId: ', storageId);

        this.fbService.addText(data, storageId).then(urlStorage => {
          resolve({key: key, urlStorage: urlStorage});
        });
      });
    });
  }



  // async confirmUpload(family) {
  //   this.utilService.alertConfirm(
  //     this.languageService.getTranslation('CONTACT_UPLOAD_HEADER'),
  //     this.languageService.getTranslation('CONTACT_UPLOAD_MESSAGE'),
  //     this.languageService.getTranslation('CANCEL'),
  //     this.languageService.getTranslation('CONTINUE')).then((res) => {
  //     console.log('confirmUploadTree - res:' , res)
  //     if (res) {
  //       this.familyService.saveFamily(JSON.parse(family));
  //     }
  //   });
  // }

  // ancestor.json
  // archive.json
  // contribution.json
  // family.json
  // intro.json

  // async onAdd() {
  //   let inputs = [
  //     {type: 'radio', label: this.languageService.getTranslation('CHILD'), value: 'child' },
  //     {type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'wife' },
  //     {type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'husband' }
  //   ];
  //   this.utilService.alertRadio('NODE_ALERT_RELATION_HEADER', 'NODE_ALERT_RELATION_MESSAGE', inputs , 'CANCEL', 'OK').then((res) => {
  //     // console.log('onAdd - res:' , res)
  //     if (res) {
  //       // this.familyService.startSourceFamily().then(status => {});
  //       let relation = res.data;
  //       // let name = this.languageService.getTranslation('NODE_CHILD_PLACEHOLDER');
  //       let name = 'Phan - nhập tên';
  //       let gender = (relation == 'child') ? 'male' : ((relation == 'wife') ? 'female' : 'male');
  //       if (relation == 'child')
  //         this.addChild(this.selectedNode, name, gender, relation);
  //       else
  //         this.addSpouse(this.selectedNode, name, gender, relation);
  //     }
  //   });
  // }

  // onDownload() {
  //   let text = JSON.stringify(this.family, null, 4);
  //   let fileName = ANCESTOR + '-family-' + this.getDateID() + '.tree';
  //   this.downloadString(text, 'text/tree', fileName);
  //   this.utilService.alertMsg(
  //     this.languageService.getTranslation('CONTACT_DOWNLOAD_HEADER'),
  //     this.languageService.getTranslation('CONTACT_DOWNLOAD_MESSAGE') + ' [' + fileName + ']'
  //   );
  // }

  // downloadString(text, fileType, fileName) {
  //   var blob = new Blob([text], { type: fileType });
  //   var a = document.createElement('a');
  //   a.download = fileName;
  //   a.href = URL.createObjectURL(blob);
  //   a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  //   a.style.display = "none";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
  // }

  // saveFilesToFB() {
  //   // introduction
  //   this.utilService.getLocalTextFile('./assets/data/' + environment.ancestor + '-vi-intro.txt').then(viText => {
  //   this.utilService.getLocalTextFile('./assets/data/' + environment.ancestor + '-en-intro.txt').then(enText => {
  //     this.fbService.saveDocument(ancestor, {
  //       id: 'intro',
  //       vi: viText,
  //       en: enText
  //     });
  //   });
  //   });

  //   // contribution
  //   let jsonFile = './assets/data/' + ancestor + '-contribution.json'
  //   this.utilService.getLocalJsonFile(jsonFile).then(json => {
  //     this.fbService.saveDocument(ancestor, {
  //       id: 'contribution',
  //       data: JSON.stringify(json),
  //     });
  //   });

  //   // images
  //   jsonFile = './assets/data/' + ancestor + '-images.json'
  //   this.utilService.getLocalJsonFile(jsonFile).then(json => {
  //     this.fbService.saveDocument(ancestor, {
  //       id: 'images',
  //       data: JSON.stringify(json),
  //     });
  //   });

  // }
}
