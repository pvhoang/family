import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, Platform } from '@ionic/angular';
import { CropperModalPage } from './cropper-modal/cropper-modal.page';
import { LanguageService } from '../../services/language.service';
import { FirebaseService } from '../../services/firebase.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
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
	compareCount = 0;
  isCompare: any = false;
  isSync: any = false;
  srcVersion: any;
  modVersion: any;
  message: string = '';
  family: any;
  ancestor: any;
	imageFiles:File[] = [];

  compareMode = true;
  manageMode = false;
  modifyMode = false;
  imageMode = false;
  storageMode = false;
  photoMode = false;

	downloadFileUrl: any;
	downloadFileName: any;
	downloadDocsUrl: any;
	downloadDocsName: any;

	imageFileName: any = '';
  imageViewMode = false;
	storageFiles: any[] = [];
  storageViewMode = false;
  storageFileName: any = '';

	photoBase64: any = '';
	photoNew: any = false;
	photo: any = '';
	photoCaption: any = '';
 
  srcFamily: any;

  constructor(
    private modalCtrl: ModalController,
		private sanitizer: DomSanitizer,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private fbService: FirebaseService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    if (DEBUGS.FILE)
      console.log('FilePage - ngOnInit');
    this.start();
		// this.downloadSetFile();
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
		if (DEBUGS.FILE)
			console.log('storage, compare: ', this.storageMode, this.compareMode);
	}

	// --- compareMode ---

  async compareOnSync() {
    this.rootChanged = false;
    this.compareCount = 0;

    this.dataService.readFamilyAndInfo().then((data:any) => {
      let localFamily = data.family;
      let info = data.info;
      let ancestor = info.id;
      this.ancestor = ancestor;
			// this.downloadFileName = ancestor + '-' + this.utilService.getShortDateID('-') + '.json';
			// this.downloadDocsName = ancestor + '-docs.json';
			this.downloadFileName = 'family-' + this.utilService.getShortDateID('-') + '.json';
			this.downloadDocsName = 'docs-' + this.utilService.getShortDateID('-') + '.json';
      this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
        let remoteFamily = rdata.family;
				this.comparePrintNode('compareOnSync', localFamily, remoteFamily);

        this.srcVersion = remoteFamily.version;
        this.modVersion = localFamily.version;
        this.compareResults = this.familyService.compareFamilies(remoteFamily, localFamily);
				
				if (DEBUGS.FILE)
					console.log('compareOnSync - compareResults:' , this.compareResults);

        if (this.compareResults.length == 1 && this.compareResults[0].srcName) {
          // different root
          this.message = this.languageService.getTranslation('FILE_COMPARE_ROOT_CHANGE_1') + this.compareResults[0].srcName + this.languageService.getTranslation('FILE_COMPARE_ROOT_CHANGE_2') + this.compareResults[0].desName + this.languageService.getTranslation('FILE_COMPARE_ROOT_CHANGE_3');
          this.rootChanged = true;
        } else {
          // data changed
          this.message = this.languageService.getTranslation('FILE_COMPARE_CHANGE_NUMBER') + this.compareResults.length;
          this.compareResults = this.compareGetSyncResults(this.compareResults);
					// console.log('compareSetSyncFamily - compareResults:' , this.compareResults);
        }
				if (DEBUGS.FILE)
					this.comparePrintNode('compareOnSync', localFamily, remoteFamily);
      });
    });
  }

  compareOnCheck(event: any, row: any) {
    row.select = event.detail.checked;
		this.compareCount = this.compareSelectCount();
  }

  compareOnCheckAll(event: any) {
    if (DEBUGS.FILE)
      console.log('FilePage - onCheckAll - event.detail.checked: ', event.detail.checked);
    for (let i = 0; i < this.compareResults.length; i++)
        this.compareResults[i].select = event.detail.checked;
    if (DEBUGS.FILE)
      console.log('FilePage - onCheckAll - this.compareResults: ', this.compareResults);
		this.compareCount = this.compareSelectCount();
  }

	compareSelectCount() {
		let count = 0;
		for (let i = 0; i < this.compareResults.length; i++)
			count += this.compareResults[i].select ? 1 : 0;
		return count;
  }

  private compareGetSyncResults(results: any) {
    let res = [];
    results.forEach(row => {
      if (row.mode == 'ADD') {
        let newNode = this.languageService.getTranslation('FILE_COMPARE_NEW_NODE');
        let add = this.languageService.getTranslation('ADD')
        res.push({name: row.name, item: '', key: row.key, mode: row.mode, label: newNode, id: '', old: '', new: add, select: false });
      } else if (row.mode == 'REMOVE') {
        let oldNode = this.languageService.getTranslation('FILE_COMPARE_OLD_NODE');
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
		// make sure the difference fits to column
		res.forEach((row:any) => {
			if (row.old.length > 30)
				row.old = row.old.substring(0, 30) + ' ...';
			if (row.new.length > 30)
				row.new = row.new.substring(0, 30) + ' ...';
		})
    return res;
  }

  comparePrintNode(message, localFamily, remoteFamily, newFamily?) {
		let remoteNodes = this.nodeService.getFamilyNodes(remoteFamily, true);
		let machineNodes = this.nodeService.getFamilyNodes(localFamily, true);
		const remoteNode = remoteNodes.find((element) => element.name == 'Phan Dính');
		const machineNode = machineNodes.find((element) => element.name == 'Phan Dính');
		console.log('comparePrintNode - message: ' , message);
		console.log('comparePrintNode - remote Node:' , remoteNode);
		console.log('comparePrintNode - machine Node:' , machineNode);
		if (newFamily) {
			let newNodes = this.nodeService.getFamilyNodes(newFamily, true);
			const newNode = newNodes.find((element) => element.name == 'Phan Dính');
			console.log('comparePrintNode - new Node:' , newNode);
		}
	}

  async compareSetSyncFamily() {

    if (!this.rootChanged) {
			if (this.compareCount == 0) {
        // copy data from source back to local
        this.utilService.presentLoading();
        this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
          this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
            this.utilService.dismissLoading();
						let message = this.utilService.getAlertMessage([
							{name: 'msg', label: 'FILE_COMPARE_SYNC_TREE_1'},
							{name: 'data', label: 'V.'+this.srcVersion},
							{name: 'msg', label: 'FILE_COMPARE_SYNC_TREE_2'},
						]);
						this.utilService.presentToast(message);
          });
        });
        return;
      }
    }
    
    this.dataService.readFamilyAndInfo().then((data:any) => {
      let localFamily = data.family;
      let info = data.info;
      let ancestor = info.id;
      this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
        let remoteFamily = rdata.family;
				let family = this.rootChanged ? localFamily : this.familyService.getSyncFamily(remoteFamily, localFamily, this.compareResults, info);
				// get new version
        let lVersion = +localFamily.version;
        let rVersion = +remoteFamily.version;
        let nVersion = (lVersion > rVersion) ? lVersion : rVersion;
        nVersion++;
        let versionLabel = this.familyService.getVersionLabel(nVersion);
        family.version = nVersion;
				// set today date
				family.date = this.utilService.getShortDateID('/');
				// clean family before save
				let cleanFamily = this.familyService.getFilterFamily(family, true);
        rdata.family = cleanFamily;
				this.utilService.presentLoading();
        this.fbService.saveAncestorData(rdata).then((status:any) => {
          this.fbService.saveBackupFamily(ancestor, cleanFamily, versionLabel).then((status:any) => {
						this.utilService.dismissLoading();
						let message = this.utilService.getAlertMessage([
							{name: 'msg', label: 'FILE_COMPARE_SYNC_TREE_1'},
							{name: 'data', label: 'V.'+family.version},
							{name: 'msg', label: 'FILE_COMPARE_SYNC_TREE_2'},
						]);
						this.utilService.presentToast(message);
          });
        });

      });
    });
  }
	
