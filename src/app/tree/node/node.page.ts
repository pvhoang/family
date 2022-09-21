import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { NodeService } from '../../services/node.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit {

  @Input() caller: string;
  @Input() node: any;

  @ViewChild('ngSelectName') ngSelectName: NgSelectComponent;
  @ViewChild('ngSelectPOB') ngSelectPOB: NgSelectComponent;
  @ViewChild('ngSelectPOD') ngSelectPOD: NgSelectComponent;
  @ViewChild('ngSelectPOR') ngSelectPOR: NgSelectComponent;

  title: any;
  values: any = {};
  places: Observable<string[]>;
  canAddChild: any = true;
  canDelete: any = true;

  selectPlacesNotFoundText: any = '';
  selectPlacesPlaceholder: any = '';
  genders: Array<any>;
  years: Array<any>;
  days: Array<any>;
  months: Array<any>;
  locations: Array<any> = [];

  selectYearsPlaceholder: any = '';
  selectDaysPlaceholder: any = '';
  selectMonthsPlaceholder: any = '';
  selectNamesNotFoundText: any = '';
  selectNamesPlaceholder: any = '';
  names: Observable<string[]>;

  selectGenderPlaceholder: any = '';
  
  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private nodeService: NodeService,
    private typeahead: TypeaheadService,
  ) { }

  ngOnInit(): void {
    // console.log('NodePage - ngOnInit - node: ', this.node);
    this.title = this.node.name + ' - ' + this.nodeService.getGeneration(this.node);
    this.values = this.nodeService.loadValues(this.node);
    this.values.nameItem = { name: this.values.name }

    this.genders = [
      { id: 'male', name: this.languageService.getTranslation('MALE') },
      { id: 'female', name: this.languageService.getTranslation('FEMALE') }
    ];

    this.typeahead.getJsonPlaces().then((data:any) => {
      this.locations = data;
    })

    this.years = this.utilService.getYears();
    this.days = this.utilService.getDays();
    this.months = this.utilService.getMonths();

    this.selectPlacesNotFoundText = null;
    this.selectPlacesPlaceholder = this.languageService.getTranslation('NODE_SELECT_PLACES_PLACEHOLDER');
    this.selectNamesNotFoundText = null;
    this.selectNamesPlaceholder = this.languageService.getTranslation('NODE_SELECT_PEOPLE_PLACEHOLDER');
    this.selectYearsPlaceholder = this.languageService.getTranslation('NODE_SELECT_YEARS_PLACEHOLDER');
    this.selectDaysPlaceholder = this.languageService.getTranslation('NODE_SELECT_DAYS_PLACEHOLDER');
    this.selectMonthsPlaceholder = this.languageService.getTranslation('NODE_SELECT_MONTHS_PLACEHOLDER');
    this.selectGenderPlaceholder = this.languageService.getTranslation('NODE_SELECT_GENDER_PLACEHOLDER');

    // set node type
    let node = this.node;
    if (node.family.nodes[0].name == node.name) {
      // valid 1st node
      if (node.family.children && node.family.children.length > 0)
        this.canDelete = false;
    } else {
      // spouse node, can not add child
      this.canAddChild = false;
    }

  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // -------------------------------------

  keydownInDropdown(event) {
    return false;
  }

  clearName() {
    // console.log('TreePage - clear');
    this.values.nameItem = null;
    this.names = this.typeahead.getJsonNames(null);
  }

  keydownName(event) {
    if (event.key !== 'Enter')
      return;
    this.values.nameItem = {name: event.target.value};
    this.ngSelectName.close();
  }

  keyupName(event) {
    this.names = this.typeahead.getJsonNames(event.target.value);
  }

  clearPOB() {
    // console.log('TreePage - clear');
    this.values.pob = null;
    // this.places = this.typeahead.getJson(null, 'places');
  }

  keydownPOB(event) {
    if (event.key !== 'Enter')
      return;
    this.values.pob = {name: event.target.value};
    this.ngSelectPOB.close();
  }

  keyupPOB(event) {
    this.places = this.typeahead.getJson(event.target.value, 'places');
  }

  clearPOD() {
    // console.log('TreePage - clear');
    this.values.pod = null;
    // this.places = this.typeahead.getJson(null, 'places');
  }

  keydownPOD(event) {
    if (event.key !== 'Enter')
      return;
    this.values.pod = {name: event.target.value};
    this.ngSelectPOD.close();
  }

  keyupPOD(event) {
    this.places = this.typeahead.getJson(event.target.value, 'places');
  }

  clearPOR() {
    // console.log('TreePage - clear');
    this.values.por = null;
    // this.places = this.typeahead.getJson(null, 'places');
  }

  keydownPOR(event) {
    if (event.key !== 'Enter')
      return;
    this.values.por = {name: event.target.value};
    this.ngSelectPOR.close();
  }

  keyupPOR(event) {
    this.places = this.typeahead.getJson(event.target.value, 'places');
  }

  clearYOB() {
    // console.log('TreePage - clear');
    this.values.yob = null;
  }

  clearYOD() {
    // console.log('TreePage - clear');
    this.values.yod = null;
  }

  clearDOD_DAY() {
    // console.log('TreePage - clear');
    this.values.dod_day = null;
  }

  clearDOD_MONTH() {
    // console.log('TreePage - clear');
    this.values.dod_month = null;
  }

  // --------- END ng-select ----------

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    let values = this.values;
    if (this.nodeService.isNodeChanged(this.node, values)) {
      this.utilService.alertConfirm('NODE_CANCEL_HEADING', 'NODE_CANCEL_MESSAGE', 'CANCEL', 'CONTINUE').then((res) => {
        if (res.data)
          this.modalCtrl.dismiss({status: 'cancel'});
      })
      return;
    }
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  async onSave() {
    let values = this.values;
    values.name = values.nameItem.name;
    // console.log('onSave: ', values);
    if (this.nodeService.isNodeChanged(this.node, values) == false) {
      this.utilService.alertMsg('NODE_SAVE_HEADING', 'NODE_SAVE_MESSAGE');
      return;
    }
    let errorMsg = this.validateData(values);
    if (errorMsg != '') {
      this.utilService.alertMsg('NODE_ERROR_TITLE', errorMsg);
      return;
    }
    await this.modalCtrl.dismiss({status: 'save', values: values});
  }

  private validateData(values: any): string {

    // console.log('validateData: values: ', values);
    let msg = '';
    let bullet = '&#8226;&nbsp;';
    // name, nick, gender, dod, desc, yob, yod, pob, pod, por, 
    let nameMsg = '';
    if (values.name == '' || values.name.length < 5)
      nameMsg = bullet + '<b>Ten</b> phai co it nhat 4 ky tu.<br>';

    let dodMsg = '';
    if (values.dod_day && values.dod_month) {
      if (!values.yod) {
        dodMsg = bullet + "<b>Ngay mat</b> phai de trong. Nam tu chua nhap.<br>";
      // } else if (values.dod.length != 5 || values.dod.indexOf('/') != 2) {
      //   dodMsg = bullet + "<b>Ngay mat</b> khong dung mau 'nn/tt'.<br>";
      }
    }
   
    let yobMsg = '';
    let yodMsg = '';
    if (values.yob && values.yod) {
      if (+values.yob.name > values.yod.name) {
        yodMsg = bullet + "Nam tu phai lon hon Nam sinh.<br>";
      }
    } 

    let pobMsg = (values.pob && values.pob.name != '' && values.pob.name.length < 5) ? bullet + 'Noi sinh phai co it nhat 5 ky tu.<br>' : '';
    let podMsg = (values.pod && values.pod.name != '' && values.pod.name.length < 5) ? bullet + 'Noi tu phai co it nhat 5 ky tu.<br>' : '';
    let porMsg = (values.por && values.por.name != '' && values.por.name.length < 5) ? bullet + 'Noi sinh song phai co it nhat 5 ky tu.<br>' : '';
    msg = nameMsg + dodMsg + yobMsg + yodMsg + pobMsg + podMsg + porMsg;
    return msg;
  }
}
