import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor(
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
        // console.log('readFamily - family: ', family);
        this.readItem('ANCESTOR').then((res:any) => {
          let info = JSON.parse(res.data);
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

}