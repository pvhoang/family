import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { getStorage, getDownloadURL, ref, Storage, uploadString } from '@angular/fire/storage';
import { deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { UtilService } from '../services/util.service';

// import {AngularFireStorage} from '@angular/fire/storage';

// import { HttpClient } from '@angular/common/http';

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

	// getContentDetails(id): Observable<any> {
	// 	const detail = doc(this.firestore, `content/${id}`);
	// 	return docData(detail) as Observable<Content>;
	// }

	// addContent(data)  {
	// 	const docRef = doc(this.firestore, "content", data.id);
	// 	return setDoc(docRef, data);
	// }

	// deleteContent(id) {
	// 	const contentRef = doc(this.firestore, `content/${id}`);
	// 	return deleteDoc(contentRef);
	// }

	// updateContent(id, data) {
	// 	const contentRef = doc(this.firestore, `content/${id}`);
	// 	return updateDoc(contentRef, data);
	// }

	readJsonDocument(collection: string, documentId): Observable<any> {
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

	addImage(base64: string, storageId: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageId);
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

	addText(text: string, storageId: string) {
		return new Promise((resolve) => {
			const storageRef = ref(this.storage, storageId);
			uploadString(storageRef, text).then((snapshot) => {
				console.log('addText - snapshot: ', snapshot);

				getDownloadURL(snapshot.ref).then(url => {
					console.log('addText - url: ', url);
					resolve(url);
				});
			})
		})
	}

	// https://firebase.google.com/docs/storage/web/download-files#web-version-9

	downloadImage(fileName, urlStorage: string) {
		return new Promise((resolve) => {
			const storage = getStorage();
			const httpsReference = ref(storage, urlStorage);
			const pathReference = ref(storage, fileName);
			// const starsRef = ref(storage, 'images/stars.jpg');
			// const fileRef = ref(storage, fileName);
			// getDownloadURL(httpsReference)
			getDownloadURL(pathReference)
			.then((url) => {
				// Insert url into an <img> tag to "download"
				// const img = document.getElementById(imageId);
				// img.setAttribute('src', url);
				console.log('url: ', url);
				resolve(url);
			})
			.catch((error) => {
				// A full list of error codes is available at
				// https://firebase.google.com/docs/storage/web/handle-errors
				switch (error.code) {
					case 'storage/object-not-found':
						console.log('File doesnot exist');
						break;
					case 'storage/unauthorized':
						console.log('User doesnt have permission to access the object');
						break;
					case 'storage/canceled':
						console.log('User canceled the upload');
						break;
					case 'storage/unknown':
						console.log('Unknown error occurred, inspect the server response');
						break;
				}
			});
		})
	}

	// async addImage(base64, storageId) {
  //   // const userId = this.auth.getUserId();

  //   // let newName = `${new Date().getTime()}-${storageId}.jpeg`;
	// 	let newName = storageId;
	// 	console.log('FirebaseService - addImage - newName: ', newName);
  //   const storageRef = ref(this.storage, newName);
	// 	console.log('FirebaseService - addImage - storageRef: ', storageRef);
  //   // const uploadResult = await uploadString(storageRef, base64, 'base64', {
  //   //   contentType: 'image/jpeg'
  //   // });

  // 	uploadString(storageRef, base64, 'base64', {
  //     contentType: 'image/jpeg'
  //   }).then((snapshot) => {
	// 		console.log('Uploaded a base64 string!');
	// 		getDownloadURL(snapshot.ref).then(url => {
	// 			console.log('url blank avatar: ', url)
	// 		});
	// 		// const url = await getDownloadURL(uploadResult.ref);
	// 	// console.log('url blank avatar: ', url)
	// 	})
	// 	// console.log('FirebaseService - addImage - uploadResult: ', uploadResult);
  //   // return await getDownloadURL(uploadResult.ref);
	// }

	// async addImageToDocument(collection: string, base64, id, data) {
  //   // const userId = this.auth.getUserId();
  //   let newName = `${new Date().getTime()}-${id}.jpeg`;
  //   const storageRef = ref(this.storage, newName);
  //   const uploadResult = await uploadString(storageRef, base64, 'base64', {
  //     contentType: 'image/jpeg'
  //   });
  //   const url = await getDownloadURL(uploadResult.ref);
	// 	console.log('url blank avatar: ', url)
	// 	data['image'] = url;
	// 	const userRef = doc(this.firestore, `users/${id}`);
	// 	updateDoc(userRef, data);
	// }
}