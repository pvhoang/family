import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { ModalController, PopoverController } from '@ionic/angular';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { TreePage } from './tree/tree.page';
import { TypeaheadService } from '../../services/typeahead.service';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

const WAIT_TIME = 500;

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-vnode',
  templateUrl: './vnode.page.html',
  styleUrls: ['./vnode.page.scss'],
})
export class VnodePage implements OnInit {

  @Input() caller: string;

  FONTS_FOLDER = FONTS_FOLDER;
  modalDataResponse: any;
  family:Family = FAMILY;
  familyView:Family = FAMILY;
  selectPeople: string = null;
  selectPeoplePlaceholder: string = null;
  title: string = '';
  peopleNodes: Node[] = [];
  justClicked = false;
  doubleClicked = false;
  selectedNode: Node = null;
  selectedNodeName: string = '';
  isChildOK = false;
  viewMode = 0;
  treeClass = 'tree';
  scaleStyle: number = 10;
  isPopover = false;
  timeEnter: number = 0;
  info: any;
  nodeItems: Array<any>;
  nodeItem: any;
  nodeItemPlaceholder: any = '';
  nodeItemMessage: any = '';
  dataEditable = false;

  constructor(
    public modalCtrl: ModalController,
    public popoverController: PopoverController,
    private utilService: UtilService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    if (DEBUGS.NODE)
      console.log('NodePage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.NODE)
        console.log('NodePage - startFromStorage - data: ', data);
      this.info = data.info;
      this.title = this.info.description;
      this.start(data.family);
    });
  }

  start(family: any) {
    this.dataService.readItem('EDIT').then((status:any) => {
      this.dataEditable = status;
    });
    this.family = this.familyService.buildFullFamily(family);
    this.peopleNodes = this.getPeopleNodes (this.family);
    this.nodeItems = this.nodeService.getInfoList();
    this.nodeItem = null;
    this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.nodeItemPlaceholder = this.languageService.getTranslation('NODE_SELECT_EMPTY_DATA');
  }

  async onExit() {
    await this.modalCtrl.dismiss({status: 'cancel'});
  }
  
  getPeopleNodes (family: any, item?: any) {
    let nodes = this.nodeService.getFamilyNodes(family);
    if (DEBUGS.NODE)
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
    return this.familyService.getPeopleList(family);
  }

  //
  // ------------- TREE -------------
  //

  getZoomStyle() {
    let scale = this.scaleStyle / 10;
    let styles = {
      'zoom': scale,
      '-moz-transform': 'scale(' + scale + ')',
      '-moz-transform-origin': '0 0',
      '-o-transform': 'scale(' + scale + ')',
      '-o-transform-origin': '0 0',
      '-webkit-transform': 'scale(' + scale + ')',
      '-webkit-transform-origin': '0 0'
    };
    return styles;
  }
  
  onLeafSelected (node: Node) {
    this.onNodeSelect(node, true);
  }

  scrollToRoot() {
    this.scrollToNode(this.familyView.nodes[0]);
  }

  scrollToNode(node: Node) {
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearPeopleNodes() {
    this.selectPeople = null;
  }

  closePeopleNodes() {
    if (DEBUGS.NODE)
      console.log('NodePage - closePeopleNodes - selectPeople: ', this.selectPeople);
    this.selectedNode = null;
    this.startSearch(this.selectPeople);
  }
  
  keyupPeopleNodes(event) {
    if (DEBUGS.NODE)
      console.log('NodePage - keyup: ', event.target.value);
    if (event.key !== 'Enter')
      return;
  }

  onNodeInfoPopover(item: any) {
    if (DEBUGS.NODE)
      console.log('NodePage - onNodeInfoPopover: ', item);
    this.nodeItem = item.id;
    if (this.nodeItem == 'all')
      this.nodeItem = null;
    this.peopleNodes = this.getPeopleNodes (this.family, this.nodeItem)
    this.selectPeople = null;
    if (this.nodeItem == null) {
      this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    } else {
    this.nodeItemMessage = this.languageService.getTranslation('NODE_MISSING_ITEM_1') + item.name +
    this.languageService.getTranslation('NODE_MISSING_ITEM_2') + this.peopleNodes.length;
    }
  }

  // --------- END ng-select ----------

  startSearch(searchStr) {
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - searchStr: ', searchStr)
    // remove Generation
    // name: Đoàn Văn Phê
    searchStr = searchStr.substring(0, searchStr.indexOf(' ('));
    let parentName = '';
    // remove Parent if any
    let idx = searchStr.indexOf('(');
    if (idx > 0) {
      // this is node with parent name
      parentName = searchStr.substring(idx+1, searchStr.length-1)
      searchStr = searchStr.substring(0, idx)
    }
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - searchStr, parentName: ', searchStr, parentName);
    let sNodes:Node[] = [];
    // search thru all nodes
    let nodes:Node[] = this.nodeService.getFamilyNodes(this.family);
    nodes.forEach((node:Node) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
      let strProfile = node.name;
      if (strProfile.indexOf(searchStr) >= 0) {
        if (parentName != '') {
          // get real node
          let words = node.pnode.name.split(' ');
          let pname = (words.length > 2) ? words[2] : words[1];
          if (pname == parentName) {
            // found the node
            sNodes.push(node);
          }
        } else
          sNodes.push(node);
      }
    })
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - sNodes: ', sNodes)
      // set select on 1st node
    sNodes[0]['nclass'] = 'select'
    this.onNodeSelect(sNodes[0]);
  }
  
  onNodeSelect(node: Node, openTask?: any) {

    if (DEBUGS.NODE)
      console.log('NodePage - onNodeSelect - node: ', node);
    // reset nclass
    if (this.selectedNode)
      this.selectedNode.nclass = this.nodeService.updateNclass(this.selectedNode);

    this.selectedNode = node;
    this.selectedNodeName = node.name;
    this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    let ancestorName = this.info.family_name;
    this.isChildOK = this.nodeService.isAncestorName(ancestorName, node);
    this.selectedNode.nclass = 'node-select';

    setTimeout(() => {
      this.scrollToNode(this.selectedNode);
      if (openTask)
        this.onTree();
    }, WAIT_TIME);
  }

  onTree() {
    let familyView = this.familyService.getSelectedFamily(this.family, this.selectedNode);
    // familyView = this.familyService.buildFullFamily(familyView);
    this.openTreeModal(this.selectedNode.id, familyView, this.info);
  }

  async openTreeModal(nodeId: any, familyView: any, info: any) {
    const modal = await this.modalCtrl.create({
      component: TreePage,
      componentProps: {
        'nodeId': nodeId,
        'familyView': familyView,
        'info': info,
      },
			backdropDismiss:false
    });

    modal.onDidDismiss().then((resp) => {
      console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      this.selectedNode.nclass = 'node-select';
    });
    return await modal.present();
  }

}
