import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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

	downloadFileUrl: any;
	downloadFileName: any;
	downloadDocsUrl: any;
	downloadDocsName: any;

	uploadItems: any;
  uploadItemsPlaceholder: any = '';

	imageFileName: any = '';
  imageViewMode = false;
	storageFiles: any[] = [];
  storageViewMode = false;
  storageFileName: any = '';

	photoBase64: any = '';
	photoNew: any = false;
	photo: any = '';
	photoCaption: any = '';

	@ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
	// editorOptions: JsonEditorOptions;
  data: any;
  showData: any;
  uploadModeShow = false;
	jsonFileName = '';
	jsonFileUrl: any;

  srcFamily: any;

  constructor(
    private modalCtrl: ModalController,
		private sanitizer: DomSanitizer,
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
		this.dataService.readAncestorData().then((data:any) => {
      this.ancestor = data.info.id;
			this.familyName = data.info.family_name;
			this.family = data.family;
			this.jsoneditorService.startEditor(this.familyName);
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
		// console.log('uploadEdit - text: ', text);
		// let json = this.jsoneditorService.convertFieldNames(JSON.parse(text), true)
		this.uploadModeShow = true;
		this.showData = this.data = JSON.parse(text);
	}

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
			// let ret = this.jsoneditorService.convertFieldNames(json, false);
			// json = ret[0];
			// let errorFields = ret[1];
			// if (errorFields.length > 0) {
			// 	// errors
			// 	return;
			// }
			this.uploadJson(json);
		}
	}

	private uploadJson(json: any) {

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
	
		// if (title == 'FAMILY') {
		// 	let errorNodes = this.uploadValidateFamily(json);
		// 	if (errorNodes.length > 0) {
		// 		this.uploadDisplayFieldErrors(errorNodes);
		// 		return;
		// 	}
		// }

		// if (title == 'DOCS') {
		// 	this.uploadValidateDocs(json);
		// 	return;
		// }

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
			// this.utilService.presentLoading('FILE_UPLOAD_WAIT_UPDATE_FAMILY');
			let toastMsg = (title == 'FAMILY') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 
			// this.utilService.presentToast('FILE_UPLOAD_WAIT_UPDATE_FAMILY');
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
				console.log('uploadValidateImage - json: ', json);

					this.fbService.saveAncestorData(rdata).then((status:any) => {
						this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
					});
				});
			}, 2000);
		})
	}


	
	// convertFieldNames1(json: any, forward: boolean) {

	// 	family = this.familyService.buildFullFamily(family);
	// 		this.family = family;
	// 		this.nodes = this.nodeService.getFamilyNodes(family, true);
			
	// 	// convert to text
	// 	let text: any = JSON.stringify(json);

	// 	let match = text.match(/"([^"]*)":/g);
	// 	// console.log('convertJsonFieldNames - match: ', match);
	// 	let unique = match.filter((value: any, index: any, array: any) => {
	// 		return array.indexOf(value) === index;
	// 	});
	// 	// console.log('convertJsonFieldNames - unique: ', unique);

	// 	let errorFields = [];
	// 	// change to new field names, unique has "...", "nodes": -> "HỆ":
	// 	unique.map((name: any) => {
	// 		let n = name.substring(1, name.length-2);
	// 		// console.log('convertJsonFieldNames - n: ', name, n);
	// 		let newName = '';
	// 		if (forward) {
	// 			newName = this.languageService.getTranslation(n);
	// 		} else {
	// 			newName =  this.languageService.getReverseTranslation(n);
	// 			if (newName == n) {
	// 				// field in json does not exist, error
	// 				errorFields.push(n);
	// 			}
	// 		}
	// 		// let newName = (forward) ? this.getTranslation(n) : this.getReverseTranslation(n);
	// 		newName = '"' + newName + '":'
	// 		text = text.replaceAll(name, newName);
	// 	})

	// 	// convert special value for gender
	// 	if (forward) {
	// 		text = text.replaceAll('"male"', '"Nam"');
	// 		text = text.replaceAll('"female"', '"Nữ"');
	// 	} else {
	// 		text = text.replaceAll('"Nam"', '"male"');
	// 		text = text.replaceAll('"Nữ"', '"female"');
	// 	}

	// 	// convert to json
	// 	// console.log('convertJsonFieldNames - text: ', text);
	// 	return forward ? JSON.parse(text) : [JSON.parse(text), errorFields];
	// }

	private uploadValidateFamily(json: any) {
		let errorNodes = [];
		try {
			let family = this.familyService.buildFullFamily(json);
			let nodes = this.nodeService.getFamilyNodes(family, true);
			nodes.forEach((node: any) => {
				// node can not have duplicate branch
				let count = 0;
				if (node.branchStart) count++;
				if (node.subBranchStart) count++;
				if (node.subSubBranchStart) count++;
				if (count > 1)
					errorNodes.push('He: ' + node.name + ' khong the co CHI, PHAI, NHANH')
			});
		} catch (error) {
			console.log('uploadValidateFamily - error: ', error);
			errorNodes.push(error);
		}
		return errorNodes;
  }

	// private uploadValidateDocs(text: any) {
	// 	let docs: any = null;
	// 	try {
	// 		docs = JSON.parse(text);
	// 		// must have vi, en, and pha_nhap
	// 		if (!docs.vi || !docs.en || !docs.vi.pha_nhap|| !docs.vi.pha_ky || !docs.vi.pha_he || !docs.vi.pha_do || !docs.vi.ngoai_pha || !docs.vi.phu_khao )
	// 			return null;
	// 		return docs;
	// 	} catch (error) {
	// 		console.log('uploadValidateDocs - error: ', error);
	// 		return null;
	// 	}		
  // }

	private uploadValidateInfo(text: any) {
		let info: any = null;
		try {
			info = JSON.parse(text);
			// console.log('uploadValidateInfo - info: ', info);
			// must have id, name, location
			if (!info.id || !info.name || !info.location)
				return null;
			return info;
		} catch (error) {
			console.log('uploadValidateInfo - info: ', info);
			return null;
		}		
  }

	private uploadValidateImage(json: any) {

		return new Promise((resolve) => {
			// this.utilService.presentLoading('FILE_UPLOAD_WAIT_READING_STORAGE_IMAGES');
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
					// console.log('uploadValidateDocs - newFiles: ', newFiles);
					// this.utilService.dismissLoading();
					resolve([newFiles, storageImages]);
				}, 2000);
			});
		});
	}

	private uploadGetImages(text: any, title: string) {
		// "im|ac|2|Nhà Thờ Phan Tộc.png|Đá Bạc, Quảng Bình"
		// "[3|Mộ Tổ Đời 1.jpg|1|1|Tổ mộ, Nghĩa trang Đá Bạc]",
		// "photo": "Phan Ngọc Luật.jpg",

		console.log('uploadGetImages - text: ', text);

		// search photo
		let images = [];
		let i1 = 0;
		if (title == 'FAMILY') {
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
				// i1 += 3;
				// let i2 = text.indexOf('|', i1);
				// let jpg = text.substring(i1, i2);
				// images.push(jpg);
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

	// console.log('photo: ', photo);
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
				// this.utilService.presentToast(this.languageService.getTranslation('FILE_PHOTO_NAME_INVALID'), 3000);
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
	
}

