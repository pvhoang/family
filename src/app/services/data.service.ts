import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, updateDoc, docData } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { Family } from '../models/family.model';

export interface Content {
	id?: string;
	email: string;
	text: string;
}

@Injectable({
	providedIn: 'root'
})
export class DataService {
	family = {};
	logout$: Subject<boolean> = new Subject<boolean>();

	constructor(private firestore: Firestore, private storage: Storage, private http: HttpClient) {
	}

	async loadFamily(id) {
		// const id = '24-07-2022_14-43';
    this.getContentDetails(id).subscribe((content:any) => {
      let family = JSON.parse(content.text);
			// save to local storage
			this.saveFamily(family);
			// console.log('loadFamily: ', family)
		})
	}
	
	async saveFamily(family) {
		localStorage.setItem('FAMILY', JSON.stringify(family));
		return await true;
	}

	async readFamily() {
		let value = localStorage.getItem('FAMILY');
		value = JSON.parse(value);
		return await value;
	}
	
	getLocalJsonFile(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.get(url).toPromise().then((data:any) => {
				resolve(data);
			}).catch(err => {
				reject(err.error);
			});
		});
	}

	saveContent(content: any) {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
		let hour = ''+d.getHours();		if (hour.length < 2) hour = '0' + hour;
		let min = ''+d.getMinutes();		if (min.length < 2) min = '0' + min;
		const id = ''+day+'-'+month+'-'+year+'_'+hour+'-'+min;
		content.id = id;
		console.log('content: ', content)
		// let content = {id: id, email: email, text: JSON.stringify(family)};
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