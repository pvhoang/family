import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from '../../components/popover/popover.component';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { EditPage } from '../node/edit/edit.page';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

const WAIT_TIME = 500;

@Component({
  selector: 'app-branch',
  templateUrl: './branch.page.html',
  styleUrls: ['./branch.page.scss'],
})
export class BranchPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  modalDataResponse: any;
  family:Family = FAMILY;
  familyView:Family = FAMILY;
  
  branches: any[] = [];
  selectBranch: any = null;
  currentBranch: any = null;

  title: string = '';
  justClicked = false;
  doubleClicked = false;
  isChildOK = false;

  selectedNode: Node = null;
  viewMode = 0;
  treeClass = 'tree';

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
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    if (DEBUGS.BRANCH)
      console.log('BranchPage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.BRANCH)
      console.log('BranchPage - ionViewWillEnter');
    this.startFromStorage();
    // this.read(this.selectBranch);
  }
	
	ionViewWillLeave() {
    if (DEBUGS.BRANCH)
      console.log('BranchPage - ionViewWillLeave');
    this.save(this.selectBranch);
	}

  startFromStorage() {
    this.dataService.readInfo().then((info: any) => {
      this.info = info;
      this.title = info.description;
      // read branches
      this.dataService.readBranchNames().then((branches:[]) => {
        this.branches = branches;
        if (!this.selectBranch)
          this.selectBranch = this.branches.length > 0 ? this.branches[0] : null;
        this.select(this.selectBranch);
      });
    });
  }

  //
  // ------------- TREE -------------
  //
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
  
  onLeafSelected (node: Node) {
    this.onNodeSelect(node, true);
  }

  scrollToRoot() {
    this.scrollToNode(this.familyView.nodes[0]);
  }

  scrollToNode(node: Node) {
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clear() {
    this.selectBranch = null;
  }

  close() {
		if (this.currentBranch)
			this.save(this.currentBranch);
    this.select(this.selectBranch);
  }
  
  save(branch: string) {
		if (DEBUGS.BRANCH)
			console.log('BranchPage - save: ', branch);
		if (branch) {
			let family = this.familyService.getFilterFamily(this.family);
			this.dataService.saveBranch(branch, family).then(status => {});
		}
  }

	select(branch: string) {
		if (DEBUGS.BRANCH)
			console.log('BranchPage - select: ', branch);
		if (branch) {
			this.dataService.readBranch(branch).then((family: Family) => {
				if (DEBUGS.BRANCH)
					console.log('BranchPage - select: family: ', family);
				this.family = this.familyService.buildFullFamily(family);
				this.familyView = this.family;
				// set visible
				let nodes = this.nodeService.getFamilyNodes(this.family);
				nodes.forEach(node => {
						node.visible = true;
				})
				this.onNodeSelect(family.nodes[0]);
				this.currentBranch = branch;
			});
		} else {
			this.family = FAMILY;
			this.familyView = this.family;
		}
  }

  add() {
    let title = this.languageService.getTranslation('NODE_ADD_BRANCH');
    let cancel = this.languageService.getTranslation('CANCEL');
    let ok = this.languageService.getTranslation('OK');
    let inputs = [
      {   placeholder: this.languageService.getTranslation('NODE_NAME_BRANCH'),
          attributes: { maxlength: 50 },
      }
    ]
    this.utilService.alertText(title, inputs , cancel, ok, 'alert-dialog').then(result => {
      console.log('getAncestor - add - result: ', result);
      if (result.data) {
        let bname = result.data[0];
        // let name = 'Phan-' + (this.branches.length + 1);
        let name = this.info.family_name + ' ...';
        let gender = 'male';
        let id = '1';
        let level = '1'
        let newNode = this.nodeService.getEmptyNode(id, level, name, gender);
        newNode.visible = true;
        let family = new Family();
        family.nodes = [newNode];

        // console.log('BranchPage - onNewBranch - family: ', family);
        this.dataService.saveBranch(bname, family).then(status => {
					if (DEBUGS.BRANCH)
						console.log('BranchPage - add - save old, add new: ', this.currentBranch, bname);
					this.save(this.currentBranch);
          this.branches = [...this.branches, bname];
          this.selectBranch = bname;
          this.select(this.selectBranch);
        });
      } else {
        // this.presentToast(['APP_NO_ANCESTOR']);
        // this.utilService.presentToast("Hello");
      }
    })
  }

  delete() {
    // let node = this.selectedNode;
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_1'},
      {name: 'data', label: this.selectBranch},
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_2'},
    ]);
    this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((result) => {
      console.log('getAncestor - delete - result: ', result);
      if (result.data) {
        let sbranch = this.selectBranch;
        this.dataService.deleteBranch(sbranch).then(status => {
          this.branches = this.branches.filter(branch => {
            return branch != sbranch;
          })
          this.selectBranch = (this.branches.length > 0) ? this.branches[0] : null;
					if (DEBUGS.BRANCH)
						console.log('BranchPage - add - delete current, select top: ', sbranch, this.selectBranch);
          this.select(this.selectBranch);
        });
      }
    });
  }

  onNodeSelect(node: Node, openTask?: any) {

    if (DEBUGS.BRANCH)
      console.log('BranchPage - onNodeSelect - node: ', node);
    // reset nclass
    if (this.selectedNode)
      this.selectedNode.nclass = this.nodeService.updateNclass(this.selectedNode);

    this.selectedNode = node;
    // this.selectedNodeName = node.name;
    // this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    let ancestorName = this.info.family_name;
    this.isChildOK = this.nodeService.isAncestorName(ancestorName, node);
    this.selectedNode.nclass = 'node-select';
    this.selectedNode.visible = true;

    setTimeout(() => {
      this.scrollToNode(this.selectedNode);
      if (openTask)
        this.presentSelectPopover();
    }, WAIT_TIME);
  }

  async presentSelectPopover() {
    this.themeService.setAlertSize({ width: 250, height: 320 });
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        'node': this.selectedNode,
        'isChildOK': this.isChildOK,
        'header': this.languageService.getTranslation('NODE_POPOVER_HEADER')
      },
      cssClass:'popover',
      side: 'right',
      alignment: 'end',
      // translucent: true,
      dismissOnSelect: true,
      // backdropDismiss: false
      backdropDismiss: true
    });
    popover.onDidDismiss().then((result) => {
      if (DEBUGS.BRANCH)
        console.log('NodePage - presentSelectPopover - result: ', result);
      this.isPopover = false;
      switch (result.data) {
        case 'onEdit':
          this.onEdit();
          break;
        case 'onAdd':
          this.onAdd();
          break;
        case 'onDelete':
          this.onDelete();
          break;
      }
    });
    await popover.present();
  }

  onEdit() {
    this.openEditModal(this.selectedNode);
  }

  async openEditModal(node: Node) {
    if (DEBUGS.BRANCH)
      console.log('NodePage - openEditModal - node: ', node);
    const modal = await this.modalCtrl.create({
      component: EditPage,
      componentProps: {
        'caller': 'editor',
        'node': node,
        'family': this.family,
        'info': this.info,
      }
    });

    modal.onDidDismiss().then((resp) => {
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        if (DEBUGS.BRANCH)
          console.log('NodePage - openEditModal - values, node : ', values, node);
        let change = this.nodeService.saveValues(node, values);
        if (change) {
          // there is change
          if (DEBUGS.BRANCH)
            console.log('TreePage - onDidDismiss : change');
          this.updateSystemData(node);
          // this.selectPeople = node.name + this.nodeService.getFullDetail(node);
          if (DEBUGS.BRANCH)
            console.log('TreePage - onDidDismiss : OK');
        }
      }
    });
    return await modal.present();
  }

  async onAdd() {

    let node = this.selectedNode;

    let inputs = [];
    if (!node.pnode)
      // root node, add father
      inputs.push({type: 'radio', label: this.languageService.getTranslation('FATHER'), value: 'FATHER', checked: false });
    if (node.gender == 'female')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'HUSBAND' });
    else if (node.gender == 'male')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'WIFE' });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('SON'), value: 'SON', checked: true });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('DAUGHTER'), value: 'DAUGHTER', checked: false });

    this.utilService.alertRadio('NODE_ADD_RELATION_HEADER', '', inputs , 'CANCEL', 'OK').then((res) => {
      console.log('onAdd- res: ', res);
      if (res.data) {

        let relation = res.data;
        let ancestorName = this.nodeService.getChildFamilyName(this.selectedNode);

        // let firstChar = ancestorName.charAt(0);
        // ancestorName = firstChar + ancestorName.substring(1);

        let gender = (relation == 'FATHER' || relation == 'HUSBAND' || relation == 'SON') ? 'male' : 'female';
        // let lName = this.utilService.stripVN(ancestorName);

        let mName = (gender == 'male') ? 'văn' : 'thị';
        let fName = (gender == 'male') ? 'nam' : 'nữ';
        // let name = this.utilService.stripVN(ancestorName) + ' ...';
        let name = ancestorName + ' ' + mName + ' ' + fName + ' ...';
        let node: any;
        if (relation == 'FATHER') {
          this.addFather(name);
        } else {
          if (relation == 'SON' || relation == 'DAUGHTER')
            node = this.nodeService.addChild(this.selectedNode, name, gender, relation);
          else
            node = this.nodeService.addSpouse(this.selectedNode, name, gender, relation);
          this.updateSystemData(node);
          this.onNodeSelect(node);
        }
      }
    });
  }

  onDelete() {
    let node = this.selectedNode;
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_1'},
      {name: 'data', label: node.name},
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_2'},
    ]);
    this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.nodeService.deleteNode(this.family, node);
        this.updateSystemData(node);
        // if (node == this.selectedNode)
        //   // reset search box
        //   this.clearPeopleNodes();
      }
    });
  }

  addFather(name: string) {
    this.dataService.readFamily().then((family:any) => {
      let node = { name: name, gender: 'male', yob: '1900' } 
      let newFamily = {
        version: family.version,
        nodes: [ node ],
        children: [ { nodes: family.nodes, children: family.children } ]
      };
    });
  }

  updateSystemData(node: any) {
    // update data for node
    node.span = this.nodeService.getSpanStr(node);
    // save full family to local memory and update people list
    this.familyService.saveFullFamily(this.family).then(status => {
    });
  }

}
