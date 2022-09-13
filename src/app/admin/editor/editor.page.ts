import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
// import { NodePage } from './node/node.page';
import { NodePage } from '../../tree/node/node.page';
import { TypeaheadService } from '../../services/typeahead.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { NgSelectComponent } from '@ng-select/ng-select';

// declare var ancestor;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
})
export class EditorPage implements OnInit {

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
  childNodes: any[] = [];
  title: any = '';

  scaleStyle: number = 10;
  justClicked = false;
  doubleClicked = false;
  selectedNode: any = null;
  selectedNodeName: any = '';

  constructor(
    public modalCtrl: ModalController,
    private router: Router,
    private utilService: UtilService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    console.log('EditorPage - ngOnInit');
    this.title = this.languageService.getTranslation('EDITOR_HEADER_TITLE');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    console.log('EditorPage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    console.log('EditorPage - ionViewWillLeave');
	}

  async onClose() {
    this.router.navigateByUrl(`/admin`);
  }

  startFromStorage() {
    this.dataService.readFamily().then((family:any) => {
      // verify data
      let msg = this.familyService.verifyFamily(family);
      if (msg)
        this.utilService.alertMsg('WARNING', msg);
      // console.log('FamilyService - msg: ', msg);
      this.start(family);
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
    console.log('FamilyService - start -fullFamily: ', this.family);

    this.familyService.savePeopleJson(family, 'people', true).then(status => {});
    this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('EDITOR_SEARCH_PLACEHOLDER');
    this.selectPeopleNotFoundText = this.languageService.getTranslation('EDITOR_SEARCH_ITEM_NOT_FOUND');
    this.childNodes = [];
    this.selectPeople = null;
    // reset search
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

    this.updateChildren();
  }
  
  updateChildren() {

    let node = this.selectedNode;
    let childNodes = [];
    // get spouse and children
    let data:any = this.getChildren(node);
    console.log('getChildren: ', data)

    if (data.spouse) {
      childNodes.push(data.spouse);
    }
    if (data.children) {
      // sort by year
      let result = data.children.sort((a:any, b:any) => {
        let a1: any = (a.yob == '') ? 2050 : +a.yob;
        let a2: any = (b.yob == '') ? 2050 : +b.yob;
        return (a1 - a2)
      });
      result.forEach((child:any) => {
        child.genderText = this.languageService.getTranslation(child.gender);
        childNodes.push(child);
      })
    }
    this.childNodes = childNodes;
  }

  async onAdd() {
    let msg = 'Role';
    let inputs = [
      {type: 'radio', label: this.languageService.getTranslation('CHILD'), value: 'child' },
      {type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'wife' },
      {type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'husband' }
    ];
    this.utilService.alertRadio('RELATION', msg, inputs , 'CANCEL', 'OK').then((res) => {
      // console.log('onAdd - res:' , res)
      if (res) {
        // this.familyService.startSourceFamily().then(status => {});
        let relation = res.data;
        // let name = this.languageService.getTranslation('NODE_CHILD_PLACEHOLDER');
        let name = 'Phan - nhập tên';
        let gender = (relation == 'child') ? 'male' : ((relation == 'wife') ? 'female' : 'male');
        if (relation == 'child')
          this.addChild(this.selectedNode, name, gender, relation);
        else
          this.addSpouse(this.selectedNode, name, gender, relation);
      }
    });
  }

  onEdit(node: any) {
    // console.log('onEdit- node: ', node);
    this.openNodeModal(node);
  }

  onDelete(node: any) {
    if (node.family.nodes[0].name == node.name) {
      // console.log('NodePage - onDelete - children: ', node.family.children);
        // this is main Node, check children
      if (node.family.children && node.family.children.length > 0) {
        let message = this.languageService.getTranslation('EDITOR_ALERT_MESSAGE_DELETE_NODE_HAS_CHILDREN') + '[' + node.name + ']';
        this.utilService.alertMsg('EDITOR_ALERT_HEADER_DELETE_NODE_HAS_CHILDREN', message
          // this.languageService.getTranslation('NODE_ERROR_TITLE'),
          // this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']'
        );
          // this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
        return;
      }
    }
    let message = this.languageService.getTranslation('EDITOR_CONFIRM_MESSAGE_DELETE_NODE') + ': ' + node.name;
    this.utilService.alertConfirm('EDITOR_CONFIRM_HEADER_DELETE_NODE', message, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.deleteNode(node);
        this.updateSystemData(node);
        this.updateChildren();
      }
    });
  }

  async openNodeModal(node) {
    // console.log('openNodeModal - node : ', node);
    const modal = await this.modalCtrl.create({
      component: NodePage,
      componentProps: {
        'caller': 'editor',
        'node': node
      }
    });

    modal.onDidDismiss().then((resp) => {
      // console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        // console.log('Editor - values : ', values);
        // console.log('Editor - node : ', node);
        let change = this.nodeService.updateNode(node, values);
        if (change) {
          // there is change
          // console.log('TreePage - onDidDismiss : change');
          this.updateSystemData(node);
          this.updateChildren();
        }
      }
    });
    return await modal.present();
  }
  
  deleteNode(node: any) {
    // console.log('deleteNode - node: ', node)
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

  getChildren(node: any) {
    let results:any = {};
    if (node.family.nodes.length > 1) {
      // get spouse
      node.family.nodes[1].relation = this.languageService.getTranslation('WIFE');
      results.spouse = node.family.nodes[1];
    }
    if (node.family.children) {
      // get children
      let nodes:any = [];
      node.family.children.forEach((family:any) => {
        family.nodes[0].relation = this.languageService.getTranslation('CHILD');
        nodes.push(family.nodes[0]);
      });
      results.children = nodes;
    };
    return results;
  }

  addChild(node: any, name, gender, relation) {
    // console.log('addChild - node: ', node)
    
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
    newNode.relation = this.languageService.getTranslation(relation);
    node.family.children.push(newFamily);

    this.updateChildren();
  }

  addSpouse(node: any, name, gender, relation:any) {
    // console.log('addSpouse - node: ', node)
    let id = node.id;
    let ids = id.split('-');
    // take the last one, increase by 1
    let nodeIdx = ids[ids.length-1];
    id = id.substring(0, id.lastIndexOf('-'));
    id = id + '-' + (+nodeIdx+1);
    let newNode = this.nodeService.getEmptyNode(id, node.level, name, gender);
    newNode.family = node.family;
    newNode.pnode = node.pnode;
    newNode.relation = this.languageService.getTranslation(relation);
    node.family.nodes.push(newNode);

    this.updateChildren();
  }

  updateSystemData(node: any) {
    // update data for node
    node.span = this.nodeService.getSpanStr(node);
    // save full family to local memory and json
    // console.log('TreePage - updateSystemData : save: ', node);
    this.familyService.saveFullFamily(this.family).then(status => {});
    // this.family = this.familyService.buildFullFamily(this.family);
    // this.startFromStorage();
  }

}
