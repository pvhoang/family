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
  translations: any;
  gender: any = '';
  genders: Array<any>;

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
    this.genders = [
      { value: 'male', label: this.translations.MALE },
      { value: 'female', label: this.translations.FEMALE }
    ];
    this.placeData = {pob: {name: node.pob}, pod: {name: node.pod}, por: {name: node.por}};
    console.log('placeData: ', this.placeData);

    this.validationsForm = new FormGroup({
      'name': new FormControl(node.name, Validators.required),
      'nick': new FormControl(node.nick),
      'gender': new FormControl(node.gender),
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
    console.log('onSubmit: ', values);
    if (!this.validationsForm.valid)
      return;
    let errorMsg = '';
    // name must be  defined
    if (values.name == '') 
      errorMsg += this.translations.NODE_ERR_NAME_IS_BLANK + '<br/>';
    
    // place of death must be empty if year of death is empty
    if (values.yod == '' && values.pod.name != '') 
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
    // save to node
    let node = this.node;
    node.name = values.name;
    node.nick = values.nick;
    node.gender = values.gender;
    node.yob = values.yob;
    node.yod = values.yod;
    node.pob = values.pob.name;
    node.pod = values.pod.name;
    node.por = values.por.name;
    if (values.child != '') {
      node.parent.children.push({nodes: [{ name: values.child, nclass: 'not-complete' }]});
    } 
    if (values.spouse != '') 
      node.parent.push({nodes: [{ name: values.spouse, nclass: 'not-complete' }]});

    await this.modalCtr.dismiss('OK');
  }
  
  async onCancel() {
    console.log('onCancel: ');
    await this.modalCtr.dismiss(null);
  }

  keyup(event, json) {
    console.log('keyup: ', event);
    if (event.key == 'Enter')
      this.close(1);
    this.places = this.typeahead.getJson(event.target.value, json);
  }

  focus(name) {
    console.log('focus: ', name);
    this.placeItem = name;
  }

  close(mode?: any) {
    console.log('close: ', mode);
    if (mode)
      this.placeData[this.placeItem] = {name: this.placeStr};
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
