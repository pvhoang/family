import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilService } from '../../../services/util.service';
import { LanguageService } from '../../../services/language.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { DEBUGS } from '../../../../environments/environment';

const EXIF_ORIENTATION = -1;	// unknown

@Injectable({
	providedIn: 'root'
})
export class PhotoService {

  ancestor: any;
  photoName = '';

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

	photoProcess(mode: any, ancestor:string, photo: any, base64: any) {
		if (base64 == '')
				return;
		if (DEBUGS.FILER)
			console.log('photoUpload - photo: ', photo);

		let parts = base64.split(';');
		let photoType = parts[0].split(':')[1].split('/')[0];
		let mimType = parts[0].split(':')[1];
		
		let photoExt = photo.substring(photo.indexOf('.')+1);
		let photoValue = (this.photoName === '') ? photo : this.photoName;
		let title = this.languageService.getTranslation('FILER_PHOTO_SAVE');

		let inputs = [{ value: photoValue, attributes: { maxlength: 50 } } ]
		if (mode == 'upload') {
			title = this.languageService.getTranslation('FILER_PHOTO_UPLOAD');
			inputs = [ { value: photoValue, attributes: { maxlength: 50 }, } ]
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
					this.photoName = photoName;
					photoName += '.' + photoExt;
					let photoObject = { url: '', type:mimType, size: '', width: 0, height: 0 };
					
					if (photoType === 'image') {
						this.getMeta(base64).then(img => {
							let width = img.naturalWidth;
							let height = img.naturalHeight;
							let ratio = (width < 500) ? 100 : ((width < 1000) ? 60 : ((width < 2000) ? 40 : 20));
							let quality = (width < 500) ? 100 : ((width < 1000) ? 60 : ((width < 2000) ? 40 : 20));
							
							// console.log('photoProcess - width, height, ratio, quality: ', width, height, ratio, quality);

							photoObject.width = width;
							photoObject.height = height;
							if (DEBUGS.FILER)
								console.log('photoUploadStorage - height, width: ', width, height);
							this.imageCompress
								.compressFile(base64, EXIF_ORIENTATION, 50, 50, width, height) // 50% ratio, 50% quality
								.then(compressedImage => {
									if (mode == 'upload')
										this.loadImage(base64, photoName, ancestor);
									else
										this.saveDoc(compressedImage, photoName, photoObject);
								});
						});
						
					} else if (photoType === 'application' || photoType === 'video') {
						if (mode == 'upload')
							this.loadImage(base64, photoName, ancestor);
						else
							this.saveDoc(base64, photoName, photoObject);
					}
				} else {
					this.utilService.presentToastOK(['FILE_PHOTO_NAME_INVALID']);
				}
			}
		});
	}
	
	private saveDoc(base64: string, photoName: string, photoObject: any) {

		var base64str = base64.substring(base64.indexOf(',') + 1)
		var decoded = atob(base64str);
		let sizeInBytes = decoded.length;
		console.log(' size: ', sizeInBytes);
		let sizeStr = this.utilService.getKB(sizeInBytes);
		photoObject.size = sizeStr;
		
		fetch(base64).then(r => r.blob()).then(blob => {
			var link = window.document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = photoName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			let photoText = '\"' + photoName + '\": ' + JSON.stringify(photoObject);

			navigator.clipboard.writeText(photoText).then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
			this.utilService.presentToastOK(['FILER_PHOTO_SAVE_COMPLETE_1', photoName, 'FILER_PHOTO_SAVE_COMPLETE_2', 'FILER_PHOTO_SAVE_COMPLETE_3']);
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
