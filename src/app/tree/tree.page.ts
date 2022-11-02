import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { NodeService } from '../services/node.service';
import { DataService } from '../services/data.service';
import { NodePage } from './node/node.page';
import { environment } from '../../environments/environment';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node, FAMILY} from '../services/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';
import '../../assets/js/Roboto-Regular-normal.js';
import { FONTS_FOLDER, DEBUG_TREE } from '../../environments/environment';

import * as $ from 'jquery';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  @ViewChild('ngSelectPeople') ngSelectPeople: NgSelectComponent;

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  modalDataResponse: any;
  family:Family = Object.create(FAMILY);
  familyView:Family = Object.create(FAMILY);
  nodeView = false;
  people: Observable<string[]>;
  newPeople: any[] = [];

  typeStr: string = '';
  selectPeople: any = null;
  selectPeopleNotFoundText: any = null;
  selectPeoplePlaceholder: any = null;
  scaleStyle: number = 10;
  searchView = false;
	searchPercent: any = '0/0';
	searchIdx: any = '0/0';
	searchDisabled:any = false;
  sNodes:Node[] = [];
  detail1:any = '';
  phabletDevice:any = false;
  treeClass:any;
  selectedNode: any = null;
  selectedNodeView: any = false;
  selectedNodeName: any = '';
  fullTreeView = false;

  constructor(
    public modalCtrl: ModalController,
    private utilService: UtilService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    if (DEBUG_TREE)
      console.log('TreePage - ngOnInit');

    this.treeClass = 'vertical-tree';
    this.scaleStyle = 10;
    this.phabletDevice = environment.phabletDevice;
    this.startFromStorage();
    this.dislayWindowData();
  }

  dislayWindowData() {
      let scrollX = window.scrollX;
      let scrollY = window.scrollY;
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      this.detail1 = 'window: ' + 
        '  scrollX='+scrollX+', scrollY='+scrollY+
        ', viewportWidth='+viewportWidth+', viewportHeight='+viewportHeight+
        ', outerWidth='+window.outerWidth+', outerHeight='+window.outerHeight;
    if (DEBUG_TREE)
      console.log('TreePage - dislayWindowData - detail1: ', this.detail1);
  }

  ionViewWillEnter() {
    if (DEBUG_TREE)
      console.log('TreePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUG_TREE)
      console.log('TreePage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamily().then((family:any) => {
      this.title = family.info.description;
      if (DEBUG_TREE)
        console.log('TreePage - startFromStorage - family: ', family);
      let msg = this.familyService.verifyFamily(family);
      if (DEBUG_TREE)
        console.log('TreePage - startFromStorage - msg: ', msg);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      this.start(family);
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    if (DEBUG_TREE)
      console.log('TreePage - start - family: ', this.family);
    this.familyService.savePeopleJson(family, 'people').then(status => {});
    this.familyView = this.family;
    this.selectPeopleNotFoundText = this.languageService.getTranslation('TREE_SEARCH_ITEM_NOT_FOUND');
    this.selectPeoplePlaceholder = this.languageService.getTranslation('TREE_SEARCH_PLACEHOLDER');
    
    // reset search
    this.fullTreeView = true;
    this.nodeView = false;
    if (this.searchView) {
      this.searchView = false;
    }
    if (this.selectedNodeView) {
      this.stopSelectedNode(this.selectedNode);
      this.selectedNode = null;
      this.selectedNodeView = false;
    }
    this.typeahead.getJsonPeople().then((data:any) => {
      this.newPeople = data;
    })
    this.startTree();
  }

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

  onLeafSelected1 (node) {
    console.log('TreePage - onLeafSelected: ', node);
  }

  onLeafSelected (node) {
    console.log('TreePage - onLeafSelected: ', node);
    // already in search view, ignore select
    if (this.searchView) {
      this.utilService.presentToast(this.languageService.getTranslation('TREE_ERROR_CLICK'));
      return;
    }

    if (!this.selectedNode) {
      // no selected node, select click one
      this.selectedNodeView = true;
      this.selectedNode = node;
      this.fullTreeView = false;
      this.startSelectedNode(node);

    } else if (this.selectedNode == node) {
      // current node is clicked again, stop select mode, start fullTreeView mode
      if (this.nodeView)
        this.onHome();
      this.stopSelectedNode(this.selectedNode);
      this.selectedNodeView = false;
      this.selectedNode = null;
      this.fullTreeView = true;
    } else {
      // different node is clicked, stop select node, select new node
      if (this.nodeView)
        this.onHome();
      this.stopSelectedNode(this.selectedNode);
      this.selectedNodeView = true;
      this.selectedNode = node;
      this.fullTreeView = false;
      this.startSelectedNode(node);
      console.log('stopSelectedNode - ', this.fullTreeView)
    }

  }
  
  onHome() {

    if (this.searchView) {
      let node = this.getSelectedNode();
      if (this.nodeView) {
        // in node view, reset to tree view, back to full family
        this.familyView = this.family;
        setTimeout(() => {
          this.scrollToNode(node);
        }, 100);
        this.nodeView = false;
      } else {
        // in tree view, set to node view
        this.nodeView = true;
        this.viewSearch(node);
      }
    } else if (this.selectedNodeView) {
      let node = this.getSelectedNode();
      if (this.nodeView) {
        // in node view, reset to tree view, back to full family
        this.familyView = this.family;
        setTimeout(() => {
          this.scrollToNode(node);
        }, 100);
        this.nodeView = false;
      } else {
        // in tree view, set to node view
        this.nodeView = true;
        this.viewSearch(node);
      }

    } else {
      // in full view, go to Root
      this.scrollToRoot();
    }
  }

  onChangeTree() {
    this.treeClass = (this.treeClass == 'tree') ? 'vertical-tree' : 'tree';
    console.log('treeClass: ', this.treeClass);
    this.startTree();
  }

  startTree() {
    this.setTreeBeforeSearch()
  }

  startTree1() {
    let tree = this.treeClass;
    $(document).ready(function(){
      $('.' + tree + ' ul').hide();
      // show the root ul
      $('.' + tree + '>ul').show();
      // show all uls with class='active'
      $('.' + tree + ' ul.active').show();
      // now display li
      $('.' + tree + ' li').off('click').on('click', function (event: any) {
        // check all direct ul children
        let children = $(this).find('> ul');
        if (children.length == 0)
          children = $(this).find('> ft-leaf > ul');
        // set active if it is not a leaf
        if (children.length > 0) {
          // change children visibility. remove/add class='active'
          if (children.is(":visible")) children.hide('fast').removeClass('active');
          else children.show('fast').addClass('active');
        }
        event.stopImmediatePropagation()
      });
    });
  }

  setTreeBeforeSearch() {
    let tree = this.treeClass;
    $(document).ready(function(){
      // show all
      $('.' + tree + ' ul').show();
    });
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearNewPeople() {
    this.selectPeople = null;
    // this.newPeople = this.typeahead.getJson('', 'people');
    this.typeahead.getJsonPeople().then((data:any) => {
      this.newPeople = data;
    })
  }

  closeNewPeople() {
    console.log('EditorPage - close: ', this.selectPeople);
    this.startSearch(this.selectPeople.name);
  }

  // --------- END ng-select ----------

  searchReset() {
    // console.log('TreePage - searchReset');
    this.searchPercent = '0/0';
    this.searchIdx = 0;
    this.sNodes = [];
    this.selectPeople = null;
    this.typeStr = '';
    this.people = this.typeahead.getJson('', 'people');
  }

  closeSearch() {
    this.searchView = false;
    this.selectedNodeView = false;
    this.nodeView = false;
    this.fullTreeView = true;
    this.startFromStorage();
  }

  startSearch(searchStr: string) {
    if (DEBUG_TREE)
      console.log('TreePage - startSearch - searchStr: ', searchStr)
    // strip search word with (Gen)
    if (searchStr.indexOf('(') > 0)
      searchStr = searchStr.substring(0, searchStr.indexOf('(')).trim();
      
    this.setTreeBeforeSearch();
    this.fullTreeView = false;
    this.searchView = true;
    // always reset
    this.searchReset();
    let skeys = this.utilService.stripVN(searchStr).split(' ');
    let strSearch = skeys.join(' ');
    // console.log('TreePage - startSearch - searchStr: ', searchStr)
    // search thru all nodes
    let nodes = this.nodeService.getFamilyNodes(this.family);
    nodes.forEach((node:any) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
      let strProfile = node.profile.join(' ');
      // console.log('TreePage - startSearch - strProfile: ', strProfile)
      if (strProfile.indexOf(strSearch) >= 0) {
        node['nclass'] = 'select'
        this.sNodes.push(node);
      }
    })
    // console.log('sNodes: ', this.sNodes)
    let sCount = this.sNodes.length;
    if (sCount == 0) {
      this.searchPercent = '0/0';
      this.searchDisabled = true;
    } else {
      this.searchDisabled = (sCount == 1);
      this.searchIdx = 1;
      let node = this.sNodes[this.searchIdx - 1];
      this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.nodeService.getGeneration(node) + ')';
      setTimeout(() => {
        this.scrollToNode(node);
      }, 300);
    }
  }
  
  startSelectedNode(node: any) {
    // always reset
    // this.searchReset();
    node.nclass = 'node-select'
    this.selectedNodeName = node.name + ' (' + this.nodeService.getGeneration(node) + ')';
    setTimeout(() => {
      this.scrollToNode(node);
    }, 300);
  }

  stopSelectedNode(node: any) {
    // reset nclass
    node.nclass = this.nodeService.updateNclass(node);
  }

  nextSearch() {
    if (this.searchIdx == this.sNodes.length)
      this.searchIdx = 1;
    else
      this.searchIdx++;
    let node = this.sNodes[this.searchIdx - 1];
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.nodeService.getGeneration(node) + ')';
    this.viewSearch(node);
  }

  prevSearch() {
    if (this.searchIdx == 1)
      this.searchIdx = this.sNodes.length;
    else
      this.searchIdx--;
    let node = this.sNodes[this.searchIdx - 1];
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.nodeService.getGeneration(node) + ')';
    this.viewSearch(node);
  }
  
  viewSearch(node: any) {
    if (this.nodeView) {
      // set new family view for node
      this.familyView = this.familyService.getSelectedFamily(this.family, node);
    } else {
      this.scrollToNode(node);
    }
  }

  getSelectedNode() {
    let node = (this.searchView) ? this.sNodes[this.searchIdx - 1] :
    ((this.selectedNodeView) ? this.selectedNode : null);
    if (!node) {
      alert('node = null in getSelectedNode')
    }
    return node;
  }

  onZoom(increment) {
    this.scaleStyle += increment;
    if (this.scaleStyle > 11)
      this.scaleStyle = 11;
    if (this.scaleStyle < 7)
      this.scaleStyle = 7;
  }

  onImage() {
    let iddom = this.treeClass;
    let node = this.getSelectedNode();
    let keys = this.utilService.stripVN(node.name).split(' ');
    let nameStr = keys.join('_');
    let fileName = nameStr + '.jpg';
    
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'TREE_SELECT_PRINT_JPG_MSG_1'},
      {name: 'data', label: fileName},
      {name: 'msg', label: 'TREE_SELECT_PRINT_JPG_MSG_2'},
    ]);

    this.utilService.alertConfirm('TREE_SELECT_PRINT_JPG', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        const ele = document.getElementById(iddom);
        const dashboardHeight = ele.clientHeight;
        const dashboardWidth = ele.clientWidth;
        let opts = { bgcolor: 'white', width: dashboardWidth, height: dashboardHeight, quality: 0.95 };
        domtoimage.toJpeg(ele, opts).then((imgData:any) => {
          var link = document.createElement('a');
          link.download = fileName;
          link.href = imgData;
          link.click();
        });
      }
    });
  }

  onPdf() {
    let iddom = this.treeClass;
    let node = this.getSelectedNode();
    let keys = this.utilService.stripVN(node.name).split(' ');
    let nameStr = keys.join('_');
    let fileName = nameStr + '.pdf';

    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_1'},
      {name: 'data', label: fileName},
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_2'},
    ]);
    
    this.utilService.alertConfirm('TREE_SELECT_PRINT_PDF', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        let header = node.name;
        let message = this.nodeService.getGeneration(node);
        const ele = document.getElementById(iddom);
        const dashboardHeight = ele.clientHeight;
        const dashboardWidth = ele.clientWidth;
        const options = { bgcolor: 'white', width: dashboardWidth, height: dashboardHeight};
        domtoimage.toPng(ele, options).then((imgData:any) => {
          const doc = new jsPDF(dashboardWidth > dashboardHeight ? 'l' : 'p', 'mm', [dashboardWidth, 1.5 * dashboardHeight]);
          doc.setFont('Roboto-Regular'); // set custom font
          doc.setTextColor("red");
          doc.setFontSize(60);
          let x = dashboardWidth / 2;
          doc.text(header, x, 30);
          doc.setTextColor("blue");
          doc.setFontSize(50);
          doc.text(message, x, 60);
          doc.addImage(imgData, 'PNG', 10, 90, dashboardWidth, dashboardHeight);
          doc.save(fileName, { 'returnPromise': true }).then((status:any) => {
            console.log('TreePage - onPdf - save: ', status);
          });
        });
      }
    });
  }

  async onAdd() {
    let node = this.getSelectedNode();
    let inputs = [
      {type: 'radio', label: this.languageService.getTranslation('CHILD'), value: 'child', checked: true },
      {type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'wife' },
      {type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'husband' }
    ];
    this.utilService.alertRadio('NODE_ALERT_RELATION_HEADER', 'NODE_ALERT_RELATION_MESSAGE', inputs , 'CANCEL', 'OK').then((res) => {
      // console.log('onAdd - res:' , res)
      if (res.data) {
        let relation = res.data;
        let name = 
          (relation == 'child') ? this.languageService.getTranslation('TREE_SELECT_NEW_CHILD_NAME') :
          ((relation == 'wife') ? this.languageService.getTranslation('TREE_SELECT_NEW_WIFE_NAME') :
           this.languageService.getTranslation('TREE_SELECT_NEW_HUSBAND_NAME'));
        let gender = (relation == 'child') ? 'male' : ((relation == 'wife') ? 'female' : 'male');
        if (relation == 'child')
          this.addChild(node, name, gender);
        else
          this.addSpouse(node, name, gender);
      }
    });
  }

  onEdit() {
    let node = this.getSelectedNode();
    this.openNodeModal(node);
  }

  onDelete() {
    let node = this.getSelectedNode();
    // this is main Node, check children
    if (node.family.children && node.family.children.length > 0) {
      let msg = this.utilService.getAlertMessage([
        {name: 'msg', label: 'EDITOR_ALERT_MESSAGE_DELETE_NODE_HAS_CHILDREN'},
        {name: 'data', label: node.name}
      ]);
      this.utilService.alertMsg('EDITOR_ALERT_HEADER_DELETE_NODE_HAS_CHILDREN', msg);
      return;
    }
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'EDITOR_CONFIRM_MESSAGE_DELETE_NODE'},
      {name: 'data', label: node.name + ' (' + this.nodeService.getGeneration(node) + ')'},
    ]);
    
    this.utilService.alertConfirm('EDITOR_CONFIRM_HEADER_DELETE_NODE', msg, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.deleteNode(node);
        this.updateSystemData();
        // return to home
        this.closeSearch();
      }
    });
  }

  scrollToRoot() {
    this.scrollToNode(this.family.nodes[0]);
  }

  scrollToNode(node) {
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

  viewTreeSummary() {
    let title = this.languageService.getTranslation('TREE_SUMMARY_HEADER');

    let nodes = this.nodeService.getFamilyNodes(this.family);
    let lowGen = 100;
    let highGen = 0;
    nodes.forEach(node => {
      if (node.level < lowGen)
        lowGen = node.level;
      if (node.level > highGen)
        highGen = node.level;
    })
    let genData = '' + (highGen-lowGen+1) + ' (' + lowGen + ', ' + highGen + ')';
    const numGen = '<b>' + this.languageService.getTranslation('TREE_SUMMARY_NUM_GENERATIONS') + '</b>: &emsp;' + genData  + '<br/>';
    const numNodes = '<b>' + this.languageService.getTranslation('TREE_SUMMARY_NUM_NODES') + '</b>: &emsp;' + nodes.length  + '<br/>';
    
    let msg = numNodes + numGen;
    msg = msg + '<br/><br/>';
    
    this.utilService.alertMsg(title, msg, 'alert-small');
  }

  viewNodeDetail() {
    // let node:any = this.sNodes[this.searchIdx - 1];?
    let node = this.getSelectedNode();

    let title = node.name;
    let options = [];
    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_GENERATION'), value: node.level});
    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_CHILD_OF'), value: node.pnode.name});
    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_NICK_NAME'), value: node.nick});
    if (node.family.children)
      options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_NUM_CHILDREN'), value: node.family.children.length});

    if (node.family.nodes.length > 1) {
      let spouseNode = null;
      for (let i = 0; i < node.family.nodes.length; i++) {
        if (node.name == node.family.nodes[i]) {
          // use the other node
          spouseNode = (i == 0) ? node.family.nodes[1] : node.family.nodes[0]
          break;
        }
      }
      if (spouseNode) {
        if (spouseNode.gender == 'male')
          options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_HUSBAND'), value: spouseNode.name});
        else
          options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_WIFE'), value: spouseNode.name});
      }
    }

    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_YOB_YOD'), value: (node.yob + ' - ' + node.yod)});
    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_POB'), value: node.pob });
    options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_POR'), value: node.por });

    let msg = this.utilService.getAlertTableMessage(options);
    this.utilService.alertMsg(title, msg, 'alert-small');
  }

  async openNodeModal(node) {
    // console.log('openNodeModal - node : ', node);
    const modal = await this.modalCtrl.create({
      component: NodePage,
      componentProps: {
        'caller': 'tree',
        'node': node
      }
    });

    modal.onDidDismiss().then((resp) => {
      // console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        // console.log('TreePage - onDidDismiss : values: ', values);
        let change = this.nodeService.updateNode(node, values);
        if (change) {
          // there is change
          // console.log('TreePage - onDidDismiss : change');
          node.span = this.nodeService.getSpanStr(node);
          this.updateSystemData();
        }
      }
    });
    return await modal.present();
  }
  
  deleteNode(node: any) {
    // console.log('deleteNode - node: ', node)
    let pnode = node.pnode;
    if (!node.pnode) {
      // this is root
      let nodes = this.family.nodes;
      let newNodes = nodes.filter((n:any) => {
        return (n.name != node.name);
      });
      if (newNodes.length > 0)
        this.family.nodes = newNodes;

    } else {
      let children = [];
      for (let i = 0; i < pnode.family.children.length; i++) {
        let family = pnode.family.children[i];
        let nodes = family.nodes;
        let newNodes = nodes.filter((n:any) => {
          return (n.name != node.name);
        });
        if (newNodes.length > 0) {
          family.nodes = newNodes;
          children.push(family);
        }
      }
      pnode.family.children = (children.length == 0) ? null : children;
    }
  }

  addChild(node: any, name, gender) {
    if (!node.family.children)
      node.family.children = [];
    let childIdx = node.family.children.length + 1;
    let nodeIdx = 1;
    let id = node.id + '-' + childIdx + '-' + nodeIdx;
    let level = '' + (1 + +node.level);
    let newNode = this.nodeService.getEmptyNode(id, level, name, gender);
    let newFamily = {nodes: [newNode]};
    newNode.pnode = node;
    newNode.family = newFamily;
    node.family.children.push(newFamily);
    this.openNodeModal(newNode);
  }

  addSpouse(node: any, name, gender) {
    // console.log('addSpouse - node: ', node)
    let id = node.id;
    let ids = id.split('-');
    // take the last one, increase by 1
    let nodeIdx = ids[ids.length-1];
    id = id.substring(0, id.lastIndexOf('-'));
    id = id + '-' + (+nodeIdx+1);
    let newNode = this.nodeService.getEmptyNode(id, node.level, name, gender);
    newNode.family = node.family;
    newNode.pnode = node.pnode;
    node.family.nodes.push(newNode);
    this.openNodeModal(newNode);
  }

  updateSystemData() {
    // update data for node
    // save full family to local memory and json
    this.familyService.saveFullFamily(this.family).then(status => {});
  }

}
