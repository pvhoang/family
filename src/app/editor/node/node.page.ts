import { Component, OnInit, ViewChild} from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from '../../components/popover/popover.component';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { EditPage } from './edit/edit.page';
import { TypeaheadService } from '../../services/typeahead.service';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

const WAIT_TIME = 500;

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit {

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
    this.family = this.familyService.buildFullFamily(family);
    console.log('NodePage - family: ', family);

    this.peopleNodes = this.getPeopleNodes (this.family);
    this.nodeItems = this.nodeService.getInfoList();
    this.nodeItem = null;
    this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.nodeItemPlaceholder = this.languageService.getTranslation('NODE_SELECT_EMPTY_DATA');
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
    if (this.selectPeople)
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
        this.presentSelectPopover();
    }, WAIT_TIME);
  }

  async presentSelectPopover() {
    this.themeService.setAlertSize({ width: 250, height: 320 });
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        'node': this.selectedNode,
        'isChildOK': this.isChildOK,
        'isBranchOK': this.isChildOK,
        'header': this.languageService.getTranslation('NODE_POPOVER_HEADER')
      },
      cssClass:'popover',
      side: 'right',
      alignment: 'end',
      // translucent: true,
      dismissOnSelect: true,
      backdropDismiss: false
      // backdropDismiss: true
    });
    popover.onDidDismiss().then((result) => {
      if (DEBUGS.NODE)
        console.log('NodePage - presentSelectPopover - result: ', result);
      this.isPopover = false;
      switch (result.data) {
				case 'onCancel':
          break;
        case 'onEdit':
          this.onEdit();
          break;
        case 'onAdd':
          this.onAdd();
          break;
        case 'onAddBranch':
            this.onAddBranch();
            break;
        case 'onDelete':
          this.onDelete();
          break;
      }
    });
    await popover.present();
  }

  onEdit() {
    this.openEditModal(this.selectedNode);
  }

  async openEditModal(node: Node) {
    if (DEBUGS.NODE)
      console.log('NodePage - openEditModal - node: ', node);
    const modal = await this.modalCtrl.create({
      component: EditPage,
      componentProps: {
        'caller': 'editor',
        'node': node,
        'family': this.family,
        'info': this.info,
      },
			backdropDismiss:false
    });

    modal.onDidDismiss().then((resp) => {
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        if (DEBUGS.NODE)
          console.log('NodePage - openEditModal - values, node : ', values, node);
        let change = this.nodeService.saveValues(node, values);
        if (change) {
          // there is change
          if (DEBUGS.NODE)
            console.log('TreePage - onDidDismiss : change');
          this.updateSystemData(node);
          this.selectPeople = node.name + this.nodeService.getFullDetail(node);
          if (DEBUGS.NODE)
            console.log('TreePage - onDidDismiss : OK');
        }
      }
    });
    return await modal.present();
  }

  async onAdd() {

    let node = this.selectedNode;

    let inputs = [];
    if (!node.pnode)
      // root node, add father
      inputs.push({type: 'radio', label: this.languageService.getTranslation('FATHER'), value: 'FATHER', checked: false });
    if (node.gender == 'female')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'HUSBAND' });
    else if (node.gender == 'male')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'WIFE' });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('SON'), value: 'SON', checked: true });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('DAUGHTER'), value: 'DAUGHTER', checked: false });

    this.utilService.alertRadio('NODE_ADD_RELATION_HEADER', '', inputs , 'CANCEL', 'OK').then((res) => {
      console.log('onAdd- res: ', res);
      if (res.data) {

        let relation = res.data;
        let ancestorName = this.nodeService.getChildFamilyName(this.selectedNode);

        // let firstChar = ancestorName.charAt(0);
        // ancestorName = firstChar + ancestorName.substring(1);

        let gender = (relation == 'FATHER' || relation == 'HUSBAND' || relation == 'SON') ? 'male' : 'female';
        // let lName = this.utilService.stripVN(ancestorName);

        let mName = (gender == 'male') ? 'văn' : 'thị';
        let fName = (gender == 'male') ? 'nam' : 'nữ';
        // let name = this.utilService.stripVN(ancestorName) + ' ...';
        let name = ancestorName + ' ' + mName + ' ' + fName + ' ...';
        let node: any;
        if (relation == 'FATHER') {
          this.addFather(name);
        } else {
          if (relation == 'SON' || relation == 'DAUGHTER')
            node = this.nodeService.addChild(this.selectedNode, name, gender, relation);
          else
            node = this.nodeService.addSpouse(this.selectedNode, name, gender, relation);
          this.updateSystemData(node);
          this.onNodeSelect(node);
        }
      }
    });
  }

  async onAddBranch() {

    let node: Node = this.selectedNode;
    console.log('NodePage - onAddBranch - node: ', node);

    this.dataService.readBranchNames().then((names:[]) => {
      console.log('NodePage - onAddBranch - names: ', names);

      let inputs = [];
      names.forEach((name: string) => {
        inputs.push({type: 'radio', label: name, value: name, checked: false });
      })
      console.log('NodePage - onAddBranch - inputs: ', inputs);

      this.utilService.alertRadio('NODE_ADD_RELATION_HEADER', '', inputs , 'CANCEL', 'OK').then((res) => {
        console.log('onAddBranch - res: ', res);
        if (res.data) {
          let branch = res.data;
          this.dataService.readBranch(branch).then((bFamily: Family) => {
            console.log('NodePage - onAddBranch - bFamily: ', bFamily);
            let bNode: any = bFamily.nodes[0];
            let relation = 'SON';
            bNode.pnode = node;
            bNode.family = bFamily;
            bNode.relation = this.languageService.getTranslation(relation);
            node.family.children.push(bFamily);

						// rebuild family with new nodes
						this.family = this.familyService.buildFullFamily(this.family);
            this.familyView = this.family;

						// and update
            this.updateSystemData(node);
            this.onNodeSelect(node);
          });
        }
      });
    });
  }

  onDelete() {
    let node = this.selectedNode;
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_1'},
      {name: 'data', label: node.name},
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_2'},
    ]);
    this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.nodeService.deleteNode(this.family, node);
        this.updateSystemData(node);
        if (node == this.selectedNode)
          // reset search box
          this.clearPeopleNodes();
      }
    });
  }

  addFather(name: string) {
    // this.dataService.readFamily().then((family:any) => {
    //   let node: Node = { name: name, gender: 'male', yob: '1900' } 
    //   let newFamily: Family= {
    //     version: family.version,
    //     nodes: [ node ],
    //     children: [ { nodes: family.nodes, children: family.children } ]
    //   };
    //   this.dataService.saveFamily(newFamily).then(status => {
    //     this.startFromStorage();
    //   });
    // });
  }

  updateSystemData(node: any) {
    // update data for node
    node.span = this.nodeService.getSpanStr(node);
    // save full family to local memory and update people list
    this.familyService.saveFullFamily(this.family).then(status => {
      this.peopleNodes = this.getPeopleNodes (this.family);
    });
  }

}
