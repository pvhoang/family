import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { CropperModalPage } from './cropper-modal/cropper-modal.page';
import { LanguageService } from '../../services/language.service';
import { FirebaseService } from '../../services/firebase.service';
import { FamilyService } from '../../services/family.service';
import { UtilService } from '../../services/util.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { NgxImageCompressService } from 'ngx-image-compress';
import { JsonEditorComponent } from '../../components/jsoneditor/jsoneditor.component';
import { JsoneditorService } from '../../services/jsoneditor.service';
// import { NodePage } from '../node/node.page';


import * as $ from 'jquery';
// https://stackoverflow.com/questions/41991178/correct-way-of-importing-and-using-lodash-in-angular
import * as _ from 'lodash';

@Component({
  selector: 'app-filer',
  templateUrl: './filer.page.html',
  styleUrls: ['./filer.page.scss'],
})
export class FilerPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  compareResults: any[] = [];
  cResults: any[] = [];
	compareCount = 0;
  isCompare: any = false;
  isSync: any = false;
  srcVersion: any;
  modVersion: any;
  message: string = '';
  family: any;
  ancestor: any;
  familyName: any;
	imageFiles:File[] = [];

  uploadMode = false;
  imageMode = false;
  storageMode = false;
  photoMode = false;
  notifyMode = false;

	downloadFileUrl: any;
	downloadFileName: any;
	downloadDocsUrl: any;
	downloadDocsName: any;

	uploadItems: any;
  uploadItemsPlaceholder: any = '';
	editorOptions: any;

	imageFileName: any = '';
  imageViewMode = false;
	storageFiles: any[] = [];
  storageViewMode = false;
  storageFileName: any = '';

	recipientList: any[] = [];
	messageList: any[] = [];
	memorialMsg: any;

	photoBase64: any = '';
	photoNew: any = false;
	photo: any = '';
	photoCaption: any = '';

	@ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  data: any;
  showData: any;
  uploadModeShow = false;
	jsonFileName = '';
	jsonFileUrl: any;

  srcFamily: any;

  constructor(
    private modalCtrl: ModalController,
    private dataService: DataService,
    private familyService: FamilyService,
    private languageService: LanguageService,
    private jsoneditorService: JsoneditorService,
    private fbService: FirebaseService,
    private utilService: UtilService,
    private nodeService: NodeService,
		private imageCompress: NgxImageCompressService
  ) { }

  ngOnInit() {
    if (DEBUGS.FILE)
      console.log('FilePage - ngOnInit');
    this.start();
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
		this.ancestor = this.fbService.getAncestorID();


		this.dataService.readAncestorData().then((data:any) => {
      this.ancestor = data.info.id;
			this.familyName = data.info.family_name;
			this.family = data.family;

		// this.fbService.getCollectionJson('FAMILY').then((json:any) => {
		// 	this.familyName = this.ancestor;
		// 	this.family = json;
			let fullFamily = this.familyService.buildFullFamily(this.family);
			this.memorialMsg = this.familyService.passAwayFamily(fullFamily);

			this.jsoneditorService.startEditor(this.familyName);
			this.editorOptions = this.jsoneditorService.getEditorOptions();

			// start notify mode
			this.notifyMode = true;
			this.notifyReadList();
			
		});
  }

	resetModes() {
    this.uploadMode = false;
		this.jsonFileName = this.languageService.getTranslation('FILE_UPLOAD_JSON');
    this.imageMode = false;
    this.storageMode = false;
    this.photoMode = false;
    this.imageViewMode = false;
		this.imageFileName = '';
    this.storageViewMode = false;
		this.storageFileName = '';
    this.notifyMode = false;

  }

	// --- uploadMode ---

	uploadOnClick(start: boolean) {
		if (start) {
			this.resetModes();
			this.uploadMode = true;
			this.uploadModeShow = false;
			this.showData = null;
		} else
			document.getElementById("modify-upload-json").click()
	}

	uploadOnFileSelect(event: any, type: any): void {
    const files = [...event.target.files]

		console.log('files: ', files);

		const file = files[0];
		this.uploadOnFile(file, type);
  }

	private uploadOnFile(file: any, type: any) {
		// console.log('type: ', type);
    this.uploadGetTextFile(file).then((res: any) => {
      // if (DEBUGS.APP)
        console.log('uploadOnFile - file: ', file);
			this.jsonFileName = file.name;
			this.uploadEdit(res.text, type);
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

	private uploadDisplayImageErrors(keys: any) {
    let msgs = [];
		msgs.push({name: 'msg', label: this.languageService.getTranslation('FILE_UPLOAD_FILES_NOT_AVAILABLE')});
		msgs.push({name: 'msg', label: '&nbsp;'});
		keys.forEach((key:any) => {
			msgs.push({name: 'msg', label: '. ' + key});
		})
		console.log('msgs: ', msgs);
    let message = this.utilService.getAlertMessage(msgs, true);
		this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 450 }).then(choice => {});
  }

	async uploadEdit(text: any, type: any) {
		this.uploadModeShow = true;
		this.showData = this.data = JSON.parse(text);
		// this.onPhaDo();
	}

	// async onPhaDo() {
	// 	const modal = await this.modalCtrl.create({
	// 		component: NodePage,
	// 		componentProps: {
	// 			'caller': 'home',
	// 		},
	// 		cssClass: 'modal-dialog',
	// 		backdropDismiss:false
	// 	});
	// 	modal.onDidDismiss().then((resp) => {
	// 		// this.toPage('pha_do');
	// 	});
	// 	return await modal.present();
	// }

	uploadChange(event = null) {
    const editorJson = this.editor.getEditor();
    editorJson.validate();
		// if there is schema, check against it
		if (editorJson.validateSchema) {
			const errors = editorJson.validateSchema.errors;
			if (errors)
				console.log('ERROR - errors: ', errors);
			if (errors && errors.length > 0) {
				editorJson.set(this.showData);
			} else {
				// restore good one
				this.showData = this.editor.get();
			}
		}
  }

	uploadProcess(mode: any) {
		if (mode == 'cancel') {

		} else if (mode == 'save') {
			let json: any = this.editor.get();
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.uploadDisplayFieldErrors(errorFields);
				return;
			}
			let text: any = JSON.stringify(json, null, 2);
			const newBlob = new Blob([text], { type: "text/csv" });
			const data = window.URL.createObjectURL(newBlob);
			const link = document.createElement("a");
			link.href = data;
			link.download = this.jsonFileName; // set a name for the file
			link.click();

		} else if (mode == 'upload') {
			// validate field names
			let json:any = this.editor.get();
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.uploadDisplayFieldErrors(errorFields);
				return;
			}
			this.uploadJson(json);
		}
	}

	// private uploadJson3(json: any) {
	// 	let title = json.title;
	// 	// if (title == 'INFO') {
	// 		console.log('json: ', json);
	// 		this.fbService.setCollectionJson(this.ancestor, title, json).then((status:any) => {
	// 				this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
	// 		});
	// 	// }
	// }

	private uploadJson(json: any) {
		let title = json.title;
		if (title == 'info') {
			this.fbService.setCollectionJson(title, json).then((status:any) => {
				this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
			});
			return;
		}
		// now check new image files
		this.uploadValidateImage(json).then((res:any) => {
			if (DEBUGS.FILE)
				console.log('uploadValidateImage - res: ', res);
			let newFiles = res[0];
			if (newFiles.length > 0) {
				// files not in storage, errors
				this.uploadDisplayImageErrors(newFiles);
				return;
			}
			// build new images files
			let storageImages = res[1];
			// some time it's too slow to process file list, wait 2 sec
			let toastMsg = (title == 'family') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 
			this.utilService.presentToast(toastMsg);
			setTimeout(() => {
				let images = {};
				storageImages.forEach((file:any) => {
					images[file.name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
				})
				// update family and images to server
				this.fbService.setCollectionJson('images', images).then((status:any) => {});
				this.fbService.setCollectionJson(title, json).then((status:any) => {
					this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
				});
			}, 2000);
		})
	}



	// private uploadJson1(json: any) {
	// 	let title = json.title;
	// 	if (title == 'INFO') {
	// 			// update info to server
	// 		this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
	// 			rdata.info = json;
	// 			this.fbService.saveAncestorData(rdata).then((status:any) => {
	// 				this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
	// 			});
	// 		});
	// 		return;
	// 	}
	
	// 	// now check new image files
	// 	this.uploadValidateImage(json).then((res:any) => {
	// 		if (DEBUGS.FILE)
	// 			console.log('uploadValidateImage - res: ', res);
	// 		let newFiles = res[0];
	// 		if (newFiles.length > 0) {
	// 			// files not in storage, errors
	// 			this.uploadDisplayImageErrors(newFiles);
	// 			return;
	// 		}
	// 		// build new images files
	// 		let storageImages = res[1];
	// 		// some time it's too slow to process file list, wait 2 sec
	// 		let toastMsg = (title == 'FAMILY') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 
	// 		this.utilService.presentToast(toastMsg);
	// 		setTimeout(() => {
	// 			let images = {};
	// 			storageImages.forEach((file:any) => {
	// 				images[file.name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
	// 			})
				
				
	// 			// update family and images to server
	// 			this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
	// 				rdata.images = images;
	// 				const doc = (title == 'FAMILY') ? 'family' : 'docs';
	// 				rdata[doc] = json;
	// 			console.log('uploadValidateImage - json: ', json);

	// 				this.fbService.saveAncestorData(rdata).then((status:any) => {
	// 					this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
	// 				});
	// 			});
	// 		}, 2000);
	// 	})
	// }

	private uploadValidateImage(json: any) {
		return new Promise((resolve) => {
			this.utilService.presentToast('FILE_UPLOAD_WAIT_READING_STORAGE_IMAGES');
			// get image list from doc text
			let docImages = this.uploadGetImages(JSON.stringify(json), json.title);
			console.log('uploadValidateImage - docImages: ', docImages);
			//  get images from storage
			this.fbService.getFileList(this.ancestor).then((storageImages:any) => {
			//  get images from local
				// wait 1 second for async to complete
				setTimeout(() => {
					console.log('uploadValidateImage - storageImages: ', storageImages);
					let newFiles = [];
					// go thru each image in doc
					docImages.forEach(dimage => {
						// compare with storageImages
						let index = storageImages.findIndex((sitem: any) => sitem.name == dimage);
						if (index == -1)
							newFiles.push(dimage);
					})
					console.log('uploadValidateDocs - newFiles: ', newFiles);
					// this.utilService.dismissLoading();
					resolve([newFiles, storageImages]);
				}, 3000);
			});
		});
	}

	private uploadGetImages(text: any, title: string) {
		// "im|ac|2|Nhà Thờ Phan Tộc.png|Đá Bạc, Quảng Bình"
		// "[3|Mộ Tổ Đời 1.jpg|1|1|Tổ mộ, Nghĩa trang Đá Bạc]",
		// "photo": "Phan Ngọc Luật.jpg",
		// search photo
		let images = [];
		let i1 = 0;
		if (title == 'family') {
			while (i1 < text.length) {
				i1 = text.indexOf('"photo"', i1)
				if (i1 > 0) {
					i1 += 7;
					i1 = text.indexOf('"', i1);
					i1++;
					let i2 = text.indexOf('"', i1);
					let jpg = text.substring(i1, i2);
					if (jpg.trim().length > 0)
						images.push(jpg);
					i1 = i2 + 1;
				} else
					i1 = text.length + 1;
			}
		}

		// search image
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"im|', i1)
			if (i1 >= 0) {
				// "im|ac|2|Nhà Thờ Phan Tộc.png|Đá Bạc, Quảng Bình"
				let i2 = text.indexOf('"', i1 + 4);
				let str = text.substring(i1 + 1, i2);
				let iLastBar = str.lastIndexOf('|');
				if (iLastBar > 0) {
					let iFirstBar = str.substring(0, iLastBar).lastIndexOf('|');
					let jpg = str.substring(iFirstBar + 1, iLastBar); 
					images.push(jpg);
				}
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		console.log('uploadGetImages - images: ', images);

		let imageList = images.filter((item, pos) => {
			return images.indexOf(item) == pos; 
		});
		return imageList;
	}

	private uploadDisplayFieldErrors(fields: any) {
    let msgs = [];
		msgs.push({name: 'msg', label: this.languageService.getTranslation('FIELDS_NOT_CORRECT')});
		msgs.push({name: 'msg', label: '&nbsp;'});
		fields.forEach((field:any) => {
			msgs.push({name: 'msg', label: '. ' + field});
		})
		console.log('msgs: ', msgs);
    let message = this.utilService.getAlertMessage(msgs, true);
		this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 450 }).then(choice => {});
  }

