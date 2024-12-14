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
import { NodePage } from '../node/node.page';
import { NgSelectComponent } from '@ng-select/ng-select';


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

	tasks: Array<any>;
  currentTask: any;

  notifyMode = false;
	notifyTasks: Array<any>;
  currentNotifyTask: any;
	recipientList: any[] = [];
	messageList: any[] = [];
	memorialMsg: any;

  jsonMode = false;
	jsonTasks: Array<any>;
  currentJsonTask: any;
	
	jsonTreeShow = false;
	jsonItems: any;
  jsonItemsPlaceholder: any = '';
	jsonModeShow = false;
	jsonFileName = '';
	jsonFileUrl: any;
	editorOptions: any;
	showData: any;

  photoMode = false;
	photoTasks: Array<any>;
  currentPhotoTask: any;
	photoBase64: any = '';
	photo: any = '';
	photoCaption: any = '';

  storageMode = false;
	storageFiles: any[] = [];
	storageViewMode = false;
  storageFileName: any = '';

	@ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  data: any;
	info: any;
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
		this.setTasks();

		this.ancestor = this.fbService.getAncestorID();

		this.dataService.readAncestorData().then((data:any) => {
      this.ancestor = data.info.id;
			this.familyName = data.info.family_name;
			this.family = data.family;
			this.info = data.info;
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
    this.jsonMode = false;
		// this.jsonTreeShow = false;
		this.showData = null;
		this.jsonFileName = this.languageService.getTranslation('FILE_UPLOAD_JSON');
    // this.imageMode = false;
    this.storageMode = false;
    this.photoMode = false;
    // this.imageViewMode = false;
		// this.imageFileName = '';
    this.storageViewMode = false;
		this.storageFileName = '';
    this.notifyMode = false;
  }

	setTasks() {

		this.tasks = [
      { id: 'notification', name: this.languageService.getTranslation('FILER_NOTIFICATION') },
      { id: 'json', name: this.languageService.getTranslation('FILER_JSON') },
      { id: 'photo', name: this.languageService.getTranslation('FILER_PHOTO') },
      { id: 'storage', name: this.languageService.getTranslation('FILER_STORAGE') },
    ];
		this.currentTask = 'notification'

		this.notifyTasks = [
      { id: 'read', name: this.languageService.getTranslation('FILER_NOTIFICATION_READ') },
      { id: 'save', name: this.languageService.getTranslation('FILER_NOTIFICATION_SAVE') },
    ];
		this.currentNotifyTask = 'read'

		this.jsonTasks = [
      { id: 'save', name: this.languageService.getTranslation('FILER_JSON_SAVE') },
      { id: 'upload', name: this.languageService.getTranslation('FILER_JSON_UPLOAD') },
      { id: 'tree', name: this.languageService.getTranslation('FILER_JSON_TREE') },
    ];
		this.currentJsonTask = 'save'

		this.photoTasks = [
      { id: 'edit', name: this.languageService.getTranslation('FILE_PHOTO_MODIFY') },
      { id: 'save', name: this.languageService.getTranslation('FILE_PHOTO_SAVE') },
      { id: 'upload', name: this.languageService.getTranslation('FILE_PHOTO_UPLOAD') },
    ];
		this.currentPhotoTask = 'edit'
	}

	closeTask() {
		console.log('closeTask: ', this.currentTask);
		switch(this.currentTask) {
			case 'notification':
				this.notifyOnClick();
				break;
			case 'json':
				this.jsonOnClick();
				break;
			case 'photo':
				this.photoCreate();
				break;
			// case 'image':
			// 	this.imageOnClick(true);
			// 	break;
			case 'storage':
				this.storageReadFiles();
				break;
			default:
		}
  }

	closeNotifyTask() {
		console.log('closeNotifyTask: ', this.currentNotifyTask);
		switch(this.currentNotifyTask) {
			case 'read':
				this.notifyReadList();
				break;
			case 'save':
				this.notifySaveList();
				break;
			default:
		}
  }

	closeJsonTask() {
		// console.log('closeUploadTask: ', this.currentJsonTask);
		let msg = '';
		switch(this.currentJsonTask) {
			case 'save':
				msg = 'Cất <b>' + this.jsonFileName + '</b> vào máy?'
				this.utilService.alertConfirm('FILER_JSON_SAVE', msg, 'CANCEL', 'OK').then((res) => {
					if (res.data)
						this.jsonProcess('save');
				});
				// this.jsonProcess('save');
				break;
			case 'upload':
				msg = 'Upload <b>' + this.jsonFileName + '</b> lên mạng?'
				this.utilService.alertConfirm('FILER_JSON_UPLOAD', msg, 'CANCEL', 'OK').then((res) => {
					if (res.data)
						this.jsonProcess('upload');
				});
				break;
			case 'tree':
				if (this.jsonTreeShow)
					this.onTree();
				break;
			default:
		}
	}

	closePhotoTask() {
		let msg = '';
		switch(this.currentPhotoTask) {
			case 'edit':
				this.photoEdit();
				break;
			case 'save':
				this.photoSave();
				break;
			case 'upload':
				this.photoUpload();
				break;
			default:
		}
  }

	// --- jsonMode ---

	jsonOnClick() {
		this.resetModes();
		document.getElementById("modify-json-json").click()
	}

	jsonOnFileSelect(event: any, type: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.jsonOnFile(file, type);
  }

	private jsonOnFile(file: any, type: any) {
    this.jsonGetTextFile(file).then((res: any) => {
      if (DEBUGS.FILER)
        console.log('jsonOnFile - file: ', file);
			this.jsonMode = true;
			this.jsonFileName = file.name;
			console.log('jsonOnFile - jsonFileName: ', this.jsonFileName);
			this.jsonEdit(res.text, type);
		});
	}

	private jsonGetTextFile(file:File) {
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

	private jsonDisplayImageErrors(keys: any) {
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

	async jsonEdit(text: any, type: any) {
		this.jsonMode = true;
		this.showData = this.data = JSON.parse(text);
		this.jsonTreeShow = this.data.title && this.data.title == 'FAMILY';
		if (this.jsonTreeShow) {
			this.jsonTasks = [
				{ id: 'save', name: this.languageService.getTranslation('FILER_JSON_SAVE') },
				{ id: 'upload', name: this.languageService.getTranslation('FILER_JSON_UPLOAD') },
				{ id: 'tree', name: this.languageService.getTranslation('FILER_JSON_TREE') },
			];
		} else {
			this.jsonTasks = [
				{ id: 'save', name: this.languageService.getTranslation('FILER_JSON_SAVE') },
				{ id: 'upload', name: this.languageService.getTranslation('FILER_JSON_UPLOAD') },
			];
		}
	}

	async onTree() {
		
		console.log('onTree - title:  ', this.data.title);

		const modal = await this.modalCtrl.create({
			component: NodePage,
			componentProps: {
				'caller': 'home',
				'familyInput': this.data,
				'infoInput': this.info
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        let family = resp.data.family;
				family.title = "FAMILY";
				// console.log('onTree - family.title:  ', family.title);
				this.showData = this.data = family;
			}

		});
		return await modal.present();
	}

	jsonChange(event = null) {
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

	jsonProcess(mode: any) {
		if (mode == 'cancel') {

		} else if (mode == 'save') {
			let json: any = this.editor.get();
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.jsonDisplayFieldErrors(errorFields);
				return;
			}
			let text: any = JSON.stringify(json, null, 2);
			const newBlob = new Blob([text], { type: "text/csv" });
			const data = window.URL.createObjectURL(newBlob);
			const link = document.createElement("a");
			link.href = data;
			link.download = this.jsonFileName; // set a name for the file
			link.click();
			this.utilService.presentToastOK(['FILER_JSON_SAVE_COMPLETE_1', this.jsonFileName, 'FILER_JSON_SAVE_COMPLETE_2']);
		} else if (mode == 'upload') {
			// validate field names
			let json:any = this.editor.get();
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.jsonDisplayFieldErrors(errorFields);
				return;
			}
			this.jsonUpload(json);
		}
	}

	private jsonUpload(json: any) {
		let title = json.title;
		if (title == 'INFO') {
				// update info to server
			this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
				rdata.info = json;
				this.fbService.saveAncestorData(rdata).then((status:any) => {
					this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
				});
			});
			return;
		}
	
		// now check new image files
		this.jsonValidateImage(json).then((res:any) => {
			if (DEBUGS.FILE)
				console.log('jsonValidateImage - res: ', res);
			let newFiles = res[0];
			if (newFiles.length > 0) {
				// files not in storage, errors
				this.jsonDisplayImageErrors(newFiles);
				return;
			}
			// build new images files
			let storageImages = res[1];
			// some time it's too slow to process file list, wait 2 sec
			let toastMsg = (title == 'FAMILY') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 
			this.utilService.presentToast(toastMsg);
			setTimeout(() => {
				let images = {};
				storageImages.forEach((file:any) => {
					images[file.name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
				})
				// update family and images to server
				this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
					rdata.images = images;
					const doc = (title == 'FAMILY') ? 'family' : 'docs';
					rdata[doc] = json;
					console.log('jsonValidateImage - json: ', json);
					this.fbService.saveAncestorData(rdata).then((status:any) => {
						this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
					});
				});
			}, 2000);
		})
	}

	private jsonValidateImage(json: any) {
		return new Promise((resolve) => {
			this.utilService.presentToast('FILE_UPLOAD_WAIT_READING_STORAGE_IMAGES');
			// get image list from doc text
			let docImages = this.jsonGetImages(JSON.stringify(json), json.title);
			console.log('jsonValidateImage - docImages: ', docImages);
			//  get images from storage
			this.fbService.getFileList(this.ancestor).then((storageImages:any) => {
			//  get images from local
				// wait 1 second for async to complete
				setTimeout(() => {
					console.log('jsonValidateImage - storageImages: ', storageImages);
					let newFiles = [];
					// go thru each image in doc
					docImages.forEach(dimage => {
						// compare with storageImages
						let index = storageImages.findIndex((sitem: any) => sitem.name == dimage);
						if (index == -1)
							newFiles.push(dimage);
					})
					console.log('jsonValidateDocs - newFiles: ', newFiles);
					// this.utilService.dismissLoading();
					resolve([newFiles, storageImages]);
				}, 3000);
			});
		});
	}

	private jsonGetImages(text: any, title: string) {
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

		console.log('jsonGetImages - images: ', images);

		let imageList = images.filter((item, pos) => {
			return images.indexOf(item) == pos; 
		});
		return imageList;
	}

	private jsonDisplayFieldErrors(fields: any) {
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
	
	photoCreate() {
		this.resetModes();
		// this.photoMode = false;
		this.photoBase64 = '';
		this.photo = '';
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
			this.photoMode = true;
			this.photoTasks = [
				{ id: 'edit', name: this.languageService.getTranslation('FILER_PHOTO_MODIFY') },
				{ id: 'save', name: this.languageService.getTranslation('FILER_PHOTO_SAVE') },
				{ id: 'upload', name: this.languageService.getTranslation('FILER_PHOTO_UPLOAD') },
			];
			this.currentPhotoTask = 'edit'
		});
	}

	photoUpload() {
		if (this.photoBase64 != '') {
			// console.log('photo: ', this.photo)
			this.photoUploadStorage( this.photo, this.ancestor, this.photoBase64, null);
		}
	}

	photoSave() {
		if (this.photoBase64 == '')
				return;

		// let fileUrl = "data:" + mimeType + ";base64," + bytesBase64;
		// 'image/png'let base64 = this.photoBase64;
		let base64 = this.photoBase64;
		let imageExt = base64.substring(base64.indexOf('/')+1, base64.indexOf(';'))
		// console.log('imageExt: ', imageExt);
		let title = this.languageService.getTranslation('FILER_PHOTO_SAVE');
		let cancel = this.languageService.getTranslation('CANCEL');
		let ok = this.languageService.getTranslation('OK');
		let inputs = [{
				label: this.languageService.getTranslation('FILER_PHOTO_NAME'),
				// value: this.photo,
				value: '',
				placeholder: this.languageService.getTranslation('FILER_PHOTO_NAME'),
				attributes: { maxlength: 50 },
			},
		]
		this.utilService.alertText(title, inputs, cancel, ok).then(result => {
			if (result.data) {
				let photoName = result.data[0];
				// let fileUrl = "data:" + mimeType + ";base64," + bytesBase64;
				// 'image/png'
				// let imageExt = base64.substring(base64.indexOf('/')+1, base64.indexOf(';'))
				// console.log('imageExt: ', imageExt);
				if (photoName != '') {
					// remove extension
					if (photoName.indexOf('.') >= 0)
						photoName = photoName.substring(0, photoName.indexOf('.'))
					photoName += '.' + imageExt;
					fetch(this.photoBase64)
					.then(response => response.blob())
					.then(blob => {
						var link = window.document.createElement("a");
						link.href = window.URL.createObjectURL(blob);
						link.download = photoName;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						this.utilService.presentToastOK(['FILER_PHOTO_SAVE_COMPLETE_1', photoName, 'FILER_PHOTO_SAVE_COMPLETE_2']);
					});
				}
			}
		});
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
			// this.photoTasks = [
			//   { id: 'upload', name: this.languageService.getTranslation('FILE_PHOTO_UPLOAD') },
			// ];
			// this.currentPhotoTask = 'upload'
		}
	}

	private photoUploadStorage(photo: string, ancestor:string, photoBase64: string, file:any) {
		// make photo type lower case
		// let i = photo.indexOf('.');
		// let ph = photo.substring(0, i) + '.' + photo.substring(i+1).toLowerCase();
		// let base64 = this.photoBase64;
		
		let imageExt = photoBase64.substring(photoBase64.indexOf('/')+1, photoBase64.indexOf(';'))
		let title = this.languageService.getTranslation('FILER_PHOTO_UPLOAD');
		let cancel = this.languageService.getTranslation('CANCEL');
		let ok = this.languageService.getTranslation('OK');
		let inputs = [{
				label: this.languageService.getTranslation('FILER_PHOTO_NAME'),
				value: '',
				placeholder: this.languageService.getTranslation('FILER_PHOTO_NAME'),
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
						if (photoName.indexOf('.') >= 0)
							photoName = photoName.substring(0, photoName.indexOf('.'))
						photoName += '.' + imageExt;

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
			this.utilService.presentToastOK(['FILER_PHOTO_COMPLETE_1', photoName, 'FILER_PHOTO_COMPLETE_2']);
		});
	}

// https://bobbyhadz.com/blog/check-image-width-and-height-before-upload-using-javascript

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
						this.storageFileName = '';
					});
				});
      }
    });
  }

  storageOnView(file: any) {
		// if (DEBUGS.FILE)
      console.log('onStorageView - file: ', file);
		if (!file.url)
			file.url = "../assets/icon/male-avatar.jpg";

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
			{name: 'msg', label: 'FILER_NOTIFICATION_SAVE'},
		]);
    this.utilService.alertConfirm('FILER_NOTIFICATION_SAVE', msg, 'CANCEL', 'OK').then((res) => {
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
				this.utilService.presentToastOK(['FILER_NOTIFICATION_SAVE_OK']);
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
					placeholder: 'Tên',
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
				// check if recipient has token
				let rList = this.recipientList.filter((rec: any) => {
					return rec.token && rec.token != ''  
				})
				if (rList.length == 0) {
					this.utilService.alertMsg('ERROR', 'FILE_NO_RECIPIENT_WITH_TOKEN', 'OK', { width: 350, height: 450 }).then(choice => {});
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
	
}

