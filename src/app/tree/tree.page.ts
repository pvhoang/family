import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { NodeService } from '../services/node.service';
import { DataService } from '../services/data.service';
import { NodePage } from './node/node.page';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node, FAMILY} from '../services/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';
import '../../assets/fonts/Roboto-Regular-normal.js';

declare var ancestor;

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
  justClicked = false;
  doubleClicked = false;

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
      console.log('FamilyService - startFromStorage - family: ', family);
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      console.log('FamilyService - msg: ', msg);
      this.start(family);
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    console.log('FamilyService - start -fullFamily: ', this.family);

    this.familyService.saveJson(family, 'people').then(status => {});
    this.familyView = this.family;
    this.selectPeopleNotFoundText = this.languageService.getTranslation('SELECT_PEOPLE_NOT_FOUND_TEXT');
    this.selectPeoplePlaceholder = this.languageService.getTranslation('SELECT_PEOPLE_PLACEHOLDER');
    // reset search
    this.searchView = false;
    setTimeout(() => {
      this.scrollToRoot();
    }, 100);
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
    console.log('TreePage - onLeafSelected: ', node);
    if (this.justClicked === true) {
      this.doubleClicked = true;
      this.viewNodeDetail(node);
      console.log('Double Click Event');
    } else {
      this.justClicked = true;
      setTimeout(() => {
        this.justClicked = false;
        if (this.doubleClicked === false) {
          this.openNodeModal(node);
        }
        this.doubleClicked = false;
      }, 500);
    }
  }

  onHome() {
    this.scaleStyle = 10;
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

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 
  clearPeople() {
    console.log('TreePage - clear');
    this.selectPeople = null;
    this.typeStr = '';
    this.people = this.typeahead.getJson('', 'people');
  }

  closePeople() {
    console.log('TreePage - close: ', this.selectPeople);
    this.startSearch(this.selectPeople.name);
  }

  keydownPeople(event) {
    if (event.key !== 'Enter')
      return;
    console.log('TreePage - keydown: Enter: ', this.typeStr);
    this.ngSelectPeople.close();
    this.startSearch(this.typeStr);
  }

  keyupPeople(event) {
    let term = event.target.value;
    console.log('TreePage - keyup - term: ', term);
    this.typeStr = term;
    this.people = this.typeahead.getJson(term, 'people');
  }

  keydownInDropdownPeople(event) {
    return false;
  }
  // --------- END ng-select ----------

  searchReset() {
    console.log('TreePage - searchReset');
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
    this.startFromStorage();
  }

  startSearch(searchStr) {
    console.log('TreePage - startSearch - searchStr: ', searchStr)
    this.searchView = true;
    // always reset
    this.searchReset();
    let skeys = this.utilService.stripVN(searchStr).split(' ');
    let strSearch = skeys.join(' ');

    // search thru all nodes
    let nodes = this.nodeService.getFamilyNodes(this.family);
    nodes.forEach((node:any) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
      let strProfile = node.profile.join(' ');
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
      this.scrollToNode(node);
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

  onImage() {
    this.utilService.alertConfirm('SAVE_IMAGE_HEADER', 'SAVE_IMAGE_MESSAGE', 'CANCEL', 'CONTINUE').then((res) => {
      console.log('res: ', res);
      if (res.data) {
        let node:any = this.sNodes[this.searchIdx - 1];
        const ele = document.getElementById('tree');
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
        htmlToImage.toJpeg(ele, options)
        .then(function (dataUrl) {
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
    let keys = this.utilService.stripVN(node.name).split(' ');
    let nameStr = keys.join('_');
    let fileName = ancestor + '_' + nameStr + '.pdf';

    this.utilService.alertConfirm('SAVE_PDF_HEADER', 'Cat pha do vao file: ' + fileName, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        let node:any = this.sNodes[this.searchIdx - 1];
        let header = 'Phả đồ chi ' + node.name;
        let message = 'Đời ' + node.level;
        const dashboard = document.getElementById('tree');
        const dashboardHeight = dashboard.clientHeight;
        const dashboardWidth = dashboard.clientWidth;
        const options = { background: 'white', width: dashboardWidth, height: dashboardHeight };
        domtoimage.toPng(dashboard, options).then((imgData:any) => {
          const doc = new jsPDF(dashboardWidth > dashboardHeight ? 'l' : 'p', 'mm', [dashboardWidth, 2 * dashboardHeight]);
          const imgProps = doc.getImageProperties(imgData);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.setFont('Roboto-Regular'); // set custom font
          doc.setTextColor("red");
          doc.setFontSize(60);
          doc.text(header, 10, 20);
          doc.setTextColor("blue");
          doc.setFontSize(40);
          doc.text(message, 10, 40);
          doc.addImage(imgData, 'PNG', 10, 60, pdfWidth, pdfHeight);
          doc.save(fileName);
        });
      }
    });
  }

  async onDelete() {
    let node:any = this.sNodes[this.searchIdx - 1];
    if (node.family.nodes[0].name == node.name) {
      console.log('NodePage - onDelete - children: ', node.family.children);
        // this is main Node, check children
      if (node.family.children && node.family.children.length > 0) {
        let msg = this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']';
        this.utilService.alertMsg('NODE_ERROR_TITLE', msg);
        return;
      }
    }
    this.utilService.alertConfirm('DELETE_PEOPLE_HEADER', 'DELETE_PEOPLE_MESSAGE', 'CANCEL', 'CONTINUE').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        node.family.nodes = node.family.nodes.filter((n:any) => {
          return (n.name != node.name);
        });
        // console.log('onDidDismiss - delete - length', node.family.nodes.length);
        if (node.family.nodes.length == 0) {
          // remove family
          node.pnode.family.children = null;
        }
        this.updateSystemData(node);
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

  private viewNodeDetail(node: any) {
    console.log('viewNodeDetail - node : ', node);

    let title = node.name;
    let level = '<b>' + this.languageService.getTranslation('VIEW_GENERATION') + '</b>' + ': ' + node.level + '<br>';
    let parent = (node.pnode) ? '<b>' + this.languageService.getTranslation('VIEW_CHILD_OF') + '</b>' + ': ' + node.pnode.name + '<br>' : '';
    let nick = (node.nick == '') ? '' : '<b>' + this.languageService.getTranslation('VIEW_NICK_NAME') + '</b>' + ': ' + node.nick + '<br>';
    let children = '';
    if (node.family.children)
      children = '<b>' + this.languageService.getTranslation('VIEW_NO_CHILDREN') + '</b>' + ': ' + node.family.children.length + '<br>';
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
          spouse = '<b>' + this.languageService.getTranslation('VIEW_HUSBAND') + '</b>' + ': ' + spouseNode.name + '<br>';
        else
        spouse = '<b>' + this.languageService.getTranslation('VIEW_WIFE') + '</b>' + ': ' + spouseNode.name + '<br>';
      }
    }

    let years = '<b>' + this.languageService.getTranslation('VIEW_YOB_YOD') + '</b>' + ': ' + node.yob + ' - ' + node.yod + '<br>';
    let birthPlace = '<b>' + this.languageService.getTranslation('VIEW_POB') + '</b>' + ': ' + node.pob + '<br>';
    let deathPlace = '<b>' + this.languageService.getTranslation('VIEW_POD') + '</b>' + ': ' + node.pod + '<br>';
    let residence = '<b>' + this.languageService.getTranslation('VIEW_POR') + '</b>' + ': ' + node.por + '<br>';

    let header = '<pre style="margin-left: 2.0em;">';
    let msg = level + parent + nick + years + birthPlace + deathPlace + residence + spouse + children;
    
    msg = header + msg + '<br><br></pre>';
    this.utilService.alertMsg(title, msg, 'alert-small');
  }

  async openNodeModal(node) {
    console.log('openNodeModal - node : ', node);
    const modal = await this.modalCtrl.create({
      component: NodePage,
      componentProps: {
        'caller': 'tree',
        'node': node
      }
    });

    modal.onDidDismiss().then((resp) => {
      console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing

      } else if (status == 'delete') {
        this.deleteNode(node);
        this.updateSystemData(node);

      } else if (status == 'add') {
        let values = resp.data.values;
        console.log('TreePage - onDidDismiss : values= ', values);
        if (values.relation == 'child') {
          // child
          this.addChild(node, values.name, values.gender);
        } else {
          // spouse
          this.addSpouse(node, values.name, values.gender);
        }
        this.updateSystemData(node);
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        let change = this.nodeService.updateNode(node, values);
        if (change) {
          // there is change
          console.log('TreePage - onDidDismiss : change');
          this.updateSystemData(node);
        }
      }
    });
    return await modal.present();
  }
  
  deleteNode(node: any) {
    console.log('deleteNode - node: ', node)
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
      pnode.family.children = children;
    }
  }

  addChild(node: any, name, gender) {
    console.log('addChild - node: ', node)

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
  }

  addSpouse(node: any, name, gender) {
    console.log('addSpouse - node: ', node)
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
  }

  updateSystemData(node: any) {
    // update data for node
    node.span = this.nodeService.getSpanStr(node);
    // save full family to local memory and json
    this.familyService.saveFullFamily(this.family).then(status => {});

    // if in search mode, must reset all select node and search data
    // if (this.searchView) {

      // let nodes = this.nodeService.getFamilyNodes(this.family);
      // nodes.forEach((node:any) => {
      //     node.nclass = this.nodeService.updateNclass(node);
      // });
      // this.searchReset();
      // this.searchView = false;
      // this.nodeView = false;
    
      // if (this.nodeView) {
      //   // in node view, reset to tree view, back to full family
      //   this.familyView = this.family;
      //   setTimeout(() => {
      //     this.scrollToNode(node);
      //   }, 100);
      //   this.nodeView = false;
    // }
  }
}
