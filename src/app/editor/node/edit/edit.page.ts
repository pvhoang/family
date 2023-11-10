import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController, Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { TypeaheadService } from '../../../services/typeahead.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { LanguageService } from '../../../services/language.service';
import { CropperModalPage } from './cropper-modal/cropper-modal.page';
import { UtilService } from '../../../services/util.service';
import { NodeService } from '../../../services/node.service';
import { FirebaseService } from '../../../services/firebase.service';
import { FONTS_FOLDER, DEBUGS, environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  @Input() caller: string;
  @Input() node: any;
  @Input() family: any;
  @Input() info: any;

  @ViewChild('ngSelectPOB') ngSelectPOB: NgSelectComponent;
  @ViewChild('ngSelectPOD') ngSelectPOD: NgSelectComponent;
  @ViewChild('ngSelectPOR') ngSelectPOR: NgSelectComponent;
  @ViewChild('ngSelectJOB') ngSelectJOB: NgSelectComponent;

  @ViewChild('popover') popover:any;

  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;

  FONTS_FOLDER = FONTS_FOLDER;
  title: any;
  values: any = {};
  places: Observable<string[]>;
  canAddChild: any = true;
  canDelete: any = true;
  ancestor: any;
  selectPlacesNotFoundText: any = '';
  selectPlacesPlaceholder: any = '';
  selectJobsPlaceholder: any = '';
  genders: Array<any>;
  years: Array<any>;
  days: Array<any>;
  months: Array<any>;
  locations: Array<any> = [];
  isOpen = false;
  yobYears: any;
  jobs: any
  passAway = false;
  selectYearsPlaceholder: any = '';
  selectDaysPlaceholder: any = '';
  selectMonthsPlaceholder: any = '';
  selectNamesNotFoundText: any = '';
  selectNamesPlaceholder: any = '';
  names: Observable<string[]>;
  searchNames = [];
  selectGenderPlaceholder: any = '';
  photoBase64: any;
  photoNew = false;

  constructor(
    private modalCtrl: ModalController,
    public platform: Platform,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService,
    private utilService: UtilService,
    private fbService: FirebaseService,
    private nodeService: NodeService,
    private typeahead: TypeaheadService,
  ) { 
    defineCustomElements(window);
  }

  ngOnInit(): void {
    if (DEBUGS.EDIT)
      console.log('EditPage - ngOnInit - node: ', this.node);
    this.title = this.node.name;
    this.ancestor = this.info.id;

    this.values = this.nodeService.loadValues(this.node);
    this.getPhotoBase64();

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
    this.yobYears = this.years;
    this.jobs = this.utilService.getJobs();
    
    this.selectPlacesNotFoundText = null;
    this.selectNamesPlaceholder = this.languageService.getTranslation('EDIT_SELECT_PEOPLE_PLACEHOLDER');
    this.selectNamesNotFoundText = null;

    this.selectPlacesPlaceholder = this.languageService.getTranslation('EDIT_SELECT_PLACES_PLACEHOLDER');
    this.selectJobsPlaceholder = this.languageService.getTranslation('EDIT_SELECT_JOBS_PLACEHOLDER');
    this.selectYearsPlaceholder = this.languageService.getTranslation('EDIT_SELECT_YEARS_PLACEHOLDER');
    this.selectDaysPlaceholder = this.languageService.getTranslation('EDIT_SELECT_DAYS_PLACEHOLDER');
    this.selectMonthsPlaceholder = this.languageService.getTranslation('EDIT_SELECT_MONTHS_PLACEHOLDER');
    this.selectGenderPlaceholder = this.languageService.getTranslation('EDIT_SELECT_GENDER_PLACEHOLDER');

    if (DEBUGS.EDIT)
      console.log('EditPage - ngOnInit - values: ', this.values);

    this.passAway = this.values.yod != null;
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

  presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  onName(name: any) {
    this.isOpen = false;
    this.values.name = name;
  }

  keyupItem(event: any, item: any) { 
    let value = event.target.value;
    let dotKey = value.endsWith(".");
    let enterKey = !environment.android && event.key == 'Enter';
    if (DEBUGS.EDIT)
      console.log('EditPage - keyupItem - dotKey, enterKey, value: ', dotKey, enterKey, value);
    if (!(dotKey || enterKey))
      return;
    if (dotKey)
      value = value.substring(0, value.length -1);
    if (item == 'name') {
      this.typeahead.getEvaluatedName(value).then((names:any) => {
        if (DEBUGS.EDIT)
          console.log('EditPage - keyupItem - dotKey, enterKey, value, names: ', dotKey, enterKey, value, names);
        if (names.length == 1) {
          let val = names[0];
          if (dotKey && value == names[0])
            val += '.';
          this.values.name = val;
          this.searchNames = [];
        } else {
          this.searchNames = names;
          this.presentPopover(event);
        }
      });
    } else {
      this.values[item] = value;
      if (item == 'pob') this.ngSelectPOB.close();
      if (item == 'por') this.ngSelectPOR.close();
      if (item == 'pod') this.ngSelectPOD.close();
      if (item == 'job') this.ngSelectJOB.close();
    }
  }
  
  clearItem(item) {
    if (DEBUGS.EDIT)
      console.log('EditPage - clearItem');
    this.values[item] = null;
  }

  closeYOD() {
    if (DEBUGS.EDIT)
      console.log('EditPage - closeYOD: ', this.values.yod);
    this.passAway = true;
  }

  clearYOD() {
    this.values.yod = null;
    if (DEBUGS.EDIT)
      console.log('EditPage - clearYOD: ', this.values.yod);
    this.passAway = false;
  }

  // --------- END ng-select ----------

  async onCancel() {
    let values = this.values;
    if (this.nodeService.isNodeChanged(this.node, values)) {
      this.utilService.alertConfirm('EDIT_CANCEL_HEADING', 'EDIT_CANCEL_MESSAGE', 'RETURN', 'CONTINUE').then((res) => {
        if (res.data)
          this.modalCtrl.dismiss({status: 'cancel'});
      })
      return;
    }
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  async onSave() {
    if (DEBUGS.EDIT)
      console.log('EditPage - onSave - values: ', this.values);

    this.savePhotoBase64();
    let values = this.values;
    if (this.nodeService.isNodeChanged(this.node, values) == false) {
      this.utilService.alertMsg('EDIT_SAVE_HEADING', 'EDIT_SAVE_MESSAGE', 'RETURN', { width: 350, height: 400 }).then(choice => {});
      return;
    }
    let errorMsg = this.validateData(values);
    if (errorMsg != '') {
      this.utilService.alertMsg('EDIT_ERROR_TITLE', errorMsg, 'RETURN', { width: 350, height: 400 }).then(choice => {});
      return;
    }
    await this.modalCtrl.dismiss({status: 'save', values: values});
  }

  private validateData(values: any): string {
    if (DEBUGS.EDIT)
      console.log('EditPage - validateData: values: ', values);
    let msg = '';
    let bullet = '&#8226;&nbsp;';
    let yodMsg = '';
    if (values.yob && values.yod && +values.yob > values.yod)
        yodMsg = bullet + this.languageService.getTranslation('EDIT_ERR_YOD') + '<br>';
    msg = yodMsg;
    return msg;
  }

  // --------- photo ----------

  // https://edupala.com/ionic-capacitor-camera/
  private getPhotoBase64() {
    this.photoBase64 = '';
    this.photoNew = false;
    if (this.values.photo != '') {
      let photoName = this.values.photo;
      console.log('getPhoto: ', photoName);
      this.fbService.downloadImage(this.ancestor, photoName).then((imageURL:any) => {
        this.photoBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(imageURL);
      })
    }
  }

  private savePhotoBase64() {
    // save new photo
    if (this.photoNew) {
      if (this.photoBase64 != '') {
        let photoName = this.nodeService.getPhotoName(this.node, true);
        let base64 = this.photoBase64;
        let type = base64.substring('data:'.length, base64.indexOf(';'));
        base64 = base64.replace("data:", "").replace(/^.+,/, "");
        this.fbService.addImage(base64, type, this.ancestor, photoName).then(urlStorage => {});
        this.values.photo =  photoName;
      } else {
        // reset empty photo
        this.values.photo = '';
      }
    }
  }

  deletePhoto() {
    this.photoBase64 = '';
    this.photoNew = true;
  }

  editPhoto() {
    this.openCropperModal(this.photoBase64, true);
  }

  async getPicture(type: any) {
    console.log('EditPage - getPicture - type: ', type);
    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: this.languageService.getTranslation('EDIT_CAMERA_HEADER'),
      promptLabelCancel: this.languageService.getTranslation('EDIT_CAMERA_CANCEL'),
      promptLabelPhoto: this.languageService.getTranslation('EDIT_CAMERA_SELECT'),
      promptLabelPicture: this.languageService.getTranslation('EDIT_CAMERA_CAPTURE')
    });
    this.photoBase64 = image.dataUrl;
    this.photoNew = true;
  }

  async openCropperModal(photoBase64: any, url: any) {
    const cropperModal = await this.modalCtrl.create({
      component: CropperModalPage,
      componentProps: {
        'caller': 'NodePage',
        'data': photoBase64,
        'url': url
      },
    });
    await cropperModal.present();
    const { data } = await cropperModal.onDidDismiss();
    if (data.result) {
      this.photoBase64 = data.result;
      this.photoNew = true;
    }
  }

}

