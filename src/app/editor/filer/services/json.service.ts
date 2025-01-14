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
	storageImages: any;
	
	constructor(
    private languageService: LanguageService,
		private fbService: FirebaseService,
		private utilService: UtilService,
		private jsoneditorService: JsoneditorService,
	) {}

	jsonStart(ancestor: any ) {
		this.ancestor = ancestor;
		this.jsonFileName = this.languageService.getTranslation('FILE_UPLOAD_JSON');
		// read storage files
		this.fbService.getFileList(this.ancestor).then((storageImages:any) => {
			this.storageImages = storageImages;
		});
	}
	
	private jsonDisplayImageErrors(keys: any) {
		let msgs = [];
		msgs.push({name: 'msg', label: this.languageService.getTranslation('FILE_UPLOAD_FILES_NOT_AVAILABLE')});
		msgs.push({name: 'msg', label: '&nbsp;'});
		keys.forEach((key:any) => {
			msgs.push({name: 'msg', label: '. ' + key});
		})
		// console.log('msgs: ', msgs);
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
			let mdFiles = res[2];
			let storageImages = this.storageImages;
			// let toastMsg = (title == 'FAMILY') ? 'FILE_UPLOAD_WAIT_UPDATE_FAMILY' : 'FILE_UPLOAD_WAIT_UPDATE_DOC'; 
			// this.utilService.presentToast(toastMsg);
			setTimeout(() => {
				let images = {};
				docImages.forEach( (name: any) => {
					let fullPath = this.ancestor + '/' + name;
					storageImages.forEach( (file: any) => {
						if (file.fullPath == fullPath)
							images[name] = { url: file.url, type: file.type, size: file.size, width: file.width, height: file.height };
					})
				})

				if (DEBUGS.JSON) {
					console.log('jsonValidateImage - docImages: ', docImages);
					console.log('jsonValidateImage - storageImages: ', storageImages);
					console.log('jsonValidateImage - images: ', images);
				}
				// update family, docs to server
				this.fbService.readAncestorData(this.ancestor).subscribe((rdata:any) => {
					// add to rdata.images if key not exist!
					for (let key of Object.keys(images)) {
						// if (!rdata.images[key])
						rdata.images[key] = images[key];
					}

					// add to rdata.mds if key not exist!
					let mds = rdata.mds;
					mdFiles.forEach((file:any) => {
						file = file.trim();
						if (!mds[file])
							mds[file] = {};
					})

					const doc = (title == 'FAMILY') ? 'family' : 'docs';
					rdata[doc] = json;

					this.fbService.saveAncestorData(rdata).then((status:any) => {
						this.utilService.presentToastOK(['FILE_UPLOAD_COMPLETE_1', this.jsonFileName, 'FILE_UPLOAD_COMPLETE_2']);
					});
				});
			}, 1000);
		})
	}
		
	private jsonValidateImage(json: any) {
		return new Promise((resolve) => {
			// get image list from doc text
			let data = this.jsonGetImages(JSON.stringify(json), json.title);
			let docImages = data[0];
			let docMds = data[1];
			// validate images from storage
			// wait 1 second for async to complete
			setTimeout(() => {
				let storageImages = this.storageImages;
				let newFiles = [];
				// go thru each image in doc
				docImages.forEach(dimage => {
					let fullPath = this.ancestor + '/' + dimage;
					// compare with storageImages
					let index = storageImages.findIndex((sitem: any) => sitem.fullPath == fullPath);
					if (index == -1)
						newFiles.push(dimage);
				})
				console.log('jsonValidateDocs - newFiles: ', newFiles);
				resolve([newFiles, docImages, docMds, storageImages]);
			}, 1000);
		});
	}
		
	private jsonGetImages(text: any, docTitle: string) {
		// "image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn"
		// "document|Quảng Bình|Quảng Bình.doc|Quang binh que ta"
		// "video|Buddha|buddha.mp4|Buddha Vipassana"
		// "photo": "Phan Ngọc Luật.jpg",

		let images = [];
		let mds = [];

		// "photo="hello.jpg"

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
		// search image, document, video, and .md from desc = []

		// "image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn"
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"image|', i1)
			if (i1 >= 0) {
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let imageName = items[2];
				images.push( imageName  );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		// "document|Quảng Bình|Quảng Bình.doc|Quang binh que ta"
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"document|', i1)
			if (i1 >= 0) {
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let documentName = items[2];
				images.push( documentName );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		// "video|Buddha|buddha.mp4|Buddha Vipassana"
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"video|', i1)
			if (i1 >= 0) {
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let videoName = items[2];
				images.push( videoName );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		// "md|phu khao.md",
		i1 = 0;
		while (i1 < text.length) {
			i1 = text.indexOf('"md|', i1)
			if (i1 >= 0) {
				let i2 = text.indexOf('"', i1+1);
				let items = text.substring(i1+1, i2).split('|');
				let mdFile: any = items[1];
				if (mdFile.endsWith('.md'))
					mds.push( mdFile );
				i1 = i2 + 1;
			} else
				i1 = text.length + 1;
		}

		// console.log('jsonGetImages - images: ', images);
		// filter duplicate file names
		let imageList = images.filter((item, pos) => {
			return images.indexOf(item) == pos; 
		});
		let mdList = mds.filter((item, pos) => {
			return mds.indexOf(item) == pos; 
		});
		return [imageList, mdList];
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
