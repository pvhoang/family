import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, query, documentId, where, updateDoc, addDoc, getDocs, getDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, getMetadata, deleteObject, getBlob, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from './util.service';
import { DEBUGS, ROOT_COLLECTION, environment } from '../../environments/environment';

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

	getAncestors() {
		return new Promise((resolve) => {
			this.collectAncestors().subscribe((ancestors:any) => {
				resolve(ancestors);
			});
		});
	}

	private collectAncestors(): Observable<[]> {
		const colRef = collection(this.firestore, ROOT_COLLECTION);
		return collectionData(colRef, { idField: 'id'}) as Observable<[]>;
	}

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

	private getAncestorData(ancestor): Observable<any> {
		let id = ROOT_COLLECTION + '/' + ancestor;
		const data = doc(this.firestore, id);
		return docData(data) as any;
	}

	private setAncestorData(ancestor, data)  {
		const docRef = doc(this.firestore, ROOT_COLLECTION, ancestor);
		return setDoc(docRef, data);
	}

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

	readAncestorData(ancestor: string): Observable<any> {
		return from(
			new Promise((resolve, reject) => {
				this.getAncestorData(ancestor).subscribe({
					next: (rdata:any) => {
						let data = {};
						for (var key of Object.keys(rdata))
							data[key] = JSON.parse(rdata[key]);
						resolve(data);
					},
					error: (error:any) => {
						reject(error);
					},
					complete() {
						console.log("is completed");
						resolve(true);
					},
				})
			})
		)
	}
	
	// ----------- STORAGE ---

	deleteImage(storageFolder, fullPath: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + fullPath);
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

	addText(text: string, storageFolder:string, fullPath: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + fullPath);
			uploadString(storageRef, text).then((snapshot) => {
				getDownloadURL(snapshot.ref).then(url => {
					resolve(url);
				});
			})
		})
	}

	addImage(base64: string, type: any, storageFolder: any, fullPath: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageFolder + '/' + fullPath);
			console.log('addImage - storageRef: ', storageRef);
			uploadString(storageRef, base64, 'base64', {
				contentType: type
			})
			.then((snapshot) => {
				getDownloadURL(snapshot.ref).then(url => {
					console.log('addImage - url: ', url);
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

	getDocumentURL(storageFolder:string, fullPath: any) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + fullPath);
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

	downloadImage(storageFolder:string, fullPath: any) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + fullPath);
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

	downloadText(storageFolder:string, fullPath: any) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const storageRef = ref(storage, storageFolder + '/' + fullPath);
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

	getFileList(storageFolder:string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const listRef = ref(storage, storageFolder + '/');
			let fileList = []
			this.getFolder(fileList, listRef);
			setTimeout(() => {
				resolve(fileList);
			}, 1000);
		})
	}

	// https://firebase.google.com/docs/storage/web/list-files

	private getFolder(fileList:any, folderRef:any) {
		listAll(folderRef).then((res) => {
			res.prefixes.forEach((fRef) => {
				this.getFolder(fileList, fRef);
			});
			res.items.forEach((fRef) => {
				getMetadata(fRef).then((metadata) => {
					let type = metadata.contentType;
					let size = metadata.size.toLocaleString('vn-VN');
					if (environment.useEmulators) {
						// emulator can not decode local file with url (localhost:9199)
						fileList.push({
							fullPath: fRef.fullPath,
							size: size,
							type: type,
							url: null,
							width: 0,
							height: 0
						});
					} else {
						const getMeta = async (url: any) => {
							const img = new Image();
							img.src = url;
							await img.decode();  
							return img
						};
						getDownloadURL(fRef).then((url) => {
							// https://stackoverflow.com/questions/11442712/get-width-height-of-remote-image-from-url
							getMeta(url).then((img) => {
								fileList.push({
									fullPath: fRef.fullPath,
									size: size,
									type: type,
									url: url,
									width: img.naturalWidth,
									height: img.naturalHeight
								});
							}).catch((error) => {
								console.log('error: ', error);
							});
						});
					}
				})
			});
		});
	}
}
