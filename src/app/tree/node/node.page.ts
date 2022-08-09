import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';
import { MIN_YEAR, MAX_YEAR } from '../../../environments/environment';

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit {

  @Input() name: string;
  @Input() node: any;

  title: any;
  values: any = {};
  places: Observable<string[]>;
  place: any;
  placeItem: any = null;
  translations: any;
  selectGender: any = '';
  selectPlacesNotFoundText: any = 'Not found text';
  selectPlacesPlaceholder: any = 'Place holder';
  genders: Array<any>;

  constructor(
    private modalCtr: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {
    // console.log('NodePage - ngOnInit - node: ', this.node);
    this.title = this.node.name + ' - ' + this.familyService.getGeneration(this.node);
    this.translations = this.languageService.getTrans();
    this.values = this.loadValues();
    this.genders = [
      { id: 'male', name: this.translations.MALE },
      { id: 'female', name: this.translations.FEMALE }
    ];
    this.selectGender = this.node.gender;
    this.selectPlacesNotFoundText = this.translations.SELECT_PLACES_NOT_FOUND_TEXT;
    this.selectPlacesPlaceholder = this.translations.SELECT_PLACES_PLACEHOLDER;

  }

  loadValues() {
    let values:any = {};
    let node = this.node;
    values.name = node.name;
    values.nick = node.nick;
    values.gender = node.gender;
    values.yob = node.yob;
    values.yod = node.yod;
    values.pob = (node.pob == '') ? null : {name: node.pob};
    values.pod = (node.pod == '') ? null : {name: node.pod};
    values.por = (node.por == '') ? null : {name: node.por};
    values.child = node.child;
    values.spouse = node.spouse;
    return values;
  }

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    let values = this.values;
    if (this.familyService.isNodeChanged(this.node, values)) {
      this.utilService.alertConfirm(this.translations.NODE_CANCEL_HEADING, this.translations.NODE_CANCEL_MESSAGE, this.translations.CANCEL, this.translations.CONTINUE).then((res) => {
        if (res.data) {
          this.modalCtr.dismiss({status: 'cancel'});
        }
      })
      return;
    }
    await this.modalCtr.dismiss({status: 'cancel'});
  }

  async onDelete() {
    if (this.node.family.nodes[0].name == this.node.name) {
      console.log('NodePage - onDelete - children: ', this.node.family.children);
        // this is main Node, check children
      if (this.node.family.children && this.node.family.children.length > 0) {
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
            this.modalCtr.dismiss({status: 'delete'});
          }
        }
      ]
    });
    alert.present();
  }

  keyup(event, json: any) {
    // console.log('NodePage - keyup: ', event);
    this.places = this.typeahead.getJson(event.target.value, json);
  }

  focus(name: any) {
    // console.log('NodePage - focus: ', name);
    this.placeItem = name;
  }

  blur() {
    // console.log('NodePage - blur');
    this.placeItem = null;
  }

  closePlace() {
    // console.log('NodePage - closePlace');
  }

  closeGender() {
    // console.log('NodePage - closeGender - ', this.selectGender);
  }

  search(event) {
    // console.log('NodePage - search: ', event);
    this.values[this.placeItem] = {name: event.term};
  }

  async onSave() {
    // console.log('NodePage - onSave - node: ', this.node);
    let values = this.values;
    console.log('onSave: ', values);
    if (this.familyService.isNodeChanged(this.node, values) == false) {
      this.utilService.alertMsg(this.translations.NODE_SAVE_HEADING, this.translations.NODE_SAVE_MESSAGE);
      return;
    }
    console.log('onSave: change');

    let errorMsg = '';
    // --- data validation

    // name must be  defined
    if (values.name == '') 
      errorMsg += this.translations.NODE_ERR_NAME_IS_BLANK + '<br/>';

    // years must be valid
    let yobTemp = 0;
    if (values.yob != '') {
      if (isNaN(values.yob)) {
        errorMsg += this.translations.NODE_ERR_YOB_ERROR + '<br/>';
      } else {
        let yob = parseInt(values.yob);
        if (yob < MIN_YEAR || yob > MAX_YEAR) {
          errorMsg += this.translations.NODE_ERR_YOB_ERROR + '<br/>';
        }
        yobTemp = yob;
      }
    }
    if (values.yod != '') {
      if (isNaN(values.yod)) {
        errorMsg += this.translations.NODE_ERR_YOD_ERROR + '<br/>';
      } else {
        let yod = parseInt(values.yod);
        if (yod < MIN_YEAR || yod > MAX_YEAR) {
          errorMsg += this.translations.NODE_ERR_YOD_ERROR + '<br/>';
        }
        if (yod < yobTemp) {
          errorMsg += this.translations.NODE_ERR_YOD_ERROR + '<br/>';
        }
      }
    }

    // --- end data validation
    console.log('onSave: errorMsg:' , errorMsg);

    if (errorMsg != '') {
      this.utilService.alertMsg(this.translations.NODE_ERROR_TITLE, errorMsg);
      return;
    }
    await this.modalCtr.dismiss({status: 'save', values: values});
  }
}
