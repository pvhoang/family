import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor(
		private http: HttpClient,
	) {
	}

  async saveItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return await true;
  }

  async readItem(key) {
    let value = localStorage.getItem(key);
    if (value) 
      value = JSON.parse(value);
    return await value;
  }

  async deleteItem(key) {
    localStorage.removeItem(key);
    return await true;
  }

  printItem(key) {
		console.log('DataService - key:' , JSON.stringify(key, null, 4) )
	}

  readFamily() {
    return new Promise((resolve) => {
      // always add info from 'ANCESTOR'
      this.readItem('FAMILY').then((family:any) => {
        console.log('readFamily - family: ', family);
        this.readItem('ANCESTOR').then((info:any) => {
          // console.log('readFamily - res: ', res);
          // let info = JSON.parse(res.data);
          // console.log('readFamily - data: ', info);
          if (!family) {
            // set a default family
            family = { version: '0.1', info: {}, nodes: [ { name: info.name, gender: 'male'} ] };
          } else
            family.info = info;
          resolve(family);
        });
      });
    });
  }

  saveFamily(family) {
    return new Promise((resolve) => {
      // remove info from 'ANCESTOR'
      family.info = {};
      this.saveItem('FAMILY', family).then((status:any) => {
        resolve(true);
      });
    });
  }

  readLocalJson(collection, documentId): Promise<any> {
		return new Promise((resolve, reject) => {
      const url = './assets/' + collection + '/' + documentId + '.json';
			this.http.get(url).toPromise().then((res:any) => {
        // json format: {id: documentId, data: data} - no Stringgify
				resolve(res.data);
			}).catch(err => {
				console.log('err: ', err);
				reject(err.error);
			});
		});
	}

}