import { Injectable } from '@angular/core';
<<<<<<< Updated upstream
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from '../services/util.service';

// import {AngularFireStorage} from '@angular/fire/storage';

// import { HttpClient } from '@angular/common/http';
=======
import { collection, collectionData, doc, Firestore, query, documentId, where, updateDoc, addDoc, getDocs, getDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, getBlob, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from './util.service';
import { DEBUGS, ROOT_COLLECTION, environment } from '../../environments/environment';
>>>>>>> Stashed changes

export interface Content {
	id?: string;
	email: string;
	text: string;
}

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {

	ancestorID: string;

	constructor(
		private firestore: Firestore, 
		private storage: Storage,
    private utilService: UtilService,
	) {
	}

	saveAncestorFamily(ancestor, data: any) {
    this.addAncestorFamily(ancestor, data).then(
      res => {
				console.log('res: ', res);
			},
      async err => {
				console.log('ERROR: ', err);
      }
    );
	}

	addAncestorFamily(ancestor, data)  {
		const docRef = doc(this.firestore, ancestor, "update", "family", data.id);
		return setDoc(docRef, data);
	}

	deleteAncestorFamily(ancestor, id) {
		// const docRef = doc(this.firestore, `content/${id}`);
		const docRef = doc(this.firestore, ancestor, "update", "family", id);
		return deleteDoc(docRef);
	}

	getAncestorFamilies(ancestor): Observable<[]> {
		const colRef = collection(this.firestore, ancestor, "update", "family");
		return collectionData(colRef, { idField: 'id'}) as Observable<[]>;
	}

<<<<<<< Updated upstream
  // saveContent(content: any) {
  //   this.addContent(content).then(
  //     res => {
	// 			console.log('res: ', res);
	// 		},
  //     async err => {
	// 			console.log('ERROR: ', err);
  //     }
  //   );
	// }

	// getContents(): Observable<Content[]> {
	// 	const contentRef = collection(this.firestore, 'content');
	// 	return collectionData(contentRef, { idField: 'id'}) as Observable<Content[]>;
	// }
=======
	async getAncestor(ancestor: any) {
		const snap = await getDoc(doc(this.firestore, ROOT_COLLECTION, ancestor))
		if (snap.exists()) {
			this.ancestorID = ancestor;
			return snap.data()
		}	else
			// return Promise.reject(Error(`No such document: ${ROOT_COLLECTION}.${ancestor}`))
			return null;
	}

	public getAncestorID() {
		return this.ancestorID;
	}

	async deleteAncestor(ancestor: any) {
		await deleteDoc(doc(this.firestore, ROOT_COLLECTION, ancestor));
	}
>>>>>>> Stashed changes

	// getContentDetails(id): Observable<any> {
	// 	const detail = doc(this.firestore, `content/${id}`);
	// 	return docData(detail) as Observable<Content>;
	// }

	// addContent(data)  {
	// 	const docRef = doc(this.firestore, "content", data.id);
	// 	return setDoc(docRef, data);
	// }

<<<<<<< Updated upstream
	// deleteContent(id) {
	// 	const contentRef = doc(this.firestore, `content/${id}`);
	// 	return deleteDoc(contentRef);
	// }

	// updateContent(id, data) {
	// 	const contentRef = doc(this.firestore, `content/${id}`);
	// 	return updateDoc(contentRef, data);
	// }

	readJsonDocument(collection: string, documentId): Observable<any> {
=======
	// private getAppData(): Observable<any> {
	// 	let id = ROOT_COLLECTION + '/app';
	// 	const data = doc(this.firestore, id);
	// 	return docData(data) as any;
	// }

	// private setAppData(data)  {
	// 	const docRef = doc(this.firestore, ROOT_COLLECTION, 'app');
	// 	return setDoc(docRef, data);
	// }

	// private setBackupFamily(ancestor: any, family: any, id: any)  {
	// 	const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "families", id);
	// 	return setDoc(docRef, family);
	// }
	
	// private setBackupDocs(ancestor: any, docs: any, id: any)  {
	// 	const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "docs", id);
	// 	return setDoc(docRef, docs);
	// }

	// async setCol(ancestor: any, colId: any, docId: any, fieldData: any, update?: boolean)  {
	// 	const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, colId, docId);
	// 	return update ? updateDoc(docRef, fieldData) : setDoc(docRef, fieldData)
	// }

	async setCollectionJson(colId: any, json: any, update?: boolean)  {
		let data = { content: JSON.stringify(json) }
		const docRef = doc(this.firestore, ROOT_COLLECTION, this.ancestorID, colId, 'json');
		return update ? updateDoc(docRef, data) : setDoc(docRef, data)
	}

	async getCollectionJson(colId: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, this.ancestorID, colId, 'json');
		const snap = await getDoc(docRef)
		if (snap.exists()) {
			let data:any = snap.data();
			return JSON.parse(data.content);
		} else 
			return null;
	}

	async deleteNotification(ancestor: any, docId: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "notifications", docId);
		return deleteDoc(docRef)
	}

	async updateNotification(ancestor: any, docId: any, data: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "notifications", docId);
		return updateDoc(docRef, data)
	}

	async setNotification(ancestor: any, docId: any, data: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "notifications", docId);
		return setDoc(docRef, data)
	}
	
	async getNotification(ancestor: any, docId: any)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor, "notifications", docId);
		// if (!docRef)
		// 	return null;
		const snap = await getDoc(docRef)
		if (snap.exists()) {
			return snap.data()
		} else 
			return null;
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

	// async saveDocsData(ancestor: any, language: any, docs: any) {
	// 	return new Promise((resolve) => {
  //     this.readAncestorData(ancestor).subscribe((rdata:any) => {
	// 			rdata.docs[language] = docs;
	// 			this.saveAncestorData(rdata).then((status:any) => {
	// 				this.saveBackupDocs(ancestor, rdata.docs).then((status:any) => {
	// 					resolve(true);
	// 				});
	// 			});
	// 		});
	// 	});
	// }

	// async saveDocsAll(ancestor: any, docs: any) {
	// 	return new Promise((resolve) => {
  //     this.readAncestorData(ancestor).subscribe((rdata:any) => {
	// 			rdata.docs = docs;
	// 			this.saveAncestorData(rdata).then((status:any) => {
	// 				this.saveBackupDocs(ancestor, rdata.docs).then((status:any) => {
	// 					resolve(true);
	// 				});
	// 			});
	// 		});
	// 	});
	// }

	readAncestorData(ancestor: string): Observable<any> {
>>>>>>> Stashed changes
		return from(
				new Promise((resolve, reject) => {
					this.readDocument(collection, documentId).subscribe(
					(res:any) => {
				// console.log('readJsonDocument - collection, res: ', collection, res);
						// if collection is not valid, use null data 
						let data = (res) ? JSON.parse(res.data) : null;
						resolve(data);
					},
					(error:any) => {
						// throw error;
						reject(error);
					})
				})
<<<<<<< Updated upstream
			)
	}

	checkJsonDocument(col:any): Observable<[]> {
		const colRef = collection(this.firestore, col);
		return collectionData(colRef) as Observable<[]>;
	}

	updateJsonDocument(collection: string, documentId, data) {
  	let document = {id: documentId, data: JSON.stringify(data)};
		const docRef = doc(this.firestore, collection, documentId);
		return updateDoc(docRef, document);
	}
