import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import * as htmlToImage from 'html-to-image';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';

@Component({
  selector: 'app-child',
  templateUrl: './child.page.html',
  styleUrls: ['./child.page.scss'],
})
export class ChildPage implements OnInit {

  @Input() name: string;
  @Input() node: any;

  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;

  title: any;
  values: any = {};
  genders: Array<any>;
  relations: Array<any>;

  nameTypeStr: string = '';
  names: Observable<string[]>;
  selectNamesNotFoundText: any = '';
  selectNamesPlaceholder: any = 'Place holder';
  selectRelationPlaceholder: any = '';
  selectGenderPlaceholder: any = '';

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {
    console.log('ChildPage - ngOnInit - node: ', this.node);
    this.title = this.languageService.getTranslation('CHILD_ADD');
    this.values.nameItem = null;
    this.values.relation = null;
    this.values.gender = null;
    this.relations = [
      { id: 'child', name: this.languageService.getTranslation('CHILD') },
      { id: 'wife', name: this.languageService.getTranslation('WIFE') },
      { id: 'husband', name: this.languageService.getTranslation('HUSBAND') },
    ];
    this.genders = [
      { id: 'male', name: this.languageService.getTranslation('MALE') },
      { id: 'female', name: this.languageService.getTranslation('FEMALE') }
    ];
    this.selectNamesNotFoundText = null;
    // this.selectNamesNotFoundText = this.languageService.getTranslation('SELECT_PEOPLE_NOT_FOUND_TEXT');
    this.selectNamesPlaceholder = this.languageService.getTranslation('SELECT_PEOPLE_PLACEHOLDER');
    this.selectRelationPlaceholder = this.languageService.getTranslation('SELECT_RELATION_PLACEHOLDER');
    this.selectGenderPlaceholder = this.languageService.getTranslation('SELECT_GENDER_PLACEHOLDER');
  }

  clear() {
    console.log('ChildPage - clear');
    this.values.nameItem = null;
    this.names = this.typeahead.getJsonNames(null);
  }

  keydown(event) {
    if (event.key !== 'Enter')
      return;
    this.values.nameItem = {name: event.target.value};
    this.ngSelectComponent.close();
  }

  keyup(event) {
    this.names = this.typeahead.getJsonNames(event.target.value);
  }

  keydownInDropdown(event) {
    return false;
  }

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  async onSave() {
    console.log('NodePage - onSave - values: ', this.values);
    console.log('onSave: change');
    let errorMsg = this.validateData(this.values);
    if (errorMsg != '') {
      this.utilService.alertMsg('NODE_ERROR_TITLE', errorMsg);
      return;
    }
    await this.modalCtrl.dismiss({status: 'save', values: this.values});
  }

  private validateData(values: any): string {
    // console.log('validateData: values: ', values);
    let msg = '';
    if (!values.nameItem ||  values.nameItem.name.length < 4)
      msg += 'Tên không hợp lệ. <br>';
    return msg;
  }
  
}
