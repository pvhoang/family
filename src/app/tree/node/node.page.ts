import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';

const MIN_YEAR = 1900;
const MAX_YEAR = 2022;

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit {

  @Input() name: string;
  @Input() node: any;

  values: any = {};
  places: Observable<string[]>;
  place: any;
  placeStr: any = '';
  placeData: any;
  placeItem: any;
  translations: any;
  // selectGender: any = {};
  selectGender: any = '';
  genders: Array<any>;

  constructor(
    private modalCtr: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {

    // console.log('NodePage - ngOnInit - node: ', this.node);

    let node = this.node;
    this.values.name = node.name;
    this.values.nick = node.nick;
    this.values.gender = node.gender;
    this.values.yob = node.yob;
    this.values.yod = node.yod;
    this.values.pob = {name: node.pob};
    this.values.pod = {name: node.pod};
    this.values.por = {name: node.por};
    this.values.child = node.child;
    this.values.spouse = node.spouse;

    this.translations = this.languageService.getTrans();
    this.genders = [
      { id: 'male', name: this.translations.MALE },
      { id: 'female', name: this.translations.FEMALE }
    ];
    this.selectGender = node.gender;
  }

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    await this.modalCtr.dismiss('cancel');
  }

  async onDelete() {
    // console.log('NodePage - onDelete');

    if (this.node.parent.nodes[0].name == this.node.name) {
        // this is main Node, check children
      if (this.node.parent.children && this.node.parent.children.length > 0) {
        this.utilService.alertMsg(this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
        return;
      }
    }
    let alert = await this.alertController.create({
      header: this.translations.DELETE_PEOPLE_HEADER,
      message: this.translations.DELETE_PEOPLE_MESSAGE + this.node.name + '?',
      buttons: [
        {
          text: this.translations.CANCEL,
          handler: (data: any) => {
          }
        },
        {
          text: this.translations.OK,
          handler: (data: any) => {
            let nodes = this.node.parent.nodes;
            this.node.parent.nodes = nodes.filter((node:any) => {
              return (node.name != this.node.name);
            });
            this.modalCtr.dismiss('delete');
          }
        }
      ]
    });
    alert.present();
  }

  keyup(event, json) {
    // console.log('NodePage - keyup: ', event);
    if (event.key == 'Enter')
      this.closePlace(1);
    this.places = this.typeahead.getJson(event.target.value, json);
  }

  focus(name) {
    // console.log('NodePage - focus: ', name);
    this.placeItem = name;
  }

  closePlace(mode?: any) {
    // console.log('NodePage - closePlace: ', mode);
    if (mode)
      this.placeData[this.placeItem] = {name: this.placeStr};
  }

  closeGender() {
    // console.log('NodePage - closeGender - ', this.selectGender);
  }

  search(event) {
    // console.log('NodePage - search: ', event);
    this.placeStr = event.term;
  }

  onSave() {
    // console.log('NodePage - onSave - node: ', this.node);
    // console.log('NodePage - onSave - nclass1: ', this.node.nclass);
    let values = this.values;
    // console.log('onSubmit: ', values);

    let errorMsg = '';
    // --- data validation
    // name must be  defined
    if (values.name == '') 
      errorMsg += this.translations.NODE_ERR_NAME_IS_BLANK + '<br/>';
    // place of death must be empty if year of death is empty
    if (values.yod == '' && values.pod.name != '') 
      errorMsg += this.translations.NODE_ERR_YOD_BLANK + '<br/>';
    // year of birth is either empty or > 1900 and < 2022
    if (values.yob == '' || (!isNaN(values.yob) && parseInt(values.yob) > MIN_YEAR && parseInt(values.yob) < MAX_YEAR)) {
    } else {
        errorMsg += this.translations.NODE_ERR_YOB_ERROR + '<br/>';
    }
    
    // year of death is either empty or > 1900 and < 2500
    if (values.yod == '' || (!isNaN(values.yob) && parseInt(values.yod) > 1900 && parseInt(values.yod) < 2500)) {
    } else {
        errorMsg += this.translations.NODE_ERR_YOD_ERROR + '<br/>';
    }
    // --- end data validation

    if (errorMsg != '') {
      this.utilService.alertMsg(this.translations.NODE_ERROR_TITLE, errorMsg);
      return;
    }
    // console.log('NodePage - onSave - nclass2: ', this.node.nclass);
    this.updateAnDismiss(values);
  }

  async updateAnDismiss(values) {

    // save to node
    let node = this.node;
    // compare
    let change = false;
    if (node.name != values.name) {     change = true;      node.name = values.name;    }
    if (node.nick != values.nick) {     change = true;      node.nick = values.nick;    }
    if (node.gender != values.gender) {     change = true;      node.gender = values.gender;    }
    if (node.yob != values.yob) {     change = true;      node.yob = values.yob;    }
    if (node.yod != values.yod) {     change = true;      node.yod = values.yod;    }
    if (node.pob != values.pob.name) {     change = true;      node.pob = values.pob.name;    }
    if (node.pod != values.pod.name) {     change = true;      node.pod = values.pod.name;    }
    if (node.por != values.por.name) {     change = true;      node.por = values.por.name;    }
    
    if (values.child != '') {
      if (!node.parent.children)
        node.parent.children = [];
      let childIdx = node.parent.children.length + 1;
      let nodeIdx = 1;
      let id = node.id + '-' + childIdx + '-' + nodeIdx;
      let newNode = { id: id, name: values.child, gender: 'male', nclass: 'not-complete' }
      node.parent.children.push({nodes: [newNode]});
      change = true;
    }

    if (values.spouse != '') {
      let id = node.id;
      let ids = id.split('-');
      // take the last one, increase by 1
      let nodeIdx = ids[ids.length-1];
      id = id.substring(0, id.lastIndexOf('-'));
      id = id + '-' + (+nodeIdx+1);
      // console.log('node - child, id: ', values.spouse, id);
      let newNode = { id: id, name: values.spouse, gender: 'male', nclass: 'not-complete' }
      node.parent.nodes.push(newNode);
      change = true;
    }
    // console.log('NodePage - onSave - nclass3: ', this.node.nclass);
    await this.modalCtr.dismiss(change ? 'change' : 'nochange');
  }

}
