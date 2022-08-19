import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { TypeaheadService } from '../../services/typeahead.service';
import * as htmlToImage from 'html-to-image';
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
  // translations: any;
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
    console.log('NodePage - ngOnInit - node: ', this.node);
    this.title = this.node.name + ' - ' + this.familyService.getGeneration(this.node);
    // this.translations = this.languageService.getTrans();
    this.values = this.familyService.loadValues(this.node);
    this.genders = [
      { id: 'male', name: this.languageService.getTranslation('MALE') },
      { id: 'female', name: this.languageService.getTranslation('FEMALE') }
    ];
    this.selectPlacesNotFoundText = this.languageService.getTranslation('SELECT_PLACES_NOT_FOUND_TEXT');
    this.selectPlacesPlaceholder = this.languageService.getTranslation('SELECT_PLACES_PLACEHOLDER');
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

  clear() {
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

  onChild() {
    // let node:any = this.sNodes[this.searchIdx - 1];
    // verify ???

    let header = this.languageService.getTranslation('TREE_ADD_CHILD');
    let msg = header;
    let texts = [
      this.languageService.getTranslation('TREE_ADD_NAME_PLACEHOLDER'),
      this.languageService.getTranslation('TREE_ADD_RELATION_PLACEHOLDER'),
      this.languageService.getTranslation('TREE_ADD_GENDER_PLACEHOLDER'),
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('OK')
    ]
    this.utilService.alertAddNode(header, msg, texts).then((res) => {
      console.log('alertAddNode - res:' , res)
      if (!res.data)
        return;
      let name = res.data.name;
      let relation = res.data.relation;
      let gender = res.data.gender == '1' ? 'male' : 'female';
      this.modalCtr.dismiss({status: 'add', values: {name: name, relation: relation, gender: gender}});
    })
  }

  async onImage() {
    let node:any = this.node;
    console.log('NodePage - onImage - node: ', node);
    const ele = document.getElementById('family-' + node.id);
    let rect:any = ele.getBoundingClientRect();
    let width = rect.width + 20;
    let height = rect.height + 20;
    let keys = this.utilService.stripVN(node.name).split(' ');
    let nameStr = keys.join('-')

    let gen = this.familyService.getGeneration(node);
    let gkeys = this.utilService.stripVN(gen).split(' ');
    let genStr = gkeys.join('-')
    let fileName = 'branch-' + nameStr + '-' + genStr + '.jpeg';
    let options = {
      quality: 0.95,
      backgroundColor: '#f0f1f2',
      width: width,
      height: height
    }
    htmlToImage.toJpeg(ele, options)
    .then(function (dataUrl) {
      var link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    });
    await this.modalCtr.dismiss({status: 'cancel'});
  }

  async onDelete() {
    let node:any = this.node;
    if (node.family.nodes[0].name == node.name) {
      console.log('NodePage - onDelete - children: ', node.family.children);
        // this is main Node, check children
      if (node.family.children && node.family.children.length > 0) {
        this.utilService.alertMsg(
          this.languageService.getTranslation('NODE_ERROR_TITLE'),
          this.languageService.getTranslation('NODE_ERR_HAVE_CHILDREN') + '[' + node.name + ']'
        );
          // this.translations.NODE_ERROR_TITLE, this.translations.NODE_ERR_HAVE_CHILDREN + '[' + this.node.name + ']');
        return;
      }
    }
    this.utilService.alertConfirm(
      this.languageService.getTranslation('DELETE_PEOPLE_HEADER'),
      this.languageService.getTranslation('DELETE_PEOPLE_MESSAGE') + ': ' + node.name,
      this.languageService.getTranslation('CANCEL'),
      this.languageService.getTranslation('CONTINUE')).then((res) => {
      console.log('onDelete - res:' , res)
      if (res) {
        this.modalCtr.dismiss({status: 'delete'});
      }
    });
  }

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    let values = this.values;
    if (this.familyService.isNodeChanged(this.node, values)) {

      let header = this.languageService.getTranslation('NODE_CANCEL_HEADING');
      let message = this.languageService.getTranslation('NODE_CANCEL_MESSAGE');
      let cancelText = this.languageService.getTranslation('CANCEL');
      let okText = this.languageService.getTranslation('CONTINUE');
      this.utilService.alertConfirm(header, message, cancelText, okText).then((res) => {
        if (res.data)
          this.modalCtr.dismiss({status: 'cancel'});
      })
      return;
    }
    await this.modalCtr.dismiss({status: 'cancel'});
  }

  async onSave() {
    console.log('NodePage - onSave - node: ', this.node);
    let values = this.values;
    console.log('onSave: ', values);
    if (this.familyService.isNodeChanged(this.node, values) == false) {
      let header = this.languageService.getTranslation('NODE_SAVE_HEADING');
      let message = this.languageService.getTranslation('NODE_SAVE_MESSAGE');
      this.utilService.alertMsg(header, message);
      return;
    }
    console.log('onSave: change');
    let errorMsg = this.validateData(values);
    if (errorMsg != '') {
      this.utilService.alertMsg(this.languageService.getTranslation('NODE_ERROR_TITLE'), errorMsg);
      return;
    }
    await this.modalCtr.dismiss({status: 'save', values: values});
  }

  private validateData(values: any): string {

    // console.log('validateData: values: ', values);
    let msg = '';
    let bullet = '&#8226;&nbsp;';
    // name, nick, gender, dod, desc, yob, yod, pob, pod, por, 
    let nameMsg = '';
    if (values.name == '' || values.name.length < 5)
      nameMsg = bullet + '<b>Ten</b> phai co it nhat 5 ky tu.<br>';
    let dodMsg = '';
    if (values.dod !== '' && values.dod.length != 5 && values.dod.indexOf('/') != 2) 
      dodMsg = bullet + "<b>Ngay mat</b> khong dung mau 'nn/tt'.<br>";

    let yobMsg = '';
    let yobNum = 0;
    let yob = values.yob;
    if (yob != '') {
      if (yob.length != 4 && isNaN(yob)) {
        yobMsg = bullet + "Nam sinh khong dung mau 'yyyy'.<br>";
      } else if (+yob < 1900 || +yob > 2030) {
        yobMsg = bullet + "<b>Nam sinh</b> phai lon hon 1900 va nho hon 2023.<br>";
      } else
        yobNum = +yob;
    }

    let yodMsg = '';
    let yod = values.yod;
    if (yod !== '') {
      if (yod.length != 4 && isNaN(yod)) {
        yodMsg = bullet + "Nam tu khong dung mau 'yyyy'.<br>";
      } else if (+yob < 1900 || +yob > 2030) {
        yodMsg = bullet + "Nam tu phai lon hon 1900 va nho hon 2023.<br>";
      } else if (yobNum > 0 && +yod < yobNum) {
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
