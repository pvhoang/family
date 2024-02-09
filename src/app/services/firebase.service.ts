import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, getBlob, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from './util.service';
import { DEBUGS } from '../../environments/environment';

const ROOT_COLLECTION = 'giapha';

export interface Content {
	id?: string;
	email: string;
	text: string;
}

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {

	constructor(
		private firestore: Firestore, 
		private storage: Storage,
		private utilService: UtilService,
	) {
	}

	getAncestors(): Observable<[]> {
		const colRef = collection(this.firestore, ROOT_COLLECTION);
		return collectionData(colRef, { idField: 'id'}) as Observable<[]>;
	}

	private getAncestorData(ancestor): Observable<any> {
		let id = ROOT_COLLECTION + '/' + ancestor;
		const data = doc(this.firestore, id);
		return docData(data) as any;
	}

	private setAncestorData(ancestor, data)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor);
		return setDoc(docRef, data);
	}

	private getAppData(): Observable<any> {
		let id = ROOT_COLLECTION + '/app';
		const data = doc(this.firestore, id);
		return docData(data) as any;
	}

	private setAppData(data)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, 'app');
		return setDoc(docRef, data);
	}

	private setBackupFamily(ancestor: any, family: any, id: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "families", id);
		return setDoc(docRef, family);
	}
	
	private setBackupDocs(ancestor: any, docs: any, id: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "docs", id);
		return setDoc(docRef, docs);
	}

	async saveAncestorData(data: any) {
		return new Promise((resolve, reject) => {
			let ancestor = data.info.id;
			let rdata = {};
			for (var key of Object.keys(data))
				rdata[key] = JSON.stringify(data[key]);
			this.setAncestorData(ancestor, rdata).then((res:any) => {
				resolve(true);
			});
		});
	}

	async saveDocsData(ancestor: any, language: any, docs: any) {
		return new Promise((resolve) => {
      this.readAncestorData(ancestor).subscribe((rdata:any) => {
				rdata.docs[language] = docs;
				this.saveAncestorData(rdata).then((status:any) => {
					this.saveBackupDocs(ancestor, rdata.docs).then((status:any) => {
						resolve(true);
					});
				});
			});
		});
	}

	async saveDocsAll(ancestor: any, docs: any) {
		return new Promise((resolve) => {
      this.readAncestorData(ancestor).subscribe((rdata:any) => {
				rdata.docs = docs;
				this.saveAncestorData(rdata).then((status:any) => {
					this.saveBackupDocs(ancestor, rdata.docs).then((status:any) => {
						resolve(true);
					});
				});
			});
		});
	}

	readAncestorData(ancestor: string): Observable<any> {
		return from(
			new Promise((resolve, reject) => {
				this.getAncestorData(ancestor).subscribe(
				(rdata:any) => {
					let data = {};
					for (var key of Object.keys(rdata))
						data[key] = JSON.parse(rdata[key]);
					resolve(data);
				},
				(error:any) => {
					reject(error);
				})
			})
		)
	}

	async saveAppData(data: any) {
		return new Promise((resolve, reject) => {
			this.setAppData(data).then((res:any) => {
				resolve(true);
			});
		});
	}

	async readAppData() {
		return new Promise((resolve, reject) => {
			this.getAppData().subscribe(
			(data:any) => {
				resolve(data);
			},
			(error:any) => {
				console.log('ERROR: ', error);
				reject(error);
			})
		})
	}

	async saveBackupFamily(ancestor: any, family: any, id: any) {
		return new Promise((resolve) => {
			let rfamily = {};
			for (var key of Object.keys(family))
				rfamily[key] = JSON.stringify(family[key]);
			this.setBackupFamily(ancestor, rfamily, id).then((res:any) => {
				resolve(true);
			})
			.catch((error) => {
				console.log('saveBackupFamily - ', error.message);
				resolve(false);
			});
		});
	}

	private async saveBackupDocs(ancestor: any, docs: any) {
		let id = this.utilService.getDateID();
		return new Promise((resolve) => {
			this.setBackupDocs(ancestor, docs, id).then((res:any) => {
				resolve(true);
			});
		});
	}

	// -----------

	updateJsonDocument(collection: string, documentId, data) {
  	let document = {id: documentId, data: JSON.stringify(data)};
		const docRef = doc(this.firestore, collection, documentId);
		return updateDoc(docRef, document);
	}

	deleteImage(storageFolder, storageId: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + storageId);
			deleteObject(storageRef)
			.then(() => {
				resolve(true);
			})
			.catch((error) => {
				console.log(error.message);
				resolve(false);
			});
		});
	}

	addText(text: string, storageFolder:string, storageId: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + storageId);
			uploadString(storageRef, text).then((snapshot) => {
				// console.log('addText - snapshot: ', snapshot);
				getDownloadURL(snapshot.ref).then(url => {
					// console.log('addText - url: ', url);
					resolve(url);
				});
			})
		})
	}

	addImage(base64: string, type: any, storageFolder, storageId: string) {
		return new Promise((resolve) => {
			// console.log('addImage - storageFolder: ', storageFolder);
			// get type: data:image/png;
			// console.log('addImage - type: ', type);
			const storageRef = ref(this.storage, storageFolder + '/' + storageId);
			uploadString(storageRef, base64, 'base64', {
				// contentType: 'image/jpeg'
				// contentType: 'image/png'
				contentType: type
			})
			.then((snapshot) => {
				getDownloadURL(snapshot.ref).then(url => {
					resolve(url);
				});
			})
			.catch((error) => {
				console.log('ERROR - addImage: ', error.message);
				resolve(null);
			});
		})
	}

	// https://firebase.google.com/docs/storage/web/download-files#web-version-9

	getDocumentURL(storageFolder:string, storageId) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getMetadata(storageRef).then((metadata) => {
				// Metadata now contains the metadata for 'images/forest.jpg'
				if (DEBUGS.FIREBASE)
					console.log('getDocumentURL - metadata: ', metadata.contentType);
				let type = metadata.contentType;
				getDownloadURL(storageRef).then((url) => {
					// const xhr = new XMLHttpRequest();
					// xhr.responseType = 'blob';
					// xhr.onload = (event) => {
					// 	const blob = xhr.response;
					// 	resolve({ url: url, blob: blob, type: type });
					// };
					// xhr.open('GET', url);
					// xhr.send();
					resolve({ url: url, type: type });
				});
			})
			.catch((error) => {
				// A full list of error codes is available at
				// https://firebase.google.com/docs/storage/web/handle-errors
				switch (error.code) {
					case 'storage/object-not-found':
						console.log('ERROR - File does not exist');
						break;
					case 'storage/unauthorized':
						console.log('ERROR - User does not have permission to access the object');
						break;
					case 'storage/canceled':
						console.log('ERROR - User canceled the upload');
						break;
					case 'storage/unknown':
						console.log('ERROR - Unknown error occurred, inspect the server response');
						break;
				}
				resolve(null);
			});
		})
	}

	downloadImage(storageFolder:string, storageId) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getDownloadURL(storageRef).then((url) => {
				resolve(url);
			})
			.catch((error) => {
				// A full list of error codes is available at
				// https://firebase.google.com/docs/storage/web/handle-errors
				switch (error.code) {
					case 'storage/object-not-found':
						console.log('ERROR - File does not exist');
						break;
					case 'storage/unauthorized':
						console.log('ERROR - User does not have permission to access the object');
						break;
					case 'storage/canceled':
						console.log('ERROR - User canceled the upload');
						break;
					case 'storage/unknown':
						console.log('ERROR - Unknown error occurred, inspect the server response');
						break;
				}
				resolve(null);
			});
		})
	}

	downloadText(storageFolder:string, storageId) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getDownloadURL(storageRef).then((url) => {
				const xhr = new XMLHttpRequest();
				xhr.responseType = 'text'
				xhr.onload = (event) => {
					const text = xhr.response;
					resolve(text);
				}
				xhr.open('GET', url)
				xhr.send();
			})
			.catch((error) => {
				// A full list of error codes is available at
				// https://firebase.google.com/docs/storage/web/handle-errors
				switch (error.code) {
					case 'storage/object-not-found':
						console.log('ERROR - File does not exist');
						break;
					case 'storage/unauthorized':
						console.log('ERROR - User does not have permission to access the object');
						break;
					case 'storage/canceled':
						console.log('ERROR - User canceled the upload');
						break;
					case 'storage/unknown':
						console.log('ERROR - Unknown error occurred, inspect the server response');
						break;
				}
				resolve(null);
			});
		})
	}

	getPhotoNames(storageFolder:string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const r = ref(storage, storageFolder + '/');
			listAll(r).then((data) => {
				let names = [];
				for (let i = 0; i < data.items.length; i++) {
					let name = data.items[i].name;
					let newref = ref(storage, storageFolder + '/' + data.items[i].name);
					getMetadata(newref).then((metadata) => {
						let type = metadata.contentType;
						if (type.indexOf('image') >= 0)
							names.push(name);
					})
					// if (name.indexOf('.png') > 0 || name.indexOf('.jpg') > 0 || name.indexOf('.jpeg') > 0)
					// 	names.push(name);
				}
				setTimeout(() => {
					resolve(names);
				}, 500);
			})
		});
	}

	getFileList(storageFolder:string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			let filelist = []
			const r = ref(storage, storageFolder + '/');
			listAll(r).then((data) => {
				// console.log('data: ', data);
				for (let i = 0; i < data.items.length; i++) {
				// console.log('data: ', data.items[i]);
					let name = data.items[i].name;
					let newref = ref(storage, storageFolder + '/' + data.items[i].name);
					getMetadata(newref).then((metadata) => {
						// Metadata now contains the metadata for 'images/forest.jpg'
						// console.log('metadata: ', metadata);
						let type = metadata.contentType;
						let size = metadata.size.toLocaleString('vn-VN');
						// type = (type.indexOf('image') >= 0) ? 'jpg' : 'html';
						getDownloadURL(newref).then((url) => {
							filelist.push({
								name: name,
								size: size,
								type: type,
								url: url
							});
						});
					}).catch((error) => {
						console.log('ERROR - FirebaseService - getFileList - error:', error)
						// Uh-oh, an error occurred!
					});
				}
				resolve(filelist);
			});
		});
	}

}