// --------- photoMode ----------
	
photoCreate(start: boolean) {
	if (start) {
		this.resetModes();
		this.photoMode = true;
		this.photoBase64 = '';
		this.photo = '';
	} else
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
		this.photoNew = true;
	});
}

photoSave() {
	if (this.photoBase64 != '')
		this.photoUpload( this.photo, this.ancestor, this.photoBase64, null);
}

photoEdit() {
	this.openCropperModal(this.photoBase64);
}

async openCropperModal(base64: any) {
	const cropperModal = await this.modalCtrl.create({
		component: CropperModalPage,
		componentProps: {
			'caller': 'FilerPage',
			'base64': base64,
		},
		cssClass: 'modal-dialog',
		backdropDismiss:false
	});
	await cropperModal.present();
	const { data } = await cropperModal.onDidDismiss();
	if (data.result) {
		this.photoBase64 = data.result;
		this.photoNew = false;
	}
}

private photoUpload(photo: string, ancestor:string, photoBase64: string, file:any) {
	// make photo type lower case
	let i = photo.indexOf('.');
	let ph = photo.substring(0, i) + '.' + photo.substring(i+1).toLowerCase();

	let title = this.languageService.getTranslation('FILE_PHOTO_UPLOAD');
	let cancel = this.languageService.getTranslation('CANCEL');
	let ok = this.languageService.getTranslation('OK');
	let inputs = [{
			label: this.languageService.getTranslation('FILE_PHOTO_NAME'),
			value: ph,
			placeholder: this.languageService.getTranslation('FILE_PHOTO_NAME'),
			attributes: { maxlength: 50 },
		},
	]
	this.utilService.alertText(title, inputs, cancel, ok).then(result => {
		if (result.data) {

			const WIDTH = 1280;
			const EXIF_ORIENTATION = -1;	// unknown

			let photoName = result.data[0];
			if (photoName != '') {
				if (photoBase64) {
					this.getMeta(photoBase64).then(img => {
						let height = img.naturalHeight * WIDTH / img.naturalWidth;
						let width = WIDTH;
						this.imageCompress
							.compressFile(photoBase64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
							.then(compressedImage => {
									this.loadImage(compressedImage, photoName, ancestor);
							});
					});
				} else {
					const objectURL = URL.createObjectURL(file);
					this.getMeta(objectURL).then(img => {
						let height = img.naturalHeight * WIDTH / img.naturalWidth;
						let width = WIDTH;
						var myReader: FileReader = new FileReader();
						myReader.readAsDataURL(file);
						myReader.onload = ((event:any) => {
							let base64 = event.target.result;
							this.imageCompress
								.compressFile(base64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
								.then(compressedImage => {
										this.loadImage(compressedImage, photoName, ancestor);
								});
						});
					});
				}
			} else {
				this.utilService.presentToastOK(['FILE_PHOTO_NAME_INVALID']);
			}
		}
	})
}

private loadImage(base64: string, photoName: string, ancestor:string) {
	let type = base64.substring('data:'.length, base64.indexOf(';'));
	base64 = base64.replace("data:", "").replace(/^.+,/, "");
	this.fbService.addImage(base64, type, ancestor, photoName).then(status => {
		this.utilService.presentToastOK(['FILE_PHOTO_COMPLETE_1', photoName, 'FILE_PHOTO_COMPLETE_2']);
	});
}

// --- imageMode ---

	imageOnClick(start: boolean) {
		if (start) {
			this.resetModes();
			this.imageMode = true;
			this.imageFiles = [];
		} else
			document.getElementById("modify-image").click();
	}

	// https://bobbyhadz.com/blog/check-image-width-and-height-before-upload-using-javascript

  imageOnSelect(event: any): void {

		console.log('imageOnSelect - this.imageFiles: ', this.imageFiles);

    const files = [...event.target.files]
    if (this.imageFiles.length == 0) {
			this.getDimension(files[0]);
			this.imageFiles = files;
    } else {
      files.forEach((file:any) => {
        let index = this.imageFiles.findIndex((f:File) => f.name == file.name);
        if (index == -1) {
					this.getDimension(file);
					// console.log('imageOnSelect - file: ', file);
          this.imageFiles.push(file);
				}
      });
    }
		event.target.value = null;
  }

	getDimension(file: any) {
		const getMeta = async (url: any) => {
			const img = new Image();
			img.src = url;
			await img.decode();  
			return img
		};
		const objectURL = URL.createObjectURL(file);
		getMeta(objectURL).then(img => {
			file.width = img.naturalWidth;
			file.height = img.naturalHeight;
		});
	}

	async getMeta (url: any) {
		const img = new Image();
		img.src = url;
		await img.decode();  
		return img
	};

	getKB(size: any) {
		// filter all . and ,
		let s = parseFloat((''+size).replace(/,/g, ''));
		let kb = s / 1024;
		let str = '';
		if (kb < 1)
			str = s + ' Byte';
		else if (kb < 1000)
			str = Math.round(kb) + ' KB';
		else {
			// let mb = kb / 1024;
			str = (Math.round(kb)).toLocaleString('vi', { minimumFractionDigits: 0, maximumFractionDigits: 3}) + ' KB';
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

	storageOnClick() {
		this.resetModes();
		this.storageMode = true;
		this.storageFiles = [];
	}

  storageReadFiles(): void {
    this.resetModes();
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
		// if (['png', 'jpg', 'jpeg'].indexOf(file.type) > -1) {
		if (file.type.indexOf('image') >= 0) {
      let img = document.getElementById('storage-view');
			if (DEBUGS.FILE)
      console.log('onStorageView - img: ', img);
			if (!img) {
				// some time too early to activate dom, wait 200 ms
				setTimeout(() => {
					let img = document.getElementById('storage-view');
					img.setAttribute('src', file.url);
				}, 1000);
			} else
				img.setAttribute('src', file.url);
    } else {
      window.open(file.url);
    }
  }

	// --- notifyMode ---

	notifyOnClick() {
		this.resetModes();
		this.notifyMode = true;

		console.log('memorialMsg: ', this.memorialMsg);
	}

  notifyReadList(): void {
    this.resetModes();
    this.notifyMode = true;

		// this.recipientList = [ { name: 'Hoang', id: 'phan' }, { name: 'Hoang1', id: 'phan1' } ];

		this.fbService.getNotification(this.ancestor, 'recipients').then((recipients:any) => {
			this.fbService.getNotification(this.ancestor, 'messages').then((messages:any) => {
				console.log('recipientReadList - recipients: ', recipients);
				console.log('messageReadList - messages: ', messages);

				let rItems = [];
				if (!recipients) {
					rItems = [{ id: 'phan', name: 'Phan Viet Hoang', token: '', tokenShort: '', platform: '' }];
				} else {
					for (let key of Object.keys(recipients)) {
						let rec = recipients[key];
						let platform = (!rec.platform) ? '' : rec.platform;
						// let token = (!rec.token) ? '' : 'x';
						let tokenShort = (!rec.token) ? '' : rec.token.substring(0, 20) + ' ...';
						let token = (!rec.token) ? '' : rec.token;
						rItems.push({id: key, name: rec.name, token: token, tokenShort: tokenShort, platform: platform })
					};
				}
				// if (rItems.length == 0) {
				// 	rItems = [{ id: 'phan', name: 'Phan Viet Hoang', token: '', tokenShort: '', platform: '' }];
				// }

				let mItems = [];
				if (!messages) {
					mItems = [{id: '1234', status: 'new', content: 'some text'}];
				} else {
					// console.log('messageReadList - messages: ', messages);
					for (let key of Object.keys(messages)) {
						let msg = messages[key];
						mItems.push({id: key, status: msg.status, content: msg.content})
					};
				}

				let dateID = this.utilService.getDateID();
				let persons = this.memorialMsg.persons;
				let lunarDay = this.memorialMsg.today;
				let stat = this.languageService.getTranslation('FILE_MESSAGE_STATUS_NEW');
				for (let i = 0; i < persons.length; i++) {
					let item = persons[i];
					// let id: any = lunarDay + '-' + item[1];
					// id = id.replaceAll('/','-');
					let id = dateID+'-'+(i+1);
					let content = 'Hôm nay (ÂL): ' + lunarDay + ' - Húy nhật: ' + item[1] + ' ( ' + item[0] + ' ) ' 
					// if this content already exists, ignore
					let iContents = mItems.filter((item: any) => {
						return item.content === content;
					})
					if (iContents.length == 0)
						mItems.push({id: id, status: stat, content: content })
				}
				if (mItems.length == 0) {
					mItems = [{ id: dateID, status: 1, content: 'Ngay giỗ của dòng họ ...' }];
				}

				this.recipientList = rItems;
				this.messageList = mItems;
			});
		});
  }

	notifySaveList(): void {

		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_NOTIFICATION_SAVE'},
		]);
    this.utilService.alertConfirm('FILE_NOTIFICATION_SAVE', msg, 'CANCEL', 'OK').then((res) => {
      if (res.data) {

				let recipients = {};
				this.recipientList.forEach(recipient => {
					recipients[recipient.id] = { name: recipient.name, token: recipient.token, platform: recipient.platform };
				})
				let messages = {};
				this.messageList.forEach(msg => {
					messages[msg.id] = { status: msg.status, content: msg.content };
				})

				this.fbService.deleteNotification(this.ancestor, 'messages').then((stat:any) => {
					this.fbService.setNotification(this.ancestor, 'messages', messages).then((status1:any) => {});
				});
				this.fbService.deleteNotification(this.ancestor, 'recipients').then((status1:any) => {
					this.fbService.setNotification(this.ancestor, 'recipients', recipients).then((status2:any) => {});
				});
				this.utilService.presentToastOK(['FILE_NOTIFICATION_SAVE_OK']);
      }
    });
  }

	notifyOnEditRecipient(recipient: any, mode: any) {

		if (mode == 'DELETE') {
			if (this.recipientList.length == 1) {
				this.utilService.alertMsg('ERROR', 'FILE_RECIPIENT_CAN_NOT_DELETE', 'OK', { width: 350, height: 450 }).then(choice => {});
			
			} else {
				let message = this.languageService.getTranslation('FILE_RECIPIENT_DELETE_1') + recipient.id;
				this.utilService.alertConfirm('DELETE', message, 'CANCEL', 'OK').then((res) => {
					if (res.data) {
						let id = recipient.id;
						let rList = this.recipientList.filter((rec: any) => {
							return rec.id != id  
						})
						this.recipientList = rList;
					}
				});
			}

		} else if (mode == 'ADD') {
			let title = 'FILE_RECIPIENT_NEW'
			let inputs = [
				{  
					type: 'text',
					value: '',
					placeholder: 'ID',
					label: 'ID',
					attributes: { maxlength: 20 },
				},
				{   
					type: 'text',
					value: '',
					placeholder: 'NAME',
					attributes: { maxlength: 40},
				},
			]
			this.utilService.alertNotification(title, inputs , 'CANCEL', null, null, 'ADD', null,  { width: 350, height: 500 }).then(result => {
				if (result.data) {
					let mode = result.data[0];
					// validate id
					// console.log('result: ', result);
					if (mode == 'CANCEL') {
						// do nothing
					} else if (mode == 'ADD') {
						let data =  result.data[1];
						let id = data[0];
						let rList = this.recipientList.filter((rec: any) => {
							return rec.id == id  
						})
						if (rList.length > 0) {
							this.utilService.alertMsg('ERROR', 'FILE_RECIPIENT_ALREADY_EXIST', 'OK', { width: 350, height: 450 }).then(choice => {});
						} else {
							this.recipientList.push({ id: id, name: data[1], token: '', tokenShort: '', platform: ''});
						}
					}
				}
			});
		}

	}

	notifyOnEditMessage(msg: any, mode: any) {

		if (mode == 'DELETE') {
			if (this.messageList.length == 1) {
				this.utilService.alertMsg('ERROR', 'FILE_MESSAGE_CAN_NOT_DELETE', 'OK', { width: 350, height: 450 }).then(choice => {});
			
			} else {
				let message = this.languageService.getTranslation('FILE_MESSAGE_DELETE_1') + msg.id;
				this.utilService.alertConfirm('DELETE', message, 'CANCEL', 'OK').then((res) => {
					if (res.data) {
						let id = msg.id;
						let mList = this.messageList.filter((m: any) => {
							return m.id != id  
						})
						this.messageList = mList;
					}
				});
			}

		} else if (mode == 'ADD') {
			let title = 'FILE_MESSAGE_NEW'
			let inputs = [
				{   
					type: 'text',
					value: msg.content,
					placeholder: 'CONTENT',
					attributes: { maxlength: 40},
				},
			]
			this.utilService.alertNotification(title, inputs , 'CANCEL', null, null, 'ADD', null,  { width: 350, height: 500 }).then(result => {
				if (result.data) {
					// validate id
					console.log('result: ', result);
					let mode = result.data[0];
					if (mode == 'CANCEL') {
					} else if (mode == 'ADD') {
						let stat = this.languageService.getTranslation('FILE_MESSAGE_STATUS_NEW');
						let data =  result.data[1];
						let dateID = this.utilService.getDateID();
						this.messageList.push({ id: dateID, status: stat, content: data[0] });
					}
				}
			});

		} else if (mode == 'SEND') {
			if (msg.status == this.languageService.getTranslation('FILE_MESSAGE_STATUS_SENT')) {
				this.utilService.alertMsg('ERROR', 'FILE_MESSAGE_ALREADY_SENT', 'OK', { width: 350, height: 450 }).then(choice => {});
			} else {
				let message = this.languageService.getTranslation('FILE_MESSAGE_SEND_MESSAGE') + msg.content;
				this.utilService.alertConfirm('SEND', message, 'CANCEL', 'OK').then((res) => {
					if (res.data) {
						this.fbService.updateNotification(this.ancestor, 'activeMessage', { content: msg.content }).then((status:any) => {});
						msg.status = this.languageService.getTranslation('FILE_MESSAGE_STATUS_SENT');
					}
				});
			}
		}
	}
	
}

