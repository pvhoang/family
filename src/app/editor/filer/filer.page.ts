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
import {NgxImageCompressService} from 'ngx-image-compress';

import * as $ from 'jquery';

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
	imageFiles:File[] = [];

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
 
  srcFamily: any;

  constructor(
    private modalCtrl: ModalController,
    private familyService: FamilyService,
    private dataService: DataService,
    private languageService: LanguageService,
    private fbService: FirebaseService,
    private utilService: UtilService,
		private imageCompress: NgxImageCompressService
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
		this.dataService.readFamilyAndInfo().then((data:any) => {
      this.ancestor = data.info.id;
			this.family = data.family;
		});
  }

	resetModes() {
    this.imageMode = false;
    this.storageMode = false;
    this.photoMode = false;
    this.imageViewMode = false;
		this.imageFileName = '';
    this.storageViewMode = false;
		this.storageFileName = '';
  }

	// --- uploadMode ---

	async uploadInfoAlert() {

		const uploadItems = [
			{ name: 'DOCS', label: this.languageService.getTranslation('FILE_UPLOAD_DOCS') },
			{ name: 'FAMILY' , label: this.languageService.getTranslation('FILE_UPLOAD_FAMILY') },
			{ name: 'INFO' , label: this.languageService.getTranslation('FILE_UPLOAD_INFO') },
		]
		// this.uploadItemsPlaceholder = this.languageService.getTranslation('FILE_UPLOAD_PLACEHOLDER');
    let inputs = [];
    inputs.push({type: 'radio', label: uploadItems[0].label, value: uploadItems[0].name, checked: true });
    inputs.push({type: 'radio', label: uploadItems[1].label, value: uploadItems[1].name, checked: false });
    inputs.push({type: 'radio', label: uploadItems[2].label, value: uploadItems[2].name, checked: false });
    this.utilService.alertRadio('FILE_UPLOAD', '', inputs , 'CANCEL', 'OK').then((res) => {
      if (res.data) {
				console.log('uploadInfoAlert - res: ', res);
				if (res.data == 'DOCS')
					document.getElementById("modify-upload-docs").click()
				else if (res.data == 'FAMILY')
					document.getElementById("modify-upload-family").click()
				else if (res.data == 'INFO')
					document.getElementById("modify-upload-info").click()
			}
    });
  }

	// async uploadInfoAlert1(type: any) {

	// 	if (type == 'DOCS')
	// 		document.getElementById("modify-upload-docs").click()
	// 	else if (type == 'FAMILY')
	// 		document.getElementById("modify-upload-family").click()

	// }

	uploadOnFileSelect(event: any, type: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.uploadOnFile(file, type);
  }

	private uploadOnFile(file: any, type: any) {
		// console.log('type: ', type);
    this.uploadGetTextFile(file).then((res: any) => {
      if (DEBUGS.APP)
        console.log('uploadOnFile - res: ', res);

      if (res.text) {
				// validate json file
				if (type == 'FAMILY') {
					let family = this.uploadValidateFamily(res.text);
					if (family) {
						// family is ok, now check new image files
						this.uploadValidateImage(res.text, true).then((res:any) => {
							console.log('uploadValidateImage - res: ', res);
							let newFiles = res[0];
							if (newFiles.length > 0) {
								// files not in storage, errors
								this.uploadDisplayImageErrors(newFiles);
							} else {
								// build new images files
								let storageImages = res[1];
								// some time it's too slow to process file list, wait 2 sec
								setTimeout(() => {
								let images = {};
								storageImages.forEach((file:any) => {
									images[file.name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
								})
								// update family and images to server
								this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
									rdata.images = images;
									rdata.family = family;
									this.fbService.saveAncestorData(rdata).then((status:any) => {
										let msg = this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_1') + '<b>' + file.name + '</b>' + this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_2');
										this.utilService.presentToast(msg);
									});
								});
								}, 2000);
							}
						})
						
					} else {
						this.utilService.presentToast(this.languageService.getTranslation('FILE_UPLOAD_FILE_INVALID'));
					}

				} else if (type == 'DOCS') {
					let docs = this.uploadValidateDocs(res.text);
					if (docs) {
						// docs is ok, now check new image files
						this.uploadValidateImage(res.text, false).then((res:any) => {
							console.log('uploadValidateImage - res: ', res);
							let newFiles = res[0];
							if (newFiles.length > 0) {
								// files not in storage, errors
								this.uploadDisplayImageErrors(newFiles);
							} else {
								// build new images files
								let storageImages = res[1]
								// some time it's too slow to process file list, wait 2 sec
								setTimeout(() => {
								let images = {};
								storageImages.forEach((file:any) => {
									images[file.name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
								})
								// update docs and images to server
								this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
									rdata.images = images;
									rdata.docs = docs;
									this.fbService.saveAncestorData(rdata).then((status:any) => {
										let msg = this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_1') + '<b>' + file.name + '</b>' + this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_2');
										this.utilService.presentToast(msg);
									});
								});
								}, 2000);
							}
						});
					} else {
						this.utilService.presentToast(this.languageService.getTranslation('FILE_UPLOAD_FILE_INVALID'));
					}
					
				} else if (type == 'INFO') {
					let info = this.uploadValidateInfo(res.text);
					if (info) {
						// update info to server
						this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
							rdata.info = info;
							this.fbService.saveAncestorData(rdata).then((status:any) => {
								let msg = this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_1') + '<b>' + file.name + '</b>' + this.languageService.getTranslation('FILE_UPLOAD_COMPLETE_2');
								this.utilService.presentToast(msg);
							});
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
		try {
			// check all image files exist!
			let family = JSON.parse(text);
			// console.log('uploadValidateFamily - family: ', family);
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
			if (!docs.vi || !docs.en || !docs.vi.pha_nhap|| !docs.vi.pha_ky || !docs.vi.pha_he || !docs.vi.pha_do || !docs.vi.ngoai_pha || !docs.vi.phu_khao )
				return null;
			return docs;
		} catch (error) {
			console.log('uploadValidateDocs - error: ', error);
			return null;
		}		
  }

	private uploadValidateInfo(text: any) {
		let info: any = null;
		try {
			info = JSON.parse(text);
			console.log('uploadValidateInfo - info: ', info);
			// must have id, name, location
			if (!info.id || !info.name || !info.location)
				return null;
			return info;
		} catch (error) {
			console.log('uploadValidateInfo - info: ', info);
			return null;
		}		
  }
	
	private uploadValidateImage(text: any, photoMode: boolean) {
    return new Promise((resolve) => {
			this.utilService.presentLoading();
			// get image list from doc text
			let docImages = this.uploadGetImages(text, photoMode);
			//  get images from storage
			this.fbService.getFileList(this.ancestor).then((storageImages:any) => {
			//  get images from local
				// wait 1 second for async to complete
				setTimeout(() => {
					// console.log('uploadValidateDocs - docImages: ', docImages);
					// console.log('uploadValidateDocs - storageImages: ', storageImages);
					let newFiles = [];
					// go thru each image in doc
					docImages.forEach(dimage => {
						// compare with storageImages
						let index = storageImages.findIndex((sitem: any) => sitem.name == dimage);
						if (index == -1)
							newFiles.push(dimage);
					})
					// console.log('uploadValidateDocs - newFiles: ', newFiles);
					this.utilService.dismissLoading();
					resolve([newFiles, storageImages]);
				}, 3000);
			});
		});
  }

	private uploadGetImages(text: any, photoMode: boolean) {
		// "[3|Mộ Tổ Đời 1.jpg|1|1|Tổ mộ, Nghĩa trang Đá Bạc]",
		// "photo": "Phan Ngọc Luật.jpg",
		// search photo
		let images = [];
		let i1 = 0;
		if (photoMode) {
			while (i1 < text.length) {
				i1 = text.indexOf('"photo"', i1)
				if (i1 > 0) {
					i1 += 7;
					i1 = text.indexOf('"', i1);
					i1++;
					let i2 = text.indexOf('"', i1);
					let jpg = text.substring(i1, i2);
					images.push(jpg);
					i1 = i2 + 1;
				} else
					i1 = text.length + 1;
			}
		}
		// search image
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('[3|', i1)
			if (i1 > 0) {
				i1 += 3;
				let i2 = text.indexOf('|', i1);
				let jpg = text.substring(i1, i2);
				images.push(jpg);
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}
		let imageList = images.filter((item, pos) => {
			return images.indexOf(item) == pos; 
		});
		return imageList;
	}

	uploadDisplayImageErrors(keys: any) {
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

// photoDelete() {
// 	this.photoBase64 = '';
// 	this.photoNew = true;
// 	this.photo = '';
// }

photoEdit() {
	this.openCropperModal(this.photoBase64);
}

async openCropperModal(base64: any) {
	const cropperModal = await this.modalCtrl.create({
		component: CropperModalPage,
		// component: CroppieComponent,
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
			// this.imageFiles.push(file);
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
				}, 500);
			} else
				img.setAttribute('src', file.url);
    } else {
      window.open(file.url);
    }
  }
	
}

