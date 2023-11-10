import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { TypeaheadService } from '../../services/typeahead.service';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

const WAIT_TIME = 500;

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
    private fbService: FirebaseService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    if (DEBUGS.NODE)
      console.log('PersonPage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.NODE)
      console.log('PersonPage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.NODE)
      console.log('PersonPage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.NODE)
        console.log('PersonPage - startFromStorage - data: ', data);
      this.info = data.info;
      this.title = this.info.description;
      this.start(data.family);
      
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);

    console.log('PersonPage - start - family: ', this.family);

    this.peopleNodes = this.getPeopleNodes (this.family);
    this.nodeItems = this.nodeService.getInfoList();
    this.nodeItem = null;
    this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    // this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.nodeItemPlaceholder = this.languageService.getTranslation('NODE_SELECT_EMPTY_DATA');

    this.familyView = {};
  }

  async onExit() {
    await this.modalCtrl.dismiss({status: 'cancel'});
  }
  
  getPeopleNodes (family: any, item?: any) {
    let nodes = this.nodeService.getFamilyNodes(family);
    if (DEBUGS.NODE)
      console.log('PersonPage - getPeopleNodes - nodes: ', nodes.length);
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
  
  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearPeopleNodes() {
    this.selectPeople = null;
  }

  closePeopleNodes() {
    if (DEBUGS.NODE)
      console.log('PersonPage - closePeopleNodes - selectPeople: ', this.selectPeople);
    this.selectedNode = null;
    if (this.selectPeople)
      this.startSearch(this.selectPeople);
  }
  
  keyupPeopleNodes(event) {
    if (DEBUGS.NODE)
      console.log('PersonPage - keyup: ', event.target.value);
    if (event.key !== 'Enter')
      return;
  }

  // --------- END ng-select ----------

  startSearch(searchStr) {
    if (DEBUGS.NODE)
      console.log('PersonPage - startSearch - searchStr: ', searchStr)
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
      console.log('PersonPage - startSearch - searchStr, parentName: ', searchStr, parentName);
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
      console.log('PersonPage - startSearch - sNodes: ', sNodes)
      // set select on 1st node
    sNodes[0]['nclass'] = 'select'
    this.onNodeSelect(sNodes[0]);
  }
  
  onNodeSelect(node: Node, openTask?: any) {
    if (DEBUGS.NODE)
      console.log('PersonPage - onNodeSelect - node: ', node);
    // reset nclass
    if (this.selectedNode)
      this.selectedNode.nclass = this.nodeService.updateNclass(this.selectedNode);

    this.selectedNode = node;
    this.selectedNodeName = node.name;
    this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    let ancestorName = this.info.family_name;
    this.isChildOK = this.nodeService.isAncestorName(ancestorName, node);
    this.selectedNode.nclass = 'node-select';
    if (this.selectedNode.yod != '') {
      const ele = document.getElementById('canvasContainer');
      if (!ele) {
        setTimeout(() => {  
          this.drawTomb();
        }, 1000);
      } else {
        this.drawTomb();
      }
    }
      
    // setTimeout(() => {
    //   this.scrollToNode(this.selectedNode);
    // }, WAIT_TIME);
		// let filterFamily = this.familyService.getFilterFamily(this.family);
    // this.familyView = this.familyService.getSelectedPerson(filterFamily, this.info, this.selectedNode);

    this.familyView = this.familyService.getSelectedPerson(this.selectedNode);
    
    this.startTree();
  }

  //
  // ------------- TREE -------------
  //

  startTree() {
    // set photo for each node
    let nodes = this.nodeService.getFamilyNodes(this.familyView);

    console.log('PersonPage - familyView: ', nodes);

    nodes.forEach((node:any) => {
      this.getPhotoUrl(node).then((url:any) => {
        node.photoUrl = url;
      });
    })
    this.themeService.setScreenSize(nodes, true);
    // this.node = this.nodeService.getFamilyNode(this.familyView, this.nodeId);
    // this.title = this.node.name;
    // this.node.nclass = 'node-select';
    // setTimeout(() => {
    //   this.scrollToNode(this.selectedNode);
    // }, 2000);
  }

  // scrollToNode(node) {
  //   const ele = document.getElementById(node.id);
  //   let options: any = {
  //     behaviour: 'smooth',
  //     block: 'center',
  //     inline: 'center',
  //   }
  //   ele.scrollIntoView(options);
  // }
  
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
          // console.log('url: ', url);
          this.drawPhoto(ctx, url, imgWidth, imgHeight);
        })
      } else {
        let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
        url = "../assets/icon/" + avatar;
        this.drawPhoto(ctx, url, imgWidth, imgHeight);
      }
      // this.drawPhoto(
      //   ctx,
      //   url,
      //   // 'https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png',
      //   imgWidth,
      //   imgHeight
      // );
      let title = (node.gender == 'male') ? 'Ông' : 'Bà';
      this.drawGender(ctx, title, imgWidth, imgHeight);
      this.drawName(ctx, node.name, imgWidth, imgHeight);
    };
  }

  drawPhoto(ctx, url, imgConWidth, imgConHeight) {
    const tombWidth = (1 / 3) * imgConWidth;
    const img = new Image();
    img.src = url;
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