// --------- downloadMode ----------

	downloadOnClick() {
		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_DOWNLOAD_MESSAGE_1'},
			{name: 'data', label: this.downloadFileName + ', ' + this.downloadDocsName },
			// {name: 'data', label: this.downloadFileName },
			{name: 'msg', label: 'FILE_DOWNLOAD_MESSAGE_2'},
		]);
		this.utilService.alertConfirm('FILE_DOWNLOAD_START', msg, 'CANCEL', 'OK').then((res) => {
			if (res.data) {
				this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
					// clean family data before save to local
					let cleanFamily = this.familyService.getFilterFamily(rdata.family, true);
					// let cleanBranch = this.familyService.getFilterFamily(rdata.branch, true);
					rdata.family = cleanFamily;
					// rdata.branch = rdata.branch;
					// save just family, because docs is html-based text! Can not change simply with text editor.
					
					// save family
					let data = JSON.stringify(cleanFamily, null, 2);
					const blobFamily = new Blob([data], {
						type: 'application/octet-stream'
					});
					this.downloadFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blobFamily));
					// https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
					
					// save docs
					let docs = JSON.stringify(rdata.docs, null, 2);
					const blobDocs = new Blob([docs], {
						type: 'application/octet-stream'
					});
					this.downloadDocsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blobDocs));

					setTimeout(() => {
						document.getElementById("modify-download").click();
						document.getElementById("modify-download-docs").click();
						this.utilService.presentToast(this.languageService.getTranslation('FILE_DOWNLOAD_COMPLETE'), 5000);
					}, 200);
				});
			}
		});
	}

	// --- uploadMode ---

	uploadOnClick() {
		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_UPLOAD_MESSAGE'}
		]);
		this.utilService.alertConfirm('FILE_UPLOAD_START', msg, 'CANCEL', 'OK').then((res) => {
			if (res.data) {
				// https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript
				document.getElementById("modify-upload").click()
			}
		});
	}

	uploadOnFileSelect(event: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.uploadOnFile(file);
  }

	private uploadOnFile(file: any) {
		// console.log('type: ', type);
    this.uploadGetTextFile(file).then((res: any) => {
      // if (DEBUGS.APP)
      //   console.log('modifyOnFileUpload - res: ', res);
      if (res.text) {
        // validate json file
				let family = this.uploadValidateFamily(res.text);
        if (family) {
					this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
						rdata.family = family;
						this.fbService.saveAncestorData(rdata).then((status:any) => {
							let msg = this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_1') + '<b>' + file.name + '</b>' + this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_2');
							this.utilService.presentToast(msg);
						});
					});
				} else {
					let docs = this.uploadValidateDocs(res.text);
					if (docs) {
						this.fbService.saveDocsAll(this.ancestor, docs).then((status:any) => {
							let msg = this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_1') + '<b>' + file.name + '</b>' + this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_2');
							this.utilService.presentToast(msg);
						});
					} else {
						this.utilService.presentToast(this.languageService.getTranslation('FILE_UPLOAD_FILE_INVALID'));
					}
				}
      } else {
				this.utilService.presentToast(this.languageService.getTranslation('FILE_UPLOAD_FILE_EMPTY'));
      }
    });
  }

	private uploadGetTextFile(file:File) {
    return new Promise((resolve) => {
      var myReader: FileReader = new FileReader();
			myReader.readAsText(file);
			myReader.onload = ((event:any) => {
				let text:any = event.target.result;
			// always parse json (string) to object
				resolve({text: text});
			});
    });
  }

	private uploadValidateFamily(text: any) {
		let family: any = null;
		try {
			family = JSON.parse(text);
			// must have version, nodes and children. Date is not important
			if (!family.version || !family.nodes || !family.children)
				return null;
			// set new version from local version (same as server version)
			let nVersion = this.family.version + 1;
			family.version = nVersion;
			family.date = this.utilService.getShortDateID('/');
			// check if this family is validated
			let cleanFamily = this.familyService.getFilterFamily(family, true);
			return cleanFamily;
		} catch (error) {
			console.log('uploadValidateFamily - error: ', error);
			return null;
		}		
  }

	private uploadValidateDocs(text: any) {
		let docs: any = null;
		try {
			docs = JSON.parse(text);
			// must have vi, en, and pha_nhap
			if (!docs.vi || !docs.en || !docs.vi.pha_nhap)
				return null;
			// set new version from local version (same as server version)
			return docs;
		} catch (error) {
			console.log('uploadValidateDocs - error: ', error);
			return null;
		}		
  }
	
