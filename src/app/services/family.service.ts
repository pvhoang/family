import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { CalendarChinese, CalendarVietnamese } from 'date-chinese';
import { Family, Node, NODE } from '../models/family.model';
import { SETTING, ANCESTOR } from '../../environments/environment';

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

  loadFamily(): Promise<any> {
    return new Promise((resolve) => {
      
    this.readSetting().then((setting:any) => {
      console.log('FamilyService - loadFamily - setting: ', setting);

      let jsonFile = './assets/data/' + ANCESTOR + '-family.json'

      // read from local
      this.readFamily().then((localFamily:any) => {
        this.utilService.getLocalJsonFile(jsonFile).then((srcFamily:any) => {

          console.log('FamilyService - loadFamily - srcFamily: ', srcFamily);

          if (!localFamily) {
            // local not available, use src
            console.log('FamilyService - localFamily not defined! Save srcFamily');
            this.saveFamily(srcFamily);
            resolve(srcFamily);
          } else {
            // check local version
            let localVersion = localFamily.version;
            if (!localVersion)
              localVersion = '0.0';
            console.log('FamilyService - loadFamily - localVersion, srcVersion :' , localVersion, srcFamily.version);
            if (localVersion == srcFamily.version) {
              resolve(localFamily);
            } else {
              // src is later, ask user
              let msg = 
                this.languageService.getTranslation('LOCAL_DATA') + ': ' + localVersion + '<br>' +
                this.languageService.getTranslation('NEW_DATA') + ': ' + srcFamily.version + '<br>' +
                this.languageService.getTranslation('DATA_WARNING');
                '<br>Continue if you want to use new version.';
              let header = this.languageService.getTranslation('SELECT_DATA_VERSION');
              let cancelText = this.languageService.getTranslation('LOCAL_DATA_BUTTON');
              let okText = this.languageService.getTranslation('NEW_DATA_BUTTON');
              this.utilService.alertConfirm(header, msg, cancelText, okText).then((res) => {
                // console.log('loadFamily - res:' , res)
                if (res.data) {
                  // continue
                  this.saveFamily(srcFamily);
                  resolve(srcFamily);
                } else {
                  resolve(localFamily);
                }
              })
            } 
          }
        });
      });
    });
    });
  }

	async saveFamily(family:any) {
		console.log('saveFamily - family: ' , family)
		localStorage.setItem(ANCESTOR, JSON.stringify(family));
		return await true;
	}

  async saveFullFamily(family:any) {
		family = this.getFilterFamily(family);
		console.log('saveFullFamily - filterFamily:' , family)
		localStorage.setItem(ANCESTOR, JSON.stringify(family));
		return await true;
	}
	
	async readFamily() {
		let value = localStorage.getItem(ANCESTOR);
		// console.log('readFamily - value:' , value)
    if (value)
      value = JSON.parse(value);
		return await value;
	}
	
  async deleteFamily() {
		localStorage.removeItem(ANCESTOR);
		return await true;
	}

  printFamily(family) {
		console.log('filterFamily:' , JSON.stringify(family, null, 4) )
	}

  // --- Setting ---

  async readSetting() {
		let value:any = localStorage.getItem('SETTING');
    if (value)
      value = JSON.parse(value);
    else
      value = SETTING;
		return await value;
	}

  async saveSetting(setting) {
		localStorage.setItem('SETTING', JSON.stringify(setting));
		return await true;
	}

  async deleteSetting() {
		localStorage.removeItem('SETTING');
		return await true;
	}

  // --- JSON: People, Places---

  async saveJson(family:any, json) {
    let data = [];
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
        data.push(this.getGeneration(node));
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
    // console.log('jsonData: ', jsonData);
		localStorage.setItem(json, JSON.stringify({data: jsonData}));
		return await true;
	}

  private saveJsonChild(family:any, data:any, json:any) {
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
        data.push(this.getGeneration(node));
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
    let ancestor = ANCESTOR;
    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');

    // console.log('FamilyService - verifyFamily1')

    if (keys[0] != ancestor) {
      let ancestorText = this.languageService.getTranslation(ancestor);
      let message = this.languageService.getTranslation('NAME_MUST_BE_ANCESTOR') + ' ' + ancestorText.short_name + '. [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
      // console.log('FamilyService - verifyFamily2')
      family['children'].forEach(child => {
        this.verifyNode(ancestor, child, msg);
      })
    }
    // console.log('FamilyService - verifyFamily4')
    return msg.length == 0 ? null : msg.join('\n');
  }

  private verifyNode(ancestor, family:any, msg) {
    let name = family.nodes[0].name;
    // console.log('FamilyService - verifyFamily3 - name: ', name);
    // console.log('FamilyService - verifyFamily3 - ancestor: ', ancestor);

    let keys = this.utilService.stripVN(name).split(' ');
    if (keys[0] != ancestor) {
      let ancestorText = this.languageService.getTranslation(ancestor);
      let message = this.languageService.getTranslation('NAME_MUST_BE_ANCESTOR') + ' ' + ancestorText.short_name + '. [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
    // console.log('FamilyService - verifyFamily3')
      family['children'].forEach(child => {
        this.verifyNode(ancestor, child, msg);
      })
    }
  }

  // --- passAwayFamily

  // getLunarDate(dod: any) {

  //   // const CalendarVietnamese = require('date-chinese').CalendarVietnamese
  //   let d = new Date();
  //   // console.log('year, month, date: ', date.getFullYear(), date.getMonth(), date.getDate());

  //   let cal = new CalendarVietnamese()
  //   // cal.fromGregorian(2022, 8, 14)
  //   cal.fromGregorian(d.getFullYear(), d.getMonth()+1, d.getDate())
  //   let cdate = cal.get()
  //   console.log('FamilyService - passAwayFamily: ', cdate);
  //   let month = cdate[2];
  //   let day = cdate[4];
  //   let paDate = dod.split('/');

  //   console.log('FamilyService - passAwayFamily: ', month, day, paDate);

  //   let todayDate = month * 30 + day;
  //   let dodDate = +paDate[1] * 30 + +paDate[0];

  //   console.log('FamilyService - passAwayFamily: ', todayDate, dodDate);

  //   if (dodDate > todayDate && dodDate < todayDate + 7) {
  //     console.log("Gio sap den!");
  //   }

    // let cal = new CalendarChinese(78, 1, 10, true, 9)
    // let date = cal.toDate(date).toISOString();

    //> 1984-11-30T16:00:00.426Z
    //> [ 78, 2, 2, true, 2 ]
    // let gyear = cal.yearFromEpochCycle()
    //> 1985
    // console.log('FamilyService - passAwayFamily: ', cdate, gyear);
  // }

  passAwayFamily(family: any) {

    console.log('FamilyService - passAwayFamily')
    let msg = [];
    family.nodes.forEach(node => {
      if (this.isMemorialComing(node.dod)) {
        msg.push('Name: ' + node.name + ' - ' + node.dod);
      }
    })
    if (family['children']) {
      // console.log('FamilyService - verifyFamily2')
      family['children'].forEach(child => {
        this.passAwayNode(child, msg);
      })
    }
    return msg.length == 0 ? null : msg.join('\n');
  }

  private passAwayNode(family:any, msg: any) {
    family.nodes.forEach(node => {
      if (this.isMemorialComing(node.dod)) {
        msg.push('Name: ' + node.name + ' - ' + node.dod);
      }
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.passAwayNode(child, msg);
      })
    }
  }

  private isMemorialComing(dod: any) {
    if (!dod || dod == '')
      return false;
    let d = new Date();
    let cal = new CalendarVietnamese()
    cal.fromGregorian(d.getFullYear(), d.getMonth()+1, d.getDate())
    let cdate = cal.get()
    let todayCount = cdate[2] * 30 + cdate[4];
    let ary = dod.split('/');
    let dodCount = +ary[1] * 30 + +ary[0];
    return dodCount > todayCount && dodCount < todayCount + 7;
  }

  // --- compareFamilies

  public compareFamilies(srcFamily:any, modFamily:any): any[] {
    let srcLevels = this.getFamilyLevel(srcFamily);
    let modLevels = this.getFamilyLevel(modFamily);

    let results = [];

    if (JSON.stringify(modLevels) == JSON.stringify(srcLevels)) {
      let msg = this.languageService.getTranslation('CONTACT_DATA_NOT_CHANGED')
      results.push({name: msg, item: '', old: '', new: '' });
      return results;            
    }

    let sLevels = Object.keys(srcLevels);
    let mLevels = Object.keys(modLevels);
    if (sLevels.length != mLevels.length) {
      let msg = this.languageService.getTranslation('CONTACT_LEVELS_CHANGED');
      results.push({name: msg, item: '', old: ''+sLevels.length, new: ''+mLevels.length });
    }

    // loop thru each node on each level
    mLevels.forEach((level:any) => {
      let mData = modLevels[level];
      let sData = srcLevels[level];
      Object.keys(mData.names).forEach((name:any) => {
        let mDetail = mData.names[name]
        let sDetail = sData.names[name]
        if (!sDetail) {
          let msg = this.languageService.getTranslation('CONTACT_NAME_ADDED');
          let genStr = this.languageService.getTranslation('GENERATION') + ' ' + level;
          let n = name + ' - ' + genStr;
          results.push({name: n, item: '', old: '', new: msg });
        } else if (!mDetail) {
          let msg = this.languageService.getTranslation('CONTACT_NAME_ADDED');
          let genStr = this.languageService.getTranslation('GENERATION') + ' ' + level;
          let n = name + ' - ' + genStr;
          results.push({name: n, item: '', old: msg, new: '' });
        } else {
          if (mDetail != sDetail) {
            // get detail difference
            let diff:any = this.compareDetail(mDetail, sDetail);
            for (let i = 0; i < diff.length; i++) {
              let genStr = this.languageService.getTranslation('GENERATION') + ' ' + level;
              let n = name + ' - ' + genStr;
              let data = (i == 0) ? 
                  { name: n, item: diff[i].item, old: diff[i].old, new: diff[i].new } :
                  { name: '', item: diff[i].item, old: diff[i].old, new: diff[i].new };
              results.push(data);
            }
          }
        }
      });
    });
    return results;
  }

  private getFamilyLevel(family:any) {
    console.log('family.generation: ', family.generation);
    let nodeLevel = +family.generation;
    let levels = {};
    let count = family.nodes.length;
    let names = {};
    family.nodes.forEach(node => {
      let name = node.name + ' ()';
      names[name] = this.getDetailStr(node);
    })
    levels[''+nodeLevel] = {count: count, names: names};

    if (family['children']) {
      nodeLevel++;
      let count = 0;
      let names = {};
      family['children'].forEach(child => {
        count += child.nodes.length;
        child.nodes.forEach(node => {
          let name = node.name + ' (' + family.nodes[0].name + ')';
          names[name] = this.getDetailStr(node);
        })
        this.compareChildFamilies(child, nodeLevel, levels);
      })
      if (!levels[''+nodeLevel])
        levels[''+nodeLevel] = {count: 0, names: []}
      levels[''+nodeLevel].count += count;
      Object.keys(names).forEach(key => {
        levels[''+nodeLevel].names[key] = names[key];
      });
    }
    return levels;
  }

  private compareChildFamilies(family:any, nodeLevel, levels) {
    if (family['children']) {
      nodeLevel++;
      let count = 0;
      let names = {};
      family['children'].forEach(child => {
        count += child.nodes.length;
        child.nodes.forEach(node => {
          let name = node.name + ' (' + family.nodes[0].name + ')';
          names[name] = this.getDetailStr(node);
        })
        this.compareChildFamilies(child, nodeLevel, levels);
      })
      if (!levels[''+nodeLevel])
        levels[''+nodeLevel] = {count: 0, names: []}
      levels[''+nodeLevel].count += count;
      Object.keys(names).forEach(key => {
        levels[''+nodeLevel].names[key] = names[key];
      });
    }
  }

  // --- getFilterFamily

  private getFilterFamily(family) {
    let filterFamily:any = {};
    filterFamily.version = family.version;
    filterFamily.description = family.description;
    filterFamily.generation = family.generation;

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
        if (node.desc != '') newNode['desc'] = node.desc;
        if (node.dod != '') newNode['dod'] = node.dod;
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
    let nodeLevel = +family.generation;
    let childIdx = 1;
    let nodeIdx = 1;

    family.nodes.forEach((node: any) => {
      node = this.fillNode(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = '' + nodeLevel;
      node.nclass = this.updateNclass(node);
      node.pnode = null;
      node.family = family;
      node.profile = this.getSearchKeys(node);
      node.span = this.getSpanStr(node);
    });
    family.iddom = 'family-' + family.nodes[0].id;
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
    family.iddom = 'family-' + family.nodes[0].id;
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
    let genStr = this.languageService.getTranslation('GENERATION') + ' ' + +node.level;
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
    if (node.desc != '') str += ' ' + node.desc;
    if (node.dod != '') str += ' ' + node.dod;
    str += ' ' + genStr;
    str = this.utilService.stripVN(str);
    let keys = str.split(' ');
    return keys;
  } 
  
  private getDetailStr(node): string  {
    let str = node.name + ',' + 
        (node.nick ? node.nick : '') + ',' +
        (node.gender ? node.gender : '') + ',' +
        (node.yob ? node.yob : '') + ',' +
        (node.yod ? node.yod : '') + ',' +
        (node.pob ? node.pob : '') + ',' +
        (node.pod ? node.pod : '') + ',' +
        (node.por ? node.por : '');
    return str;
  } 

  private compareDetail(mod, src):any  {
    let mItems = mod.split(',');
    let sItems = src.split(',');
    let diff = [];
    let ids = ["NODE_NAME", "NODE_NICK", "NODE_GENDER", "NODE_YOB", "NODE_YOD", "NODE_POB", "NODE_POD", "NODE_POR"];
    for (let i = 0; i < sItems.length; i++) {
      if (mItems[i] != sItems[i])
        diff.push({item: this.languageService.getTranslation(ids[i]), old: sItems[i], new: mItems[i]})
    }
    return diff;
  } 

  public getSpanStr(node) {
    let spans = [];
    spans.push(node.name);
    spans.push(node.yob + ' - ' + node.yod);
    //   spans.push(node.pob + ' - ' + node.pod);
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
    if (!node.desc) node.desc = '';
    if (!node.dod) node.dod = '';
    if (!node.child) node.child = '';
    if (!node.spouse) node.spouse = '';
    return node;
  }

  public loadValues(node: any) {
    let values:any = {};

    values.name = node.name;
    values.nick = node.nick;
    values.gender = node.gender;
    values.yob = node.yob;
    values.yod = node.yod;
    values.pob = (node.pob == '') ? null : {name: node.pob};
    values.pod = (node.pod == '') ? null : {name: node.pod};
    values.por = (node.por == '') ? null : {name: node.por};
    values.desc = node.desc;
    values.dod = node.dod;
    values.child = node.child;
    values.spouse = node.spouse;
    return values;
  }

  public updateNode(node: any, values: any) {
    // console.log('values: ', values);
    let change = this.isNodeChanged(node, values);
    let pob = values.pob ? values.pob.name : '';
    let pod = values.pod ? values.pod.name : '';
    let por = values.por ? values.por.name : '';
    node.name = values.name;
    node.nick = values.nick;
    node.gender = values.gender;
    node.yob = values.yob;
    node.yod = values.yod;  
    node.pob = pob;
    node.pod = pod;
    node.por = por;
    node.desc = values.desc;
    node.dod = values.dod;
    return change;
  }

  public isNodeChanged(node: any, values:any) {
    let pob = values.pob ? values.pob.name : '';
    let pod = values.pod ? values.pod.name : '';
    let por = values.por ? values.por.name : '';
    let change = 
      (node.name != values.name) ||
      (node.nick != values.nick) ||
      (node.gender != values.gender) ||
      (node.yob != values.yob) ||
      (node.yod != values.yod) ||
      (node.pob != pob) ||
      (node.pod != pod) ||
      (node.por != por) ||
      (node.desc != values.desc) ||
      (node.dod != values.dod) ||
      (values.child != '') ||
      (values.spouse != '');
    return change;
  }

  public getEmptyNode(id: string, level: string, name: string, gender: string) {
    let node = Object.create(NODE);
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
    // if (node['pob'].length == 0)
    //   return true;    
    // if (node['gender'].length == 0)
    //   return true;
    return false;
  }
}