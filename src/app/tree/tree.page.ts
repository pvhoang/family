import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { FamilyService } from '../services/family.service';
import { NodePage } from './node/node.page';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node } from '../models/family.model';
import { NgxSmoothScrollService } from '@eunsatio/ngx-smooth-scroll';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  modalDataResponse: any;
  // family:Family = { children: [], nodes: [] }
  family:any = {};
  nodes:Node[] = [];
  language = 'VI';
  people: Observable<string[]>;
  typeStr: any = '';
  selectPeople: any = {};
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
    private smoothScrollService: NgxSmoothScrollService
  ) {}

  ngOnInit() {
    this.familyService.readFamily().then(family => {
      // console.log('TreePage - ngOnInit: ', family)
      this.familyService.buildFullFamily(family);
      this.nodes = this.familyService.getFamilyNodes(family);
      this.family = family;
      // verify data
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);

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
    // console.log('close');
    this.startSearch(this.selectPeople.name);
  }

  clear() {
    // console.log('clear');
    this.searchReset();
  }

  enter() {
    this.typeStr = this.typeStr.trim();
    // console.log('TreePage - enter: ', this.typeStr);
    this.startSearch(this.typeStr.slice());
  }

  search(event) {
    // console.log('TreePage - search: ', event);
    this.typeStr = event.term;
  }

  searchReset() {
    // console.log('TreePage -searchReset');
    this.searchPercent = '0/0';
    this.searchIdx = 0;
    this.sNodes = [];
    this.searchView = false;
    // reset nclass
    this.nodes.forEach(node => {
      this.familyService.updateNclass(node);
    });
    this.family = this.nodes[0]['parent'];
  }

  startSearch(searchStr) {
    // always reset
    this.searchReset();
    searchStr = this.utilService.stripVN(searchStr);
    // console.log('TreePage - startSear - chsearchStr: ', searchStr)
    this.searchView = true;

    // search thru all nodes
    this.nodes.forEach(node => {
      // reset nclass
      this.familyService.updateNclass(node);
      // check if the node is select
      let text = JSON.stringify(node['profile']);
      text = this.utilService.stripVN(text);
      if (text.indexOf(searchStr) >= 0) {
        // console.log('text: ', text)
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
      this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + this.sNodes[this.searchIdx - 1].name;
      this.scrollToSearch(this.searchIdx-1);
    }
  }

  nextSearch() {
    if (this.searchIdx == this.sNodes.length)
      this.searchIdx = 1;
    else
      this.searchIdx++;
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + this.sNodes[this.searchIdx - 1].name;
    this.scrollToSearch(this.searchIdx-1);
  }

  prevSearch() {
    if (this.searchIdx == 1)
      this.searchIdx = this.sNodes.length;
    else
      this.searchIdx--;
    this.searchPercent = this.searchIdx + '/' + this.sNodes.length + ' - ' + this.sNodes[this.searchIdx - 1].name;
    this.scrollToSearch(this.searchIdx-1);
  }

  scrollToRoot() {
    let node = this.nodes[0];
    let id = node.id;
    const eleTree = document.getElementById('1-0');
    const ele = document.getElementById(id);
    // console.log('ele: ', ele);
    let options: any = {
      duration: 600,
      alignX: 'center',
      alignY: 'center',
      timingFunction: 'ease-in-out'
    }
    this.smoothScrollService.scrollToElement(eleTree, ele, options);
  }

  scrollToSearch(sIndex: number) {
    let node = this.sNodes[sIndex];
    let id = node.id;
    const eleTree = document.getElementById('1-0');
    const ele = document.getElementById(id);
    // console.log('ele: ', ele);
    let options: any = {
      duration: 600,
      alignX: 'center',
      alignY: 'center',
      timingFunction: 'ease-in-out'
    }
    this.smoothScrollService.scrollToElement(eleTree, ele, options);
  }

  setLanguage() {
    if (this.language == 'VI')
      this.language = 'EN'
    else
      this.language = 'VI'
    this.languageService.setLanguage(this.language.toLowerCase());
  }
  
  async openNodeModal(node) {
    const modal = await this.modalCtrl.create({
      component: NodePage,
      componentProps: {
        'name': 'Detail',
        'node': node
      }
    });

    modal.onDidDismiss().then((resp) => {
      console.log('onDidDismiss : ', resp);
      if (resp.data !== null) {
        let mode = resp.data;
        if (mode == 'change' || mode == 'delete') {
          // save to storage
          this.familyService.saveFullFamily(this.family).then(status => {});
          this.familyService.updateNclass(node);
        }
        // console.log('node : ', node);
      }
    });
    return await modal.present();
  }

  // async alertMsg(title, message) {
	// 	let alert = await this.alertController.create({
	// 		header: title,
	// 		message: message,
	// 		buttons: ['OK']
	// 	});
	// 	alert.present();
	// }
}
