import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CropperModalPage } from './cropper-modal/cropper-modal.page';
import { LanguageService } from '../../services/language.service';
import { FirebaseService } from '../../services/firebase.service';
import { FamilyService } from '../../services/family.service';
import { UtilService } from '../../services/util.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';

import { NotifyService } from './services/notify.service';
import { JsonService } from './services/json.service';
import { PhotoService } from './services/photo.service';

import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { NgxImageCompressService } from 'ngx-image-compress';
import { JsonEditorComponent } from '../../components/jsoneditor/jsoneditor.component';
import { JsoneditorService } from '../../services/jsoneditor.service';
import { NodePage } from '../node/node.page';
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
	photoType: any = '';

  storageMode = false;
	storageTasks: Array<any>;
  currentStorageTask: any;
	storageFiles: any[] = [];
	storageFolders: any[] = [];
	storageViewMode = false;
  storageFileName: any = '';
  storageFileType: any = null;

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
    public utilService: UtilService,
    private jsonService: JsonService,
    private notifyService: NotifyService,
    private photoService: PhotoService,

  ) { }

  ngOnInit() {
    if (DEBUGS.FILER)
      console.log('FilePage - ngOnInit');
    this.start();
  }

  ionViewWillEnter() {
    if (DEBUGS.FILER)
      console.log('FilePage - ionViewWillEnter');
    this.start();
  } 
	
	ionViewWillLeave() {
    if (DEBUGS.FILER)
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
			let fullFamily = this.familyService.buildFullFamily(this.family);
			this.memorialMsg = this.familyService.passAwayFamily(fullFamily);
			this.jsoneditorService.startEditor(this.familyName);
			this.editorOptions = this.jsoneditorService.getEditorOptions();
			this.notifyService.notifyStart(this.ancestor, this.memorialMsg)
			this.jsonService.jsonStart(this.ancestor);

		});
  }

	resetModes() {
    this.notifyMode = false;
    this.jsonMode = false;
		this.showData = null;
    this.photoMode = false;
    this.storageMode = false;
    this.storageViewMode = false;
		this.storageFileName = '';
		this.jsonFileName = this.languageService.getTranslation('FILE_UPLOAD_JSON');

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

		this.storageTasks = [
      { id: 'read', name: this.languageService.getTranslation('FILE_STORAGE_READ') },
    ];
		this.currentStorageTask = 'read'
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
				this.photoOnClick();
				break;
			case 'storage':
				this.storageOnClick();
				break;
			default:
		}
  }

	closeNotifyTask() {
		console.log('closeNotifyTask: ', this.currentNotifyTask);
		switch(this.currentNotifyTask) {
			case 'read':
				this.notifyService.notifyReadList().then(data => {
					this.recipientList = data.recipientList;
					this.messageList = data.messageList;
				});
				break;
			case 'save':
				this.notifyService.notifySaveList(this.recipientList, this.messageList);
				break;
			default:
		}
  }

	closeJsonTask() {
		let msg = '';
		let json: any = this.editor.get();
		switch(this.currentJsonTask) {
			case 'save':
				msg = 'Cất <b>' + this.jsonFileName + '</b> vào máy?'
				this.utilService.alertConfirm('FILER_JSON_SAVE', msg, 'CANCEL', 'OK').then((res) => {
					if (res.data)
						this.jsonService.jsonProcess('save', json);
				});
				break;
			case 'upload':
				msg = 'Upload <b>' + this.jsonFileName + '</b> lên mạng?'
				this.utilService.alertConfirm('FILER_JSON_UPLOAD', msg, 'CANCEL', 'OK').then((res) => {
					if (res.data)
						this.jsonService.jsonProcess('upload', json);
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
				this.photoService.photoSave(this.photo, this.photoBase64);
				break;
			case 'upload':
				this.photoService.photoUpload( this.photo, this.ancestor, this.photoBase64);
				break;
			default:
		}
  }

	closeStorageTask() {
		let msg = '';
		switch(this.currentStorageTask) {
			case 'read':
				this.storageReadFiles();
				break;
			default:
		}
  }

	// --- notifyMode ---

	notifyOnClick() {
		this.resetModes();
		this.notifyMode = true;
		this.recipientList = [];
		this.messageList = [];
		this.notifyService.notifyReadList().then(data => {
			this.recipientList = data.recipientList;
			this.messageList = data.messageList;
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

	// --- jsonMode ---

	jsonOnClick() {
		this.resetModes();
		document.getElementById("modify-json-json").click()
	}
	
	jsonOnFileSelect(event: any, type: any): void {
		const files = [...event.target.files]
		const file = files[0];
		event.target.value = ''
		this.jsonOnFile(file, type);
	}

	private jsonOnFile(file: any, type: any) {
		this.jsonGetTextFile(file).then((res: any) => {
			if (DEBUGS.FILER)
				console.log('jsonOnFile - file: ', file);
			// this.jsonMode = true;
			this.jsonFileName = file.name;
			this.jsonService.jsonSetFileName(file.name);
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

	async onTree() {
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
				this.showData = this.data = family;
			}
		});
		return await modal.present();
	}

// --------- photoMode ----------
	
	photoOnClick() {
		this.resetModes();
		this.photoBase64 = '';
		this.photo = '';
		document.getElementById("photo-image").click();
	}

	photoGetFile(event: any): void {
		const files = [...event.target.files]
		const file = files[0];
		console.log('photoGetFile - file: ', file);
		const name = file.name;
		event.target.value = ''
		const myReader: FileReader = new FileReader();
		myReader.readAsDataURL(file);
		myReader.onload = ((event:any) => {
			// console.log('photoGetFile - event: ', event);
			let base64 = event.target.result;
			let parts = base64.split(';');
			let photoType = parts[0].split(':')[1].split('/')[0];
			this.photoBase64 = base64;
			this.photo = name;
			this.photoType = photoType;
      if (DEBUGS.FILER) {
				console.log('photoGetFile - photo: ', this.photo);
				console.log('photoGetFile - photoType: ', this.photoType);
			}
			this.photoMode = true;
			this.photoTasks = [
				{ id: 'edit', name: this.languageService.getTranslation('FILER_PHOTO_MODIFY') },
				{ id: 'save', name: this.languageService.getTranslation('FILER_PHOTO_SAVE') },
				{ id: 'upload', name: this.languageService.getTranslation('FILER_PHOTO_UPLOAD') },
			];
			this.currentPhotoTask = 'edit'
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
			console.log('result: ', data.result)
			this.photoBase64 = data.result.base64;
		}
	}

	// --- storageMode ---

	storageOnClick() {
		this.resetModes();
		this.storageMode = true;
		this.storageFiles = [];
		this.storageReadFiles();
	}

  storageReadFiles(): void {
    this.fbService.getFileList(this.ancestor).then((res:any) => {
			// decode folder and name
			res.forEach((file:any) => {
				let fullPath = file.fullPath.substring(this.ancestor.length+1)
				let idx = fullPath.lastIndexOf('/');
				file.name = fullPath.substring(idx+1);
				file.path = fullPath.substring(0,idx);
				file.fullPath = fullPath;
			})

			res.sort((row1:any, row2: any) => {
				let ret = 0;
				let val1 = row1.path.replaceAll(' ', '_') + row1.name.replaceAll(' ', '_');
				let val2 = row2.path.replaceAll(' ', '_') + row2.name.replaceAll(' ', '_');
				if (val1 < val2)
					ret = -1;
				else if (val1 > val2)
					ret = 1;
				// console.log('onStorageFile - ret, val1, val2: ', ret, val1, val2);
				return ret;
			});

			// set empty path
			let displayPath = '';
			res.forEach((file:any) => {
				let path = file.path;
				if (path != displayPath) {
					file.displayPath = path;
					displayPath = path;
				} else {
					file.displayPath = '';
				}
			})

      this.storageFiles = res;
      if (DEBUGS.FILER)
        console.log('onStorageFile - storageFiles: ', res);
    });
  }

  storageOnDelete(file: any) {
    if (DEBUGS.FILER)
      console.log('onStorageDelete');
		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILE_STORAGE_DELETE_1'},
			{name: 'data', label: file.fullPath},
			{name: 'msg', label: 'FILE_STORAGE_DELETE_2'},
		]);
    this.utilService.alertConfirm('FILE_STORAGE_DELETE', msg, 'CANCEL', 'OK').then((res) => {
      if (res.data) {
				this.fbService.deleteImage(this.ancestor, file.fullPath).then((status:any) => {
					this.storageFileName = '';
					this.storageReadFiles();
				});
      }
    });
  }

  storageOnView(file: any) {
		// if (DEBUGS.FILER)
      console.log('onStorageView - file: ', file);
		if (!file.url)
			file.url = "../assets/icon/male-avatar.jpg";

    this.storageViewMode = true;
    this.storageFileName = file.name;
		if (file.type.indexOf('image') >= 0) {
			this.storageFileType = file.type;
      let img = document.getElementById('storage-view');
			if (DEBUGS.FILER)
      console.log('onStorageView - img: ', img);
			if (!img) {
				// some time too early to activate dom, wait 1000 ms
				setTimeout(() => {
					let img = document.getElementById('storage-view');
					img.setAttribute('src', file.url);
				}, 1000);
			} else
				img.setAttribute('src', file.url);
    } else {
			this.storageFileType = null;
    }
  }

}