// --------- photoMode ----------
	
photoCreate(start: boolean) {
	if (start) {
		this.resetModes();
		this.manageMode = false;
		this.photoMode = true;
		this.photoBase64 = '';
		this.photo = '';
	}
	document.getElementById("photo-image").click();
}

photoGetFile(event: any): void {
	const files = [...event.target.files]
	const file = files[0];
	const name = file.name;
	const myReader: FileReader = new FileReader();
	myReader.readAsDataURL(file);
	myReader.onload = ((event:any) => {
		let base64 = event.target.result;
		this.photoBase64 = base64;
		this.photo = name;
	});
}

photoSave() {
	if (this.photoBase64 != '')
		this.photoUpload( this.photo, this.ancestor, this.photoBase64, null);
}

photoDelete() {
	this.photoBase64 = '';
	this.photoNew = true;
	this.photo = '';
}

photoEdit() {
	this.openCropperModal(this.photoBase64, true);
}

async openCropperModal(photoBase64: any, url: any) {
	const cropperModal = await this.modalCtrl.create({
		component: CropperModalPage,
		componentProps: {
			'caller': 'NodePage',
			'data': photoBase64,
			'url': url
		},
		cssClass: 'modal-dialog',
		backdropDismiss:false
	});
	await cropperModal.present();
	const { data } = await cropperModal.onDidDismiss();
	if (data.result) {
		this.photoBase64 = data.result;
		this.photoNew = true;
	}
}

