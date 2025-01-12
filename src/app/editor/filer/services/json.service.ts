import { Injectable } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { UtilService } from '../../../services/util.service';
import { FirebaseService } from '../../../services/firebase.service';
import { JsoneditorService } from '../../../services/jsoneditor.service';
import { FONTS_FOLDER, DEBUGS, environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class JsonService {

	ancestor: any;
	jsonTreeShow = false;
	jsonItems: any;
  jsonItemsPlaceholder: any = '';
	jsonModeShow = false;
	jsonFileName = '';
	jsonFileUrl: any;
	
	constructor(
    private languageService: LanguageService,
		private fbService: FirebaseService,
		private utilService: UtilService,
		private jsoneditorService: JsoneditorService,
	) {}

	jsonStart(ancestor: any ) {
		this.ancestor = ancestor;
		this.jsonFileName = this.languageService.getTranslation('FILE_UPLOAD_JSON');
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
		
	jsonSetFileName(jsonFileName: any ) {
		this.jsonFileName = jsonFileName;
	}

	jsonProcess(mode: any, json: any) {
		
		if (mode == 'save') {
			// check syntax: field names only
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.jsonDisplayFieldErrors(errorFields);
				return;
			}
			// save
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
			let errorFields = this.jsoneditorService.validateFieldNames(json);
			if (errorFields.length > 0) {
				this.jsonDisplayFieldErrors(errorFields);
				return;
			}
			// check images
			this.jsonUpload(json);
		}
	}
		
	private jsonType(json: any) {
		let title = json.title;
		if (!title) {
			if (this.jsonFileName.indexOf('images') > 0)
				title = 'IMAGES'
			else if (this.jsonFileName.indexOf('mds') > 0)
				title = 'MDS'
			else
				title = null;
		}
		return title;
	}

	private jsonUpload(json: any) {
		let type = this.jsonType(json);
		// let title = json.title;
		// validate images before upload for FAMILY and DOCS files
		if (!type)
			return;

		if (type == 'INFO' || type == 'IMAGES' || type == 'MDS') {
			// update info to server
			this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
				if (type == 'INFO')
					rdata.info = json;
				else if (type == 'IMAGES')
					rdata.images = json;
				else
					rdata.mds = json;
				this.fbService.saveAncestorData(rdata).then((status:any) => {
					this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
				});
			});
			return;
		}

		if (environment.useEmulators) {
			this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
				if (type == 'DOCS')
					rdata.docs = json;
				else if (type == 'FAMILY')
					rdata.family = json;
				this.fbService.saveAncestorData(rdata).then((status:any) => {
					this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
				});
			});
			return;
		}

		// validate new image files
		this.jsonValidateImage(json).then((res:any) => {
			if (DEBUGS.FILER)
				console.log('jsonValidateImage - res: ', res);
			let newFiles = res[0];
			if (newFiles.length > 0) {
				// files not in storage, errors
				this.jsonDisplayImageErrors(newFiles);
				return;
			}
			// build new images files
			let docImages = res[1];
			let storageImages = res[2];
			
			// some time it's too slow to process file list, wait 2 sec
			let toastMsg = (type == 'FAMILY') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 

			this.utilService.presentToast(toastMsg);
			setTimeout(() => {
				let images = {};
				docImages.forEach( (name: any) => {
					storageImages.forEach( (file: any) => {
						if (file.name == name)
							images[name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
					})
				})

				if (DEBUGS.JSON) {
					console.log('jsonValidateImage - docImages: ', docImages);
					console.log('jsonValidateImage - storageImages: ', storageImages);
					console.log('jsonValidateImage - images: ', images);
				}

				// update family and images to server
				this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
					// add to rdata.images if not exist!
					for (let key of Object.keys(images)) {
						if (!rdata.images[key])
							rdata.images[key] = images[key];
					}
					// console.log('jsonValidateImage - rdata.images: ', rdata.images);
					rdata.images = images;
					const doc = (type == 'FAMILY') ? 'family' : 'docs';
					rdata[doc] = json;
					// console.log('jsonValidateImage - json: ', json);
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
						let index = storageImages.findIndex((sitem: any) => sitem.fullPath == dimage);
						if (index == -1)
							newFiles.push(dimage);
					})
					console.log('jsonValidateDocs - newFiles: ', newFiles);
					// this.utilService.dismissLoading();
					resolve([newFiles, docImages, storageImages]);
				}, 2000);

			});
		});
	}
		
	private jsonGetImages(text: any, docTitle: string) {
		// "image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn"
		// "document|Quảng Bình|Quảng Bình.doc|Quang binh que ta"
		// "video|Buddha|buddha.mp4|Buddha Vipassana"
		// "photo": "Phan Ngọc Luật.jpg",

		let images = [];
		let i1 = 0;
		if (docTitle == 'FAMILY') {
			// search photo for FAMILY type
			while (i1 < text.length) {
				i1 = text.indexOf('"photo"', i1)
				if (i1 > 0) {
					i1 += 7;
					i1 = text.indexOf('"', i1);
					i1++;
					let i2 = text.indexOf('"', i1);
					let imageName = text.substring(i1, i2);
					if (imageName.trim().length > 0)
						images.push( imageName );
					i1 = i2 + 1;
				} else
					i1 = text.length + 1;
			}
		}
		// console.log('jsonGetImages - photo images: ', images);
		// search image, document, and video from desc = []
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"image|', i1)
			if (i1 >= 0) {
				// "image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn"
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let imageName = items[2];
				images.push( imageName  );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"document|', i1)
		// "video|Buddha|buddha.mp4|Buddha Vipassana"
			if (i1 >= 0) {
				// "document|Quảng Bình|Quảng Bình.doc|Quang binh que ta"
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let documentName = items[2];
				images.push( documentName );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"video|', i1)
		// "video|Buddha|buddha.mp4|Buddha Vipassana"
			if (i1 >= 0) {
				// "document|Quảng Bình|Quảng Bình.doc|Quang binh que ta"
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let videoName = items[2];
				images.push( videoName );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		// console.log('jsonGetImages - images: ', images);
		// filter duplicate file names
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
		// console.log('msgs: ', msgs);
		let message = this.utilService.getAlertMessage(msgs, true);
		this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 450 }).then(choice => {});
	}
    
}
