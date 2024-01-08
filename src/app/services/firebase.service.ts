import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, getBlob, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from './util.service';

// import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, listAll, Storage, uploadString } from '@angular/fire/storage';

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

	// private setDocsData(ancestor, data)  {
	// 	const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor);
	// 	return setDoc(docRef, data);
	// }

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

	async saveDocsData(ancestor: any, docs: any) {
		return new Promise((resolve) => {
      this.readAncestorData(ancestor).subscribe((rdata:any) => {
				rdata.docs = docs;
				this.saveAncestorData(rdata).then((status:any) => {
          resolve(true);
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

	async saveBackupDocs(ancestor: any, docs: any) {
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
				// console.log("File deleted successfully");
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
				// console.log('Uploaded a base64 string!');
				getDownloadURL(snapshot.ref).then(url => {
					// console.log('addImage - url: ', url);
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

	downloadImage(storageFolder:string, storageId) {
		return new Promise((resolve) => {
			const storage = getStorage();
			// const httpsReference = ref(storage, storageFolder + '/' + urlStorage);
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getDownloadURL(storageRef)
			.then((url) => {
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
			// const httpsReference = ref(storage, storageFolder + '/' + urlStorage);
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getDownloadURL(storageRef)
			.then((url) => {
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

	// getPhotoNames1(storageFolder:string) {
	// 	return new Promise((res) => {
	// 		const storage = getStorage();
	// 		const r = ref(storage, storageFolder + '/');
	// 		listAll(r).then((data) => {
	// 			let promises = [];
	// 			for (let i = 0; i < data.items.length; i++) {
	// 				promises.push(
	// 					new Promise((resolve) => {
	// 						let name = data.items[i].name;
	// 						if (name.indexOf('.png') > 0 || name.indexOf('.jpg') > 0 || name.indexOf('.jpeg') > 0) {
	// 							console.log('name1: ', name)
	// 							let sname = name.substring(0, name.indexOf('.'));
	// 							let textFile = sname + '.txt';
	// 							console.log('textFile: ', textFile)
	// 							this.downloadText(storageFolder, textFile).then(text => {
	// 								if (text) {
	// 									console.log('text: ', text)
	// 									// there is some caption data, add to name
	// 									name += '|' + text;
	// 								}
	// 								// names.push(name);
	// 								resolve(name);
	// 							})
	// 						}
	// 						// resolve(null);
	// 					})
	// 				)
	// 			}
	// 			Promise.all(promises).then(resolves => {
	// 				let names = [];
	// 				console.log('resolves = ', resolves);
	// 				for (let i = 0; i < resolves.length; i++) {
	// 					let name = resolves[i];
	// 					if (name)
	// 						names.push(name);
	// 				}
	// 				res(names);
	// 			});
	// 		})
	// 	});
	// }

	getPhotoNames(storageFolder:string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const r = ref(storage, storageFolder + '/');
			listAll(r).then((data) => {
				let names = [];
				for (let i = 0; i < data.items.length; i++) {
					let name = data.items[i].name;
					if (name.indexOf('.png') > 0 || name.indexOf('.jpg') > 0 || name.indexOf('.jpeg') > 0)
						names.push(name);
				}
				for (let i = 0; i < names.length; i++) {
					let name = names[i];
					let sname = name.substring(0, name.indexOf('.'));
					let textFile = sname + '.txt';
					for (let j = 0; j < data.items.length; j++) {
						let srcName = data.items[j].name;
						if (srcName.indexOf(textFile) == 0) {
							names[i] += '|' + textFile;
							break;
						}
					}
				}
				resolve(names);
			})
		});
	}

	getPhotoList(storageFolder:string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const r = ref(storage, storageFolder + '/');
			listAll(r).then((data) => {
				let photolist = []
				for (let i = 0; i < data.items.length; i++) {
					let name = data.items[i].name;
					if (name.lastIndexOf('_') > 0) {
						let photoTime = name.substring(name.lastIndexOf('_')+1);
						if (photoTime.length > 12) {
							let time = photoTime;
							let photoName = name.substring(0, name.lastIndexOf('_'));
							// photolist.push({ photoName: photoTime })
							photolist.push( [photoName, time] )
						}
					}
				}
				resolve(photolist);
			});
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
						console.log('ERROR - FirebaseService - getFileList:', error)
						// Uh-oh, an error occurred!
					});
					// let url = getDownloadURL(newref).then((data) => {
					// 	filelist.push({
					// 		name: name,
					// 		url: data
					// 	});
					// });
				}
				resolve(filelist);
			});
		});
	}

}