import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { NodeService } from '../services/node.service';
<<<<<<< Updated upstream
import { LanguageService } from '../services/language.service';
import { FirebaseService } from '../services/firebase.service';
import { DEBUG_FAMILY_SERVICE } from '../../environments/environment';

import { CalendarVietnamese } from 'date-chinese';
import { Family, Node, NODE } from './family.model';

// var ancestor = environment.ancestor;
// declare var ancestor;
// declare var Diff: any;
=======
import { Family, Node} from './family.model';
import { DEBUGS } from '../../environments/environment';
>>>>>>> Stashed changes

@Injectable({
	providedIn: 'root'
})
export class FamilyService {

	constructor(
    private utilService: UtilService,
    private dataService: DataService,
    private fbService: FirebaseService,
    private nodeService: NodeService,
	) {
	}

  // --- Family ---

  startFamily(): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log('FamilyService - startFamily - ancestor: ', environment.ancestor);
      // console.log('FamilyService - startFamily');
      // always start by loading ancestor from FB
      // this.loadAncestor().then(status => {
        // console.log('FamilyService - startFamily - status: ', status);
        this.loadFamily().then(family => {
          this.dataService.saveFamily(family).then(status => {});
          this.saveFileJson('places').then(status => {});
          this.saveFileJson('names').then(status => {});
          resolve(true);
        }).catch(error => {
          console.log('FamilyService - startFamily - err: ', error);
          reject(false);
        });
      // });
    });
  }

  private loadFamily(): Promise<any> {
    return new Promise((resolve) => {
      this.dataService.readFamily().then((localFamily:any) => {
        // console.log('FamilyService - loadFamily - localFamily: ', localFamily);
        // this.dataService.readLocalJson(ancestor, 'family').then((srcFamily:any) => {
        this.fbService.readJsonDocument(localFamily.info.id, 'family').subscribe((srcFamily:any) => {
          // console.log('FamilyService - loadFamily - srcFamily: ', srcFamily);
          let localVersion = localFamily.version;
          // console.log('FamilyService - loadFamily - localVersion, srcVersion :' , localVersion, srcFamily.version);
          if (localVersion == srcFamily.version) {
            resolve(localFamily);
          } else {
            // src is different, ask user
            // let msg = 
            //   this.languageService.getTranslation('FAMILY_EDIT_TREE') + ': ' + localVersion + '<br>' +
            //   this.languageService.getTranslation('FAMILY_NEW_TREE') + ': ' + srcFamily.version + '<br>' +
            //   this.languageService.getTranslation('FAMILY_TREE_WARNING');
            let msg = this.utilService.getAlertMessage([
              {name: 'msg', label: 'FAMILY_EDIT_TREE'},
              {name: 'data', label: localVersion},
              {name: 'msg', label: 'FAMILY_NEW_TREE'},
              {name: 'data', label: srcFamily.version},
              {name: 'msg', label: 'FAMILY_TREE_WARNING_1'},
              {name: 'msg', label: 'FAMILY_TREE_WARNING_2'},
              {name: 'msg', label: 'FAMILY_TREE_WARNING_3'},
            ]);
            
            this.utilService.alertConfirm('FAMILY_SELECT_NEW_TREE', msg, 'CANCEL', 'OK').then((res) => {
              if (res.data) {
                this.dataService.saveFamily(srcFamily).then(status => {});
                resolve(srcFamily);
              } else {
                resolve(localFamily);
              }
            })
          } 
        });
      });
    });
  }

  // private loadAncestor(): Promise<any> {
  //   return new Promise((resolve) => {
  //     // always read ancestor from FB since it may change
  //     // this.dataService.readLocalJson(ancestor, 'ancestor').then((data:any) => {
        
  //     // this.fbService.readDocument(ancestor, 'ancestor').subscribe((res:any) => {
  //     // this.fbService.readJsonDocument(environment.ancestor, 'ancestor').subscribe((data:any) => {
  //       // console.log('FamilyService - loadAncestor - data: ', data);
  //       // let data = JSON.parse(res.data);
  //       // console.log('FamilyService - loadAncestor - data: ', data);
  //       // add id to data for local memory
  //       // data.id = environment.ancestor;
  //       // this.dataService.saveItem('ANCESTOR', data).then((status:any) => {
  //         // resolve (true);
  //       // });
  //     // });
  //     resolve (true);
  //   });
  // }

  startSourceFamily(ancestor: any): Promise<any> {
    return new Promise((resolve) => {
      // read from Firebase
      // this.dataService.readLocalJson(ancestor, 'family').then((family:any) => {
      this.fbService.readJsonDocument(ancestor, 'family').subscribe((family:any) => {
        // let family = JSON.parse(res.data);
        // const family = data;
        this.dataService.saveFamily(family);
        this.savePeopleJson(family, 'people').then(status => {});
        resolve(true);
      });
    });
  }

  getSourceFamilyVersion(ancestor): Promise<any> {
    return new Promise((resolve) => {
      // this.dataService.readLocalJson(ancestor, 'family').then((family:any) => {
      this.fbService.readJsonDocument(ancestor, 'family').subscribe((family:any) => {
        // let family = JSON.parse(res.data);
        resolve(family.version);
      });
    });
  }

  getDefaultFamily(name: any) {
    let family:any = {};
    family.version = '0.1';
    family.nodes = [];
    family.nodes.push({ name: name, gender: 'male'});
    return family;
  }

  async saveFullFamily(family:any) {
		family = this.getFilterFamily(family);
    this.dataService.saveFamily(family).then(status => {});
		return await true;
	}

  // --- JSON: People ---

  public async savePeopleJson(family:any, json, nameOnly?: any) {
    let data = [];
    let nodeLevel = +family.info.data.generation;
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        node.level = nodeLevel;
        if (nameOnly) {
          data.push(node.name);
        } else {
          // create a front name
          this.pushName(data, node);
          // data.push(node.pob); data.push(node.pod); data.push(node.por);
          // data.push(node.yob); data.push(node.yod);
          data.push(this.nodeService.getGeneration(node));
        }
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
        this.saveJsonChild(child, data, nodeLevel, json, nameOnly);
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
  
  private saveJsonChild(family:any, data:any, nodeLevel: number, json:any, nameOnly: any) {
    family.nodes.forEach((node: any) => {
      if (json == 'people') {
        node.level = nodeLevel;
        if (nameOnly) {
          data.push(node.name);
        } else {
          this.pushName(data, node);
          // data.push(node.pob); data.push(node.pod); data.push(node.por);
          // data.push(node.yob); data.push(node.yod);
          data.push(this.nodeService.getGeneration(node));
        }
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
        this.saveJsonChild(child, data, nodeLevel, json, nameOnly);
      })
    }
  }

  private pushName(data:any, node: any) {
    let words = node.name.split(' ');
    data.push(words[0]);
    if (words.length > 2) 
      // add 1st and middle name
      data.push(words[0] + ' ' + words[1]);
    data.push(node.name + ' (' + this.nodeService.getGeneration(node) + ')');
  }

  private saveFileJson(json) {
    return new Promise((resolve) => {
      // let jsonFile = './assets/data/' + json + '.json';
      let jsonFile = './assets/common/' + json + '.json';
      this.utilService.getLocalJsonFile(jsonFile).then((jsonData:any) => {
        localStorage.setItem(json, JSON.stringify(jsonData));
        resolve(true);
      });
    });
	}

  // --- verifyFamily

  verifyFamily(family: any) {
    let msg = [];
    let family_name = this.utilService.stripVN(family.info.data.family_name);

    if (DEBUG_FAMILY_SERVICE)
      console.log('FamilyService - verifyFamily - family: ', family);

    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');
    // console.log('family root, name, keys: ', family, name, keys);
    // console.log('keys: ', keys);
    // console.log('family_name: ', family_name);
    if (keys[0] != family_name) {
      let message = 'Not useful!'
      msg.push(message);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyFamilyNode(family_name, child, msg);
      })
    }
    if (DEBUG_FAMILY_SERVICE)
      console.log('FamilyService - verifyFamily - msg: ', msg);

    return msg.length == 0 ? null : msg.join('\n');
  }

  private verifyFamilyNode(family_name, family:any, msg) {
    let name = family.nodes[0].name;
    let keys = this.utilService.stripVN(name).split(' ');
    // if (keys[0] != family_name) {
    //   // console.log('family, name, keys: ', family, name, keys);
    //   let ancestorText = this.languageService.getTranslation(family_name);
    //   let message = this.languageService.getTranslation('NAME_MUST_BE_ANCESTOR') + ' ' + ancestorText.short_name + '. [' + name + ']';
    //   msg.push(message);
    // }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyFamilyNode(family_name, child, msg);
      })
    }
  }

  // --- passAwayFamily

  passAwayFamily(): Promise<any> {
    return new Promise((resolve) => {
      this.dataService.readFamily().then((family:any) => {
        let msg = [];
        let nodeLevel = +family.info.data.generation;
        family.nodes.forEach(node => {
          const dayCount = this.isMemorialComing(node.dod);
          if (dayCount >= 0 && dayCount < 7) {
          // if (this.isMemorialComing(node.dod)) {
            let name = node.name + ' (' + this.languageService.getTranslation('GENERATION') +  ' ' + nodeLevel + ')';
            // msg.push([node.name, ''+nodeLevel, node.dod]);
            let dod = node.dod;
            if (dayCount == 0) {
              name = '<b>' + name + '</b>';
              dod = '<b>' + dod + '</b>';
            }
            msg.push([name, dod, dayCount]);
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
      const dayCount = this.isMemorialComing(node.dod);
      if (dayCount >= 0 && dayCount < 7) {
        let name = node.name + ' (' + this.languageService.getTranslation('GENERATION') +  ' ' + nodeLevel + ')';
        let dod = node.dod;
        if (dayCount == 0) {
          name = '<b>' + name + '</b>';
          dod = '<b>' + dod + '</b>';
        }
        msg.push([name, dod, dayCount]);
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
      return -1;
    let d = new Date();
    let cal = new CalendarVietnamese()
    cal.fromGregorian(d.getFullYear(), d.getMonth()+1, d.getDate())
    let cdate = cal.get()
    let todayCount = cdate[2] * 30 + cdate[4];
    let ary = dod.split('/');
    let dodCount = +ary[1] * 30 + +ary[0];
    return dodCount - todayCount;
    // return dodCount >= todayCount && dodCount < todayCount + 7;
  }

  // --- compareFamilies

  public compareFamilies(srcFamily:any, modFamily:any): any[] {

    let modNodes = this.nodeService.getFamilyNodes(modFamily);
    // add info to srcFamily for level calculation
    srcFamily.info = modFamily.info;
    let srcNodes = this.nodeService.getFamilyNodes(srcFamily);

    let results = [];
    // build diff based src and mod nodes
    let mNodes = {};
    modNodes.forEach((node:any) => {
      // let modName = node.name + ' (' + this.nodeService.getGeneration(node) + ')';
      let name = node.name + '_' + node.level;
      mNodes[name] = node;
    })
    // console.log('compareFamilies - mNodes: ', mNodes);

    let sNodes = {};
    srcNodes.forEach((node:any) => {
      // let modName = node.name + ' (' + this.nodeService.getGeneration(node) + ')';
      let name = node.name + '_' + node.level;
      sNodes[name] = node;
    })
    // console.log('compareFamilies - sNodes: ', sNodes);

    // get new nodes
    for (var key of Object.keys(mNodes)) {
      let mNode = mNodes[key]
      let mName = mNode.name + ' (' + this.nodeService.getGeneration(mNode) + ')';
      if (!sNodes[key]) {
        results.push({name: mName, item: this.languageService.getTranslation('ADD'), level: mNode.level });
      } else {
        // available in both, now compare data
        let mStr = this.nodeService.getDetailStr(mNodes[key]);
        let sStr = this.nodeService.getDetailStr(sNodes[key]);
        if (mStr != sStr) {
          let item = this.languageService.getTranslation('MODIFY') + ' - ' + this.nodeService.compareDetail(sStr, mStr);
          results.push({name: mName, item: item, level: mNode.level});
        }
      }
    }
    // console.log('compareFamilies - results: ', results);

    // get old nodes
    for (var key of Object.keys(sNodes)) {
      let sNode = sNodes[key]
      let sName = sNode.name + ' (' + this.nodeService.getGeneration(sNode) + ')';
      if (!mNodes[key])
        results.push({name: sName, item: this.languageService.getTranslation('REMOVE'), level: sNode.level});
    }

    // now sort by level
    results.sort((a, b) => {
      return a.level - b.level;
    })

    // console.log('compareFamilies - results: ', results);
    return results;
  }

  // public compareFamilies1(srcFamily:any, modFamily:any): any[] {

  //   // console.log('compareFamilies');
  //   console.log('compareFamilies - srcFamily: ', srcFamily);
  //   console.log('compareFamilies - modFamily: ', modFamily);

  //   let fSrcFamily = this.getFilterFamily(srcFamily);
  //   let fModFamily = this.getFilterFamily(modFamily);

  //   let src = JSON.stringify(fSrcFamily, null, 4);
  //   let mod = JSON.stringify(fModFamily, null, 4);
  //   var diff = Diff.diffLines(src, mod, { ignoreWhitespace: true, newlineIsToken: true });
  //   console.log('diff: ', diff);
    
  //   let srcLines = src.split('\n');
  //   let modLines = mod.split('\n');
  //   let results = [];
  //   let names = [];
  //   diff.forEach((part:any) => {
  //       const mode = part.added ? 'ADD' : (part.removed ? 'REMOVE' : 'COMMON');
  //       if (mode !== 'COMMON' && part.value.length > 4) {
  //         // console.log('part: ', part);
  //         let row = 0;
  //         if (part.oldPos) {
  //           // get line number
  //           row = +part.oldPos + 1;
  //         } else if (part.newPos) {
  //           row = +part.newPos + 1;
  //         }
  //         // console.log('mode, row, value: ', mode, row, part.value);
  //         // let result = {};
  //         let lines: any;
  //         let old = '';
  //         let n = '';
  //         let name: any = '';
  //         if (mode == 'REMOVE') {
  //           lines = srcLines;
  //           old = part.value;
  //           // search for name on 'old'. Name may be there
  //           if (old.indexOf('"name"') >= 0) {
  //             let idx1 = old.indexOf(': "') + 3;
  //             let idx2 = old.indexOf('"', idx1);
  //             name = old.substring(idx1, idx2);
  //           }
  //         } else if (mode == 'ADD') {
  //           // console.log('line: ', modLines[row-1])
  //           lines = modLines;
  //           n = part.value;
  //           // console.log('line: ', srcLines[row-1]);
  //           // search backward for name
  //           for (let i = row; i > row - 6 && i >= 0; i--) {
  //             let line = lines[i]
  //             // console.log('line: ', line)
  //             if (line.indexOf('"name"') >= 0) {
  //               let idx1 = line.indexOf(': "') + 3;
  //               let idx2 = line.indexOf('"', idx1);
  //               name = line.substring(idx1, idx2);
  //               break;
  //             }
  //           }
  //         }
  //         // console.log('name: ', name);
  //         if (name != '') {
  //           results.push({name: name, item: mode, status: status, old: old, new: n});
  //           names.push(name);
  //         }
  //       }
  //   });
  //   // filter name and check
  //   let uniqueData = [];
  //   names.forEach((element) => {
  //     if (element && element != '' && !uniqueData.includes(element)) {
  //       uniqueData.push(element);
  //     }
  //   });
  //   uniqueData.sort();
  //   // if name exist in old and new
  //   let modNodes = this.nodeService.getFamilyNodes(modFamily);
  //   // add info to srcFamily for level calculation
  //   srcFamily.info = modFamily.info;
  //   let srcNodes = this.nodeService.getFamilyNodes(srcFamily);

  //   results = [];
  //   uniqueData.forEach((name:any) => {
  //     // console.log('name: ', name);
  //     const srcResult = srcNodes.filter((node:any) => node.name == name );
  //     const modResult = modNodes.filter((node:any) => node.name == name );
  //     let stat = '';
  //     let node: any = null;
  //     if (srcResult.length > 0 && modResult.length > 0) {
  //       node = modResult[0];
  //       stat = 'MODIFY';
  //     } else if (srcResult.length > 0 && modResult.length == 0) {
  //       node = srcResult[0];
  //       stat = 'REMOVE';
  //       console.log('node REMOVE: ', node);

  //     } else if (srcResult.length == 0 && modResult.length > 0) {
  //       node = modResult[0];
  //       stat = 'ADD';
  //     } else {
  //       node = null;
  //       stat = 'UNKNOWN';
  //     }
  //     let modName = (node) ? (node.name + ' (' + this.nodeService.getGeneration(node) + ')') : '';
  //     let level = (node) ? node.level : '';
  //     results.push({name: modName, item: stat, level: level });
  //   });
  //   results.sort((a, b) => { return a.level - b.level});

  //   // console.log('results: ', results);
  //   return results;
  // }

  // --- getFilterFamily

  getFilterFamily(family) {
    let filterFamily:any = {};
    filterFamily.version = family.version;
    // console.log('getFilterFamilyNode - family: ', family);
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        // console.log('getFilterFamilyNode - node: ', node);
        let newNode = {};
        if (node.relationship != '') newNode['relationship'] = node.relationship;
        if (node.name != '') newNode['name'] = this.nodeService.getProperName(node);
        // console.log('getFilterFamilyNode - name: ', newNode['name']);
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
      // console.log('getFilterFamilyNode - node1: ', filterFamily);
      // sort nodes by yob
      // filterFamily['nodes'].sort((n1, n2) => {
      //   let a1 = (n1.yob == '') ? 0 : +n1.yob;
      //   let a2 = (n2.yob == '') ? 0 : +n2.yob;
      //   return a1 > a2
      // });
      // console.log('getFilterFamilyNode - node2: ', filterFamily);
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
        // if (node.id == "1-1-4-1-2-1-5-1-1-1")
          // console.log('getFilterFamilyNode - node: ', node);
        let newNode = {};
        if (node.relationship != '') newNode['relationship'] = node.relationship;
        if (node.name != '') newNode['name'] = this.nodeService.getProperName(node);
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
      // sort nodes by yob
      // if (filterFamily['nodes'].length > 2)
      //   console.log('getFilterFamilyNode - node1: ', filterFamily['nodes']);

      // filterFamily['nodes'].sort((n1:any, n2:any) => {
      //   let a1 = (n1.yob == '') ? 0 : +n1.yob;
      //   let a2 = (n2.yob == '') ? 0 : +n2.yob;
      //   return a1 > a2;
      // });

      // if (filterFamily['nodes'].length > 2)
      //   console.log('getFilterFamilyNode - node2: ', filterFamily['nodes']);
    }
    // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
    if (family['children']) {
      filterFamily['children'] = [];
      // sort each family by main person yob
      let sortNodes:any = [];
      family['children'].forEach(fam => {
        if (fam.nodes.length > 0)
          sortNodes.push({ node: fam.nodes[0], family: fam });
      })
      // if (sortNodes.length > 5)
        // console.log('getFilterFamilyNode - node1: ', sortNodes);
      sortNodes.sort((item1:any, item2:any) => {
        let a1: any = (item1.node.yob == '') ? 2050 : +item1.node.yob;
        let a2: any = (item2.node.yob == '') ? 2050 : +item2.node.yob;
        // console.log('getFilterFamilyNode - a1, a2: ', a1, a2);
        return a1 - a2;
      });
      // if (sortNodes.length > 5)
      //   console.log('getFilterFamilyNode - node2: ', sortNodes);

      // family['children'].forEach(fam => {
      sortNodes.forEach(item => {
        let fam = item.family;
        if (fam.nodes.length > 0) {
          let nFamily = this.getFilterFamilyNode(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }

  getSelectedFamily(family: any, srcNode: any) {
    let filterFamily:any = {};
    filterFamily.version = family.version;
    filterFamily.info = family.info;
    let nodes = [];
    // search backward till root
    let node = srcNode;
    while (node) {
      // node.spanDetail = this.nodeService.getSpanDetailStr(node);
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
      } else if (i == nodes.length - 1) {
        ffam.children.push(srcNode.family);
      } else if (i < nodes.length) {
        ffam.children.push(fam);
        ffam = fam;
      }
    }
    nodes = this.nodeService.getFamilyNodes(filterFamily);
    console.log('getSelectedFamily - nodes: ', nodes);
    nodes.forEach((node:any) => {
      node.spanDetail = this.nodeService.getSpanDetailStr(node);
    })
    return filterFamily;
  }

  private getSelectedFamilyNode(node) {
    let filterFamily:any = {};
    filterFamily.nodes = [];
    filterFamily.nodes.push(node);
    filterFamily.children = [];
    return filterFamily;
  }

  // --- buildFullFamily

  buildFullFamily(family: any): Family {
    // start at root
    let nodeLevel = +family.info.data.generation;
    let childIdx = 1;
    let nodeIdx = 1;

    family.nodes.forEach((node: any) => {
      node = this.nodeService.fillNode(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = nodeLevel;
      node.nclass = this.nodeService.updateNclass(node);
      node.pnode = null;
      node.family = family;
      node.profile = this.nodeService.getSearchKeys(node);
      node.span = this.nodeService.getSpanStr(node);
      node.spanDetail = this.nodeService.getSpanDetailStr(node);
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

  private buildChildNodes(pnode: any, family: any, nodeLevel: number, childIdx) {
    let nodeIdx = 1;
    family.nodes.forEach(node => {
      node = this.nodeService.fillNode(node);
      node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = nodeLevel;
      node.nclass = this.nodeService.updateNclass(node);
      node.pnode = pnode;
      node.family = family;
      node.profile = this.nodeService.getSearchKeys(node);
      node.span = this.nodeService.getSpanStr(node);
      node.spanDetail = this.nodeService.getSpanDetailStr(node);
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
<<<<<<< Updated upstream
=======
  
  // --- People ---

	searchPeopleNodes(family, searchStr: any) {
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - searchStr: ', searchStr)
		// Phan Văn Nghi (Đời 1)
		let idx = searchStr.indexOf('(');
		let name = searchStr.substring(0, idx).trim();
		let idx1 = searchStr.indexOf(' ', idx) + 1;
		let idx2 = searchStr.indexOf(')', idx1);
		let level = searchStr.substring(idx1, idx2);
		if (DEBUGS.FAMILY_SERVICE)
			console.log('NodePage - name, level: ', name, level)
		let nodeSelect = null;
		// search thru all nodes
    let nodes:Node[] = this.nodeService.getFamilyNodes(family);
    nodes.forEach((node:any) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
			if (node.name == name && node.level == level)
				nodeSelect = node;
    })
		if (DEBUGS.FAMILY_SERVICE)
      console.log('searchPeopleNodes - nodeSelect: ', nodeSelect)
		return nodeSelect;
  }

	getPeopleNodes (family: any, item?: any) {
    let nodes = this.nodeService.getFamilyNodes(family);
    if (DEBUGS.FAMILY_SERVICE)
      console.log('NodePage - getPeopleNodes - nodes: ', nodes.length);
    nodes.forEach(node => {
      if (!item)
        // all visible
        node.visible = true;
      else {
        // visible only if item == ''
        node.visible = (node[item] == '');
        if (item == 'pod' || item == 'dod') {
          // show if yod != ''
          if (node.visible && node.yod == '')
            node.visible = false;
        }
      }       
    })
    return this.getPeopleList(family);
  }

  private getPeopleList(family:Family): any {
    let data = [];
    let nodeLevel = 1;
    family.nodes.forEach((node: any) => {
      if (node.visible) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
        data.push({name: name, node: node});
      }
    })
    if (family.children) {
      nodeLevel++;
      family.children.forEach(child => {
        this.getPeopleListChild(child, data, nodeLevel);
      })
    }
    if (DEBUGS.FAMILY_SERVICE)
      console.log('FamilyService - getPeopleList -  data: ', data.length);
    
		let names = [];
		data.forEach(name => {
			names.push(name.name);
		})
		return names;
	}
  
  private getPeopleListChild(family:Family, data:any, nodeLevel: number) {
    family.nodes.forEach((node: any) => {
      if (node.visible) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
        data.push({name: name, node: node});
      }
    })
    if (family.children) {
      nodeLevel++;
      family.children.forEach(child => {
        this.getPeopleListChild(child, data, nodeLevel);
      })
    }
  }

  // --- passAwayFamily

  passAwayFamily(family: any) {
		let msg = [];
		let nodeLevel = 1;
		family.nodes.forEach((node: Node) => {
			const dayCount = this.isMemorialComing(node.dod);
			if (dayCount) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
				msg.push([name, node, dayCount]);
			}
		})
		if (family['children']) {
			nodeLevel++;
			family['children'].forEach(child => {
				this.passAwayFamilyNode(child, nodeLevel, msg);
			})
		}
		// sort number of days
		msg.sort((row1:any, row2: any) => {
			return row1[2] - row2[2];
		});
		let today = this.utilService.getLunarDate();
		return ({ today: today, persons: msg });
  }

  private passAwayFamilyNode(family:Family, nodeLevel: number, msg: any[]) {
    family.nodes.forEach(node => {
      const dayCount = this.isMemorialComing(node.dod);
			if (dayCount) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
        msg.push([name, node, dayCount]);
      }
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.passAwayFamilyNode(child, nodeLevel, msg);
      })
    }
  }

	private isMemorialComing(dod: string) {
		if (!dod || dod == '')
			return null;
		// get gregorian day of dod
		let gdate = this.utilService.getGregorianDate(dod);
		let d = new Date();
		let d1 = new Date( d.getFullYear(), d.getMonth(), 1)
		let d2 = new Date( d.getFullYear(), d.getMonth()+1, 1);
		let dDod = new Date( gdate.year, gdate.month - 1, gdate.day, 23, 30, 30);
		let dodTime = dDod.getTime();
		let days = null;
		if (dodTime >= d1.getTime() && dodTime <= d2.getTime())
			days = Math.round((dodTime - d.getTime()) / (1000 * 3600 * 24));
		return days;
	}

  // --- getFilterFamily
  getFilterFamily(family: Family, clean?: any) {
		let filterFamily:any = {};
    filterFamily.version = family.version;
    filterFamily.date = family.date;
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        if (clean)
					filterFamily['nodes'].push(this.nodeService.getCleanNode(node));
				else
					filterFamily['nodes'].push(this.nodeService.cloneNode(node));
      });
    }
    if (family['children']) {
      filterFamily['children'] = [];
      family['children'].forEach(fam => {
        if (fam.nodes.length > 0) {
          let nFamily = this.getFilterFamilyNode(fam, clean);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }

  private getFilterFamilyNode(family: Family, clean?: any) {
		// validate this family format if clean
		// only 2 keys: 'nodes and 'children' are allowed
		if (clean) {
			for (let key of Object.keys(family))
				if (key != 'nodes' && key != 'children') {
					console.log('ERROR - FamilyService - getFilterFamilyNode() - Key not valid: ' + key + '.');
					return null;
				}
		}
		let filterFamily:any = {};
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
				if (clean)
					filterFamily['nodes'].push(this.nodeService.getCleanNode(node));
				else
					filterFamily['nodes'].push(this.nodeService.cloneNode(node));
      });
    }
    if (family['children']) {
      filterFamily['children'] = [];
      // sort each family by main person yob
      let sortNodes:any = [];
      family['children'].forEach(fam => {
        if (fam.nodes.length > 0)
          sortNodes.push({ node: fam.nodes[0], family: fam });
      })
      if (clean) {
				sortNodes.sort((item1:any, item2:any) => {
					// let a2: any = (item2.node.yob == '') ? 2050 : +item2.node.yob;
					// return a1 - a2;
					// no sort for now, 12/01/24, DOB can be filled in later. Keep input order
					return 0;
				});
			}
      sortNodes.forEach(item => {
        let fam = item.family;
        if (fam.nodes.length > 0) {
          let nFamily = this.getFilterFamilyNode(fam, clean);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }
  
  getSelectedFamily(family: Family, srcNode: Node) {
    let filterFamily:any = {};
    let nodes = [];

    // search backward for parent
    let node = srcNode;
		// if (node.pnode) {
		// 	nodes.push(node.pnode);
		// 	nodes.push(node);
		// } else {
		// 	nodes.push(node);
		// }
		// let count = 0;
    while (node) {
      nodes.push(node);
      node = node.pnode;
			// count++;
			// if (count > 1)
			// 	break;
    }

    let ffam:any = filterFamily;
    if (nodes.length == 1) {
      // this is root node, add everything below
        filterFamily = srcNode.family;
    } else {
      for (let i = 0; i < nodes.length; i++) {
        node = nodes[nodes.length - 1 - i];
        let fam = this.getSelectedFamilyNode(node);
        if (i == 0) {
          ffam.nodes = fam.nodes;
          ffam.children = fam.children;
        } else if (i == nodes.length - 1) {
          ffam.children.push(srcNode.family);
        } else if (i < nodes.length) {
          ffam.children.push(fam);
          ffam = fam;
        }
      }
    }
    // nodes = this.nodeService.getFamilyNodes(filterFamily);
    // console.log('getSelectedFamily - nodes: ', nodes);
    // nodes.forEach((node:any) => {
    //   node.spanDetail = this.nodeService.getSpanVerticalTreeStr(node);
    // })
    return filterFamily;
  }

  private getSelectedFamilyNode(node: any) {
    let filterFamily:any = {};
    filterFamily.nodes = [];
    filterFamily.nodes.push(node);
    filterFamily.children = [];
    return filterFamily;
  }

  getSelectedPerson(srcNode: any) {
    let filterFamily:any = {};
    filterFamily['nodes'] = [];
    let family = srcNode.family;
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        filterFamily['nodes'].push(this.nodeService.cloneNode(node, true));
      });
    }
    if (family['children']) {
      filterFamily['children'] = [];
      family['children'].forEach(fam => {
        if (fam.nodes.length > 0) {
          let nFamily = this.getSelectedPersonNode(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    let nodes = this.nodeService.getFamilyNodes(filterFamily);
    nodes.forEach((node:any) => {
      node.span = this.nodeService.getSpanStr(node);
    })
		nodes[0].span = "<b>" + nodes[0].span + "</b>"
    return filterFamily;
  }

  private getSelectedPersonNode(family) {
    let filterFamily:any = {};
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach((node: any) => {
        filterFamily['nodes'].push(this.nodeService.cloneNode(node, true));
      });
    }
    filterFamily['children'] = [];
    return filterFamily;
  }
>>>>>>> Stashed changes

}