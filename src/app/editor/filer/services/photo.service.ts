import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilService } from '../../../services/util.service';
import { LanguageService } from '../../../services/language.service';
import { NgxImageCompressService } from 'ngx-image-compress';

import { FONTS_FOLDER, DEBUGS, IMAGE_SIZE } from '../../../../environments/environment';

// const WIDTH = 640;
// const HEIGHT = 480;
const EXIF_ORIENTATION = -1;	// unknown

@Injectable({
	providedIn: 'root'
})
export class PhotoService {

  ancestor: any;

	constructor(
		private fbService: FirebaseService,
		private utilService: UtilService,
    private languageService: LanguageService,
		private imageCompress: NgxImageCompressService,

	) {}

	photoStart(ancestor: any) {
		this.ancestor = ancestor;
	}
    
	photoSave(photo: any, base64: any) {
		this.photoProcess('save', null, photo, base64);
	}

	photoUpload(photo: string, ancestor:string, base64: string) {
		this.photoProcess('upload', ancestor, photo, base64);
	}

	// photoSave1(photo: any, base64: any) {
	// 	if (base64 == '')
	// 			return;
	// 	let parts = base64.split(';');
	// 	let photoType = parts[0].split(':')[1].split('/')[0];
	// 	let photoExt = photo.substring(photo.indexOf('.')+1);

	// 	let title = this.languageService.getTranslation('FILER_PHOTO_SAVE');
	// 	let cancel = this.languageService.getTranslation('CANCEL');
	// 	let ok = this.languageService.getTranslation('OK');
	// 	let inputs = [{ value: photo, attributes: { maxlength: 50 } } ]
	// 	this.utilService.alertText(title, inputs, cancel, ok).then(result => {
	// 		if (result.data) {
	// 			let photoName = result.data[0];
	// 			if (photoName != '') {
	// 				// remove extension
	// 				if (photoName.indexOf('.') >= 0)
	// 					photoName = photoName.substring(0, photoName.indexOf('.'))
	// 				photoName += '.' + photoExt;

	// 				if (photoType === 'image') {
	// 					this.getMeta(base64).then(img => {
	// 						let height = img.naturalHeight * IMAGE_SIZE.WIDTH / img.naturalWidth;
	// 						let width = IMAGE_SIZE.WIDTH;
	// 						if (DEBUGS.FILER)
	// 							console.log('photoUploadStorage - height, width: ', width, height);
	// 						this.imageCompress
	// 							.compressFile(base64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
	// 							.then(compressedImage => {
	// 								this.saveDoc(compressedImage, photoName);
	// 							});
	// 					});
	// 				} else if (photoType === 'application' || photoType === 'video') {
	// 					this.saveDoc(base64, photoName);
	// 				}
	// 			} else {
	// 				this.utilService.presentToastOK(['FILE_PHOTO_NAME_INVALID']);
	// 			}
	// 		}
	// 	});
	// }

	// photoUpload1(photo: string, ancestor:string, base64: string) {
			
	// 	if (DEBUGS.FILER)
	// 		console.log('photoUpload - photo: ', photo);

	// 	let parts = base64.split(';');
	// 	let photoType = parts[0].split(':')[1].split('/')[0];
	// 	let photoExt = photo.substring(photo.indexOf('.')+1);
	// 	let title = this.languageService.getTranslation('FILER_PHOTO_UPLOAD');
	// 	let cancel = this.languageService.getTranslation('CANCEL');
	// 	let ok = this.languageService.getTranslation('OK');
	// 	let inputs = [ { value: '[thu_muc/]' + photo, attributes: { maxlength: 50 }, } ]

	// 	this.utilService.alertText(title, inputs, cancel, ok).then(result => {
	// 		if (result.data) {
	// 			let photoName = result.data[0];
	// 			if (photoName != '') {
	// 				// remove extension
	// 				if (photoName.indexOf('.') >= 0)
	// 					photoName = photoName.substring(0, photoName.indexOf('.'))
	// 				photoName += '.' + photoExt;

