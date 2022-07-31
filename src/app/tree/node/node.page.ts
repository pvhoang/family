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

  // validationsForm: UntypedFormGroup;
  validationsForm: FormGroup;
  places: Observable<string[]>;
  place: any;
  placeStr: any = '';
  placeData: any;
  placeItem: any;
  // genderData: any;
  // genderItem: any;

  translations: any;
  // gender: any = '';
  genders: Array<any>;
  selectedGender: string;

  validations = {
    'name': [
      { type: 'required', message: 'NODE_NAME_ERROR' },
    ],
  };

  constructor(
    private modalCtr: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {

    let node = this.node;
    // console.log('node: ', this.node);
    this.translations = this.languageService.getTrans();
    // this.genders = [
    //   { value: 'male', label: this.translations.MALE },
    //   { value: 'female', label: this.translations.FEMALE }
    // ];
    this.genders = [
      { id: 'male', name: this.translations.MALE },
      { id: 'female', name: this.translations.FEMALE }
    ];
    // this.selectedGender = this.genders[0].id;

    this.placeData = {pob: {name: node.pob}, pod: {name: node.pod}, por: {name: node.por}};
    // this.genderData = {id: node.gender, name: node.gender == 'male' ? this.translations.MALE : this.translations.FEMALE};
    this.selectedGender = node.gender;

    console.log('placeData: ', this.placeData);

    this.validationsForm = new FormGroup({
      'name': new FormControl(node.name, Validators.required),
      'nick': new FormControl(node.nick),
      // 'gender': new FormControl(this.genderData),
      'gender': new FormControl(this.selectedGender),
      'yob': new FormControl(node.yob),
      'yod': new FormControl(node.yod),
      'pob': new FormControl(this.placeData.pob),
      'pod': new FormControl(this.placeData.pod),
      'por': new FormControl(this.placeData.por),
      'child': new FormControl(''),
      'spouse': new FormControl('')
    });
  }

  async onSubmit(values) {
    if (!this.validationsForm.valid)
      return;

    if (values.pob.name) values.pob = values.pob.name;
    if (values.pod.name) values.pod = values.pod.name;
    if (values.por.name) values.por = values.por.name;

    console.log('onSubmit: ', values);

    let errorMsg = '';
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

    if (errorMsg != '') {
      this.alertMsg(this.translations.NODE_ERROR_TITLE, errorMsg);
      return;
    }

    if (values.child != '' || values.spouse != '') {
      let alert = await this.alertController.create({
        header: this.translations.ADD_PEOPLE_HEADER,
        message: this.translations.ADD_PEOPLE_MESSAGE,
        buttons: [
          {
            text: this.translations.CANCEL,
            handler: (data: any) => {
            }
          },
          {
            text: this.translations.OK,
            handler: (data: any) => {
              this.updateAnDismiss(values);
            }
          }
        ]
      });
      alert.present();
    } else {
      this.updateAnDismiss(values);
    }
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
    
    // node.nick = values.nick;
    // node.gender = values.gender;
    // node.yob = values.yob;
    // node.yod = values.yod;
    // node.pob = values.pob.name;
    // node.pod = values.pod.name;
    // node.por = values.por.name;

    if (values.child != '') {
      if (!node.parent.children)
        node.parent.children = [];

      // node.id = '' + nodeLevel + '-' + (++nodeIdx);
      // 1-1-4-1-1-1
      // node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;

      console.log('pnode - name, id: ', node.pnode.name, node.pnode.id);
      console.log('node - name, id: ', node.name, node.id);
      let childIdx = node.parent.children.length + 1;
      let nodeIdx = 1;
      let id = node.id + '-' + childIdx + '-' + nodeIdx;
      console.log('node - name, id: ', values.child, id);

      let newNode = { id: id, name: values.child, gender: 'male', nclass: 'not-complete' }

      node.parent.children.push({nodes: [newNode]});

      // let ids = node.id.split('-');
      // let nodeLevel = ids[0];
      // // let nodeIdx = ids[1];
      // let id = '' + (nodeLevel+1) + (node.parent.children.length + 1)
      // let newNode = { name: values.child, nclass: 'not-complete' }

      // node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      // console.log('name, id: ', nodeIdx, node.name, node.id);
      // node.pnode = pnode;

      // node.parent.children.push({nodes: [{ id: id, name: values.child, nclass: 'not-complete' }]});
      change = false;
    }

    if (values.spouse != '') {

      // if (!node.parent.nodes)
      //   node.parent.nodes = [];

      // let ids = node.id.split('-');
      // let nodeLevel = ids[0];
      // // let nodeIdx = ids[1];
      // let id = '' + nodeLevel + (node.parent.nodes.length + 1)

      // console.log('pnode - name, id: ', node.pnode.name, node.pnode.id);
      console.log('node - name, id: ', node.name, node.id);
      // let childIdx = node.parent.children.length + 1;
      // let nodeIdx = 1;
      // let id = node.id + '-' + childIdx + '-' + nodeIdx;
      let id = node.id;
      let ids = id.split('-');
      // take the last one, increase by 1
      let nodeIdx = ids[ids.length-1];
      console.log('node - nodeIdx: ', nodeIdx);

      id = id.substring(0, id.lastIndexOf('-'));
      id = id + '-' + (+nodeIdx+1);
      console.log('node - child, id: ', values.spouse, id);

      let newNode = { id: id, name: values.spouse, gender: 'male', nclass: 'not-complete' }

      // node.parent.children.push({nodes: [newNode]});
      // node.parent.push({nodes: [{ id: id, name: values.spouse, nclass: 'not-complete' }]});
      // node.parent.children.push({nodes: [newNode]});

      // node.parent.nodes.push(newNode);

      node.parent.nodes.push(newNode);

      change = true;
    }
    await this.modalCtr.dismiss(change ? 'change' : 'nochange');
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
        this.alertMsg(this.translations.NODE_ERROR_TITLE, 'Can not delete. Node has children');
        return;
      }
    }

    let alert = await this.alertController.create({
      header: this.translations.ADD_PEOPLE_HEADER,
      message: this.translations.ADD_PEOPLE_MESSAGE,
      buttons: [
        {
          text: this.translations.CANCEL,
          handler: (data: any) => {
          }
        },
        {
          text: this.translations.OK,
          handler: (data: any) => {
              // delete the node
              // save to node
            let nodes = this.node.parent.nodes;
            console.log(nodes);
            // console.log('this node name: ', this.node.name);
            this.node.parent.nodes = nodes.filter((node:any) => {
              // console.log('node name: ', node.name);
              return (node.name != this.node.name);
            });
            // console.log(this.node.parent.nodes);
            this.modalCtr.dismiss('delete');
          }
        }
      ]
    });
    alert.present();
    
  }

  keyup(event, json) {
    console.log('keyup: ', event);
    if (event.key == 'Enter')
      this.closePlace(1);
    this.places = this.typeahead.getJson(event.target.value, json);
  }

  focus(name) {
    console.log('focus: ', name);
    this.placeItem = name;
  }

  closePlace(mode?: any) {
    console.log('closePlace: ', mode);
    if (mode)
      this.placeData[this.placeItem] = {name: this.placeStr};
  }

  closeGender() {
    console.log('closeGender: ');
  }

  search(event) {
    // console.log('search: ', event);
    this.placeStr = event.term;
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
