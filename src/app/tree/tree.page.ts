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
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';
import '../../assets/js/Roboto-Regular-normal.js';

declare var ancestor:any;
import * as $ from 'jquery';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  @ViewChild('ngSelectPeople') ngSelectPeople: NgSelectComponent;

  modalDataResponse: any;
  family:Family = Object.create(FAMILY);
  familyView:Family = Object.create(FAMILY);
  nodeView = false;
  people: Observable<string[]>;
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
    console.log('TreePage - ngOnInit');
    this.treeClass = 'vertical-tree';
    this.scaleStyle = 10;
    this.phabletDevice = environment.phabletDevice;
    this.startFromStorage();
  }

  ionViewWillEnter() {
    console.log('TreePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    console.log('TreePage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamily().then((family:any) => {
      // console.log('FamilyService - startFromStorage - family: ', family);
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      // console.log('FamilyService - msg: ', msg);
      this.start(family);
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    // console.log('FamilyService - start -fullFamily: ', this.family);
    this.familyService.savePeopleJson(family, 'people').then(status => {});
    this.familyView = this.family;
    this.selectPeopleNotFoundText = this.languageService.getTranslation('TREE_SEARCH_ITEM_NOT_FOUND');
    this.selectPeoplePlaceholder = this.languageService.getTranslation('TREE_SEARCH_PLACEHOLDER');
    // reset search
    this.searchView = false;
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

  onLeafSelected (node) {
    // console.log('TreePage - onLeafSelected: ', node);
  }
  
  onHome() {
    if (this.searchView) {
      let node = this.sNodes[this.searchIdx - 1];
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
    let tree = this.treeClass;
    $(document).ready(function(){
      // let uls = $('.' + tree + ' ul');
      // console.log('startTree - uls: ', uls);
      // uls = $('.' + tree + ' ul.active');
      // if (uls && uls.length)
      //   console.log('startTree - uls with class active: ', uls);

      $('.' + tree + ' ul').hide();
      // show the root ul
      $('.' + tree + '>ul').show();
      // show all uls with class='active'
      $('.' + tree + ' ul.active').show();
      // now display li
      $('.' + tree + ' li').off('click').on('click', function (event: any) {
        // let uls = $('.' + tree + ' ul');
        // // console.log('startTree - click - treeViewMax: ', this.treeViewMax);
        // console.log('startTree - click - uls: ', uls);
        // console.log('startTree - click - this: ', this);

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
      // let uls = $('.' + tree + ' ul');
      // console.log('showFullTree - before show full - uls: ', uls);
      // show all
      $('.' + tree + ' ul').show();
    });
  }

  resetTreeAfterSearch() {
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 
  clearPeople() {
    // console.log('TreePage - clear');
    this.selectPeople = null;
    this.typeStr = '';
    this.people = this.typeahead.getJson('', 'people');
  }

  closePeople() {
    // console.log('TreePage - close: ', this.selectPeople);
    this.startSearch(this.selectPeople.name);
  }

  keydownPeople(event) {
    if (event.key !== 'Enter')
      return;
    // console.log('TreePage - keydown: Enter: ', this.typeStr);
    this.ngSelectPeople.close();
    this.startSearch(this.typeStr);
  }

  keyupPeople(event) {
    let term = event.target.value;
    // console.log('TreePage - keyup - term: ', term);
    this.typeStr = term;
    this.people = this.typeahead.getJson(term, 'people');
  }

  keydownInDropdownPeople(event) {
    return false;
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
    this.nodeView = false;
    this.resetTreeAfterSearch();
    this.startFromStorage();
  }

  startSearch(searchStr) {
    // console.log('TreePage - startSearch - searchStr: ', searchStr)
    this.setTreeBeforeSearch();
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

  onZoom(increment) {
    this.scaleStyle += increment;
    if (this.scaleStyle > 11)
      this.scaleStyle = 11;
    if (this.scaleStyle < 7)
      this.scaleStyle = 7;
  }

  onImage() {
    let iddom = this.treeClass;
    this.utilService.alertConfirm('TREE_SELECT_PRINT_JPG', 'TREE_SELECT_PRINT_JPG_MSG', 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        let node:any = this.sNodes[this.searchIdx - 1];
        const ele = document.getElementById(iddom);
        // console.log('TreePage - onImage - ele.width, height: ', ele.clientWidth, ele.clientHeight);
        let rect:any = ele.getBoundingClientRect();
        let width = rect.width + 20;
        let height = rect.height + 20;
        let keys = this.utilService.stripVN(node.name).split(' ');
        let nameStr = keys.join('_')
        let options = {
          quality: 0.95,
          backgroundColor: '#f0f1f2',
          width: width,
          height: height
        }
        htmlToImage.toJpeg(ele, options).then((dataUrl:any) => {
          var link = document.createElement('a');
          link.download = 'family_' + nameStr + '.jpeg';
          link.href = dataUrl;
          link.click();
        });
      }
    });
  }

  onPdf() {

    let node:any = this.sNodes[this.searchIdx - 1];
    let iddom = this.treeClass;
    let keys = this.utilService.stripVN(node.name).split(' ');
    let nameStr = keys.join('_');
    let fileName = ancestor + '_' + nameStr + '.pdf';
    this.utilService.alertConfirm('TREE_SELECT_PRINT_PDF', 'TREE_SELECT_PRINT_PDF_MSG', 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        let node:any = this.sNodes[this.searchIdx - 1];
        let header = node.name;
        let message = this.nodeService.getGeneration(node);
        const dashboard = document.getElementById(iddom);
        const dashboardHeight = dashboard.clientHeight;
        const dashboardWidth = dashboard.clientWidth;
        console.log('onPdf - dashboardWidth: ', dashboardWidth, dashboardHeight);
        const options = { background: 'white', width: dashboardWidth, height: dashboardHeight};
        domtoimage.toPng(dashboard, options).then((imgData:any) => {
          const doc = new jsPDF(dashboardWidth > dashboardHeight ? 'l' : 'p', 'mm', [dashboardWidth, dashboardHeight * 2]);
          const imgProps = doc.getImageProperties(imgData);
          console.log('TreePage - imgProps.width: ', imgProps.width, imgProps.height);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          console.log('TreePage - pdfWidth: ', pdfWidth, pdfHeight);
          doc.setFont('Roboto-Regular'); // set custom font
          doc.setTextColor("red");
          doc.setFontSize(60);
          doc.text(header, 10, 20);
          doc.setTextColor("blue");
          doc.setFontSize(40);
          doc.text(message, 10, 40);
          doc.addImage(imgData, 'PNG', 10, 60, pdfWidth, pdfHeight);
          // doc.addImage(imgData, 'PNG', 10, 60, dashboardWidth, dashboardHeight);
          doc.save(fileName, { 'returnPromise': true }).then((status:any) => {
            console.log('TreePage - onPdf - save: ', status);
          });
        });
      }
    });
  }

  async onAdd() {
    let node:any = this.sNodes[this.searchIdx - 1];

    let inputs = [
      {type: 'radio', label: this.languageService.getTranslation('CHILD'), value: 'child' },
      {type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'wife' },
      {type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'husband' }
    ];
    this.utilService.alertRadio('NODE_ALERT_RELATION_HEADER', 'NODE_ALERT_RELATION_MESSAGE', inputs , 'CANCEL', 'OK').then((res) => {
      // console.log('onAdd - res:' , res)
      if (res) {
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
    let node:any = this.sNodes[this.searchIdx - 1];
    this.openNodeModal(node);
  }

  onDelete() {
    let node:any = this.sNodes[this.searchIdx - 1];
    // this is main Node, check children
    if (node.family.children && node.family.children.length > 0) {
      let message = this.languageService.getTranslation('EDITOR_ALERT_MESSAGE_DELETE_NODE_HAS_CHILDREN') + '[' + node.name + ']';
      this.utilService.alertMsg('EDITOR_ALERT_HEADER_DELETE_NODE_HAS_CHILDREN', message);
      return;
    }
    let message = this.languageService.getTranslation('EDITOR_CONFIRM_MESSAGE_DELETE_NODE') + ': ' + node.name;
    this.utilService.alertConfirm('EDITOR_CONFIRM_HEADER_DELETE_NODE', message, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.deleteNode(node);
        this.updateSystemData();
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
    let title = 'Tree Summary';
    let header = '<pre style="margin-left: 2.0em;">';
    let msg = 'Summary';
    msg = header + msg + '<br><br></pre>';
    this.utilService.alertMsg(title, msg, 'alert-small');
  }

  viewNodeDetail() {
    let node:any = this.sNodes[this.searchIdx - 1];
    let title = node.name;
    let level = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_GENERATION') + '</b>' + ': ' + node.level + '<br>';
    let parent = (node.pnode) ? '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_CHILD_OF') + '</b>' + ': ' + node.pnode.name + '<br>' : '';
    let nick = (node.nick == '') ? '' : '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_NICK_NAME') + '</b>' + ': ' + node.nick + '<br>';
    let children = '';
    if (node.family.children)
      children = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_NUM_CHILDREN') + '</b>' + ': ' + node.family.children.length + '<br>';
    let spouse = '';
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
          spouse = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_HUSBAND') + '</b>' + ': ' + spouseNode.name + '<br>';
        else
        spouse = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_WIFE') + '</b>' + ': ' + spouseNode.name + '<br>';
      }
    }

    let years = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_YOB_YOD') + '</b>' + ': ' + node.yob + ' - ' + node.yod + '<br>';
    let birthPlace = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_POB') + '</b>' + ': ' + node.pob + '<br>';
    let deathPlace = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_POD') + '</b>' + ': ' + node.pod + '<br>';
    let residence = '<b>' + this.languageService.getTranslation('TREE_ALERT_VIEW_POR') + '</b>' + ': ' + node.por + '<br>';

    let header = '<pre style="margin-left: 2.0em;">';
    let msg = level + parent + nick + years + birthPlace + deathPlace + residence + spouse + children;
    
    msg = header + msg + '<br><br></pre>';
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
