import { Component, OnInit, Input } from '@angular/core';
import { Dimensions, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { UtilService } from '../../../services/util.service';
import { ModalController } from '@ionic/angular';
import { FONTS_FOLDER, DEBUGS, environment } from '../../../../environments/environment';

// https://www.positronx.io/angular-image-upload-preview-crop-zoom-and-scale-example/

@Component({
  selector: 'app-cropper-modal',
  templateUrl: './cropper-modal.page.html',
  styleUrls: ['./cropper-modal.page.scss'],
})
export class CropperModalPage implements OnInit {

  @Input() data: string;
  @Input() url: boolean;

  FONTS_FOLDER = FONTS_FOLDER;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private modalCtrl: ModalController,
    public utilService: UtilService,
  ) {}

  ngOnInit() {
    // console.log('CropperModalPage - ngOnInit - photo: ', this.photo);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    console.log('CropperModalPage - fileChangeEvent - event: ', event);
  }

  cropperReady(srcDim: Dimensions) {
    console.log('CropperModalPage - cropperReady - source: ', srcDim);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    console.log('CropperModalPage - imageCropped - event: ', event);
    // console.log('CropperModalPage - cropperReady - this.croppedImage: ', this.croppedImage);
  }

  imageLoaded() {
      // show cropper
  }
  
  loadImageFailed() {
      // show message
  }

  async onCancel() {
    await this.modalCtrl.dismiss({
      result: false
    });
  }

  async onSave() {
    await this.modalCtrl.dismiss({
      result: this.croppedImage
    });
  }
}
