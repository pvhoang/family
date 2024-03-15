import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { EditorService } from '../../services/editor.service';
import { DataService } from '../../services/data.service';
import { FtTreeService } from '../../services/ft-tree.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-person',
  templateUrl: './person.page.html',
  styleUrls: ['./person.page.scss'],
})
export class PersonPage implements OnInit {

  @Input() caller: string;
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

	image1: any = { w: '187px', h: '269px', url: '' };
	image2: any = { w: '187px', h: '269px', url: '' };

  constructor(
    public modalCtrl: ModalController,
    public popoverController: PopoverController,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private editorService: EditorService,
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
      this.title = this.info.description;
      this.start(data.family);
			// this.setupEditor('');
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    this.peopleNodes = this.familyService.getPeopleNodes (this.family);
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
    // reset nclass
    if (this.selectedNode)
      this.selectedNode.nclass = this.nodeService.updateNclass(this.selectedNode);
    this.selectedNode = node;
		
		// read images from local storage
		this.dataService.readItem('images').then((images:any) => {
			if (Array.isArray(node.desc)) {
				// convert to html if desc is an array
				let html = this.editorService.convertArrayToHtml(images, node.desc, true);
				// html = 'Ông bà sinh:<br><p style="padding-left: 20px;">1. Phan <b>Văn</b> Nguyên Trưởng Nam</p>';
				// html =  'Ông bà sinh:<br><div class="viewer-home-container-left viewer-home-container-padding-20">1. Phan Văn Nguyên Trưởng Nam</div>';
				// html =  'Ông bà sinh:<br><div class="viewer-home-container-center">1. Phan Văn Nguyên Trưởng Nam</div>';
				node.desc = html;
				// console.log('PersonPage - onNodeSelect - html: ', html);
			};
			this.onNodeDisplay(images, node);
		});
  }

	onNodeDisplay(images: any, node: Node) {
		this.selectedNodeName = node.name;
    this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    this.selectedNode.nclass = 'node-select';
    this.familyView = this.familyService.getSelectedPerson(this.selectedNode);

		// setup for photo display on top
		if (node.dod == '' && node.pod == '')
			return;

		let w2 = 1000;
		let h2 = 1000;
		let url = '';
		if (node.photo != '') {
			let pdata = images[node.photo];
			// console.log('pdata: ', pdata);
			w2 = pdata.width;	// 128
			h2 = pdata.height;	// 96
			url = pdata.url;
		} else {
			let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
			url = "../assets/icon/" + avatar;
		}
		// calculate scale
		let w1 = 187;
		let h1 = 269;
		let portrait = w2 < h2;
		let bigPhoto = w2 > w1 || h2 > h1;
		let scale = w2 / h2;
		if (bigPhoto) {
			w1 = 0.6 * w1;
			h1 = 0.6 * h1;
			// reset photo
			if (portrait) {
				w2 = w1;
				h2 = w2 / scale;
			} else {
				h2 = h1;
				w2 = h2 * scale;
			}
		} else {
		}
		// add 30%
		w1 = 1.3 * w2;
		h1 = 1.30 * h2;
		let top = (h1 - h2) / 2;
		let left = (w1 - w2) / 2 + w2;

		// top = 40;
		// left = 40;
		// top = 80;
		// left = 290;
		// console.log('w1, h1: ', w1, h1);
		// console.log('w2, h2: ', w2, h2);
		// console.log('top, left: ', top, left);

		this.image1.url = "../../../assets/icon/bia-mo.png";
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