=======
			})
		)
	}

	// async saveAppData(data: any) {
	// 	return new Promise((resolve, reject) => {
	// 		this.setAppData(data).then((res:any) => {
	// 			resolve(true);
	// 		});
	// 	});
	// }

	// async readAppData() {
	// 	return new Promise((resolve, reject) => {
	// 		this.getAppData().subscribe({
	// 			next: (data:any) => {
	// 				resolve(data);
	// 			},
	// 			error: (error:any) => {
	// 				console.log('ERROR: ', error);
	// 				reject(error);
	// 			},
	// 			complete() {
	// 				console.log("is completed");
	// 				resolve(true);
	// 			},
	// 		})
	// 	})
	// }

	// async saveBackupFamily(ancestor: any, family: any, id: any) {
	// 	return new Promise((resolve) => {
	// 		let rfamily = {};
	// 		for (var key of Object.keys(family))
	// 			rfamily[key] = JSON.stringify(family[key]);
	// 		this.setBackupFamily(ancestor, rfamily, id).then((res:any) => {
	// 			resolve(true);
	// 		})
	// 		.catch((error) => {
	// 			console.log('saveBackupFamily - ', error.message);
	// 			resolve(false);
	// 		});
	// 	});
	// }

	// private async saveBackupDocs(ancestor: any, docs: any) {
	// 	let id = this.utilService.getDateID();
	// 	return new Promise((resolve) => {
	// 		this.setBackupDocs(ancestor, docs, id).then((res:any) => {
	// 			resolve(true);
	// 		});
	// 	});
	// }

	// -----------

	// updateJsonDocument(collection: string, documentId, data) {
  // 	let document = {id: documentId, data: JSON.stringify(data)};
	// 	const docRef = doc(this.firestore, collection, documentId);
	// 	return updateDoc(docRef, document);
	// }
