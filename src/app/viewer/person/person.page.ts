import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { HtmlService } from '../../services/html.service';
import { DataService } from '../../services/data.service';
import { FtTreeService } from '../../services/ft-tree.service';
import { Family, Node, FAMILY} from '../../services/family.model';
// import { FONTS_FOLDER, DEBUGS, PHOTO_SIZE } from '../../../environments/environment';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-person',
  templateUrl: './person.page.html',
  styleUrls: ['./person.page.scss'],
})
export class PersonPage implements OnInit {

  @Input() caller: string;
  @Input() nodeid: string;

  @ViewChild('canvasContainer') canvasRef: ElementRef = null;
  
  FONTS_FOLDER = FONTS_FOLDER;
  modalDataResponse: any;
  family:Family = FAMILY;
  familyView:any = {};
  selectPeople: string = null;
  selectPeoplePlaceholder: string = null;
  title: string = '';
  peopleNodes: Node[] = [];
  justClicked = false;
  doubleClicked = false;
  selectedNode: any = null;
  selectedNodeName: string = '';
	editor: any;
  settings: any;

  treeClass = 'person-tree'
  viewMode = 1;

  isPopover = false;
  timeEnter: number = 0;
  info: any;
	pass_away: any;

	images: any;

	image1: any = { w: '187px', h: '269px', url: '' };
	image2: any = { w: '187px', h: '269px', url: '' };

  constructor(
    public modalCtrl: ModalController,
    public popoverController: PopoverController,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private htmlService: HtmlService,
    private dataService: DataService,
    private languageService: LanguageService,
    public ftTreeService: FtTreeService,
  ) {}

  ngOnInit() {
    if (DEBUGS.PERSON)
      console.log('PersonPage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.PERSON)
      console.log('PersonPage - ionViewWillEnter');
    this.startFromStorage();
		this.ftTreeService.reset();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.PERSON)
      console.log('PersonPage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readAncestorData().then((data:any) => {
      if (DEBUGS.PERSON)
        console.log('PersonPage - startFromStorage - data: ', data);
      this.info = data.info;
			this.images = data.images;
      this.title = this.info.description;
      this.start(data.family);
			// this.setupEditor('');
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);

		// console.log('nodeid: ', this.nodeid);

		if (this.nodeid != '') {
			let selectedNode = this.nodeService.getFamilyNode(this.family, this.nodeid);
			this.peopleNodes = [selectedNode.name];
			this.onNodeSelect(selectedNode);
		} else {
			this.peopleNodes = this.familyService.getPeopleNodes (this.family);
			// console.log('this.peopleNodes: ', this.peopleNodes);
		}
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.familyView = {};
  }

  async onExit() {
    await this.modalCtrl.dismiss({status: 'cancel'});
  }
  
  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearPeopleNodes() {
    this.selectPeople = null;
  }

  closePeopleNodes() {
    if (DEBUGS.PERSON)
      console.log('PersonPage - closePeopleNodes - selectPeople: ', this.selectPeople);
    this.selectedNode = null;
    if (this.selectPeople) {
			let nodeSelect = this.familyService.searchPeopleNodes(this.family, this.selectPeople);
			this.onNodeSelect(nodeSelect);
		}
  }
  
  keyupPeopleNodes(event) {
    if (DEBUGS.PERSON)
      console.log('PersonPage - keyup: ', event.target.value);
    if (event.key !== 'Enter')
      return;
  }

  // --------- END ng-select ----------

	onNodeSelect(node: Node) {
    if (DEBUGS.PERSON)
      console.log('PersonPage - onNodeSelect - node: ', node);

		if (Array.isArray(node.desc)) {
			// convert to html if desc is an array
			let dataSource = { images: this.images, textarea: true }
			let pageHtmls = this.htmlService.convertArrayToHtmls(dataSource, node.desc);
			let html = this.htmlService.convertHtmls2Html(pageHtmls);
			node.desc = html;
			let dom = document.getElementById('detail-person');
			dom.innerHTML = node.desc;
		};

		this.onNodeDisplay(this.images, node);

		this.selectedNodeName = node.name;
		this.selectPeople = node.name + this.nodeService.getFullDetail(node)
		this.selectedNode = node;
		// this.selectedNode.nclass = 'node-select';
		this.familyView = this.familyService.getSelectedPerson(this.selectedNode);
		
		// evaluate living status
		let currentYear = new Date().getFullYear();
		this.pass_away =
			(node.yod && node.yod !== '') ||
			(node.dod && node.dod != '') ||
			(node.yob && node.yob != '' && (+node.yob + 100 < currentYear) )

  }

	onNodeDisplay(images: any, node: Node) {

		if (node.desc) {
			let dom = document.getElementById('detail-person');
			dom.innerHTML = node.desc;
		}
	
		let url = '';
		if (node.photo != '') {
			let pdata = images[node.photo];
			url = pdata.url;
		} else {
			let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
			url = "../assets/icon/" + avatar;
		}
		let frameUrl = "../../../assets/icon/bia.png";

		let PHOTO = { frame: { width: 140 , height: 138 }, view: { width: 110, height: 110 } };
		let w1 = PHOTO.frame.width;
		let h1 = PHOTO.frame.height;
		let w2 = PHOTO.view.width;
		let h2 = PHOTO.view.height;
		
		let top = (h1 - h2) / 2 + 2;
		let left = (w1 - w2) / 2 + w2;
		if (DEBUGS.PERSON) {
			console.log('w1, h1: ', w1, h1);
			console.log('w2, h2: ', w2, h2);
			console.log('top, left: ', top, left);
		}
		this.image1.url = frameUrl;
		this.image1.w = '' + parseInt('' + w1)  + 'px';
		this.image1.h = '' + parseInt('' + h1)  + 'px';
		this.image2.url = url;
		this.image2.w = '' + parseInt('' + w2) + 'px';
		this.image2.h = '' + parseInt('' + h2) + 'px';
		let root = document.documentElement;
		root.style.setProperty('--app-view-person-top', '' + parseInt('' + top) + 'px');
		root.style.setProperty('--app-view-person-left', '-' + parseInt('' + left) + 'px');

	}
	
  //
  // ------------- TREE -------------
  //
	
  onLeafSelected (node: any) {
  }
}
