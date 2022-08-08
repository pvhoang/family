import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
// import { Family, Node } from '../models/family.model';
import { GENERATION } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FamilyService {

	constructor(
    private utilService: UtilService,
    private languageService: LanguageService,
	) {
	}

  // --- Family ---

  async loadFamily() {
    // read from local
    this.readFamily().then((localFamily:any) => {
      this.utilService.getLocalJsonFile('./assets/data/phan.json').then((srcFamily:any) => {
        if (!localFamily) {
          // local not available, save src
          this.saveFamily(srcFamily);
        } else {
          // check local version
          let localVersion = localFamily.version;
          if (!localVersion)
            localVersion = '0.0';
            console.log('loadFamily - localVersion, srcVersion :' , localVersion, srcFamily.version);

          if (localVersion != srcFamily.version) {
            // src is later, show user
            let msg = 
              this.languageService.getTranslation('LOCAL_DATA') + ': ' + localVersion + '<br>' +
              this.languageService.getTranslation('NEW_DATA') + ': ' + srcFamily.version + '<br>' +
              this.languageService.getTranslation('DATA_WARNING');
              // 'Local data version: ' + localVersion + 
              // '<br>New data version: ' + srcFamily.version +
              '<br>Continue if you want to use new version.';
            let header = this.languageService.getTranslation('SELECT_DATA_VERSION');
            let cancelText = this.languageService.getTranslation('LOCAL_DATA_BUTTON');
            let okText = this.languageService.getTranslation('NEW_DATA_BUTTON');
            this.utilService.alertConfirm(header, msg, cancelText, okText).then((res) => {
              console.log('loadFamily - res:' , res)
              if (res.data) {
                // continue
                this.saveFamily(srcFamily);
              }
            })
          }
        }
      });
    });
  }

	async saveFamily(family) {
		localStorage.setItem('FAMILY', JSON.stringify(family));
		return await true;
	}

  async saveFullFamily(family) {
		family = this.getFilterFamily(family);
		// console.log('saveFullFamily - filterFamily:' , family)
		localStorage.setItem('FAMILY', JSON.stringify(family));
		return await true;
	}
	
	async readFamily() {
		let value = localStorage.getItem('FAMILY');
    if (value)
      value = JSON.parse(value);
		return await value;
	}
	
  printFamily(family) {
		console.log('filterFamily:' , JSON.stringify(family, null, 4) )
	}

  // --- JSON: People, Places---

  async saveJson(family:any, json) {
    let data = [];
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
      } else if (json == 'places') {
        data.push(node.pob); data.push(node.pod); data.push(node.por);
      }
    })
    if (family.children) {
      family.children.forEach(child => {
        this.saveJsonChild(child, data, json);
      })
    }

    let uniqueData = [];
		data.forEach((element) => {
			if (element && element != '' && !uniqueData.includes(element)) {
				uniqueData.push(element);
			}
		});
    uniqueData.sort();

    let jsonData = [];
    uniqueData.forEach(value => {
      jsonData.push({'name': value});
    });
    console.log('jsonData: ', jsonData);
		localStorage.setItem(json, JSON.stringify({data: jsonData}));
		return await true;
	}

  private saveJsonChild(family:any, data:any, json:any) {
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
      } else if (json == 'places') {
        data.push(node.pob); data.push(node.pod); data.push(node.por);
      }
    })
    if (family.children) {
      family.children.forEach(child => {
        this.saveJsonChild(child, data, json);
      })
    }
  }

  async readJson(json) {
		let value = localStorage.getItem(json);
    if (value)
      value = JSON.parse(value);
		return await value;
	}

  // --- verifyFamily

  verifyFamily(family: any) {
    let msg = [];
    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');
    // if (family.nodes[0].name.indexOf('Phan') != 0) {
    if (keys[0] != 'phan') {
      let message = this.languageService.getTranslation('NAME_MUST_BE_PHAN') + ' [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyNode(child, msg);
      })
    }
    return msg.length == 0 ? null : msg.join('\n');
  }

  private verifyNode(family:any, msg) {
    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');
    if (keys[0] != 'phan') {
      let message = this.languageService.getTranslation('NAME_MUST_BE_PHAN') + ' [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyNode(child, msg);
      })
    }
  }

  // --- getFilterFamily

  private getFilterFamily(family) {
    let filterFamily:any = {};
    filterFamily.version = family.version;

    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        let newNode = {};
        if (node.relationship != '') newNode['relationship'] = node.relationship;
        if (node.name != '') newNode['name'] = node.name;
        if (node.nick != '') newNode['nick'] = node.nick;
        if (node.gender != '') newNode['gender'] = node.gender;
        if (node.yob != '') newNode['yob'] = node.yob;
        if (node.yod != '') newNode['yod'] = node.yod;
        if (node.pob != '') newNode['pob'] = node.pob;
        if (node.pod != '') newNode['pod'] = node.pod;
        if (node.por != '') newNode['por'] = node.por;
        filterFamily['nodes'].push(newNode);
      });
    }
    // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
    if (family['children']) {
      filterFamily['children'] = [];
      family['children'].forEach(fam => {
        if (fam.nodes.length > 0) {
          let nFamily = this.getFilterFamily(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }
  
  // --- getFamilyNodes

  getFamilyNodes(family: any) {
    let nodes = [];
    family.nodes.forEach((node: any) => {
      nodes.push(node);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.getChildNodes(child, nodes);
      })
    }
    return nodes;
  }

  private getChildNodes(family:any, nodes) {
    family.nodes.forEach(node => {
      nodes.push(node);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.getChildNodes(child, nodes);
      })
    }
  }

  // --- buildFullFamily

  buildFullFamily(family: any) {
    // start at root
    let nodeLevel = 1;
    let childIdx = 1;
    let nodeIdx = 1;
		family.nodes.forEach((node: any) => {
      node = this.fillNode(node);
      // this.updateNclass(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = '' + nodeLevel;
      node.nclass = this.updateNclass(node);
      node.pnode = null;
      node.family = family;
      node.profile = this.getSearchKeys(node);
      node.span = this.getSpanStr(node);
    });

    if (family.children) {
      nodeLevel++;
      childIdx = 1;
      family['children'].forEach(child => {
        this.buildChildNodes(family.nodes[0], child, nodeLevel, childIdx);
        childIdx++;
      })
    }
  }

  private buildChildNodes(pnode, family, nodeLevel, childIdx) {
    let nodeIdx = 1;
    family.nodes.forEach(node => {
      node = this.fillNode(node);
      node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = '' + nodeLevel;
      node.nclass = this.updateNclass(node);
      node.pnode = pnode;
      node.family = family;
      node.profile = this.getSearchKeys(node);
      node.span = this.getSpanStr(node);
    })
    if (family['children']) {
      nodeLevel++;
      let cIdx = 1;
      family['children'].forEach(child => {
        this.buildChildNodes(family.nodes[0], child, nodeLevel, cIdx);
        cIdx++;
      })
    }
  }

  public getGeneration(node)  {
    let nodeLevel = +node.level;
    let genStr = this.languageService.getTranslation('GENERATION') + ' ' + (GENERATION + nodeLevel);
    return genStr;
  }

  public updateNclass(node: any): void {
    return (this.isNodeMissingData(node)) ? 'not-complete' : node.gender;
  }

	private getSearchKeys(node): string[]  {
    let genStr = this.getGeneration(node);
    // break into array
    let str = node.name;
    if (node.nick != '') str += ' ' + node.nick;
    if (node.gender != '') str += ' ' + this.languageService.getTranslation(node.gender);
    if (node.yob != '') str += ' ' + node.yob;
    if (node.yod != '') str += ' ' + node.yod;
    if (node.pob != '') str += ' ' + node.pob;
    if (node.pod != '') str += ' ' + node.pod;
    if (node.por != '') str += ' ' + node.por;
    str += ' ' + genStr;
    str = this.utilService.stripVN(str);
    let keys = str.split(' ');
    return keys;
  } 
  
  public getSpanStr(node) {
    let spans = [];
    spans.push(node.name);
    if (node.yob != '' || node.yod != '')
      spans.push(node.yob + ' - ' + node.yod);
    if (node.pob != '' || node.pod != '')
      spans.push(node.pob + ' - ' + node.pod);
    return spans;
  }

  private fillNode(node) {
    if (!node.id) node.id = '';
    if (!node.relationship) node.relationship = '';
    if (!node.name) node.name = '';
    if (!node.nick) node.nick = '';
    if (!node.gender) node.gender = '';
    if (!node.yob) node.yob = '';
    if (!node.yod) node.yod = '';
    if (!node.pob) node.pob = '';
    if (!node.pod) node.pod = '';
    if (!node.por) node.por = '';
    if (!node.child) node.child = '';
    if (!node.spouse) node.spouse = '';
    return node;
  }

  public isNodeChanged(node, values:any) {
    // let node = this.node;
    let change = 
      (node.name != values.name) ||
      (node.nick != values.nick) ||
      (node.gender != values.gender) ||
      (node.yob != values.yob) ||
      (node.yod != values.yod) ||
      (values.pob && node.pob != values.pob.name) ||
      (values.pod && node.pod != values.pod.name) ||
      (values.por && node.por != values.por.name) ||
      (values.child != '') ||
      (values.spouse != '');
    return change;
  }

  public getEmptyNode(id: string, level: string, name: string, gender: string) {
    let node:any = {
      id: id,
      relationship: '',
      name: name,
      level: level,
      nick: '',
      gender: gender,
      yob: '',
      yod: '',
      pob: '',
      pod: '',
      por: ''
    }
    node.profile = this.getSearchKeys(node),
    node.span = this.getSpanStr(node);
    node.nclass = this.updateNclass(node);
    return node;
  }

  private isNodeMissingData(node: any): boolean {
    if (node['name'].length == 0)
      return true;
    if (node['yob'].length == 0)
      return true;
    if (node['pob'].length == 0)
      return true;    
    if (node['gender'].length == 0)
      return true;
    return false;
  }
}