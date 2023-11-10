import { Injectable } from '@angular/core';
import { DEBUGS } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor() {}

  async saveItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  async readItem(key) {
    let value = localStorage.getItem(key);
    if (value) 
      value = JSON.parse(value);
    return value;
  }

  async deleteItem(key) {
    localStorage.removeItem(key);
    return true;
  }

  printItem(key) {
		if (DEBUGS.DATA_SERVICE)
      console.log('DataService - printItem - key:' , JSON.stringify(key, null, 4) )
	}

  readFamily() {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((adata:any) => {
        resolve(adata.family);
      });
    })
  }

  saveFamily(family) {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((adata:any) => {
        adata.family = family;
        this.saveItem('ANCESTOR_DATA', adata).then((status) => {});
        resolve(true);
      });
    });
  }

  readFamilyAndInfo() {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((adata:any) => {
        resolve({ family: adata.family, info: adata.info });
      });
    })
  }

  readDocs() {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((adata:any) => {
        resolve(adata.docs);
      });
    })
  }

  saveDocs(docs) {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((adata:any) => {
        adata.docs = docs;
        this.saveItem('ANCESTOR_DATA', adata).then((status) => {});
        resolve(true);
      });
    });
  }
}