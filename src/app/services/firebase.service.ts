import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
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

	constructor(private firestore: Firestore, private storage: Storage) {
	}

  saveContent(content: any) {
    this.addContent(content).then(
      res => {
				console.log('res: ', res);
			},
      async err => {
				console.log('ERROR: ', err);
      }
    );
	}

	getContents(): Observable<Content[]> {
		const contentRef = collection(this.firestore, 'content');
		return collectionData(contentRef, { idField: 'id'}) as Observable<Content[]>;
	}

	getContentDetails(id): Observable<any> {
		const detail = doc(this.firestore, `content/${id}`);
		return docData(detail) as Observable<Content>;
	}

	addContent(data)  {
		const docRef = doc(this.firestore, "content", data.id);
		return setDoc(docRef, data);
	}

	deleteContent(id) {
		const contentRef = doc(this.firestore, `content/${id}`);
		return deleteDoc(contentRef);
	}

	updateContent(id, data) {
		const contentRef = doc(this.firestore, `content/${id}`);
		return updateDoc(contentRef, data);
	}

}