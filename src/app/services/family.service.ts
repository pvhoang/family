import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { NodeService } from '../services/node.service';
import { LanguageService } from '../services/language.service';
import { DEBUGS } from '../../environments/environment';

import { CalendarVietnamese } from 'date-chinese';
import { Family, Node} from './family.model';

const DAY_COUNT = 5;

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

  async saveFullFamily(family:Family) {
		family = this.getFilterFamily(family);
    if (DEBUGS.FAMILY_SERVICE)
      console.log('FamilyService - saveFullFamily -  family: ', family);
    this.dataService.saveAncestorData(family, 'FAMILY').then(status => {});
		return true;
	}

  buildFullFamily(family:Family): Family {
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
      node.span = this.nodeService.getSpanStr(node);
    }
		// modify desc data in node
		// w|Phan Viet Hoang

		for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
			let pnode = node.pnode;
			if (!pnode)
				continue;
			let desc = pnode.desc;
			for (let j = 0; j < desc.length; j++) {
			// desc.forEach((item:any) => {
				let items = desc[j].split('|');
				if (items.length > 1) {
					let rel = items[0].trim();
					// let status = RELATION_STATUS[rel];
					let relation = this.utilService.getRelationStr(rel);
					if (relation !== '') {
						let name = items[1].trim();
						if (name.indexOf(node.name) == 0) {
							// desc[j] += '*';
							desc[j] += this.nodeService.getFullDetail(node);
							break;
						}
					}
				}
			}
		}

    // console.log('buildFullFamily - nodes: ', nodes);
    // console.log('buildFullFamily - family: ', family);
		return family;
  }

  private buildChildNodes(pnode: Node, family: Family, nodeLevel: number, childIdx: number) {
    let nodeIdx = 1;
    family.nodes.forEach((node: any) => {
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
			if (dayCount >= 0 && dayCount < DAY_COUNT) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
				// let dod = node.dod;
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
      if (dayCount >= 0 && dayCount < DAY_COUNT) {
				let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
        // let dod = node.dod;
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
    // console.log('getSelectedFamily - nodes: ', nodes);
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
    let nodes = this.nodeService.getFamilyNodes(filterFamily);
    nodes.forEach((node:any) => {
      node.spanDetail = this.nodeService.getSpanPersonStr(node);
    })
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

}