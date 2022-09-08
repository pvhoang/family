import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { ChildPage } from '../child/child.page';

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

  // place: any;
  // placeItem: any = null;
  // translations: any;
  selectPlacesNotFoundText: any = '';
  selectPlacesPlaceholder: any = '';
  genders: Array<any>;
  years: Array<any>;

  selectYearsPlaceholder: any = '';

  // nameTypeStr: string = '';
  selectNamesNotFoundText: any = '';
  selectNamesPlaceholder: any = '';
  names: Observable<string[]>;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private languageService: LanguageService,
    private utilService: UtilService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private typeahead: TypeaheadService
  ) { }

  ngOnInit(): void {
    console.log('NodePage - ngOnInit - node: ', this.node);
    this.title = this.node.name + ' - ' + this.nodeService.getGeneration(this.node);
    this.values = this.nodeService.loadValues(this.node);
    this.values.nameItem = { name: this.values.name }

    this.genders = [
      { id: 'male', name: this.languageService.getTranslation('MALE') },
      { id: 'female', name: this.languageService.getTranslation('FEMALE') }
    ];

    this.years = this.utilService.getYears();

    // this.selectPlacesNotFoundText = this.languageService.getTranslation('SELECT_PLACES_NOT_FOUND_TEXT');
    this.selectPlacesNotFoundText = null;
    this.selectPlacesPlaceholder = this.languageService.getTranslation('SELECT_PLACES_PLACEHOLDER');
    // this.selectNamesNotFoundText = this.languageService.getTranslation('SELECT_PEOPLE_NOT_FOUND_TEXT');
    this.selectNamesNotFoundText = null;
    this.selectNamesPlaceholder = this.languageService.getTranslation('SELECT_PEOPLE_PLACEHOLDER');
    this.selectYearsPlaceholder = this.languageService.getTranslation('SELECT_YEARS_PLACEHOLDER');
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // -------------------------------------

  keydownInDropdown(event) {
    return false;
  }

  clearName() {
    console.log('TreePage - clear');
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
    console.log('TreePage - clear');
    this.values.pob = null;
    this.places = this.typeahead.getJson(null, 'places');
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
    console.log('TreePage - clear');
    this.values.pod = null;
    this.places = this.typeahead.getJson(null, 'places');
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
    console.log('TreePage - clear');
    this.values.por = null;
    this.places = this.typeahead.getJson(null, 'places');
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
    console.log('TreePage - clear');
    this.values.yob = null;
  }

  clearYOD() {
    console.log('TreePage - clear');
    this.values.yod = null;
  }


  // --------- END ng-select ----------

  async onChild() {
    let node:any = this.node;

    console.log('openChildModal - node : ', node);
    const modal = await this.modalCtrl.create({
      component: ChildPage,
      componentProps: {
        'name': 'Detail',
        'node': node
      },
      cssClass: "child-modal"
    });

    modal.onDidDismiss().then((resp) => {
      console.log('onDidDismiss : ', resp);
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        let values = resp.data.values;
        console.log('onChild - values:' , values)
        // console.log('alertAddNode - res:' , res)
        // if (!res.data)
        //   return;
        let name = values.nameItem.name;
        let relation = values.relation;
        let gender = values.gender;
        this.modalCtrl.dismiss({status: 'add', values: {name: name, relation: relation, gender: gender}});
      }
    });
    return await modal.present();
  }

  // async onImage() {
  //   let node:any = this.node;
  //   console.log('NodePage - onImage - node: ', node);
  //   const ele = document.getElementById('family-' + node.id);
  //   let rect:any = ele.getBoundingClientRect();
  //   let width = rect.width + 20;
  //   let height = rect.height + 20;
  //   let keys = this.utilService.stripVN(node.name).split(' ');
  //   let nameStr = keys.join('-')

  //   let gen = this.nodeService.getGeneration(node);
  //   let gkeys = this.utilService.stripVN(gen).split(' ');
  //   let genStr = gkeys.join('-')
  //   let fileName = 'branch-' + nameStr + '-' + genStr + '.jpeg';
  //   let options = {
  //     quality: 0.95,
  //     backgroundColor: '#f0f1f2',
  //     width: width,
  //     height: height
  //   }
  //   htmlToImage.toJpeg(ele, options)
  //   .then(function (dataUrl) {
  //     var link = document.createElement('a');
  //     link.download = fileName;
  //     link.href = dataUrl;
  //     link.click();
  //   });
  //   // await this.modalCtrl.dismiss({status: 'cancel'});
  // }

  async onDelete() {
    let node:any = this.node;
    if (node.family.nodes[0].name == node.name) {
      console.log('NodePage - onDelete - children: ', node.family.children);
        // this is main Node, check children
      if (node.family.children && node.family.children.length > 0) {
        let message = this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']';
        this.utilService.alertMsg('NODE_ERROR_TITLE', message
          // this.languageService.getTranslation('NODE_ERROR_TITLE'),
          // this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']'
        );
          // this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
        return;
      }
    }
    let message = this.languageService.getTranslation('DELETE_PEOPLE_MESSAGE') + ': ' + node.name;
    this.utilService.alertConfirm('DELETE_PEOPLE_HEADER', message, 'CANCEL', 'CONTINUE').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.modalCtrl.dismiss({status: 'delete'});
      }
    });
  }

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
    console.log('NodePage - onSave - node: ', this.node);
    let values = this.values;
    values.name = values.nameItem.name;

    console.log('onSave: ', values);
    if (this.nodeService.isNodeChanged(this.node, values) == false) {
      this.utilService.alertMsg('NODE_SAVE_HEADING', 'NODE_SAVE_MESSAGE');
      return;
    }
    console.log('onSave: change');
    let errorMsg = this.validateData(values);
    if (errorMsg != '') {
      this.utilService.alertMsg('NODE_ERROR_TITLE', errorMsg);
      return;
    }
    await this.modalCtrl.dismiss({status: 'save', values: values});
  }

  private validateData(values: any): string {

    console.log('validateData: values: ', values);
    let msg = '';
    let bullet = '&#8226;&nbsp;';
    // name, nick, gender, dod, desc, yob, yod, pob, pod, por, 
    let nameMsg = '';
    if (values.name == '' || values.name.length < 5)
      nameMsg = bullet + '<b>Ten</b> phai co it nhat 4 ky tu.<br>';

    let dodMsg = '';
    if (values.dod !== '') {
      if (!values.yod) {
        dodMsg = bullet + "<b>Ngay mat</b> phai de trong. Nam tu chua nhap.<br>";
      } else if (values.dod.length != 5 || values.dod.indexOf('/') != 2) {
        dodMsg = bullet + "<b>Ngay mat</b> khong dung mau 'nn/tt'.<br>";
      }
    }
   
    let yobMsg = '';
    let yodMsg = '';
    if (values.yob && values.yod) {
      if (+values.yob.name > values.yod.name) {
        yodMsg = bullet + "Nam tu phai lon hon Nam sinh.<br>";
      }
    } 

    // console.log('yob: ', yob);
    // if (yob != '') {
    //   if (yob.length != 4 && isNaN(yob)) {
    //     yobMsg = bullet + "Nam sinh khong dung mau 'yyyy'.<br>";
    //   } else if (+yob < 1900 || +yob > 2030) {
    //     yobMsg = bullet + "<b>Nam sinh</b> phai lon hon 1900 va nho hon 2023.<br>";
    //   } else
    //     yobNum = +yob;
    // }

    // let yodMsg = '';
    // let yod = values.yod;
    // if (yod !== '') {
    //   if (yod.length != 4 && isNaN(yod)) {
    //     yodMsg = bullet + "Nam tu khong dung mau 'yyyy'.<br>";
    //   } else if (+yob < 1900 || +yob > 2030) {
    //     yodMsg = bullet + "Nam tu phai lon hon 1900 va nho hon 2023.<br>";
    //   } else if (yobNum > 0 && +yod < yobNum) {
    //     yodMsg = bullet + "Nam tu phai lon hon Nam sinh.<br>";
    //   }
    // }

    let pobMsg = (values.pob && values.pob.name != '' && values.pob.name.length < 5) ? bullet + 'Noi sinh phai co it nhat 5 ky tu.<br>' : '';
    let podMsg = (values.pod && values.pod.name != '' && values.pod.name.length < 5) ? bullet + 'Noi tu phai co it nhat 5 ky tu.<br>' : '';
    let porMsg = (values.por && values.por.name != '' && values.por.name.length < 5) ? bullet + 'Noi sinh song phai co it nhat 5 ky tu.<br>' : '';
    msg = nameMsg + dodMsg + yobMsg + yodMsg + pobMsg + podMsg + porMsg;
    return msg;
  }
}
