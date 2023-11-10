import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { Family, Node, NODE } from './family.model';

const NODE_VARIABLES = [
  "NODE_NAME", "NODE_NICK", "NODE_GENDER", "NODE_YOB", "NODE_YOD", 
  "NODE_POB", "NODE_POD", "NODE_POR", "NODE_JOB", "NODE_DESC", 
  "NODE_DOD_SHORT"
];

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(
    private utilService: UtilService,
    private languageService: LanguageService,
	) {
	}

  // --- getFamilyNodes

  getFamilyNodes(family: any, addLevel?: any) {
    let nodeLevel = 1;
    let nodes = [];
    family.nodes.forEach((node: any) => {
      if (addLevel)
        node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.getChildNodes(child, nodeLevel, nodes, addLevel);
      })
    }
    return nodes;
  }

  getChildNodes(family:any, nodeLevel, nodes, addLevel) {
    family.nodes.forEach(node => {
      if (addLevel)
        node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.getChildNodes(child, nodeLevel, nodes, addLevel);
      })
    }
  }

  getFamilyNode(family: any, nodeId: any) {
    // console.log('getFamilyNode: ', nodeId);
    let nodeFound: any = null;
    family.nodes.forEach((node: any) => {
      // console.log('getFamilyNode: ', node.id);
      if (node.id == nodeId)
        nodeFound = node;
    })
    if (nodeFound)
      return nodeFound;

    if (family['children']) {
      family['children'].forEach(child => {
        let node:any = this.getChildNode(child, nodeId);
        if (node)
          nodeFound = node;
      })
      if (nodeFound)
        return nodeFound;
    }
    return null;
  }

  getChildNode(family:any, nodeId) {
    let nodeFound: any = null;
    family.nodes.forEach(node => {
      if (node.id == nodeId)
        nodeFound = node;
    })
    if (nodeFound)
      return nodeFound;
    if (family['children']) {
      family['children'].forEach(child => {
        let node:any = this.getChildNode(child, nodeId);
        if (node)
          nodeFound = node;
      })
      if (nodeFound)
        return nodeFound;
    }
    return null;
  }

  getChildFamilyName(node: any) {
    if (node.family.nodes.length == 1) {
      let name = node.name;
      return name.substring(0, name.indexOf(' '));
    }
    // get spouse name
    for (let i = 0; i < node.family.nodes.length; i++) {
      let n = node.family.nodes[i];
      if (n.gender == 'male') {
        let name = n.name;
        return name.substring(0, name.indexOf(' '));
      }
    }
    return 'NO_FAMILY_NAME';
  }

  public getProperName(node: any)  {
    // get proper Vietnamese name
    let values = [];
    node.name.split(' ').forEach((key:any) => {
      // lower all chars and upper 1st character
      key = key.toLowerCase();
      key = key.charAt().toUpperCase() + key.substring(1);
      values.push(key);
    })
    // console.log('getProperName - values: ', values)
    return values.join(' ');
  }

  public isAncestorName(ancestorName, node: any)  {
    // get proper Vietnamese name
    let values = node.name.split(' ');
    let fname = values[0].toLowerCase();
    let aname = ancestorName.toLowerCase();
    return aname == fname;
  }

  public getGeneration(node: any) {
    // let genStr = this.languageService.getTranslation('GENERATION') + ' ' + node.level;
    let genStr = this.languageService.getTranslation('GENERATION_SHORT') + ((node.idlevel) ? node.idlevel : node.level);
    return genStr;
  }
  
  // public getGenerationOrder(node: any) {
  //   let indexes = node.id.split('-');
  //   // pair of 2
  //   // console.log('indexes: ', indexes)

  //   console.log('name: ', node.name)
  //   let gen = 1;
  //   for (let i = 0; i < indexes.length; i += 2) {
  //     let childIdx = indexes[i];
  //     let nodeIdx = indexes[i+1];
  //     console.log('gen, order, spouse: ', gen, childIdx, nodeIdx )
  //     gen++;
  //   }
  //   // console.log('gen: ', indexes.length / 2);


  // }

  public getPhotoName(node: any, storageName?)  {
    let name = this.utilService.stripVN(node.name);
    name = name.replace(/ /g, '_');
    // let photoName = name + '_' + ((node.yob) ? node.yob : '0000');
    let photoName = name + '_' + ((node.idlevel) ? node.idlevel : node.level);
    if (storageName)
      photoName += '_' + this.utilService.getCurrentTime();
    return photoName;
  }

  public getFullDetail(node: any)  {
    let str = ' (' + this.getGeneration(node);
    // let str = ' (' + this.languageService.getTranslation('GENERATION_SHORT') + node.level;
    if (node.dod != '') str += ', ⚱'
    // if (node.photo != '') str += ', <b>☺</b>'
    if (node.photo != '') str += ', ☺'
    str += ')';
    return str;
  }

  public updateNclass(node: any): string {
    return (this.isNodeMissingData(node)) ? 'not-complete' : node.gender;
  }

	public getSearchKeys(node): string[]  {
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
    if (node.job != '') str += ' ' + node.job;
    if (node.desc != '') str += ' ' + node.desc;
    if (node.dod != '') str += ' ' + node.dod;
    
    str += ' ' + genStr;
    str = this.utilService.stripVN(str);
    let keys = str.split(' ');
    return keys;
  } 
  
  public getDetailStr(node: Node): string  {
    let str = 
      node.name + '||' + 
      (node.nick ? node.nick : '') + '||' +
      (node.gender ? node.gender : '') + '||' +
      (node.yob ? node.yob : '') + '||' +
      (node.yod ? node.yod : '') + '||' +
      (node.pob ? node.pob : '') + '||' +
      (node.pod ? node.pod : '') + '||' +
      (node.por ? node.por : '') + '||' +
      (node.job ? node.job : '') + '||' +
      (node.desc ? node.desc :  '') + '||' +
      // ((node.photo) ? node.photo : '') + '||' +
      (node.dod ? node.dod : '');
    return str;
  } 

  public getInfoList(): any  {
    let ids = ["all", "yob", "yod", "pob", "pod", "por", "job", "dod"];
    let labels = ["NODE_ALL_NODES", "NODE_YOB", "NODE_YOD", 
      "NODE_POB", "NODE_POD", "NODE_POR", "NODE_JOB", "NODE_DOD_SHORT"
    ];
    let infos = [];
    for (let i = 0; i < labels.length; i++)
      infos.push({ id: ids[i], name: this.languageService.getTranslation(labels[i]) })
    return infos;
  }

  public compareDetail(src: string, mod: string):any  {
    let sItems = src.split('||');
    let mItems = mod.split('||');
    let msg = '';
    for (let i = 0; i < sItems.length; i++) {
      if (mItems[i] != sItems[i]) {
        if (msg != '')
          msg += ', ';
        msg += this.languageService.getTranslation(NODE_VARIABLES[i]);
        let str = ' (' + sItems[i] + '->' + mItems[i] + ')';
        msg += str;
      }
    }
    return msg;
  }

  public compareDetailByArray(src: string, mod: string):any  {
    let sItems = src.split('||');
    let mItems = mod.split('||');
    let res = [];
    for (let i = 0; i < sItems.length; i++) {
      if (mItems[i] != sItems[i])
        res.push({id: NODE_VARIABLES[i], src: sItems[i], mod: mItems[i] })
    }
    return res;
  }

  public replaceDetail(srcNode: any, modNode: any, id: any, src2mod: any) {
    let idNames = [
        "name", "nick", "gender", "yob", "yod", 
        "pob", "pod", "por", "job", "desc", 
        "dod"];
    for (let i = 0; i < NODE_VARIABLES.length; i++) {
      if (id == NODE_VARIABLES[i]) {
        if (src2mod) {
          modNode[idNames[i]] = srcNode[idNames[i]];
        } else {
          srcNode[idNames[i]] = modNode[idNames[i]];
        }
        break;
      }
    }
  }

  public getSpanStr(node) {
    // let str = node.name + '-' + node.idlevel;
    let str = node.name;
    if (node.yod != '' && node.photo != '') str += ' (☺,⚱)';
    else if (node.yod != '') str += ' (⚱)';
    else if (node.photo != '') str += ' (☺)';
    return str;
  }

  public getSpanNodeStr(node) {
    let row1 = node.name + ' (' + this.getGeneration(node) + ')';
    if (node.family && node.family.children)
      row1 = '<b>' +  row1 + '</b>';
    let yob = (node.yob) ? node.yob : '';
    let yod = (node.yod) ? node.yod : '';
    let pod = (node.pod) ? node.pod : '';
    let por = (node.por) ? node.por : '';
    let job = (node.job) ? node.job : '';
    // let desc = (node.desc) ? node.desc : '';
    let str = row1 + '<br/>' + '<i>Sinh</i>: ' + yob + ' - ' + '<i>Sống</i>: ' + por;
    if (yod != '')
      str += '<br/>' + '<i>Tử</i>: ' + yod + ' - ' + '<i>Mộ</i>: ' + pod;
    if (job != '')
      str += '<br/>' + '<b>' +  job + '</b>'
    return str;
  }

  public getSpanPersonStr(node) {
    let str = '';
    let row1 = node.name + ' (' + this.getGeneration(node) + ')';
    let row2 = '';
    let row3 = '';
    let row4 = '';
    let row5 = '';

    if (node.nclass == 'node-select') {
      row2 = '<b>Sinh</b>: ' + node.yob + ' - ' + ((node.yob != '') ? this.utilService.getLunarYear(+node.yob) : '');
      if (node.yod != '') {
        row3 = '<b>Tử</b>: ' + node.yod + ' - ' + ((node.yod != '') ? this.utilService.getLunarYear(+node.yod) : '');
        row4 = '<b>Giỗ</b>: ' + node.dod + ' (ÂL)';
        row5 = '<b>Mộ</b>: ' + node.pod;
      }
    } else {
      row2 = '(' + node.yob + ' - ' + node.yod + ')';
    }
    str = row1 + '<br/>' + row2;
    if (row3 != '') str += '<br/>' + row3;
    if (row4 != '') str += '<br/>' + row4;
    if (row5 != '') str += '<br/>' + row5;
    
    // if (node.family && node.family.children)
    //   row1 = '<b>' +  row1 + '</b>';
    // let yob = (node.yob) ? node.yob : '';
    // let yod = (node.yod) ? node.yod : '';
    // let row2 = '( ' + node.yob + ' - ' + this.utilService.getLunarYear(+node.yob).yod + ' )';
    // let str = row1 + '<br/>' + row2;
    // if (node.nclass == 'node-select') {
    //   if (node.yod != '') {
    //     let row3 = '<br/><b>Giỗ</b>: ' + node.dod + ' (ÂL)';
    //     let row4 = '<b>Mộ</b>: ' + node.pod;
    //     str += row3 + '<br/>' + row4
    //   }
    // }
    // let pod = (node.pod) ? node.pod : '';
    // let por = (node.por) ? node.por : '';
    // let job = (node.job) ? node.job : '';
    // // let desc = (node.desc) ? node.desc : '';
    // let str =  + '<i>Sinh</i>: ' + yob + ' - ' + '<i>Sống</i>: ' + por;
    // if (yod != '')
    //   str += '<br/>' + '<i>Tử</i>: ' + yod + ' - ' + '<i>Mộ</i>: ' + pod;
    // if (job != '')
    //   str += '<br/>' + '<b>' +  job + '</b>'
    return str;
  }

  public fillNode(node) {
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
    if (!node.job) node.job = '';
    if (!node.desc) node.desc = '';
    if (!node.photo) node.photo = '';
    if (!node.dod) node.dod = '';
    return node;
  }

  public loadValues(node: any) {
    let values:any = {};

    values.name = node.name;
    values.nick = node.nick;
    values.gender = node.gender;
    values.yob = (node.yob == '') ? null : node.yob;
    values.yod = (node.yod == '') ? null : node.yod;
    values.pob = (node.pob == '') ? null : node.pob;
    values.pod = (node.pod == '') ? null : node.pod;
    values.por = (node.por == '') ? null : node.por;
    values.job = (node.job == '') ? null : node.job;
    values.desc = node.desc;
    values.photo = (node.photo) ? node.photo : '';
    values.dod_day = (node.dod == '') ? null : node.dod.substring(0,2);
    values.dod_month = (node.dod == '') ? null : node.dod.substring(3);

    return values;
  }

  public updateNode(node: any, values: any) {
    // console.log('values: ', values);
    let change = this.isNodeChanged(node, values);

    let yob = values.yob ? values.yob : '';
    let yod = values.yod ? values.yod : '';
    let pob = values.pob ? values.pob : '';
    let pod = values.pod ? values.pod : '';
    let por = values.por ? values.por : '';
    let job = values.job ? values.job : '';

    node.name = values.name;
    node.nick = values.nick;
    node.gender = values.gender;
    node.yob = yob;
    node.yod = yod;  
    node.pob = pob;
    node.pod = pod;
    node.por = por;
    node.job = job;
    node.desc = values.desc;
    node.photo = values.photo;
    // node.dod = values.dod;
    node.dod = (values.dod_day && values.dod_month) ? (values.dod_day + '/' + values.dod_month) : '';
    return change;
  }

  public isNodeChanged(node: any, values:any) {
    let yob = values.yob ? values.yob : '';
    let yod = values.yod ? values.yod : '';
    let pob = values.pob ? values.pob : '';
    let pod = values.pod ? values.pod : '';
    let por = values.por ? values.por : '';
    let job = values.job ? values.job : '';
    let dod = (values.dod_day && values.dod_month) ? (values.dod_day + '/' + values.dod_month) : '';

    let change = 
      (node.name != values.name) ||
      (node.nick != values.nick) ||
      (node.gender != values.gender) ||
      (node.yob != yob) ||
      (node.yod != yod) ||
      (node.pob != pob) ||
      (node.pod != pod) ||
      (node.por != por) ||
      (node.job != job) ||
      (node.desc != values.desc) ||
      (node.photo != values.photo) ||
      (node.dod != dod);
    return change;
  }

  public cloneNode(srcNode: any, cloneLevel?:boolean) {
    let node = Object.create(NODE);
    node.name = srcNode.name;
    node.nick = srcNode.nick;
    node.gender = srcNode.gender;
    node.yob = srcNode.yob;
    node.yod = srcNode.yod;  
    node.pob = srcNode.pob;
    node.pod = srcNode.pod;
    node.por = srcNode.por;
    node.job = srcNode.job;
    node.desc = srcNode.desc;
    node.photo = srcNode.photo;
    node.dod = srcNode.dod;
    if (cloneLevel) {
      node.level = srcNode.level;
      node.idlevel = srcNode.idlevel;
      node.nclass = srcNode.nclass;
    }
    return node;
  }

  public getEmptyNode(id: string, level: string, name: string, gender: string) {
    let node = Object.create(NODE);
    node.id = id;
    node.name = name;
    node.gender = gender;
    node.level = +level;
    node.profile = this.getSearchKeys(node)
    node.span = this.getSpanStr(node);
    node.nclass = this.updateNclass(node);
    return node;
  }

  public isNodeMissingData(node: any): boolean {
    if (node['name'].length == 0)
      return true;
    return false;
  }

  public addNode(srcNode: any, modNode: any) {
    // check src node is child or spouse, mod node must have 
  }

  public deleteNode(family: any, node: any) {

    // console.log('deleteNode - family: ', family);
    // console.log('deleteNode - node: ', node);

    let pnode = node.pnode;
    if (!node.pnode) {
      // this is root node
      let nodes = family.nodes;
      let newNodes = nodes.filter((n:any) => {
        return (n.name != node.name);
      });
      if (newNodes.length > 0)
        family.nodes = newNodes;

    } else {
      let children = [];
      for (let i = 0; i < pnode.family.children.length; i++) {
        let fam = pnode.family.children[i];
        let nodes = fam.nodes;
        let newNodes = nodes.filter((n:any) => {
          return (n.name != node.name);
        });
        if (newNodes.length > 0) {
          fam.nodes = newNodes;
          children.push(fam);
        }
      }
      pnode.family.children = (children.length == 0) ? null : children;
      // console.log('deleteNode - family1: ', family);
    }
  }

  public addChild(node: any, name, gender, relation) {
    console.log('addChild - node: ', node);
    console.log('addChild - pnode: ', node.pnode);
    if (!node.family.children)
      node.family.children = [];
    let childIdx = node.family.children.length + 1;
    let nodeIdx = 1;
    let id = node.id + '-' + childIdx + '-' + nodeIdx;
    let level = '' + (1 + +node.level);
    let newNode = this.getEmptyNode(id, level, name, gender);
    let newFamily = {nodes: [newNode]};
    // console.log('addChild - newNode: ', newNode);
    newNode.pnode = node;
    newNode.family = newFamily;
    newNode.relation = this.languageService.getTranslation(relation);
    node.family.children.push(newFamily);
    return newNode;
  }

  public addSpouse(node: any, name, gender, relation:any) {
    let id = node.id;
    let ids = id.split('-');
    // take the last one, increase by 1
    let nodeIdx = ids[ids.length-1];
    id = id.substring(0, id.lastIndexOf('-'));
    id = id + '-' + (+nodeIdx+1);
    let newNode = this.getEmptyNode(id, node.level, name, gender);
    newNode.pnode = node;
    newNode.family = node.family;
    newNode.pnode = node.pnode;
    newNode.relation = this.languageService.getTranslation(relation);
    node.family.nodes.push(newNode);
    return newNode;
  }

  public getChildren(node: any) {
    let results:any = {};
    let pnode = node.pnode;
    // only for 1st member
    if (node.family.nodes[0] == node && pnode && pnode.family.nodes.length > 0) {
      let pnodes:any = [];
      let count = 0;
      pnode.family.nodes.forEach((n:any) => {
        n.relation = this.languageService.getTranslation('MOTHER');
        if (n.gender == 'male')
          n.relation = this.languageService.getTranslation('FATHER');
        if (++count <= 2)
          pnodes.push(n);
      });
      results.parents = pnodes;
    }
    if (node.family.nodes.length > 1) {
      let snodes:any = [];
      // get spouse
      node.family.nodes.forEach((n:any) => {
        if (n.name != node.name) {
          // real spouses
          n.relation = this.languageService.getTranslation('WIFE');
          if (n.gender == 'male')
            n.relation = this.languageService.getTranslation('HUSBAND');
          snodes.push(n);
        }
      });
      results.spouses = snodes;
    }
    if (node.family.children) {
      // get children
      let nodes:any = [];
      node.family.children.forEach((family:any) => {
        family.nodes[0].relation = this.languageService.getTranslation('CHILD');
        nodes.push(family.nodes[0]);
      });
      results.children = nodes;
    };
    return results;
  }
}