private photoUpload(photo: string, ancestor:string, photoBase64: string, file:File) {

	// console.log('photo: ', photo);
	let title = this.languageService.getTranslation('FILE_PHOTO_UPLOAD');
	let cancel = this.languageService.getTranslation('CANCEL');
	let ok = this.languageService.getTranslation('OK');
	let inputs = [{
			label: this.languageService.getTranslation('FILE_PHOTO_NAME'),
			value: photo,
			placeholder: this.languageService.getTranslation('FILE_PHOTO_NAME'),
			attributes: { maxlength: 50 },
		},
	]
	this.utilService.alertText(title, inputs, cancel, ok, 'alert-dialog').then(result => {
		if (result.data) {
			let photoName = result.data[0];
			if (photoName != '') {
				if (photoBase64) {
					this.loadImage(photoBase64, photoName, ancestor);
				} else {
					var myReader: FileReader = new FileReader();
					myReader.readAsDataURL(file);
					myReader.onload = ((event:any) => {
						let base64 = event.target.result;
						this.loadImage(base64, photoName, ancestor);
					});
				}
			} else {
				this.utilService.presentToast(this.languageService.getTranslation('FILE_PHOTO_NAME_INVALID'), 3000);
			}
		}
	})
}

private loadImage(base64: string, photoName: string, ancestor:string) {
	let type = base64.substring('data:'.length, base64.indexOf(';'));
	base64 = base64.replace("data:", "").replace(/^.+,/, "");
	this.fbService.addImage(base64, type, ancestor, photoName).then(urlStorage => {
		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_PHOTO_COMPLETE_1'},
			{name: 'data', label: photoName},
			{name: 'msg', label: 'FILE_PHOTO_COMPLETE_2'},
		]);
		this.utilService.presentToast(msg, 5000);
	});
}

// --- imageMode ---

	imageOnClick(start: boolean) {
		if (start) {
			this.resetModes();
			this.manageMode = false;
			this.imageMode = true;
			this.imageFiles = [];
		}
		document.getElementById("modify-image").click();
	}

  imageOnSelect(event: any): void {
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
		event.target.value = null;
  }

	getKB(size: any) {
		let kb = size / 1024;
		let str = '';
		if (kb < 1)
			str = size + ' Byte';
		else if (kb < 1000)
			str = Math.round(kb) + ' KB';
		else {
			// let mb = kb / 1024;
			str = (Math.round(kb)).toLocaleString('vi', { minimumFractionDigits: 0, maximumFractionDigits: 3}) + ' KB';
			// str = (Math.round(mb)).toLocaleString('vi', { minimumFractionDigits: 3, maximumFractionDigits: 3}) + ' MB'
		}
		return str;
	}

  imageOnDelete(file:File) {
    if (DEBUGS.FILE)
      console.log('FilePage - imageOnDelete: ', this.imageFiles);
    let index = this.imageFiles.findIndex((f:File) => f.name == file.name);
    if (index != -1) {
      const files:File[] = [];
      for (let i = 0; i < this.imageFiles.length; i++) {
        if (i != index)
          files.push(this.imageFiles[i])
      }
      this.imageFiles = files;
			// console.log('imageOnDelete - imageFiles: ', this.imageFiles);
    }
  }

  imageOnView(file:File) {
		this.imageViewMode = true;
    this.imageFileName = file.name;
    const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = ((event:any) => {
			$('#image-view').attr('src', event.target.result);
		});
    
  }

  imageOnUpload(file:File) {
    console.log('FilePage - imageOnUpload');
    const photo:string = file.name;
		this.photoUpload(photo, this.ancestor, null, file);
  }

	// --- storageMode ---

  storageReadFiles(): void {
    this.resetModes();
    this.manageMode = false;
    this.storageMode = true;
    this.fbService.getFileList(this.ancestor).then((res:any) => {
      this.storageFiles = res;
      if (DEBUGS.FILE)
        console.log('onStorageFile - res: ', res);
    });
  }

  storageOnDelete(file: any) {
    if (DEBUGS.FILE)
      console.log('onStorageDelete');
		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_STORAGE_DELETE_1'},
			{name: 'data', label: file.name},
			{name: 'msg', label: 'FILE_STORAGE_DELETE_2'},
		]);
    this.utilService.alertConfirm('FILE_STORAGE_DELETE', msg, 'CANCEL', 'OK').then((res) => {
      if (res.data) {
				this.fbService.deleteImage(this.ancestor, file.name).then((status:any) => {
					this.fbService.getFileList(this.ancestor).then((res:any) => {
						this.storageFiles = res;
					});
				});
      }
    });
  }

  storageOnView(file: any) {
		if (DEBUGS.FILE)
      console.log('onStorageView - file: ', file);
    this.storageViewMode = true;
    this.storageFileName = file.name;
		if (['png', 'jpg', 'jpeg'].indexOf(file.type) > -1) {
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
	 
}

