import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { DataService } from '../../services/data.service';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { AncestorPage } from '../ancestor/ancestor.page';

declare var ancestor;

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  title = '';
  paramsChange = false;

  constructor(
    private modalCtrl: ModalController,
    private fbService: FirebaseService,
    private dataService: DataService,
    private utilService: UtilService,
    private languageService: LanguageService,

  ) { }

  ngOnInit() {
    // this.title = this.languageService.getTranslation('ADMIN_SETTING');
    this.fbService.readDocument(ancestor, 'ancestor').subscribe((fbRes:any) => {
      let data = fbRes ? JSON.parse(fbRes.data) : null;
      this.title = this.languageService.getTranslation('TITLE_TREE') + ' ' + data.family_name;
    });

    // this.openAdmin();
  }

  ionViewWillEnter() {
    console.log('SettingPage - ionViewWillEnter');
  }
	
	ionViewWillLeave() {
    console.log('SettingPage - ionViewWillLeave');
    if (this.paramsChange) {
      this.dataService.readItem('ANCESTOR').then((data:any) => {
        // save ancestor setting
        // this.fbService.updateDocument(ancestor, 'ancestor', {
        //   id: 'ancestor',
        //   data: JSON.stringify(data)
        // });

        // this.fbService.saveDocument(ancestor, {
        //   id: 'ancestor',
        //   data: JSON.stringify(data)
        // });
      });
    }
	}

  onReloadAncestor1() {
    this.dataService.readItem('ANCESTOR').then((data:any) => {
      this.fbService.saveDocument(ancestor, {
        id: 'ancestor',
        data: JSON.stringify(data),
      });
    });
  }

  onReloadAncestor() {
    let jsonFile = '../../../assets/data/ancestor.json';
    this.utilService.getLocalJsonFile(jsonFile).then(json => {
      this.fbService.saveDocument(ancestor, {
        id: 'ancestor',
        data: JSON.stringify(json),
      });
    });
  }

  onParams() {
    // this.openAdmin();
    this.fbService.readDocument(ancestor, 'ancestor').subscribe((fbRes:any) => {
      let data = fbRes ? JSON.parse(fbRes.data) : null;
      console.log('SettingPage - onParams - data: ', data);
      this.onModalDialog(data);
    });
  }

  async onModalDialog(params: any) {
    const modal = await this.modalCtrl.create({
      component: AncestorPage,
      componentProps: {
        'name': 'Detail',
        'params': params
      },
      cssClass: "child-modal"
    });
    modal.onDidDismiss().then((resp) => {
      // console.log('SettingPage - onDidDismiss - resp: ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        let data = resp.data.values;
        console.log('SettingPage - onDidDismiss - data:' , data)
        // add more info
        data.date = this.utilService.getDateID();
        data.ancestor = ancestor;
        this.dataService.saveItem('ANCESTOR', data);
        // this.fbService.saveDocument(ancestor, {
        //   id: 'ancestor',
        //   data: JSON.stringify(data)
        // });
        this.utilService.alertMsg('WARNING', 'Thong tin gia pha da duoc cap nhat!', 'OK').then((status) => {});
        this.paramsChange = true;
      }
    });
    return await modal.present();
  }

  uploadJson(event:any, fileName) {
    // console.log('SettingPage - uploadJson: ', event);
    var file: File = event.target.files[0];
    // console.log('SettingPage - file: ', file);
    var myReader: FileReader = new FileReader();
    myReader.onloadend = ((ev:any) => {
      let json = JSON.parse(ev.target.result);
      // console.log('SettingPage - json: ', json);
      console.log('SettingPage - fileName: ', fileName);
      
      if (fileName == 'archive') {
        this.processArchive(json).then(js => {
          this.fbService.saveDocument(ancestor, {
            id: 'archive',
            data: JSON.stringify(js),
          });
        });
      }
    });
    myReader.readAsText(file);
  }

  processArchive(json: any) {
    return new Promise((resolve) => {

      let promises = [];

      // console.log('SettingPage - processArchive - json: ', json);
      for (var key of Object.keys(json)) {
        const type = json[key].type;
        // console.log('SettingPage - processArchive - key, type: ', key, type);
        const src = json[key].src;
        if (type == 'image') {
          promises.push(this.uploadLocalImage(key, src));
        } else if (type == 'html') {
          promises.push(this.uploadLocalHtml(key, src));
        }

      }
      Promise.all(promises).then(resolves => {
        console.log('resolves = ', resolves);
        for (let i = 0; i < resolves.length; i++) {
          let key = resolves[i].key;
          let urlStorage = resolves[i].urlStorage;
          json[key].src = urlStorage;
        }
        resolve(json);
      });
    });
  }

  uploadImage(event:any) {
    var file: File = event.target.files[0];
    // console.log('SettingPage - file: ', file);
    var myReader: FileReader = new FileReader();
    myReader.readAsDataURL(file);
    myReader.onload = ((ev:any) => {
      let base64 = ev.target.result;
      base64 = base64.replace("data:", "").replace(/^.+,/, "");
      const id = file.name;
      const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
      this.fbService.addImage(base64, storageId);
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
          const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
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
        const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
        console.log('uploadLocalHtml - storageId: ', storageId);

        this.fbService.addText(data, storageId).then(urlStorage => {
          resolve({key: key, urlStorage: urlStorage});
        });
      });
    });
  }


  // uploadImage(event:any) {
  //   // console.log('SettingPage - uploadImage: ', event);
  //   var file: File = event.target.files[0];
  //   console.log('SettingPage - file: ', file);
  //   var myReader: FileReader = new FileReader();
  //   myReader.readAsDataURL(file);
  //   // myReader.onloadend = ((ev:any) => {
  //   myReader.onload = ((ev:any) => {
  //     let base64 = ev.target.result;
  //     base64 = base64.replace("data:", "").replace(/^.+,/, "");
  //     // console.log('SettingPage - data: ', base64);
  //     const id = file.name;
  //     const storageId = ancestor +'-'+id;
  //     const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;

  //     // this.fbService.addImage(base64, storageId).then(status => {
  //     //   console.log('SettingPage - uploadLocalImage - status: ', status);
  //     // });
  //   });
  // }

  // uploadLocalImage(url:any, id: any) {
  // uploadLocalImage() {
  //   // const url = '/dev/family/data/phan-dinh-1971.jpg';
  //   const url = '../../../assets/imgs/phan-dinh-1971.jpg';
  //   const id = url.substring(url.lastIndexOf('/')+1);

  //   this.utilService.getLocalImageFile(url).then((blob) => {
  //     var myReader: FileReader = new FileReader();
  //     const binaryString = myReader.readAsDataURL(blob);
  //     myReader.onload = ((event:any) => {
  //       // let base64 = JSON.stringify(myReader.result).replace("data:", "").replace(/^.+,/, "");
  //       // base64 = JSON.parse(base64);
  //       // let base64 = '5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB'
  //       let base64 = event.target.result;
  //       base64 = base64.replace("data:", "").replace(/^.+,/, "");
  //       // console.log('Image in Base64: ', base64);
  //       // console.log('SettingPage - uploadLocalImage - base64: ', base64);
  //       const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
  //       this.fbService.addImage(base64, storageId).then(status => {
  //         console.log('SettingPage - uploadLocalImage - status: ', status);
  //       });
  //     });
  //   });
  // }

