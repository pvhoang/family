import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { NodeService } from '../services/node.service';
import { LanguageService } from '../services/language.service';
import { DEBUGS } from '../../environments/environment';

import { CalendarVietnamese } from 'date-chinese';
import { Family } from './family.model';

@Injectable({
	providedIn: 'root'
})
export class FamilyService {

	constructor(
    private utilService: UtilService,
    private dataService: DataService,
    private nodeService: NodeService,
    private languageService: LanguageService,
	) {
	}

  // --- Family ---

  async saveFullFamily(family:any) {
		family = this.getFilterFamily(family);
    if (DEBUGS.FAMILY_SERVICE)
      console.log('FamilyService - saveFullFamily -  family: ', family);
    this.dataService.saveFamily(family).then(status => {});
		return true;
	}

  buildFullFamily(family: any): Family {
    // start at root
    let nodeLevel = 1;
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

    // add level ranking
    let nodes = this.nodeService.getFamilyNodes(family);
    // console.log('getSelectedPerson - nodes2: ', nodes);
    let levelRankingCount = {};
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      // console.log('buildFullFamily - idlevel1: ', node.idlevel);
      // nodes.forEach((node:any) => {
      let level = '' + node.level;
      let id = node.id;
      let lastChar = id.charAt(id.length - 1);
      if (lastChar != '1') {
        // use same ranking as 1
        node.idlevel = nodes[i-1].idlevel;
      } else {
        if (!levelRankingCount[level])
          levelRankingCount[level] = 1;
        else
          levelRankingCount[level] = levelRankingCount[level] + 1;
        node.idlevel = level + '-' + levelRankingCount[level];
      }
      // console.log('buildFullFamily - idlevel: ', node.idlevel);
      node.span = this.nodeService.getSpanStr(node);
    }
    // console.log('getSelectedPerson - nodes3: ', nodes);
    console.log('buildFullFamily - family: ', family);
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
  
  // --- People ---

