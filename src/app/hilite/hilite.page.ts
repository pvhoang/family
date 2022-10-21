import { Component, OnInit, ViewChild} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { DataService } from '../services/data.service';
import { FamilyService } from '../services/family.service';
import { NodeService } from '../services/node.service';
import { ViewService } from '../services/view.service';
import { TypeaheadService } from '../services/typeahead.service';
import { Family, Node, FAMILY} from '../services/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FONTS_FOLDER, DEBUG_HILITE } from '../../environments/environment';

@Component({
  selector: 'app-hilite',
  templateUrl: './hilite.page.html',
  styleUrls: ['./hilite.page.scss'],
})
export class HilitePage implements OnInit {

  @ViewChild('ngSelectPeople') ngSelectPeople: NgSelectComponent;
  FONTS_FOLDER = FONTS_FOLDER;
  family:Family = Object.create(FAMILY);
  familyView:Family = Object.create(FAMILY);
  modalDataResponse: any;
  // people: Observable<string[]>;
  // typeStr: string = '';
  selectPeople: any = null;
  // selectPeopleNotFoundText: any = null;
  selectPeoplePlaceholder: any = null;
  selectPlacesPlaceholder:any = null;
  selectCareersPlaceholder:any = null;

  childNodes: any[] = [];
  title: any = '';
  peopleNodes: any[] = [];

  scaleStyle: number = 10;
  justClicked = false;
  doubleClicked = false;
  selectedNode: any = null;
  selectedNodeName: any = '';
  fullView = true;
  nodeView = true;
  treeView = false;
  livingView = false;
  passingView = false;

  treeClass:any;