>>>>>>> Stashed changes

	readDocument(collection: string, documentId): Observable<any> {
		// --- ASSETS ---
		// return from(
		// 	new Promise((resolve, reject) => {
		// 		let jsonFile = './assets/' + collection + '/' + documentId + '.json';
		// 		this.utilService.getLocalJsonFile(jsonFile).then((json:any) => {
		// 			resolve(json);
		// 		});
		// 	})
		// )
		// --- FIREBASE ---
		let id = collection + '/' + documentId;
		const data = doc(this.firestore, id);
		return docData(data) as any;
	}

	saveDocument(collection: string, document: any) {
    this.addDocument(collection, document).then(
      res => {
				console.log('saveDocument - res: ', res);
			},
      async err => {
				console.log('saveDocument - ERROR: ', err);
      }
    );
	}

	updateDocument(collection: string, documentId, data) {
		let id = collection + '/' + documentId;
		const docRef = doc(this.firestore, id);
		return updateDoc(docRef, data);
	}

	async addDocument(collection: string, document: any)  {
		const docRef = doc(this.firestore, collection, document.id);
		return await setDoc(docRef, document);
	}

	addImage(base64: string, storageFolder, storageId: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + storageId);
			uploadString(storageRef, base64, 'base64', {
				contentType: 'image/jpeg'
			}).then((snapshot) => {
				// console.log('Uploaded a base64 string!');
				getDownloadURL(snapshot.ref).then(url => {
					// console.log('addImage - url: ', url);
					resolve(url);
				});
			})
		})
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

	// https://firebase.google.com/docs/storage/web/download-files#web-version-9

<<<<<<< Updated upstream
	// downloadImage(fileName, storageFolder:string, urlStorage: string) {
=======
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

>>>>>>> Stashed changes
	downloadImage(storageFolder:string, storageId) {
		return new Promise((resolve) => {
			const storage = getStorage();
			// const httpsReference = ref(storage, storageFolder + '/' + urlStorage);
			const storageRef = ref(storage, storageFolder + '/' + storageId);
			getDownloadURL(storageRef)
			.then((url) => {
				// Insert url into an <img> tag to "download"
				// const img = document.getElementById(imageId);
				// img.setAttribute('src', url);
				resolve(url);
			})
			.catch((error) => {
				// A full list of error codes is available at
				// https://firebase.google.com/docs/storage/web/handle-errors
				switch (error.code) {
					case 'storage/object-not-found':
						console.log('File does not exist');
						break;
					case 'storage/unauthorized':
						console.log('User does not have permission to access the object');
						break;
					case 'storage/canceled':
						console.log('User canceled the upload');
						break;
					case 'storage/unknown':
						console.log('Unknown error occurred, inspect the server response');
						break;
				}
				resolve(null);
			});
		})
	}

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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
						console.log('metadata: ', metadata);
						let type = metadata.contentType;
						let size = metadata.size;
						type = (type.indexOf('image') >= 0) ? 'jpg' : 'html';
						getDownloadURL(newref).then((url) => {
							filelist.push({
								name: name,
								size: size,
								type: type,
								url: url
							});
						});

					}).catch((error) => {
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
