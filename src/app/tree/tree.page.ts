import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { NodePage } from './node/node.page';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node, FAMILY} from '../services/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;

  modalDataResponse: any;
  family:Family = Object.create(FAMILY);
  nodes:Node[] = [];
  people: Observable<string[]>;
  typeStr: string = '';
  selectPeople: any = null;
  selectPeopleNotFoundText: any = 'Not found text';
  selectPeoplePlaceholder: any = 'Place holder';
  split = false;
  scaleStyle: number = 10;
  searchView = false;
	searchPercent: any = '0/0';
	searchIdx: any = '0/0';
	searchDisabled:any = false;
  sNodes:Node[] = [];

  constructor(
    public modalCtrl: ModalController,
    private utilService: UtilService,
    private familyService: FamilyService,
    private languageService: LanguageService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    console.log('TreePage - ngOnInit');
    this.start();
    console.log('TreePage - end ngOnInit');
  }

  ionViewWillEnter() {
    console.log('TreePage - ionViewWillEnter');
    this.start();
  }
	
	ionViewWillLeave() {
    console.log('TreePage - ionViewWillLeave');
	}

  start() {
    this.familyService.readFamily().then((family:any) => {
      this.family = this.familyService.buildFullFamily(family);
      // console.log('TreePage - ngOnInit - family: ', this.family)
      this.selectPeople = null;
      this.selectPeopleNotFoundText = this.languageService.getTranslation('SELECT_PEOPLE_NOT_FOUND_TEXT');
      this.selectPeoplePlaceholder = this.languageService.getTranslation('SELECT_PEOPLE_PLACEHOLDER');
      this.nodes = this.familyService.getFamilyNodes(this.family);
      setTimeout(() => {
        this.scrollToRoot();
      }, 100);
    });
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

  onLeafSelected(node: any) {
    // console.log('TreePage - onLeafSelected: ', node);
    this.openNodeModal(node);
  }

  onHome() {
    this.scaleStyle = 10;
    this.scrollToRoot();
  }

  onZoom(increment) {
    this.scaleStyle += increment;
  }

  onSplit() {
    this.split = !this.split;
  }

  keyup(event, json) {
    // console.log('TreePage - keyup: ', event);
    if (event.key == 'Enter')
      this.enter();
    this.people = this.typeahead.getJson(event.target.value, json);
  }

  close() {
    console.log('TreePage - close: ', this.selectPeople.name, this.typeStr);
    if (this.selectPeople.name != '')
      this.startSearch(this.selectPeople.name);
    else
      this.selectPeople = {'name': this.typeStr};
  }

  clear() {
    console.log('TreePage - clear');
    this.searchReset();
  }

  enter() {
    this.typeStr = this.typeStr.trim();
    // console.log('TreePage - enter: ', this.typeStr);
    this.selectPeople = {'name': this.typeStr};
    this.startSearch(this.typeStr.slice());
  }

  search(event) {
    // console.log('TreePage - search: ', event);
    this.typeStr = event.term;
  }

  searchReset() {
    console.log('TreePage -searchReset');
    this.searchPercent = '0/0';
    this.searchIdx = 0;
    this.sNodes = [];
    this.searchView = false;
    // reset nclass
    this.nodes.forEach((node:any) => {
      node.nclass = this.familyService.updateNclass(node);
    });
    this.family = this.nodes[0]['family'];
    console.log('TreePage -searchReset-selectPeople: ', this.selectPeople);
    this.ngSelectComponent.clearModel();
  }

  startSearch(searchStr) {
    // always reset
    this.searchReset();
    console.log('TreePage - startSearch - searchStr: ', searchStr)
    let skeys = this.utilService.stripVN(searchStr).split(' ');
    let strSearch = skeys.join(' ');

    this.searchView = true;
    // search thru all nodes
    this.nodes.forEach((node:any) => {
      // reset nclass
      node.nclass = this.familyService.updateNclass(node);
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
      this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.familyService.getGeneration(node) + ')';
      this.scrollToSearch(this.searchIdx-1);
    }
  }

  nextSearch() {
    if (this.searchIdx == this.sNodes.length)
      this.searchIdx = 1;
    else
      this.searchIdx++;
    let node = this.sNodes[this.searchIdx - 1];
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.familyService.getGeneration(node) + ')';
    this.scrollToSearch(this.searchIdx-1);
  }

  prevSearch() {
    if (this.searchIdx == 1)
      this.searchIdx = this.sNodes.length;
    else
      this.searchIdx--;
    let node = this.sNodes[this.searchIdx - 1];
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + node.name + ' (' + this.familyService.getGeneration(node) + ')';
    this.scrollToSearch(this.searchIdx-1);
  }

  onChild() {
    let node:any = this.sNodes[this.searchIdx - 1];
    // verify ???

    let header = this.languageService.getTranslation('TREE_ADD_CHILD');
    let msg = header;
    let texts = [
      this.languageService.getTranslation('TREE_ADD_NAME_PLACEHOLDER'),
      this.languageService.getTranslation('TREE_ADD_RELATION_PLACEHOLDER'),
      this.languageService.getTranslation('TREE_ADD_GENDER_PLACEHOLDER'),
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('OK')
    ]
    this.utilService.alertAddNode(header, msg, texts).then((res) => {
      console.log('alertAddNode - res:' , res)
      if (!res.data)
        return;
      let name = res.data.name;
      let relation = res.data.relation;
      let gender = res.data.gender == '1' ? 'male' : 'female';
      if (relation == '1') {
        // child
        this.addChild(node, name, gender);
      } else {
        // spouse
        this.addSpouse(node, name, gender);
      }
      this.updateSystemData(node);
    })
  }

  onImage() {
    let node:any = this.sNodes[this.searchIdx - 1];
    console.log('NodePage - onImage - node: ', node);
    const ele = document.getElementById('family-' + node.id);
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

  async onDelete() {
    let node:any = this.sNodes[this.searchIdx - 1];
    if (node.family.nodes[0].name == node.name) {
      console.log('NodePage - onDelete - children: ', node.family.children);
        // this is main Node, check children
      if (node.family.children && node.family.children.length > 0) {
        this.utilService.alertMsg(
          this.languageService.getTranslation('NODE_ERROR_TITLE'),
          this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']'
        );
          // this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
        return;
      }
    }
    this.utilService.alertConfirm(
      this.languageService.getTranslation('DELETE_PEOPLE_HEADER'),
      this.languageService.getTranslation('DELETE_PEOPLE_MESSAGE'),
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('CONTINUE')).then((res) => {
      console.log('onDelete - res:' , res)
      if (res) {
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
    let node = this.nodes[0];
    let id = node.id;
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

  scrollToSearch(sIndex: number) {
    let node = this.sNodes[sIndex];
    console.log('scrollToSearch: ', sIndex);
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

  async openNodeModal(node) {

    console.log('openNodeModal - node : ', node);
    const modal = await this.modalCtrl.create({
      component: NodePage,
      componentProps: {
        'name': 'Detail',
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
        if (values.relation == '1') {
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
        let change = this.familyService.updateNode(node, values);
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
    // console.log('deleteNode - pnode: ', node.pnode, node.pnode.family)
    // console.log('deleteNode - node: ', node, node.family)
    let children = [];
    let pnode = node.pnode;
    for (let i = 0; i < pnode.family.children.length; i++) {
      let family = pnode.family.children[i];
      let nodes = family.nodes;
      nodes = nodes.filter((n:any) => {
        return (n.name != node.name);
      });
      if (nodes.length > 0)
        children.push(family);
    }
    pnode.family.children = children;
  }

  addChild(node: any, name, gender) {
    if (!node.family.children)
      node.family.children = [];
    let childIdx = node.family.children.length + 1;
    let nodeIdx = 1;
    let id = node.id + '-' + childIdx + '-' + nodeIdx;
    let level = '' + (1 + +node.level);
    let newNode = this.familyService.getEmptyNode(id, level, name, gender);
    let newFamily = {nodes: [newNode]};
    newNode.pnode = node;
    newNode.family = newFamily;
    node.family.children.push(newFamily);
  }

  addSpouse(node: any, name, gender) {
    let id = node.id;
    let ids = id.split('-');
    // take the last one, increase by 1
    let nodeIdx = ids[ids.length-1];
    id = id.substring(0, id.lastIndexOf('-'));
    id = id + '-' + (+nodeIdx+1);
    let newNode = this.familyService.getEmptyNode(id, node.level, name, gender);
    newNode.family = node.family;
    newNode.pnode = node.pnode;
    node.family.nodes.push(newNode);
  }

  updateSystemData(node: any) {
    // save to local memory and json
    this.familyService.saveFullFamily(this.family).then(status => {});
    this.familyService.saveJson(this.family, 'people').then(status => {});
    this.familyService.saveJson(this.family, 'places').then(status => {});
    if (node.nclass != 'select')
      node.nclass = this.familyService.updateNclass(node);
    node.span = this.familyService.getSpanStr(node);
    // finally rebuild nodes
    this.nodes = this.familyService.getFamilyNodes(this.family);
    // must reset search information
    this.searchReset();
  }
}