  values: any = {};
  careers: Array<any>;
  years: Array<any>;
  days: Array<any>;
  months: Array<any>;
  locations: Array<any> = [];
  selectYearsPlaceholder: any = '';
  selectDaysPlaceholder: any = '';
  selectMonthsPlaceholder: any = '';

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private dataService: DataService,
    private viewService: ViewService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private languageService: LanguageService,
    private typeahead: TypeaheadService,

  ) { }

  ngOnInit() {

    this.typeahead.getJsonPlaces().then((data:any) => {
      this.locations = data;
    })
    
    this.careers = this.utilService.getCareers();
    this.years = this.utilService.getYears();
    this.days = this.utilService.getDays();
    this.months = this.utilService.getMonths();

    this.selectYearsPlaceholder = this.languageService.getTranslation('NODE_SELECT_YEARS_PLACEHOLDER');
    this.selectDaysPlaceholder = this.languageService.getTranslation('NODE_SELECT_DAYS_PLACEHOLDER');
    this.selectMonthsPlaceholder = this.languageService.getTranslation('NODE_SELECT_MONTHS_PLACEHOLDER');
  
    this.selectPlacesPlaceholder = this.languageService.getTranslation('HILITE_SELECT_PLACES_PLACEHOLDER');
    this.selectCareersPlaceholder = this.languageService.getTranslation('HILITE_SELECT_CAREERS_PLACEHOLDER');

    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUG_HILITE)
      console.log('HilitePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUG_HILITE)
      console.log('HilitePage - ionViewWillLeave');
	}

  async onCancel() {
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  // onPassAway() {
  //   this.passingView = !this.passingView;
  // }

  onTemp() {
  }

  onPdf() {
    this.treeView = false;
    this.livingView = true;
    this.passingView = true;
  }

  onSummary() {
    if (this.treeView) {
      this.livingView = true;
      this.passingView = true;
      this.treeView = false;
    }
    this.viewService.viewNodeDetail(this.selectedNode);
  }

  onNodeTree() {

    if (this.treeView) {
      this.livingView = true;
      this.passingView = true;
      this.treeView = false;
      return;
    }
    this.livingView = false;
    this.passingView = false;
    this.treeView = true;
    this.treeClass = 'vertical-tree';
    this.familyView = this.familyService.getSelectedFamily(this.family, this.selectedNode);
  }

  onClose() {
    this.fullView = true;
    this.nodeView = false;
    this.livingView = false;
    this.passingView = false;
    this.treeView = false;
    this.selectPeople = null;
  }

  resetView() {
  }

  onLeafSelected (node) {
    console.log('HilitPage - onLeafSelected: ', node);
  }

  startFromStorage() {
    this.dataService.readFamily().then((family:any) => {
      this.title = family.info.description;
      // verify data
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      // console.log('FamilyService - msg: ', msg);
      this.start(family);
    });
  }

  start(family: any) {
    this.onClose();
    this.family = this.familyService.buildFullFamily(family);
    if (DEBUG_HILITE)
      console.log('HilitePage - start - fullFamily: ', this.family);

    this.familyService.savePeopleJson(family, 'people', true).then(status => {
      this.typeahead.getJsonPeople().then((data:any) => {
        this.peopleNodes = data;
        if (DEBUG_HILITE)
          console.log('HilitePage - start - peopleNodes: ', this.peopleNodes);
      })
    });
    this.fullView = true;
    this.nodeView = false;
    this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('EDITOR_SEARCH_PLACEHOLDER');
    this.childNodes = [];
    this.selectPeople = null;
    if (DEBUG_HILITE)
      console.log('HilitePage - start - fullView: ', this.fullView);

  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearPeopleNodes() {
    this.childNodes = [];
    this.selectPeople = null;
  }

  closePeopleNodes() {
    console.log('HilitePage - close: ', this.selectPeople);
    this.startSearch(this.selectPeople.name);
  }
  
  clearYear(type) {
    if (type == 'yob')
      this.values.yob = null;
    else if (type == 'yod')
      this.values.yod = null;
    else if (type == 'dod_day')
      this.values.dod_day = null;
    else if (type == 'dod_month')
      this.values.dod_month = null;
      this.updateNode(type);
  }

  closeYear(type) {
    this.updateNode(type);
  }

  clearPlace(type) {
    if (type == 'pob')
      this.values.pob = null;
    else if (type == 'por')
      this.values.por = null;
    else if (type == 'desc')
      this.values.desc = null;
    this.updateNode(type);
  }

  closePlace(type) {
    this.updateNode(type);
  }

  updateNode(type) {
    // let node = this.selectedNode;
    if (type == 'career')
      this.values.desc = this.values.career.name;
    // console.log('HilitePage - type, values: ', type, this.values);
    let change = this.nodeService.updateNode(this.selectedNode, this.values);
    if (change) {
      // there is change
      this.familyService.saveFullFamily(this.family).then(status => {});
    }

    // this.values = this.nodeService.loadValues(node);
    // if (type == 'yob')
    //   node.yob = this.values.yob ? this.values.yob.name : '';
    // else if (type == 'yod')
    //   node.yod = this.values.yod ? this.values.yod.name : '';
    // else if (type == 'dod_day')
    //   node.dod_day = this.values.dod_day ? this.values.dod_day.name : '';
    // else if (type == 'dod_month')
    //   node.dod_month = this.values.dod_month ? this.values.dod_month.name : '';
    //   updateNode

  }

  // --------- END ng-select ----------

  startSearch(searchStr) {
    console.log('TreePage - startSearch - searchStr: ', searchStr)
    let skeys = this.utilService.stripVN(searchStr).split(' ');
    let strSearch = skeys.join(' ');

    let sNodes:Node[] = [];

    // search thru all nodes
    let nodes = this.nodeService.getFamilyNodes(this.family);
    nodes.forEach((node:any) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
      let strProfile = node.profile.join(' ');
      if (strProfile.indexOf(strSearch) >= 0) {
        node['nclass'] = 'select'
        sNodes.push(node);
      }
    })
    console.log('sNodes: ', sNodes)
    let node:any = sNodes[0];
    // node.relation = this.languageService.getTranslation('CHILD');
    this.selectedNode = node;
    this.selectedNodeName = node.name;
    this.evalNode();
  }
  
  // evaluate the selected node
  evalNode() {
    let node = this.selectedNode;
    this.values = this.nodeService.loadValues(node);
    // special case for career
    if (this.values.desc == '') {
      this.values.career = null;
    } else {
      this.values.career = { name: this.values.desc };
    }

    this.fullView = false;
    this.nodeView = true;
    this.livingView = true;
    // this.passingView = (this.values.yod);
    this.passingView = true;
    this.treeView = false;

  }
  
}
