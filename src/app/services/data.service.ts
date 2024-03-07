import { Injectable } from '@angular/core';
import { DEBUGS } from '../../environments/environment';
import { Family, Node, FAMILY} from '../services/family.model';

@Injectable({
	providedIn: 'root'
})
export class DataService {

	constructor() {}
    
  // saveItem(key: any, value: any) {
  //   return new Promise((resolve) => {
  //     localStorage.setItem(key, JSON.stringify(value));
  //     resolve(true);
  //   });
  // }

  // readItem(key: any) {
  //   return new Promise((resolve) => {
  //     let value = localStorage.getItem(key);
  //     if (value) 
  //       value = JSON.parse(value);
  //     resolve(value);
  //   });
  // }

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
				else if (type == 'BRANCH')
					res = data.branch;
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
				else if (type == 'IMAGES')
					data.images = value;
				else if (type == 'BRANCH')
					data.branch = value;
				this.saveItem('ANCESTOR_DATA', data).then((status) => {
						resolve(true);
				});
      });
    })
  }

  // readFamily() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       resolve(adata.family);
  //     });
  //   })
  // }

  // saveFamily(family: Family) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       adata.family = family;
  //       this.saveItem('ANCESTOR_DATA', adata).then((status) => {
  //         resolve(true);
  //       });
  //     });
  //   });
  // }

  // readFamilyAndInfo() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       resolve({ family: adata.family, info: adata.info });
  //     });
  //   })
  // }

  // readInfo() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       resolve(adata.info);
  //     });
  //   })
  // }

  // saveBranch(name: string, branch: Family) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       // if (!adata.branch) {
  //       //   adata.branch = {};
  //       //   adata.branch[name] = branch;

  //       // } else if (adata.branch[name]) {
  //       //   adata.branch[name] = branch;
  //       // }
  //       if (!adata.branch)
  //         adata.branch = {};
  //       adata.branch[name] = branch;
  //       console.log('BranchPage - saveBranch - name, branch: ', name, branch);
  //       this.saveItem('ANCESTOR_DATA', adata).then((status) => {
  //         // console.log('BranchPage - saveBranch - status: ', status);
  //         resolve(true);
  //       });
  //     });
  //   });
  // }

  // readBranch(name: string) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       // console.log('BranchPage - readBranch - name: ', name);
  //       let branch = (adata.branch) ? adata.branch[name] : null; 
  //       resolve(branch);
  //     });
  //   })
  // }

  // deleteBranch(name: string) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       if (adata.branch) {
  //         delete adata.branch[name];
  //         this.saveItem('ANCESTOR_DATA', adata).then((status) => {
  //           resolve(true);
  //         });
  //       } else
  //         resolve(true);
  //     });
  //   })
  // }

	// deleteAllBranches() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       if (adata.branch) {
	// 				Object.keys(adata.branch).forEach(name => {
	// 					delete adata.branch[name];
	// 				});
	// 				adata.branch = null;
  //         this.saveItem('ANCESTOR_DATA', adata).then((status) => {
  //           resolve(true);
  //         });
  //       } else
  //         resolve(true);
  //     });
  //   })
  // }

  // readBranchNames() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       let names = [];
  //       if (adata.branch)
  //         names = Object.keys(adata.branch);
  //       // console.log('BranchPage - readBranchNames - names: ', names);
  //       resolve(names);
  //     });
  //   })
  // }

  // readBranches() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       resolve(adata.branch);
  //     });
  //   })
  // }

  // readDocs() {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       resolve(adata.docs);
  //     });
  //   })
  // }

  // saveDocs(docs: any) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       adata.docs = docs;
  //       this.saveItem('ANCESTOR_DATA', adata).then((status) => {
	// 				resolve(true);
	// 			});
  //     });
  //   });
  // }

	// saveInfo(info: any) {
  //   return new Promise((resolve) => {
  //     this.readItem('ANCESTOR_DATA').then((adata:any) => {
  //       adata.info = info;
  //       // adata.info = JSON.parse(JSON.stringify(info))
	// 			// console.log('AppComponent - saveInfo - adata.info: ', adata.info);
  //       this.saveItem('ANCESTOR_DATA', adata).then((status) => {
	// 				resolve(true);
	// 			})
	// 			.catch((error) => {
	// 				console.log('saveInfo - error: ', error.message);
	// 				resolve(false);
	// 			});
  //     })
	// 		.catch((error) => {
	// 			console.log('saveInfo - error1: ', error.message);
	// 			resolve(false);
	// 		});
  //   });
  // }
}