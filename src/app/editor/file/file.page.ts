import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController, Platform } from '@ionic/angular';
import { CropperModalPage } from './cropper-modal/cropper-modal.page';
import { LanguageService } from '../../services/language.service';
import { FirebaseService } from '../../services/firebase.service';
import { FamilyService } from '../../services/family.service';
import { UtilService } from '../../services/util.service';
import { DataService } from '../../services/data.service';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

import * as $ from 'jquery';

@Component({
  selector: 'app-file',
  templateUrl: './file.page.html',
  styleUrls: ['./file.page.scss'],
})
export class FilePage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  compareResults: any[] = [];
  cResults: any[] = [];
  rootChanged: any = false;
  isCompare: any = false;
  isSync: any = false;
  srcVersion: any;
  modVersion: any;
  message: string = '';
  family: any;
  ancestor: any;
	imageFiles:File[] = [];

  compareMode = false;
  manageMode = false;
  modifyMode = false;
  imageMode = false;
  storageMode = false;
  photoMode = false;

	modifyFileUrl: any;
	modifyFileName: any;
	modifyFileObject: any;

	imageFileName: any = '';
  imageViewMode = false;

	storageFiles: any[] = [];
  storageViewMode = false;
  storageFileName: any = '';

	photoBase64: any = '';
	photoNew: any = false;
	photo: any = '';
 
  // contents: any[] = [];
  // contentMode = false;
  srcFamily: any;
  // msgCompare: any;
  // ancestor_info: any;
  // fileExtension: any = '';
  // percentage = 0;

  constructor(
    private modalCtrl: ModalController,
		private sanitizer: DomSanitizer,
    private familyService: FamilyService,
    private dataService: DataService,
    private languageService: LanguageService,
    private fbService: FirebaseService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    if (DEBUGS.FILE)
      console.log('FilePage - ngOnInit');
    this.start();
		this.modifySetDownloadFile();
  }

  ionViewWillEnter() {
    if (DEBUGS.FILE)
      console.log('FilePage - ionViewWillEnter');
    this.start();
  } 
	
	ionViewWillLeave() {
    if (DEBUGS.FILE)
      console.log('FilePage - ionViewWillLeave');
	}

  start() {
		this.resetModes();
    this.onCompareFamily();
  }

	resetModes() {
    this.compareMode = false;
    this.manageMode = false;
    this.modifyMode = false;
    this.imageMode = false;
    this.storageMode = false;
    this.photoMode = false;
    this.imageViewMode = false;
		this.imageFileName = '';
    this.storageViewMode = false;
		this.storageFileName = '';
		this.rootChanged = false;
  }

  onCompareFamily() {
		this.resetModes();
    this.dataService.readFamily().then((family:any) => {
      this.family = family;
      this.compareOnSync();
			this.compareMode = true;
    });
  }

	onManageFiles() {
		this.resetModes();
		this.manageMode = true;
	}

	onModifyFamily() {
		this.resetModes();
		this.modifyMode = true;
	}

	onUploadImages() {
		this.resetModes();
		this.imageMode = true;
	}

	onManageStorage() {
		this.resetModes();
		this.storageMode = true;
		console.log('storage, compare: ', this.storageMode, this.compareMode);
	}

	onCreatePhoto() {
		this.resetModes();
		this.manageMode = true;
		this.photoMode = true;
		this.photoBase64 = '';
		this.photoNew = true;
		this.photo = '';
	}

	// --- compareMode ---

  async compareOnSync() {
    this.rootChanged = false;
    this.dataService.readFamilyAndInfo().then((data:any) => {
      let localFamily = data.family;
      let info = data.info;
      let ancestor = info.id;
      this.ancestor = ancestor;
      this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
        let remoteFamily = rdata.family;
        this.srcVersion = remoteFamily.version;
        this.modVersion = localFamily.version;
        this.compareResults = this.familyService.compareFamilies(remoteFamily, localFamily);
        if (this.compareResults.length == 1 && this.compareResults[0].srcName) {
          // different root
          this.message = this.languageService.getTranslation('FILE_ROOT_CHANGE_1') + this.compareResults[0].srcName + this.languageService.getTranslation('FILE_ROOT_CHANGE_2') + this.compareResults[0].desName + this.languageService.getTranslation('FILE_ROOT_CHANGE_3');
          this.rootChanged = true;
        } else {
          // data changed
          this.message = this.languageService.getTranslation('FILE_CHANGE_NUMBER') + this.compareResults.length;
          this.compareResults = this.compareGetSyncResults(this.compareResults);
        }
      });
    });
  }

  compareOnCheck(event: any, row: any) {
    row.select = event.detail.checked;
  }

  compareOnCheckAll(event: any) {
    if (DEBUGS.FILE)
      console.log('FilePage - onCheckAll - event.detail.checked: ', event.detail.checked);
    for (let i = 0; i < this.compareResults.length; i++)
        this.compareResults[i].select = event.detail.checked;
    if (DEBUGS.FILE)
      console.log('FilePage - onCheckAll - this.compareResults: ', this.compareResults);
  }

  private compareGetSyncResults(results: any) {
    let res = [];
    results.forEach(row => {
      if (row.mode == 'ADD') {
        let newNode = this.languageService.getTranslation('FILE_NEW_NODE');
        let add = this.languageService.getTranslation('ADD')
        res.push({name: row.name, item: '', key: row.key, mode: row.mode, label: newNode, id: '', old: '', new: add, select: false });
      } else if (row.mode == 'REMOVE') {
        let oldNode = this.languageService.getTranslation('FILE_OLD_NODE');
        let remove = this.languageService.getTranslation('REMOVE')
        res.push({name: row.name, item: '', key: row.key, mode: row.mode, label: oldNode, id: '', old: '', new: remove, select: false });
      } else if (row.mode == 'MODIFY') {
        for (let i = 0; i < row.items.length; i++) {
          let item =  row.items[i];
          let label = this.languageService.getTranslation(item.id);
          if (item.id == 'NODE_GENDER') {
            item.src = this.languageService.getTranslation(item.src);
            item.mod = this.languageService.getTranslation(item.mod);
          }
          if (i == 0)
            res.push({name: row.name, item: row.item, key: row.key, mode: row.mode, label: label, id: item.id, old: item.src, new: item.mod, select: false });
          else
            res.push({name: '', item: '', key: row.key, mode: row.mode, label: label, id: item.id, old: item.src, new: item.mod, select: false });
        }
      }
    })
    return res;
  }

  async compareSetSyncFamily() {
    if (!this.rootChanged) {
      // check if compareResults is selected
      let selCount = 0;
      for (let i = 0; i < this.compareResults.length; i++)
        if (this.compareResults[i].select)
          selCount++;
      if (selCount == 0) {
        // copy source back
        let message = this.utilService.getAlertMessage([
          {name: 'msg', label: 'FILE_SYNC_NOT_1'},
          {name: 'data', label: 'V.'+this.srcVersion},
          {name: 'msg', label: 'FILE_SYNC_NOT_2'},
        ]);
        this.utilService.presentToast(message);
        this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
          this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
            this.utilService.dismissLoading();
          });
        });
        return;
      }
      if (selCount == this.compareResults.length)
        // use all modified data, reset rootChanged
        this.rootChanged = true;
    }
    
    this.dataService.readFamilyAndInfo().then((data:any) => {
      let localFamily = data.family;
      let info = data.info;
      this.utilService.presentLoading();
      let ancestor = info.id;
      this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
        let remoteFamily = rdata.family;
        // if rootChanged just copy over
        let family = this.rootChanged ? localFamily : this.familyService.getSyncFamily(remoteFamily, localFamily, this.compareResults, info);
        // get new version
        let lVersion = +localFamily.version;
        let rVersion = +remoteFamily.version;
        let nVersion = (lVersion > rVersion) ? lVersion : rVersion;
        nVersion++;
        let versionLabel = this.familyService.getVersionLabel(nVersion);
        family.version = nVersion;
        rdata.family = family;
        if (DEBUGS.FILE)
          console.log('setSyncFamily - family:' , family);
        this.fbService.saveAncestorData(rdata).then((status:any) => {
          this.fbService.saveBackupFamily(ancestor, family, versionLabel).then((status:any) => {
            this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
              this.utilService.dismissLoading();
              let message = this.utilService.getAlertMessage([
                {name: 'msg', label: 'FILE_SYNC_TREE_1'},
                {name: 'data', label: 'V.'+family.version},
                {name: 'msg', label: 'FILE_SYNC_TREE_2'},
              ]);
              this.utilService.presentToast(message);
            });
          });
        });
      });
    });
  }
	
	// --- modifyMode ---

	modifySetDownloadFile() {
		// download family data from Firebase to local file for editing
		this.dataService.readFamilyAndInfo().then((data:any) => {
      let family = data.family;
      let info = data.info;
			let ancestor = info.id;
			this.modifyFileName = ancestor + '.json';
			this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
				// clean family data before save to local
				let cleanFamily = this.familyService.getFilterFamily(rdata.family, true);
				let data = JSON.stringify(cleanFamily, null, 2);
				// console.log('data: ', data);
				const blob = new Blob([data], {
					type: 'application/octet-stream'
				});
				this.modifyFileName = ancestor + '-' + family.version + '.json';
				this.modifyFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
			});
		});
		this.modifyFileObject = null;
  }

	modifyOnDownloadComplete() {
		this.utilService.presentToast(this.languageService.getTranslation('FILE_MODIFY_DOWNLOAD_COMPLETE') + this.modifyFileName, 5000);
	}

	modifyOnFileSelect(event: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.modifyFileObject = file;
		// console.log('file: ', file);
		this.modifyOnFileUpload(file);
  }

	modifyOnFileUpload(file: any) {
    // console.log('FilePage - onDownloadFileUpload');
		// let file: File = this.modifyFileObject;
    const name:string = file.name;
    // get extension
    const type = name.substring(name.lastIndexOf('.')+1);
		console.log('type: ', type);
    this.modifyUploadFile(file).then((res: any) => {
      if (DEBUGS.APP)
        console.log('modifyOnFileUpload - res: ', res);
      if (res.text) {
        // validate json file
				let family = this.modifyGetValidateData(res.text);
        if (family) {
					this.dataService.readFamilyAndInfo().then((ldata:any) => {
						let ancestor = ldata.info.id;
						this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
							rdata.family = family;
							this.fbService.saveAncestorData(rdata).then((status:any) => {
								this.utilService.presentToast(this.languageService.getTranslation('FILE_DOWNLOAD_UPLOAD'), 1000);
							});
						});
					});
        } else {
					this.utilService.presentToast(this.languageService.getTranslation('FILE_DOWNLOAD_FILE_INVALID'), 1000);
				}
      } else {
				this.utilService.presentToast(this.languageService.getTranslation('FILE_DOWNLOAD_FILE_EMPTY'), 1000);
      }
    });
  }

	modifyUploadFile(file:File) {
    return new Promise((resolve) => {
      const name = file.name;
      var myReader: FileReader = new FileReader();
			myReader.readAsText(file);
			myReader.onload = ((event:any) => {
				let text:any = event.target.result;
			// always parse json (string) to object
				resolve({text: text});
			});
    });
  }

	modifyGetValidateData(text: any) {
		let family: any = null;
		try {
			family = JSON.parse(text);
			if (!family.version || !family.nodes || !family.children)
				return null;
		} catch (error) {
			console.log('getValidateData - error: ', error);
		}		
    return family;
  }

	// --- imageMode ---

  imageOnSelect(event: any): void {

		this.resetModes();

		this.manageMode = true;
		this.imageMode = true;

    const files = [...event.target.files]
    if (this.imageFiles.length == 0) {
        this.imageFiles = files;
    } else {
      files.forEach((file:File) => {
        let index = this.imageFiles.findIndex((f:File) => f.name == file.name);
        if (index == -1)
          this.imageFiles.push(file);
      });
    }
  }

  imageOnDelete(file:File) {
    if (DEBUGS.FILE)
      console.log('FilePage - onFileDelete');
    let index = this.imageFiles.findIndex((f:File) => f.name == file.name);
    if (index != -1) {
      const files:File[] = [];
      for (let i = 0; i < this.imageFiles.length; i++) {
        if (i != index)
          files.push(this.imageFiles[i])
      }
      this.imageFiles = files;
    }
  }

	imageOnView1(file: any) {
		if (DEBUGS.FILE)
      console.log('imageViewMode - file: ', file);
    this.imageViewMode = true;
    this.imageFileName = file.name;
		const img = document.getElementById('image-view');
		img.setAttribute('src', file.url);
  }

  imageOnView(file:File) {
		// if (this.imageViewMode) {
		// 	this.imageViewMode = false;
		// 	return;
		// }
		this.imageViewMode = true;
    this.imageFileName = file.name;
    const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = ((event:any) => {
			$('#image-view').attr('src', event.target.result);
		});
    
  }

  imageOnUpload(file:File) {
    console.log('FilePage - onFileUpload');
    const name:string = file.name;
    this.imageUploadFile(file, this.ancestor).then((res: any) => {
      if (DEBUGS.FILE)
        console.log('onFileUpload - res: ', res);
			let message = this.languageService.getTranslation('FILE_UPLOAD_FILE') + ': ' + name;
			this.utilService.presentToast(message);
    });
  }

  imageUploadFile(file:File, ancestor) {
    return new Promise((resolve) => {
      const name = file.name;
      var myReader: FileReader = new FileReader();
			myReader.readAsDataURL(file);
			myReader.onload = ((event:any) => {
				let base64 = event.target.result;
				base64 = base64.replace("data:", "").replace(/^.+,/, "");
				// const id = name.substring(0, name.lastIndexOf('.'));
				// const storageId = ancestor + '-' + this.utilService.getDateID(true) + '-' + id;
				// const storageId = ancestor + '/' + id;
				const storageId = name;
				console.log('uploadLocalImage - storageId: ', storageId);
				this.fbService.addImage(base64, 1, ancestor, storageId).then(urlStorage => {
					resolve({storageId: storageId, urlStorage: 'urlStorage'});
				});
			});
    });
  }

	// --- storageMode ---

  storageReadFiles(): void {
    // if (DEBUGS.FILE)
    //   console.log('storageReadFiles');
    // if (this.storageMode) {
    //   this.storageMode = false;
    //   return;
    // }
    this.resetModes();
    this.manageMode = true;
    this.storageMode = true;
		// console.log('storageReadFiles - storageMode: ', this.storageMode);

    this.fbService.getFileList(this.ancestor).then((res:any) => {
      this.storageFiles = res;
      if (DEBUGS.FILE)
        console.log('onStorageFile - res: ', res);
    });

  }

  storageOnDelete(file: any) {
    if (DEBUGS.FILE)
      console.log('onStorageDelete');
    this.fbService.deleteImage(this.ancestor, file.name).then((status:any) => {
      this.fbService.getFileList(this.ancestor).then((res:any) => {
        this.storageFiles = res;
        console.log('FilePage - res: ', res);
      });
    });
  }

  storageOnView(file: any) {
		if (DEBUGS.FILE)
      console.log('onStorageView - file: ', file);
    this.storageViewMode = true;
    this.storageFileName = file.name;
		if (['png', 'jpg', 'jpeg'].indexOf(file.type) > -1) {
      console.log('onStorageView - type: ', file.type);
      let img = document.getElementById('storage-view');
			if (!img) {
				// some time too early to activate dom, wait 200 ms
				setTimeout(() => {
					let img = document.getElementById('storage-view');
					img.setAttribute('src', file.url);
				}, 200);
			} else
				img.setAttribute('src', file.url);
    } else {
      window.open(file.url);
    }
  }

	 // --------- photo ----------
	
  photoSave() {
    // save new photo
		if (this.photoBase64 != '' && this.photo != '') {
			// let photoName = this.nodeService.getPhotoName(this.node, true);
			let photoName = this.photo;
			let base64 = this.photoBase64;
			let type = base64.substring('data:'.length, base64.indexOf(';'));
			base64 = base64.replace("data:", "").replace(/^.+,/, "");
			this.fbService.addImage(base64, type, this.ancestor, photoName).then(urlStorage => {
				this.utilService.presentToast(this.languageService.getTranslation('FILE_PHOTO_SAVE') + photoName, 5000);
			});
		} else {
		}
  }

  photoDelete() {
    this.photoBase64 = '';
    this.photoNew = true;
		this.photo = '';
  }

  photoEdit() {
    this.openCropperModal(this.photoBase64, true);
  }

	photoGetFile(event: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.modifyFileObject = file;
		// console.log('file: ', file);
		const name = file.name;
		const myReader: FileReader = new FileReader();
		myReader.readAsDataURL(file);
		myReader.onload = ((event:any) => {
			let base64 = event.target.result;
			// base64 = base64.replace("data:", "").replace(/^.+,/, "");
			// console.log('fileName: ', name)
			this.photoBase64 = base64;
			this.photoNew = true;
			this.photo = name;
		});
  }

  async openCropperModal(photoBase64: any, url: any) {
    const cropperModal = await this.modalCtrl.create({
      component: CropperModalPage,
      componentProps: {
        'caller': 'NodePage',
        'data': photoBase64,
        'url': url
      },
			backdropDismiss:false
    });
    await cropperModal.present();
    const { data } = await cropperModal.onDidDismiss();
    if (data.result) {
      this.photoBase64 = data.result;
      this.photoNew = true;
    }
  }
}

