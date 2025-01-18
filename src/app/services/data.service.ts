import { Injectable } from '@angular/core';
import { DEBUGS } from '../../environments/environment';
import { Family, Node, FAMILY} from '../services/family.model';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor() {}
    
  async saveItem(key: any, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  async readItem(key: any) {
    let value = localStorage.getItem(key);
		if (value) 
      value = JSON.parse(value);
    return value;
  }

  async deleteItem(key: any) {
    localStorage.removeItem(key);
    return true;
  }

  public printItem(key: any) {
		if (DEBUGS.DATA_SERVICE)
      console.log('DataService - printItem - key:' , JSON.stringify(key, null, 4) )
	}

	readAncestorData(type?: any) {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((data:any) => {
				let res: any;
				if (!type)
					res = data;
				else if (type == 'INFO')
					res = data.info;
				else if (type == 'DOCS')
					res = data.docs;
				else if (type == 'FAMILY')
					res = data.family;
				else if (type == 'IMAGES')
					res = data.images;
				resolve(res);
      });
    })
  }

	saveAncestorData(value: any, type?: any) {
    return new Promise((resolve) => {
      this.readItem('ANCESTOR_DATA').then((data:any) => {
				if (!type)
					data = value;
				else if (type == 'INFO')
					data.info = value;
				else if (type == 'DOCS')
					data.docs = value;
				else if (type == 'FAMILY')
					data.family = value;
				this.saveItem('ANCESTOR_DATA', data).then((status) => {
						resolve(true);
				});
      });
    })
  }

}