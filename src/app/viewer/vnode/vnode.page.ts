import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { TreePage } from './tree/tree.page';

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
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {
    if (DEBUGS.VNODE)
      console.log('VnodePage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.VNODE)
      console.log('VnodePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.VNODE)
      console.log('VnodePage - ionViewWillLeave');
	}

	ngAfterViewInit(): void {
		if (DEBUGS.VNODE)
      console.log('VnodePage - ngAfterViewInit');
	}

  startFromStorage() {
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.VNODE)
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
    this.peopleNodes = this.familyService.getPeopleNodes (this.family);
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
  
	//
  // ------------- TREE -------------
  //
  
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
    if (DEBUGS.VNODE)
      console.log('NodePage - closePeopleNodes - selectPeople: ', this.selectPeople);
    this.selectedNode = null;
		if (this.selectPeople) {
			let nodeSelect = this.familyService.searchPeopleNodes(this.family, this.selectPeople);
			this.onNodeSelect(nodeSelect);
		}
  }
  
  keyupPeopleNodes(event) {
    if (DEBUGS.VNODE)
      console.log('NodePage - keyup: ', event.target.value);
    if (event.key !== 'Enter')
      return;
  }

  onNodeInfoPopover(item: any) {
    if (DEBUGS.VNODE)
      console.log('NodePage - onNodeInfoPopover: ', item);
    this.nodeItem = item.id;
    if (this.nodeItem == 'all')
      this.nodeItem = null;
    this.peopleNodes = this.familyService.getPeopleNodes (this.family, this.nodeItem)
    this.selectPeople = null;
    if (this.nodeItem == null) {
      this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    } else {
			this.nodeItemMessage = this.languageService.getTranslation('NODE_MISSING_ITEM_1') + item.name +
			this.languageService.getTranslation('NODE_MISSING_ITEM_2') + this.peopleNodes.length;
    }
  }

  // --------- END ng-select ----------
  
  onNodeSelect(node: Node, openTask?: any) {

    if (DEBUGS.VNODE)
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
			cssClass: 'modal-dialog',
			backdropDismiss:false,
    });

    modal.onDidDismiss().then((resp) => {
      console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      this.selectedNode.nclass = 'node-select';
    });
    return await modal.present();
  }

}
