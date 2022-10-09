import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor(
		private http: HttpClient,
    private fbService: FirebaseService,
    private utilService: UtilService,

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

  // always read ancestor from FB since it may change, and save it to localMemory
  setAncestor(ancestor): Promise<any> {
    return new Promise((resolve) => {
      this.fbService.readJsonDocument(ancestor, 'ancestor').subscribe((data:any) => {
        data.id = ancestor;
        // console.log('setAncestor - info: ', data);
        this.saveItem('ANCESTOR', data).then((status:any) => {
          resolve (data);
        });
      });
    });
  }

  readFamily() {
    return new Promise((resolve) => {
      // always add info from 'ANCESTOR'
      this.readItem('FAMILY').then((family:any) => {
        // console.log('readFamily - family: ', family);
        this.readItem('ANCESTOR').then((info:any) => {
          info = JSON.parse(JSON.stringify(info));
          if (!family) {
            // new to the system, provide Guide

            // always add family from 'ANCESTOR' for new ancestor
            this.fbService.readJsonDocument(info.id, 'family').subscribe((srcFamily:any) => {
              this.saveFamily(srcFamily).then(status => {
                family = srcFamily;
                family.info = info;
                this.utilService.presentToast('HOME_FIRST_TIME_USER');
                resolve(family);
              });
            });
          } else {
            family.info = info;
            resolve(family);
          }
          // if (!family) {
          //   // set a default family
          //   family = { version: '0.1', info: info, nodes: [ { name: info.name, gender: 'male'} ] };
          // } else {
            // family.info = info;
          // }
          // resolve(family);
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