import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { NodePage } from './node/node.page';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node } from '../models/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;

  modalDataResponse: any;
  family:any = {};
  nodes:Node[] = [];
  language = 'VI';
  people: Observable<string[]>;
  typeStr: any = '';
  selectPeople: any = null;
  selectPeopleNotFoundText: any = 'Not found text';
  selectPeoplePlaceholder: any = 'Place holder';

  translations: any;
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

    console.log('TreePage - ngOnInit')

    this.familyService.loadFamily().then(family => {
      console.log('TreePage - ngOnInit - family: ', family)
      // initialize from family
      this.familyService.saveFamily(family);
      this.familyService.buildFullFamily(family);
      this.familyService.saveJson(family, 'people').then(status => {});
      this.familyService.saveJson(family, 'places').then(status => {});

      this.translations = this.languageService.getTrans();
      
      this.selectPeople = null;
      this.selectPeopleNotFoundText = this.translations.SELECT_PEOPLE_NOT_FOUND_TEXT;
      this.selectPeoplePlaceholder = this.translations.SELECT_PEOPLE_PLACEHOLDER;
      this.nodes = this.familyService.getFamilyNodes(family);
      // this.utilService.console_log('TreePage - nodes: ', this.nodes);
      this.family = family;

      // verify data
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      setTimeout(() => {
        this.scrollToRoot();
      }, 100);
    });
  }

  ionViewWillEnter() {
    console.log('TreePage - ionViewWillEnter');
  }
	
	ionViewWillLeave() {
    console.log('TreePage - ionViewWillLeave');
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
    this.scrollToRoot();
  }

  onZoom(increment) {
    this.scaleStyle += increment;
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

  scrollToRoot() {
    let node = this.nodes[0];
    let id = node.id;
    console.log('scrollToRoot: ', id);
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

  setLanguage() {
    if (this.language == 'VI') {
      this.language = 'EN';
    } else {
      this.language = 'VI'
    }
    this.languageService.setLanguage(this.language.toLowerCase());
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
        node.family.nodes = node.family.nodes.filter((n:any) => {
          return (n.name != node.name);
        });
        // console.log('onDidDismiss - delete - length', node.family.nodes.length);
        if (node.family.nodes.length == 0) {
          // remove family
          node.pnode.family.children = null;
        }
        this.familyService.saveFullFamily(this.family).then(status => {});
        this.familyService.saveJson(this.family, 'people').then(status => {});
        this.familyService.saveJson(this.family, 'places').then(status => {});
         // rebuild nodes
        this.nodes = this.familyService.getFamilyNodes(this.family);
        // must reset search information
        this.searchReset();
        // this.ngSelectComponent.clearModel();

      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        let change = this.updateNode(node, values);
        if (change) {
          // there is change
          console.log('TreePage - onDidDismiss : change');
          if (values.child != '') {
            // add new child node
            if (!node.family.children)
              node.family.children = [];
            let childIdx = node.family.children.length + 1;
            let nodeIdx = 1;
            let id = node.id + '-' + childIdx + '-' + nodeIdx;
            let level = '' + (1 + +node.level);
            let newNode = this.familyService.getEmptyNode(id, level, values.child, 'male');
            let newFamily = {nodes: [newNode]};
            newNode.pnode = node;
            newNode.family = newFamily;
            node.family.children.push(newFamily);
          }
          if (values.spouse != '') {
            // add new spouse node
            let id = node.id;
            let ids = id.split('-');
            // take the last one, increase by 1
            let nodeIdx = ids[ids.length-1];
            id = id.substring(0, id.lastIndexOf('-'));
            id = id + '-' + (+nodeIdx+1);
            let newNode = this.familyService.getEmptyNode(id, node.level, values.spouse, 'female');
            newNode.family = node.family;
            newNode.pnode = node.pnode;
            node.family.nodes.push(newNode);
          }
          // save to local memory and json
          this.familyService.saveFullFamily(this.family).then(status => {});
          this.familyService.saveJson(this.family, 'people').then(status => {});
          this.familyService.saveJson(this.family, 'places').then(status => {});
          // update other variables
          if (node.nclass != 'select')
            node.nclass = this.familyService.updateNclass(node);
          node.span = this.familyService.getSpanStr(node);
          // finally rebuild nodes
          this.nodes = this.familyService.getFamilyNodes(this.family);
          // must reset search information
          this.searchReset();
        }
      }
    });
    return await modal.present();
  }

  updateNode(node, values) {
    // console.log('values: ', values);
    let change = this.familyService.isNodeChanged(node, values);
    node.name = values.name;
    node.nick = values.nick;
    node.gender = values.gender;
    node.yob = values.yob;
    node.yod = values.yod;  
    node.pob = (values.pob && values.pob.name != '') ? values.pob.name : '';
    node.pod = (values.pod && values.pod.name != '') ? values.pod.name : '';
    node.por = (values.por && values.por.name != '') ? values.por.name : '';
    return change;
  }

}
