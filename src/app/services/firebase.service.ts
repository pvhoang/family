import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, deleteObject, getBlob, listAll, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from './util.service';

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

	// async saveDocsData(ancestor, data: any) {
	// 	return new Promise((resolve, reject) => {
	// 		let rdata = {};
	// 		for (var key of Object.keys(data))
	// 			rdata[key] = JSON.stringify(data[key]);
	// 		this.setDocsData(ancestor, rdata).then((res:any) => {
	// 			resolve(true);
	// 		});
	// 	});
	// }

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
		return new Promise((resolve, reject) => {
			this.setBackupFamily(ancestor, family, id).then((res:any) => {
				resolve(true);
			});
		});
	}

	async saveBackupDocs(ancestor: any, docs: any, id: any) {
		return new Promise((resolve, reject) => {
			this.setBackupDocs(ancestor, docs, id).then((res:any) => {
				resolve(true);
			});
		});
	}

	// -----------

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
				console.log('Uploaded a base64 string!');
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

}