//   imageUploaded() {
//     var file = document.querySelector(
//         'input[type=file]')['files'][0];
  
//     var reader = new FileReader();
//     console.log("next");
      
//     reader.onload = function () {
//         // let base64String = reader.result.replace("data:", "")
//         //     .replace(/^.+,/, "");
//         let base64String = reader.result.replace("data:", "");

//         let imageBase64Stringsep = base64String;
  
//         // alert(imageBase64Stringsep);
//         console.log(base64String);
//     }
//     reader.readAsDataURL(file);
// }

  // uploadJPEG() {
  //   var file = document.querySelector(
  //       'input[type=file]')['files'][0];
  //   var reader: FileReader = new FileReader();
  //   console.log("next");
  //   reader.onloadend = ((e:any) => {
  //       let result:string = reader.result;
  //       let base64String:any = result.replace("data:", "").replace(/^.+,/, "");
  
  //       // imageBase64Stringsep = base64String;
  
  //       // alert(imageBase64Stringsep);
  //       console.log(base64String);
  //   }
  //   reader.readAsDataURL(file);
  // }

}
  // uploadTree(event:any) {
  //   // console.log('ContactPage - uploadTree: ', event);
  //   var file: File = event.target.files[0];
  //   var myReader: FileReader = new FileReader();
  //   myReader.onloadend = ((e:any) => {
  //     let family = myReader.result;
  //     console.log('family: ', family);
  //     this.confirmUploadTree(family);
  //   });
  //   myReader.readAsText(file);
  // }

  // async confirmUploadTree(family) {
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

  // downloadTree() {
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