  public getPeopleList(family:any): any {
    let data = [];
    let nodeLevel = 1;
    family.nodes.forEach((node: any) => {
      if (node.visible) {
        node.level = nodeLevel;
        data.push({name: node.name + this.nodeService.getFullDetail(node), node: node});
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
    // check for same name and level
    let uData = {};
    for (let i = 0; i < data.length; i++) {
      let node = data[i].node;
      let name = node.name + '_' + node.level;
      if (uData[name] == null) {
        uData[name] = [];
        uData[name].push(node);
      } else {
        uData[name].push(node);
      }
    }
    let uniqueData = [];
    for (var name of Object.keys(uData)) {
      if (uData[name].length > 1) {
        // duplicate name
        uData[name].forEach(node => {
          // get parent name
          let words = node.pnode.name.split(' ');
          let pname = (words.length > 2) ? words[2] : words[1];
          let nname = node.name + '(' + pname + ')' + this.nodeService.getFullDetail(node);
          if (DEBUGS.FAMILY_SERVICE)
            console.log('FamilyService - getPeopleList -  nname: ', nname);
          uniqueData.push(nname);
        })
      } else {
        let node = uData[name][0];
        let nname = node.name + this.nodeService.getFullDetail(node);
        uniqueData.push(nname);
      }
    }
    uniqueData.sort();
    return uniqueData;
	}
  
  private getPeopleListChild(family:any, data:any, nodeLevel: number) {
    family.nodes.forEach((node: any) => {
      if (node.visible) {
        node.level = nodeLevel;
        data.push({name: node.name + this.nodeService.getFullDetail(node), node: node});
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

  passAwayFamily(): Promise<any> {
    return new Promise((resolve) => {
      this.dataService.readFamily().then((family:any) => {
        let msg = [];
        let nodeLevel = 1;
        family.nodes.forEach(node => {
          const dayCount = this.isMemorialComing(node.dod);
          if (dayCount >= 0 && dayCount < 15) {
            let name = node.name + ' (' + this.languageService.getTranslation('GENERATION_SHORT') + nodeLevel + ')';
            let dod = node.dod;
            msg.push([name, dod, dayCount]);
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
        let d = new Date();
        let cal = new CalendarVietnamese()
        cal.fromGregorian(d.getFullYear(), d.getMonth()+1, d.getDate())
        let cdate = cal.get()
        let day = (cdate[4] < 10) ? '0' + cdate[4] : cdate[4];
        let month = (cdate[2] < 10) ? '0' + cdate[2] : cdate[2];
        let today = day + '/' + month;
        resolve ({ today: today, persons: msg });
      });
    });
  }

  private passAwayFamilyNode(family:any, nodeLevel: any, msg: any) {
    family.nodes.forEach(node => {
      const dayCount = this.isMemorialComing(node.dod);
      if (dayCount >= 0 && dayCount < 15) {
        let name = node.name + ' (' + this.languageService.getTranslation('GENERATION_SHORT') + nodeLevel + ')';
        let dod = node.dod;
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
  }

  // --- compareFamilies

  public compareFamilies(srcFamily:any, modFamily:any): any[] {

    let srcFullFamily = this.buildFullFamily(srcFamily);
    let modFullFamily = this.buildFullFamily(modFamily);
    let modNodes = this.nodeService.getFamilyNodes(modFullFamily, true);
    let srcNodes = this.nodeService.getFamilyNodes(srcFullFamily, true);

    // let modNodes = this.nodeService.getFamilyNodes(modFamily, true);
    // let srcNodes = this.nodeService.getFamilyNodes(srcFamily, true);
    
    let results = [];
    // make sure src and mod has same root
    let srcRoot = srcNodes[0];
    let modRoot = modNodes[0];
    if (srcRoot.name != modRoot.name) {
      // different tree
      results.push({srcName: srcRoot.name, desName: modRoot.name});
      return results;
    }
    // build diff based src and mod nodes
    let mNodes = {};
    modNodes.forEach((node:any) => {
      let name = node.name + '_' + node.level;
      mNodes[name] = node;
    })
    let sNodes = {};
    srcNodes.forEach((node:any) => {
      let name = node.name + '_' + node.level;
      sNodes[name] = node;
    })
    // get new nodes
    for (var key of Object.keys(mNodes)) {
      let mNode = mNodes[key]
      let mName = mNode.name + ' (' + this.nodeService.getGeneration(mNode) + ')';
      if (!sNodes[key]) {
        results.push({name: mName, item: this.languageService.getTranslation('ADD'), detail: '', items: [], level: mNode.level, key: key, mode: 'ADD' });
      } else {
        // available in both, now compare data
        let mStr = this.nodeService.getDetailStr(mNodes[key]);
        let sStr = this.nodeService.getDetailStr(sNodes[key]);
        if (mStr != sStr) {
          // console.log('compareFamilies - results: ', mStr, sStr);
          let item = this.languageService.getTranslation('MODIFY');
          let detail = this.nodeService.compareDetail(sStr, mStr);
          let items = this.nodeService.compareDetailByArray(sStr, mStr);
          results.push({name: mName, item: item, detail: detail, items: items, level: mNode.level, key: key, mode: 'MODIFY' });
        }
      }
    }
    // get old nodes
    for (var key of Object.keys(sNodes)) {
      let sNode = sNodes[key]
      let sName = sNode.name + ' (' + this.nodeService.getGeneration(sNode) + ')';
      if (!mNodes[key])
        results.push({name: sName, item: this.languageService.getTranslation('REMOVE'), detail: '', items: [], level: sNode.level, key: key, mode: 'REMOVE'});
    }
    // now sort by level
    results.sort((a, b) => {
      return a.level - b.level;
    })
    return results;
  }

  public getSyncFamily(srcFamily:any, modFamily:any, compareResults:any, info: any) {

    let srcFullFamily = this.buildFullFamily(srcFamily);
    let modFullFamily = this.buildFullFamily(modFamily);
    let modNodes = this.nodeService.getFamilyNodes(modFullFamily, true);
    let srcNodes = this.nodeService.getFamilyNodes(srcFullFamily, true);

    // build diff based src and mod nodes
    let sNodes = {};
    srcNodes.forEach((node:any) => {
      let name = node.name + '_' + node.level;
      sNodes[name] = node;
    })
    
    let mNodes = {};
    modNodes.forEach((node:any) => {
      let name = node.name + '_' + node.level;
      mNodes[name] = node;
    })

    // change modFullFamily
    for (let i = 0; i < compareResults.length; i++) {
      let res = compareResults[i];
      if (res.mode == 'MODIFY') {
        // not wanted, restore from src -> mod
        if (!res.select)
          this.nodeService.replaceDetail(sNodes[res.key], mNodes[res.key], res.id, true);
      } else if (res.mode == 'ADD') {
        // not wanted, remove from mod
        if (!res.select) {
          this.nodeService.deleteNode(modFullFamily, mNodes[res.key]);
        }
      } else if (res.mode == 'REMOVE') {
        // not wanted, add back from src -> mod
        if (!res.select) {
          let node = sNodes[res.key];
          let pnodeSrc = node.pnode;
          let keySrc = pnodeSrc.name + '_' + pnodeSrc.level;
          let pnodeMod = mNodes[keySrc];
          // reset src node to mod
          node.pnode = pnodeMod;
        }
      }
    }
    let family = this.getFilterFamily(modFullFamily);
    return family;
  }

  public getVersionLabel(version) {
    let v = version;
    if (version < 10)
      v = '000' + version;
    else if (version < 100)
      v = '00' + version;
    else if (version < 1000)
      v = '0' + version;
    return v + '-' + this.utilService.getShortDateID();
  }

  // --- getFilterFamily

  getFilterFamily(family) {
    let filterFamily:any = {};
    filterFamily.version = family.version;
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        filterFamily['nodes'].push(this.nodeService.cloneNode(node));
      });
    }
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
      sortNodes.sort((item1:any, item2:any) => {
        let a1: any = (item1.node.yob == '') ? 2050 : +item1.node.yob;
        let a2: any = (item2.node.yob == '') ? 2050 : +item2.node.yob;
        return a1 - a2;
      });
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
    // filterFamily.version = family.version;
    let nodes = [];
    // search backward till root
    let node = srcNode;
    while (node) {
      nodes.push(node);
      node = node.pnode;
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
    nodes = this.nodeService.getFamilyNodes(filterFamily);
    console.log('getSelectedFamily - nodes: ', nodes);
    nodes.forEach((node:any) => {
      node.spanDetail = this.nodeService.getSpanNodeStr(node);
    })
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

    console.log('getSelectedPerson - filterFamily: ', filterFamily);
    let nodes = this.nodeService.getFamilyNodes(filterFamily);
    console.log('getSelectedPerson - nodes2: ', nodes);
    nodes.forEach((node:any) => {
      node.spanDetail = this.nodeService.getSpanPersonStr(node);
    })
    return filterFamily;
  }

  private getSelectedPersonNode(family) {
    let filterFamily:any = {};
    filterFamily['nodes'] = [];
    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        filterFamily['nodes'].push(this.nodeService.cloneNode(node, true));
      });
    }
    filterFamily['children'] = [];
    return filterFamily;
  }

}