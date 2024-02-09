import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { EditorService } from '../../services/editor.service';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { FtTreeService } from '../../services/ft-tree.service';
import { ThemeService } from '../../services/theme.service';
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
  selectedNode: Node = null;
  selectedNodeName: string = '';
  isChildOK = false;

  treeClass = 'person-tree'
  viewMode = 1;

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
    private fbService: FirebaseService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private editorService: EditorService,
    private dataService: DataService,
    private languageService: LanguageService,
    private themeService: ThemeService,
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
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.PERSON)
        console.log('PersonPage - startFromStorage - data: ', data);
      this.info = data.info;
      this.title = this.info.description;
      this.start(data.family);
      
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    // console.log('PersonPage - start - family: ', this.family);
    this.peopleNodes = this.familyService.getPeopleNodes (this.family);
    this.nodeItems = this.nodeService.getInfoList();
    this.nodeItem = null;
    this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.nodeItemPlaceholder = this.languageService.getTranslation('NODE_SELECT_EMPTY_DATA');

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
		// convert to html for display
		node.desc = this.editorService.replaceDescTextStyle(node.desc);
    this.selectedNode = node;

		this.dataService.readItem('images').then((images:any) => {
			let resolves = this.editorService.convertDocumentTemplate(images, node.desc);
			if (resolves.length > 0) {
				// console.log('PersonPage - onNodeSelect - node.desc: ', node.desc);
				// console.log('PersonPage - onNodeSelect - resolves: ', resolves);
				let html:any = node.desc.slice(0);
				for (let i = 0; i < resolves.length; i++) {
					let data = resolves[i];
					let docStr = '[' + data.docStr + ']';
					html = html.replaceAll(docStr,data.html);
				}
				// convert html to css based text and to desc
				node.desc = this.editorService.replaceDescTextStyle(html);
				this.onNodeDisplay(node);
			} else {
				this.onNodeDisplay(node);
			}
		});
  }

	onNodeDisplay(node: Node) {

		this.selectedNodeName = node.name;
    this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    let ancestorName = this.info.family_name;
    this.isChildOK = this.nodeService.isAncestorName(ancestorName, node);
    this.selectedNode.nclass = 'node-select';

    console.log('onNodeDisplay - selectedNode: ', this.selectedNode);

    if (this.selectedNode.yod != '' || this.selectedNode.dod != '' || this.selectedNode.pod != '') {
      const ele = document.getElementById('canvasContainer');
      if (!ele) {
        setTimeout(() => {  
          this.drawTomb();
        }, 1000);
      } else {
        this.drawTomb();
      }
    }
    this.familyView = this.familyService.getSelectedPerson(this.selectedNode);
    this.startTree();

	}

  //
  // ------------- TREE -------------
  //
  startTree() {
    // set photo for each node
    let nodes = this.nodeService.getFamilyNodes(this.familyView);
    nodes.forEach((node:any) => {
      this.getPhotoUrl(node).then((url:any) => {
        node.photoUrl = url;
      });
    })
    this.themeService.setScreenSize(nodes, true);
  }

  onLeafSelected (node) {
    if (DEBUGS.TREE)
      console.log('TreePage - onLeafSelected - node: ', node);
  }

  getPhotoUrl(node) {
    return new Promise((resolve) => {
      let photoName = node.photo;
      if (photoName == '') {
        let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
        let url = "../assets/icon/" + avatar;
        resolve(url)
      } else {
        let ancestor = this.info.id;
        this.fbService.downloadImage(ancestor, photoName)
        .then((imageURL:any) => {
          resolve(imageURL)
        })
        .catch((error) => {
          console.log('ERROR: getPhotoUrl: ', error);
        });
      }
    });
  }

  drawTomb() {
    let node = this.selectedNode;
    const img = new Image();
		img.className = "person-tomb-image";
    img.src = "../assets/icon/tomb-1.png";
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    // load img to canvas
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      let imgWidth = canvas.width;
      let imgHeight = imgWidth / ratio;
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
      let url = '';
      if (node.photo != '') {
        this.fbService.downloadImage(this.info.id, node.photo).then((imageURL:any) => {
          url = imageURL;
          this.drawPhoto(ctx, url, imgWidth, imgHeight);
        })
      } else {
        let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
        url = "../assets/icon/" + avatar;
        this.drawPhoto(ctx, url, imgWidth, imgHeight);
      }
			// 'https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png',
      let title = (node.gender == 'male') ? this.languageService.getTranslation('MR') : this.languageService.getTranslation('MRS');

      this.drawGender(ctx, title, imgWidth, imgHeight);
      this.drawName(ctx, node.name, imgWidth, imgHeight);
    };
  }

  drawPhoto(ctx: any, url: any, imgConWidth: any, imgConHeight: any) {
    const tombWidth = (1 / 3) * imgConWidth;
    const img = new Image();
		// img.classList.add('person-tomb-image');
		// img.className = "person-tomb-image";
    img.src = url;
		console.log('img: ', img);
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      let imgWidth = tombWidth * 0.6;
      let imgHeight = imgWidth / ratio;
      // center image
      const positionX = imgConWidth / 2 - imgWidth / 2 + tombWidth * 0.05;
      const positionY = 0.62 * imgConHeight;
      ctx.drawImage(img, positionX, positionY, imgWidth, imgHeight);
    };
  }

  drawName(ctx, fullName, imgWidth, imgHeight) {
    const size = 0.03 * imgWidth;
    // const font = 'Arial';
    const font = 'Roboto-Regular';
    ctx.font = `bold ${size}px ${font}`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const tombWidth = (1 / 3) * imgWidth;
    const positionX = imgWidth / 2 + tombWidth * 0.05;
    const positionY = 0.87 * imgHeight;
    let wrappedText = this.wrapText(
      ctx,
      fullName,
      positionX,
      positionY,
      tombWidth * 0.8,
      size+2
    );
    wrappedText.forEach(function (item) {
      ctx.fillText(item[0], item[1], item[2]);
    });
  }

  drawGender(ctx, gender, imgConWidth, imgConHeight) {
    const size = 0.03 * imgConWidth;
    // const font = 'Arial';
    const font = 'Roboto-Regular';

    ctx.font = `bold ${size}px ${font}`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const tombWidth = (1 / 3) * imgConWidth;
    const positionX = imgConWidth / 2 + tombWidth * 0.05;
    const positionY = 0.83 * imgConHeight;
    ctx.fillText(gender, positionX, positionY);
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // First, start by splitting all of our text into words, but splitting it into an array split by spaces
    let words = text.split(' ');
    let line = ''; // This will store the text of the current line
    let testLine = ''; // This will store the text when we add a word, to test if it's too long
    let lineArray = []; // This is an array of lines, which the function will return

    // Lets iterate over each word
    for (var n = 0; n < words.length; n++) {
      // Create a test line, and measure it..
      testLine += `${words[n]} `;
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      // If the width of this test line is more than the max width
      if (testWidth > maxWidth && n > 0) {
        // Then the line is finished, push the current line into "lineArray"
        lineArray.push([line, x, y]);
        // Increase the line height, so a new line is started
        y += lineHeight;
        // Update line and test line to use this word as the first word on the next line
        line = `${words[n]} `;
        testLine = `${words[n]} `;
      } else {
        // If the test line is still less than the max width, then add the word to the current line
        line += `${words[n]} `;
      }
      // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
      if (n === words.length - 1) {
        lineArray.push([line, x, y]);
      }
    }
    // Return the line array
    return lineArray;
  }
}