	// 				if (photoType === 'image') {
	// 					this.getMeta(base64).then(img => {
	// 						let height = img.naturalHeight * IMAGE_SIZE.WIDTH / img.naturalWidth;
	// 						let width = IMAGE_SIZE.WIDTH;
	// 						if (DEBUGS.FILER)
	// 							console.log('photoUploadStorage - height, width: ', width, height);
	// 						this.imageCompress
	// 							.compressFile(base64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
	// 							.then(compressedImage => {
	// 								this.loadImage(compressedImage, photoName, ancestor);
	// 							});
	// 					});
	// 				} else if (photoType === 'application' || photoType === 'video') {
	// 					this.loadImage(base64, photoName, ancestor);
	// 				}
	// 			} else {
	// 				this.utilService.presentToastOK(['FILE_PHOTO_NAME_INVALID']);
	// 			}
	// 		}
	// 	})
	// }

	photoProcess(mode: any, ancestor:string, photo: any, base64: any) {
		if (base64 == '')
				return;
		if (DEBUGS.FILER)
			console.log('photoUpload - photo: ', photo);

		let parts = base64.split(';');
		let photoType = parts[0].split(':')[1].split('/')[0];
		let photoExt = photo.substring(photo.indexOf('.')+1);
		let title = this.languageService.getTranslation('FILER_PHOTO_SAVE');
		let inputs = [{ value: photo, attributes: { maxlength: 50 } } ]
		if (mode == 'upload') {
			title = this.languageService.getTranslation('FILER_PHOTO_UPLOAD');
			inputs = [ { value: '[thu_muc/]' + photo, attributes: { maxlength: 50 }, } ]
		}
		let cancel = this.languageService.getTranslation('CANCEL');
		let ok = this.languageService.getTranslation('OK');
		this.utilService.alertText(title, inputs, cancel, ok).then(result => {
			if (result.data) {
				let photoName = result.data[0];
				if (photoName != '') {
					// remove extension
					if (photoName.indexOf('.') >= 0)
						photoName = photoName.substring(0, photoName.indexOf('.'))
					photoName += '.' + photoExt;

					if (photoType === 'image') {
						this.getMeta(base64).then(img => {
							let height = img.naturalHeight * IMAGE_SIZE.WIDTH / img.naturalWidth;
							let width = IMAGE_SIZE.WIDTH;
							if (DEBUGS.FILER)
								console.log('photoUploadStorage - height, width: ', width, height);
							this.imageCompress
								.compressFile(base64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
								.then(compressedImage => {
									if (mode == 'upload')
										this.loadImage(base64, photoName, ancestor);
									else
										this.saveDoc(compressedImage, photoName);
								});
						});
						
					} else if (photoType === 'application' || photoType === 'video') {
						if (mode == 'upload')
							this.loadImage(base64, photoName, ancestor);
						else
							this.saveDoc(base64, photoName);
					}
				} else {
					this.utilService.presentToastOK(['FILE_PHOTO_NAME_INVALID']);
				}
			}
		});
	}
	
	private saveDoc(base64: string, photoName: string) {
		fetch(base64).then(r => r.blob()).then(blob => {
			var link = window.document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = photoName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			this.utilService.presentToastOK(['FILER_PHOTO_SAVE_COMPLETE_1', photoName, 'FILER_PHOTO_SAVE_COMPLETE_2']);
		})
	}

	private loadImage(base64: string, photoName: string, ancestor:string) {
		let type = base64.substring('data:'.length, base64.indexOf(';'));
		base64 = base64.replace("data:", "").replace(/^.+,/, "");
		this.fbService.addImage(base64, type, ancestor, photoName).then(status => {
			this.utilService.presentToastOK(['FILER_PHOTO_COMPLETE_1', photoName, 'FILER_PHOTO_COMPLETE_2']);
		});
	}

	async getMeta (url: any) {
		const img = new Image();
		img.src = url;
		await img.decode();  
		return img
	};
	
}
