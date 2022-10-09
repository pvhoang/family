import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { Family, Node, NODE } from './family.model';

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

  getFamilyNodes(family: any) {
    let nodeLevel = +family.info.generation;
    let nodes = [];
    family.nodes.forEach((node: any) => {
      node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.getChildNodes(child, nodeLevel, nodes);
      })
    }
    return nodes;
  }

  getChildNodes(family:any, nodeLevel, nodes) {
    family.nodes.forEach(node => {
      node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        this.getChildNodes(child, nodeLevel, nodes);
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

  public getGeneration(node: any)  {
    let genStr = this.languageService.getTranslation('GENERATION') + ' ' + node.level;
    return genStr;
  }

  public updateNclass(node: any): void {
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
    if (node.desc != '') str += ' ' + node.desc;
    if (node.dod != '') str += ' ' + node.dod;
    
    str += ' ' + genStr;
    str = this.utilService.stripVN(str);
    let keys = str.split(' ');
    return keys;
  } 
  
  public getDetailStr(node): string  {
    let str = node.name + ',' + 
        (node.nick ? node.nick : '') + ',' +
        (node.gender ? node.gender : '') + ',' +
        (node.yob ? node.yob : '') + ',' +
        (node.yod ? node.yod : '') + ',' +
        (node.pob ? node.pob : '') + ',' +
        (node.pod ? node.pod : '') + ',' +
        (node.por ? node.por : '') + ',' +
        (node.desc ? node.desc :  '') + ',' +
        (node.dod ? node.dod : '');
    return str;
  } 

  public compareDetail(src: string, mod: string):any  {
    let sItems = src.split(',');
    let mItems = mod.split(',');
    let ids = ["NODE_NAME", "NODE_NICK", "NODE_GENDER", "NODE_YOB", "NODE_YOD", "NODE_POB", "NODE_POD", "NODE_POR", "NODE_DESC", "NODE_DOD"];
    let msg = '';
    for (let i = 0; i < sItems.length; i++) {
      if (mItems[i] != sItems[i]) {
        if (msg != '')
          msg += ', ';
        msg += this.languageService.getTranslation(ids[i]);
        let str = '(' + sItems[i] + '->' + mItems[i] + ')';
        msg += str;
      }
    }
    return msg;
  }

  // public compareDetail(mod, src):any  {
  //   let mItems = mod.split(',');
  //   let sItems = src.split(',');
  //   let diff = [];
  //   let ids = ["NODE_NAME", "NODE_NICK", "NODE_GENDER", "NODE_YOB", "NODE_YOD", "NODE_POB", "NODE_POD", "NODE_POR"];
  //   for (let i = 0; i < sItems.length; i++) {
  //     if (mItems[i] != sItems[i])
  //       diff.push({item: this.languageService.getTranslation(ids[i]), old: sItems[i], new: mItems[i]})
  //   }
  //   return diff;
  // } 

  public getSpanStr(node) {

    let yod = (node.yod) ? node.yod : '';
    let str = '';
    if (node.family && node.family.children) {
      str = (yod != '') ? ('<b><i>' + node.name + '</i></b>') : '<b>' + node.name + '</b>';
    } else {
      str = (yod != '') ? ('<i>' + node.name + '</i>') : node.name;
    }
    // let noName = this.languageService.getTranslation('TREE_SELECT_NO_NAME');
    // let header = (node.family.children) ? ' (=>)' : '';
    // let row1 = (node.family && node.family.children) ? '<b>' + node.name + '</b>' : ( node.name.indexOf(noName) > 0 ? '<i>' + node.name + '</i>' : node.name );
    // let row1 = (node.family && node.family.children) ? '<b>' + node.name + '</b>' : node.name;
    // let row2 = ((node.yob) ? node.yob : '') + ' - ' + ((node.yod) ? node.yod : '');
    // return row1 + '<br/>' + row2;
    return str;
  }

  public getSpanDetailStr(node) {
    let row1 = node.name + ' (' + this.getGeneration(node) + ')';
    if (node.family && node.family.children)
      row1 = '<b>' +  row1 + '</b>';
    let yob = (node.yob) ? node.yob : '';
    let yod = (node.yod) ? node.yod : '';
    let por = (node.por) ? node.por : '';
    let desc = (node.desc) ? node.desc : '';

    let row2 = '';
    if (yob != '')
      row2 = '<i>Sinh</i>: ' + yob;
    if (yod != '') {
      if (row2 != '')
        row2 += ' - '
      row2 += '<i>Tử</i>: ' + yod;
    }

    let row3 = '';
    if (por != '')
      row3 = '<i>Sống</i>: ' + por;
    if (desc != '') {
      if (row3 != '')
        row3 += ' - '
      // row3 += 'Thông tin khác: ' + desc;
      row3 += desc;
    }
    //   row2  += 'Tử: ' + yod;
    // if (por != '')
    //   msg += 'Nơi sống: ' + por;
    // if (desc != '')
    //   msg += 'Thông tin khác: ' + desc;

    // let row2 = ((node.yob) ? node.yob : '') + ' - ' + ((node.yod) ? node.yod : '');
    // let row3 = ((node.por) ? node.por : '') + ' - ' + ((node.desc) ? node.desc : '');
    let str = row1;
    if (row2 != '')
      str += '<br/>' + row2;
    if (row3 != '')
      str += '<br/>' + row3;
    // return row1 + '<br/>' + row2 + '<br/>' + row3;
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
    if (!node.desc) node.desc = '';
    if (!node.dod) node.dod = '';
    return node;
  }

  public loadValues(node: any) {
    let values:any = {};

    values.name = node.name;
    values.nick = node.nick;
    values.gender = node.gender;
    values.yob = (node.yob == '') ? null : {name: node.yob};
    values.yod = (node.yod == '') ? null : {name: node.yod};
    values.pob = (node.pob == '') ? null : {name: node.pob};
    values.pod = (node.pod == '') ? null : {name: node.pod};
    values.por = (node.por == '') ? null : {name: node.por};
    values.desc = node.desc;
    values.dod_day = (node.dod == '') ? null : {name: node.dod.substring(0,2)};
    values.dod_month = (node.dod == '') ? null : {name: node.dod.substring(3)};
    return values;
  }

  public updateNode(node: any, values: any) {
    // console.log('values: ', values);
    let change = this.isNodeChanged(node, values);

    let yob = values.yob ? values.yob.name : '';
    let yod = values.yod ? values.yod.name : '';
    let pob = values.pob ? values.pob.name : '';
    let pod = values.pod ? values.pod.name : '';
    let por = values.por ? values.por.name : '';

    node.name = values.name;
    node.nick = values.nick;
    node.gender = values.gender;
    node.yob = yob;
    node.yod = yod;  
    node.pob = pob;
    node.pod = pod;
    node.por = por;
    node.desc = values.desc;
    // node.dod = values.dod;
    node.dod = (values.dod_day && values.dod_month) ? (values.dod_day.name + '/' + values.dod_month.name) : '';
    return change;
  }

  public isNodeChanged(node: any, values:any) {
    let yob = values.yob ? values.yob.name : '';
    let yod = values.yod ? values.yod.name : '';
    let pob = values.pob ? values.pob.name : '';
    let pod = values.pod ? values.pod.name : '';
    let por = values.por ? values.por.name : '';
    let dod = (values.dod_day && values.dod_month) ? (values.dod_day.name + '/' + values.dod_month.name) : '';

    let change = 
      (node.name != values.name) ||
      (node.nick != values.nick) ||
      (node.gender != values.gender) ||
      (node.yob != yob) ||
      (node.yod != yod) ||
      (node.pob != pob) ||
      (node.pod != pod) ||
      (node.por != por) ||
      (node.desc != values.desc) ||
      (node.dod != dod);
    return change;
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
}
