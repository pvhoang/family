import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { FtTreeService } from '../../services/ft-tree.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { TreePage } from './tree/tree.page';
import { PinchZoomComponent } from '../../components/pinch-zoom/pinch-zoom.component';

const WAIT_TIME = 500;

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-vnode',
  templateUrl: './vnode.page.html',
  styleUrls: ['./vnode.page.scss'],
})
export class VnodePage implements OnInit {

  @Input() caller: string;

	@ViewChild('myPinch') pinchZoom: PinchZoomComponent;

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
    public ftTreeService: FtTreeService,
  ) {}

  ngOnInit() {
    if (DEBUGS.VNODE)
      console.log('VnodePage - ngOnInit');
    this.startFromStorage();
		this.ftTreeService.reset();
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

	// ngAfterViewInit1(): void {
	// 	if (DEBUGS.VNODE)
  //     console.log('VnodePage - ngAfterViewInit');
	// 	// this.pinchZoom.toggleZoom();
	// 	// scale MUST BE between 0.2 - 1.0
	// 	// this.pinchZoom.setInitialZoom(0.4);
	// 		// document.getElementById("double-tap").addEventListener("touchstart", this.tapHandler);
	// }

// tapedTwice = false;

// tapHandler(event: any) {
// 	console.log('tapHandler: ', this.tapedTwice);
//     if(!this.tapedTwice) {
// 			this.tapedTwice = true;
//         setTimeout( () => { this.tapedTwice = false; }, 200 );
//     } else {
// 			event.preventDefault();
// 			//action on double tap goes below
// 			alert('You tapped me Twice !!!');
// 		}
//  }

//  clickTimer = null;

// touchStart(event: any) {
//     if (this.clickTimer == null) {
// 			this.clickTimer = setTimeout(function () {
// 				this.clickTimer = null;
// 				alert("single");
// 			}, 500)
//     } else {
// 				event.preventDefault();
//         clearTimeout(this.clickTimer);
//         this.clickTimer = null;
//         alert("double");
//     }
// }

	ngAfterViewInit(): void {
		if (DEBUGS.VNODE)
      console.log('VnodePage - ngAfterViewInit');
		// this.pinchZoom.toggleZoom();
		// scale MUST BE between 0.2 - 1.0
		// this.pinchZoom.setInitialZoom(0.4);
		// var el = document.getElementById('touch-me');
		
		// el.addEventListener('touchstart', this.touchStart);

		// el.addEventListener('touchstart', () => {
    //   console.log('VnodePage - ngAfterViewInit - touch start!');
		// 	if (this.scaleStyle > 2)
		// 		this.scaleStyle--;
		// });

		// el.addEventListener('touchstart', (event: any) => {
    //   console.log('VnodePage - ngAfterViewInit - touchstart!');
		// 	// alert('You touchstart me once !!!');
		// 	if (this.scaleStyle < 10)
		// 		this.scaleStyle++;

		// });

		// el.addEventListener('touchend', () => {
    //   // console.log('VnodePage - ngAfterViewInit - touchend!');
		// 	// alert('You tapped me once !!!');
		// });

		// el.addEventListener('double-tap', () => {
    //   console.log('VnodePage - ngAfterViewInit - double-tap!');
		// 	if (this.scaleStyle > 2)
		// 			this.scaleStyle--;
		// });

		// el.addEventListener('doubleTap', () => {
    //   console.log('VnodePage - ngAfterViewInit - doubleTap!');
		// 	if (this.scaleStyle > 2)
		// 			this.scaleStyle--;
		// });

		// el.addEventListener("dblclick", (event: any) => {
    //   console.log('VnodePage - ngAfterViewInit - dblclick!');
		// 	// alert('You dblclick me Twice !!!');
		// 	if (this.scaleStyle > 2)
		// 			this.scaleStyle--;
		// });
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
  // scaleStyle = 10;
	// getZoomStyle() {
  //   let scale = this.scaleStyle / 10;
  //   let styles = {
  //     'zoom': scale,
  //     '-moz-transform': 'scale(' + scale + ')',
  //     '-moz-transform-origin': '0 0',
  //     '-o-transform': 'scale(' + scale + ')',
  //     '-o-transform-origin': '0 0',
  //     '-webkit-transform': 'scale(' + scale + ')',
  //     '-webkit-transform-origin': '0 0'
  //   };
  //   return styles;
  // }

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
