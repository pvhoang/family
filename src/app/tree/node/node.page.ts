import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit {

  @Input() name: string;
  @Input() node: any;

  validationsForm: FormGroup;
  places: Observable<string[]>;
  place: any;
  placeStr: any = '';
  placeData: any;
  placeItem: any;
  translations: any;
  // selectGender: any = {};
  selectGender: any = '';
  selectPob: any = '';
  genders: Array<any>;

  constructor(
    private modalCtr: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {

    let node = this.node;
    console.log('node: ', this.node);

    this.translations = this.languageService.getTrans();
    this.genders = [
      { id: 'male', name: this.translations.MALE },
      { id: 'female', name: this.translations.FEMALE }
    ];
    this.selectGender = node.gender;

    // this.genders = ['male', 'female'];
    // this.genders = [this.translations.MALE, this.translations.FEMALE];
    // this.selectGender = (node.gender == 'male') ? this.translations.MALE : this.translations.FEMALE;
    // let genders1 = { 
    //   male: this.translations.MALE,
    //   female: this.translations.FEMALE,
    // }
    // this.selectGender = genders1[node.gender];

    //   { id: 'male', name: this.translations.MALE },
    //   { id: 'female', name: this.translations.FEMALE }
    // ];
    // this.genders = ['male', 'female'];

    this.placeData = {pob: {name: node.pob}, pod: {name: node.pod}, por: {name: node.por}};
    // this.selectPob = node.pob;
    
    // this.selectGender = node.gender;

    console.log('gender: ', node.gender);

    // let nameGender = (node.gender == 'male') ? this.translations.MALE : this.translations.FEMALE;
    // this.selectGender = { id: node.gender, name: nameGender };
    // console.log('selectGender: ', this.selectGender);

    this.validationsForm = new FormGroup({
      'name': new FormControl(node.name, Validators.required),
      'nick': new FormControl(node.nick),
      'gender': new FormControl(this.selectGender),
      'yob': new FormControl(node.yob),
      'yod': new FormControl(node.yod),
      'pob': new FormControl(this.placeData.pob.name),
      'pod': new FormControl(this.placeData.pod.name),
      'por': new FormControl(this.placeData.por.name),
      'child': new FormControl(''),
      'spouse': new FormControl('')
    });
  }

  async onCancel() {
    console.log('onCancel: ');
    await this.modalCtr.dismiss('cancel');
  }

  async onDelete() {
    console.log('onDelete: ');

    if (this.node.parent.nodes[0].name == this.node.name) {
        // this is main Node, check children
      if (this.node.parent.children && this.node.parent.children.length > 0) {
        this.alertMsg(this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
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
    console.log('NodePage - keyup: ', event);
    if (event.key == 'Enter')
      this.closePlace(1);
    this.places = this.typeahead.getJson(event.target.value, json);
  }

  focus(name) {
    console.log('NodePage - focus: ', name);
    this.placeItem = name;
  }

  closePlace(mode?: any) {
    console.log('NodePage - closePlace: ', mode);
    if (mode)
      this.placeData[this.placeItem] = {name: this.placeStr};
  }

  closeGender() {
    console.log('NodePage - closeGender - ', this.selectGender);
  }

  search(event) {
    // console.log('NodePage - search: ', event);
    this.placeStr = event.term;
  }

  async onSubmit(values) {
    if (!this.validationsForm.valid)
      return;

    console.log('onSubmit1: ', values);
    if (values.pob.name) values.pob = values.pob.name;
    if (values.pod.name) values.pod = values.pod.name;
    if (values.por.name) values.por = values.por.name;
    console.log('onSubmit2: ', values);

    let errorMsg = '';
    // --- data validation

    // name must be  defined
    if (values.name == '') 
      errorMsg += this.translations.NODE_ERR_NAME_IS_BLANK + '<br/>';
    // place of death must be empty if year of death is empty
    if (values.yod == '' && values.pod != '') 
      errorMsg += this.translations.NODE_ERR_YOD_BLANK + '<br/>';
    // year of birth is either empty or > 1900 and < 2500
    if (values.yob == '' || (!isNaN(values.yob) && parseInt(values.yob) > 1900 && parseInt(values.yob) < 2500)) {
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
      this.alertMsg(this.translations.NODE_ERROR_TITLE, errorMsg);
      return;
    }
    this.updateAnDismiss(values);
  }

  async updateAnDismiss(values) {

    console.log('updateAnDismiss: ', values);
    // save to node
    let node = this.node;
    // compare
    let change = false;
    if (node.name != values.name) {     change = true;      node.name = values.name;    }
    if (node.nick != values.nick) {     change = true;      node.nick = values.nick;    }
    if (node.gender != values.gender) {     change = true;      node.gender = values.gender;    }
    if (node.yob != values.yob) {     change = true;      node.yob = values.yob;    }
    if (node.yod != values.yod) {     change = true;      node.yod = values.yod;    }
    if (node.pob != values.pob) {     change = true;      node.pob = values.pob;    }
    if (node.pod != values.pod) {     change = true;      node.pod = values.pod;    }
    if (node.por != values.por) {     change = true;      node.por = values.por;    }
    
    if (values.child != '') {
      if (!node.parent.children)
        node.parent.children = [];
      // console.log('pnode - name, id: ', node.pnode.name, node.pnode.id);
      // console.log('node - name, id: ', node.name, node.id);
      let childIdx = node.parent.children.length + 1;
      let nodeIdx = 1;
      let id = node.id + '-' + childIdx + '-' + nodeIdx;
      // console.log('node - name, id: ', values.child, id);
      let newNode = { id: id, name: values.child, gender: 'male', nclass: 'not-complete' }
      node.parent.children.push({nodes: [newNode]});
      change = true;
    }

    if (values.spouse != '') {
      // console.log('node - name, id: ', node.name, node.id);
      let id = node.id;
      let ids = id.split('-');
      // take the last one, increase by 1
      let nodeIdx = ids[ids.length-1];
      // console.log('node - nodeIdx: ', nodeIdx);
      id = id.substring(0, id.lastIndexOf('-'));
      id = id + '-' + (+nodeIdx+1);
      // console.log('node - child, id: ', values.spouse, id);
      let newNode = { id: id, name: values.spouse, gender: 'male', nclass: 'not-complete' }
      node.parent.nodes.push(newNode);
      change = true;
    }
    await this.modalCtr.dismiss(change ? 'change' : 'nochange');
  }
  

  async alertMsg(title, message) {
		let alert = await this.alertController.create({
			header: title,
			message: message,
			buttons: ['OK']
		});
		alert.present();
	}

}
