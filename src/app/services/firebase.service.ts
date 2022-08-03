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

	
	// getLocalJsonFile(url: string): Promise<any> {
	// 	return new Promise((resolve, reject) => {
	// 		this.http.get(url).toPromise().then((data:any) => {
	// 			resolve(data);
	// 		}).catch(err => {
	// 			reject(err.error);
	// 		});
	// 	});
	// }

	saveContent(content: any) {
		// const d = new Date();
		// let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		// let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		// let year = d.getFullYear();
		// let hour = ''+d.getHours();		if (hour.length < 2) hour = '0' + hour;
		// let min = ''+d.getMinutes();		if (min.length < 2) min = '0' + min;
		// const id = ''+day+'-'+month+'-'+year+'_'+hour+'-'+min;
		// content.id = id;
		// console.log('content: ', content)
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

	// private filterNodes(family: any) {
  //   let filterFamily = {};
  //   filterFamily['nodes'] = [];

  //   family['nodes'].forEach(node => {
  //     let newNode = {};
  //     if (node.id != '') newNode['id'] = node.id;
  //     if (node.relationship != '') newNode['relationship'] = node.relationship;
  //     if (node.name != '') newNode['name'] = node.name;
  //     if (node.nick != '') newNode['nick'] = node.nick;
  //     if (node.gender != '') newNode['gender'] = node.gender;
  //     if (node.yob != '') newNode['yob'] = node.yob;
  //     if (node.yod != '') newNode['yod'] = node.yod;
  //     if (node.pob != '') newNode['pob'] = node.pob;
  //     if (node.pod != '') newNode['pod'] = node.pod;
  //     if (node.por != '') newNode['por'] = node.por;
  //     filterFamily['nodes'].push(newNode);
  //   })
  //   // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
  //   if (family['children']) {
  //     filterFamily['children'] = [];
  //     family['children'].forEach(fam => {
  //       let newFamily = this.filterFamily(fam);
  //       filterFamily['children'].push(newFamily);
  //     })
  //   }
  //   return filterFamily;
  // }

  // private filterFamily(family) {
  //   let filterFamily = {};
  //   filterFamily['nodes'] = [];

  //   if (family['nodes'].length > 0) {
  //     family['nodes'].forEach(node => {
  //       let newNode = {};
  //       if (node.id != '') newNode['id'] = node.id;
  //       if (node.relationship != '') newNode['relationship'] = node.relationship;
  //       if (node.name != '') newNode['name'] = node.name;
  //       if (node.nick != '') newNode['nick'] = node.nick;
  //       if (node.gender != '') newNode['gender'] = node.gender;
  //       if (node.yob != '') newNode['yob'] = node.yob;
  //       if (node.yod != '') newNode['yod'] = node.yod;
  //       if (node.pob != '') newNode['pob'] = node.pob;
  //       if (node.pod != '') newNode['pod'] = node.pod;
  //       if (node.por != '') newNode['por'] = node.por;
  //       filterFamily['nodes'].push(newNode);
  //     });
  //   }
  //   // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
  //   if (family['children']) {
  //     filterFamily['children'] = [];
  //     family['children'].forEach(fam => {
  //       let nFamily = this.filterFamily(fam);
  //       filterFamily['children'].push(nFamily);
  //     })
  //   }
  //   return filterFamily;
  // }
	
	// getFamilyNodes(family: any) {
	// 	let nodes = [];
	// 	family.nodes.forEach((node: any) => {
	// 		nodes.push(node);
  //   })
  //   if (family['children']) {
  //     family['children'].forEach(child => {
  //       this.getChildNodes(child, nodes);
  //     })
  //   }
  //   return nodes;
  // }

	// private getChildNodes(family, nodes) {
  //   family.nodes.forEach(node => {
  //     nodes.push(node);
  //   })
  //   if (family['children']) {
  //     family['children'].forEach(child => {
  //       this.getChildNodes(child, nodes);
  //     })
  //   }
  // }
}