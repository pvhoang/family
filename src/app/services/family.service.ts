import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { NodeService } from '../services/node.service';
import { LanguageService } from '../services/language.service';
import { CalendarVietnamese } from 'date-chinese';
import { Family, Node, NODE } from './family.model';
import { SETTING, ANCESTOR } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FamilyService {

	constructor(
    private utilService: UtilService,
    private nodeService: NodeService,
    private languageService: LanguageService,
	) {
	}

  // --- Family ---

  startFamily(): Promise<any> {
    return new Promise((resolve) => {
      this.loadFamily().then(family => {
        console.log('FamilyService - startFamily');
        // console.log('FamilyService - startFamily - family: ', family);
        this.saveFamily(family);
        this.saveJson(family, 'people').then(status => {});
        this.saveFileJson('places').then(status => {});
        this.saveFileJson('names').then(status => {});
        // this.saveJson(family, 'places').then(status => {});
        // this.saveJson(family, 'names').then(status => {});
        // verify data
        let msg = this.verifyFamily(family);
        if (msg)
          this.utilService.alertMsg('WARNING', msg);
        resolve(true);
      });
    });
  }

  private loadFamily(): Promise<any> {
    return new Promise((resolve) => {
    this.readSetting().then((setting:any) => {
      let jsonFile = './assets/data/' + ANCESTOR + '-family.json'
      // read from local
      this.readFamily().then((localFamily:any) => {
        this.utilService.getLocalJsonFile(jsonFile).then((srcFamily:any) => {
          // console.log('FamilyService - loadFamily - srcFamily: ', srcFamily);
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
            // console.log('FamilyService - loadFamily - localVersion, srcVersion :' , localVersion, srcFamily.version);
            if (localVersion == srcFamily.version) {
              resolve(localFamily);
            } else {
              // src is later, ask user
              let msg = 
                this.languageService.getTranslation('LOCAL_DATA') + ': ' + localVersion + '<br>' +
                this.languageService.getTranslation('NEW_DATA') + ': ' + srcFamily.version + '<br>' +
                this.languageService.getTranslation('DATA_WARNING');
                '<br>Continue if you want to use new version.';
              this.utilService.alertConfirm('SELECT_DATA_VERSION', msg, 'LOCAL_DATA_BUTTON', 'NEW_DATA_BUTTON').then((res) => {
                if (res.data) {
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

  startSourceFamily(): Promise<any> {
    return new Promise((resolve) => {
      let jsonFile = './assets/data/' + ANCESTOR + '-family.json'
      this.utilService.getLocalJsonFile(jsonFile).then((family:any) => {
        this.saveFamily(family);
        this.saveJson(family, 'people').then(status => {});
        resolve(true);
      });
    });
  }

  getSourceFamilyVersion(): Promise<any> {
    return new Promise((resolve) => {
      let jsonFile = './assets/data/' + ANCESTOR + '-family.json'
      this.utilService.getLocalJsonFile(jsonFile).then((family:any) => {
        resolve(family.version);
      });
    });
  }

	async saveFamily(family:any) {
		// console.log('saveFamily - family: ' , family)
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

  // --- JSON: People ---

  private async saveJson(family:any, json) {
    let data = [];
    let nodeLevel = +family.generation;
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        node.level = nodeLevel;
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
        data.push(this.nodeService.getGeneration(node));
      } else if (json == 'places') {
        data.push(node.pob); data.push(node.pod); data.push(node.por);
      } else if (json == 'names') {
        // break names to last, middle, and first
        let keys = node.name.split(' ');
        data.push(keys);
      }
    })
    if (family.children) {
      nodeLevel++;
      family.children.forEach(child => {
        this.saveJsonChild(child, data, nodeLevel, json);
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
  
  private saveJsonChild(family:any, data:any, nodeLevel: any, json:any) {
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        node.level = nodeLevel;
        data.push(node.name);
        data.push(node.pob); data.push(node.pod); data.push(node.por);
        data.push(node.yob); data.push(node.yod);
        data.push(this.nodeService.getGeneration(node));
      } else if (json == 'places') {
        data.push(node.pob); data.push(node.pod); data.push(node.por);
      } else if (json == 'names') {
        let keys = node.name.split(' ');
        data.push(keys);
      }
    })
    if (family.children) {
      nodeLevel++;
      family.children.forEach(child => {
        this.saveJsonChild(child, data, nodeLevel, json);
      })
    }
  }

  private saveFileJson(json) {
    return new Promise((resolve) => {
      let jsonFile = './assets/data/' + json + '.json';
      this.utilService.getLocalJsonFile(jsonFile).then((jsonData:any) => {
        localStorage.setItem(json, JSON.stringify(jsonData));
        resolve(true);
      });
    });
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

    if (keys[0] != ancestor) {
      let ancestorText = this.languageService.getTranslation(ancestor);
      let message = this.languageService.getTranslation('NAME_MUST_BE_ANCESTOR') + ' ' + ancestorText.short_name + '. [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyFamilyNode(ancestor, child, msg);
      })
    }
    return msg.length == 0 ? null : msg.join('\n');
  }

  private verifyFamilyNode(ancestor, family:any, msg) {
    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');
    if (keys[0] != ancestor) {
      let ancestorText = this.languageService.getTranslation(ancestor);
      let message = this.languageService.getTranslation('NAME_MUST_BE_ANCESTOR') + ' ' + ancestorText.short_name + '. [' + name + ']';
      msg.push(message);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyFamilyNode(ancestor, child, msg);
      })
    }
  }

  // --- passAwayFamily

  passAwayFamily(): Promise<any> {
    return new Promise((resolve) => {

      this.readFamily().then((family:any) => {
        let msg = [];
        let nodeLevel = +family.generation;
        family.nodes.forEach(node => {
          if (this.isMemorialComing(node.dod)) {
            msg.push([node.name, ''+nodeLevel, node.dod]);
          }
        })
        if (family['children']) {
          nodeLevel++;
          family['children'].forEach(child => {
            this.passAwayFamilyNode(child, nodeLevel, msg);
          })
        }
        let d = new Date();
        let cal = new CalendarVietnamese()
        cal.fromGregorian(d.getFullYear(), d.getMonth()+1, d.getDate())
        let cdate = cal.get()
        let today = cdate[4] + '/' + cdate[2];
        resolve ({ today: today, persons: msg });
      });
    });
  }

  private passAwayFamilyNode(family:any, nodeLevel: any, msg: any) {
    family.nodes.forEach(node => {
      if (this.isMemorialComing(node.dod)) {
        msg.push([node.name, nodeLevel, node.dod]);
      }
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.passAwayFamilyNode(child, nodeLevel, msg);
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

    if (JSON.stringify(modLevels) == JSON.stringify(srcLevels))
      return results;            

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
            let diff:any = this.nodeService.compareDetail(mDetail, sDetail);
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
      names[name] = this.nodeService.getDetailStr(node);
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
          names[name] = this.nodeService.getDetailStr(node);
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
          names[name] = this.nodeService.getDetailStr(node);
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
          let nFamily = this.getFilterFamilyNode(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }

  private getFilterFamilyNode(family) {
    let filterFamily:any = {};
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
          let nFamily = this.getFilterFamilyNode(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }

  // setViewNodeSpan(family: any, srcNode: any, srcNodes) {
  //   let tnodes = [];
  //   // search backward till root
  //   let node = srcNode;
  //   while (node.pnode) {
  //     node = node.pnode;
  //     tnodes.push(node);
  //   }
  //   let nodes = [];
  //   for (let i = tnodes.length - 1; i >= 0; i--)
  //     nodes.push(tnodes[i]);
  //   // get extra nodes from original
  //   this.nodeService.getChildNodes(srcNode.family, nodes);
  //   for (let i = 0; i < srcNodes.length; i++)
  //     srcNodes[i].span = [];

  //   for (let i = 0; i < nodes.length; i++)
  //     nodes[i].span = this.nodeService.getSpanStr(nodes[i]);

  //   let fam = this.getSelectedFamily(family, srcNode);
  //   return fam;
  // }

  getSelectedFamily(family: any, srcNode: any) {

    let filterFamily:any = {};
    filterFamily.version = family.version;
    filterFamily.description = family.description;
    filterFamily.generation = family.generation;
    let nodes = [];
    // search backward till root
    let node = srcNode;
    while (node) {
      nodes.push(node);
      node = node.pnode;
    }
    let ffam:any = filterFamily;
    for (let i = 0; i < nodes.length; i++) {
      node = nodes[nodes.length - 1 - i];
      let fam = this.getSelectedFamilyNode(node);
      if (i == 0) {
        ffam.nodes = fam.nodes;
        ffam.children = fam.children;
      } else if (i < nodes.length) {
        ffam.children.push(fam);
        ffam = fam;
      }
    }
    console.log('filterFamily = ', filterFamily);
    return filterFamily;
  }

  private getSelectedFamilyNode(node) {
    
    // let newNode = {};
    // if (node.relationship != '') newNode['relationship'] = node.relationship;
    // if (node.name != '') newNode['name'] = node.name;
    // if (node.nick != '') newNode['nick'] = node.nick;
    // if (node.gender != '') newNode['gender'] = node.gender;
    // if (node.yob != '') newNode['yob'] = node.yob;
    // if (node.yod != '') newNode['yod'] = node.yod;
    // if (node.pob != '') newNode['pob'] = node.pob;
    // if (node.pod != '') newNode['pod'] = node.pod;
    // if (node.por != '') newNode['por'] = node.por;
    // if (node.desc != '') newNode['desc'] = node.desc;
    // if (node.dod != '') newNode['dod'] = node.dod;

    let filterFamily:any = {};
    filterFamily.nodes = [];
    filterFamily.nodes.push(node);
    filterFamily.children = [];
    return filterFamily;
  }

  // --- buildFullFamily

  buildFullFamily(family: any): Family {
    // start at root
    let nodeLevel = +family.generation;
    let childIdx = 1;
    let nodeIdx = 1;

    family.nodes.forEach((node: any) => {
      node = this.nodeService.fillNode(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = '' + nodeLevel;
      node.nclass = this.nodeService.updateNclass(node);
      node.pnode = null;
      node.family = family;
      node.profile = this.nodeService.getSearchKeys(node);
      node.span = this.nodeService.getSpanStr(node);
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
    return family;
  }

  private buildChildNodes(pnode: any, family: any, nodeLevel: any, childIdx) {
    let nodeIdx = 1;
    family.nodes.forEach(node => {
      node = this.nodeService.fillNode(node);
      node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = '' + nodeLevel;
      node.nclass = this.nodeService.updateNclass(node);
      node.pnode = pnode;
      node.family = family;
      node.profile = this.nodeService.getSearchKeys(node);
      node.span = this.nodeService.getSpanStr(node);
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

}