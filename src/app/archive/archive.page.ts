import { Component, OnInit, ViewChild} from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LanguageService } from '../services/language.service';
import { FirebaseService } from '../services/firebase.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { FONTS_FOLDER, DEBUG_ARCHIVE } from '../../environments/environment';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage implements OnInit {

  @ViewChild('ngSelectPeople') ngSelectPeople: NgSelectComponent;

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  data: any;
  idata: any;
  language: any;
  imageIds: any = [];
  showDetail:any = false;
  images: any[] = [];
  selectedImage: string;
  selectNotFoundText: any = '';
  fileNotFoundText: any = '';
  selectPlaceholder: any = '';
  fullView = true;
  itemView = false;
  ancestor: any;

  constructor(
    public toastController: ToastController,
    private utilService: UtilService,
    private dataService: DataService,
    private fbService: FirebaseService,
    private languageService: LanguageService,
		private iab: InAppBrowser,
  ) {
  }

  ngOnInit() {
    // console.log('ArchivePage - ngOnInit');
    this.dataService.readFamily().then((family:any) => {
      let ancestor = family.info.id;
      this.ancestor = ancestor;
      this.fbService.readJsonDocument(ancestor, 'archive').subscribe((archive:any) => {
        // this.title = family.info.description;
        // this.data = archive.data;
        // update url for all image files
        this.fullView = true;
        this.itemView = false;
        // if (DEBUG)
          // console.log('ArchivePage - ngOnInit - archive: ', archive);
        this.updateUrl(archive.data).then((data:any) => {
          this.data = archive.data;
          this.start();
        })
      });
    });
  }

  ionViewWillEnter() {
    if (DEBUG_ARCHIVE)
      console.log('ArchivePage - ionViewWillEnter');
    this.start();
  }
	
	ionViewWillLeave() {
    if (DEBUG_ARCHIVE)
      console.log('ArchivePage - ionViewWillLeave');
	}

  start() {
    this.closeView();
    this.fullView = true;
    this.itemView = false;
    this.language = this.languageService.getLanguage();
    this.imageIds = Object.keys(this.data);
    this.images = [];
    this.imageIds.forEach(iid => {
      // console.log('this.imageIds - iid: ', iid);
      // let d = this.data[iid];
      // console.log('this.imageIds - d: ', d);
      // // add url from storage
      // this.fbService.downloadImage(this.ancestor, d.name).then((url:any) => {
      //   console.log('this.imageIds - url: ', url);
      //   d.url = url ? d.url = url : '';
      // });
      this.images.push({id: iid, name: this.data[iid].title[this.language]});
    });

    if (DEBUG_ARCHIVE)
      console.log('ArchivePage - start - imageIds: ', this.imageIds);
    
    this.selectedImage = null;
    this.idata = null;
    this.selectPlaceholder = this.languageService.getTranslation('ARCHIVE_SELECT_PLACEHOLDER');
    // this.selectNotFoundText = this.languageService.getTranslation('ARCHIVE_SELECT_ITEM_NOT_FOUND');
    this.fileNotFoundText = this.languageService.getTranslation('ARCHIVE_FILE_NOT_AVALABLE');
  }

  updateUrl(data: any) {
    return new Promise((resolve) => {
      let promises = [];
      let keyPromises = [];
      for (var key of Object.keys(data)) {
        const type = data[key].type;
        if (type == 'image' || type == 'people' || type == 'html') {
          const name = data[key].name;
          promises.push(this.fbService.downloadImage(this.ancestor, name));
          keyPromises.push(key);
          // .then((url:any) => {
          //   data[key].url = url ? url : '';
          //   promises.push
          // });
        }
      }
      if (promises.length == 0) {
        // nothing to change
        resolve(data);
      } else {
        Promise.all(promises).then(resolves => {
          console.log('resolves = ', resolves);
          for (let i = 0; i < resolves.length; i++) {
            let url = resolves[i];
            let key = keyPromises[i];
            data[key].url = url ? url : '';
          }
          resolve(data);
        });
      }
    });
  }

  show() {
    // console.log('ArchivePage - show');
    if (this.showDetail)
      this.showDetail = false;
    else 
      this.showDetail = true;
  }

  clear() {
    this.selectedImage = null;
  }
  
  close() {
    if (DEBUG_ARCHIVE)
      console.log('ArchivePage - close - selectedImage: ', this.selectedImage);
    if (this.selectedImage)
      this.startView(this.selectedImage);
  }

  closeView() {
    this.fullView = true;
    this.itemView = false;
    this.selectedImage = null;
    this.idata = null;
  }

  startView(item: any) {

    this.fullView = false;
    this.itemView = true;

    let data = this.data[item];
    this.idata = data;
    this.idata.desc =  data.description[this.language];
    this.idata.imageTitle = this.idata.title[this.language];

    if (data.type == 'people') {
      setTimeout(() => {
        this.updateImageArea(this.idata, this.selectedImage);
      },1000);
      this.showDetail = false;
      console.log('ArchivePage - startView: idata.url: ', this.idata.url);
    }
  }

  updateImageArea(idata, id) {
    let rowEle = document.getElementById("row");
    let rectRow:any = rowEle.getBoundingClientRect();
    let imageEle = document.getElementById("image");
    let rectImage:any = imageEle.getBoundingClientRect();
    // console.log('ArchivePage - updateImageArea: rectImage: ', rectImage);
    if (rectImage.width == 0 && rectImage.height == 0) {
      // image not activated yet, wait and reactivate
      setTimeout(() => {
        this.updateImageArea(this.idata, this.selectedImage);
        imageEle = document.getElementById("image");
        rectImage = imageEle.getBoundingClientRect();
      },1000);
    }
    
    let imageWidth = idata.image.width;
    let imageHeight = idata.image.height;
    let ratioWidth = rectImage.width / imageWidth;
    let ratioHeight = rectImage.height / imageHeight;

    let xImage = 0;
    let yImage = parseInt(rectRow.height);

    idata.areas.forEach((area:any) => {
      let aid = area.id;
      area.domid = id + '-' + aid;
      let x = parseInt(area.coords.x);
      let y = parseInt(area.coords.y);
      x = x * ratioWidth;
      y = y * ratioHeight;
      area.x = x + xImage;
      area.y = y + yImage;
      
      area.width = parseInt(area.coords.width) * ratioWidth;
      area.height = parseInt(area.coords.height) * ratioHeight;
    })
  }

  getAreaStyle(area: any) {
    // console.log('ArchivePage - getAreaStyle: area: ', area);
    let styles = {
      // 'background':'#fff',
      'background':'var(--app-background-color)',
      'display': 'block',
      // 'display': 'inline-block',
      'width': area.width + 'px',
      'height': area.height + 'px',
      'opacity': '0.2',
      'position': 'absolute',
      'top': area.y + 'px',
      'left': area.x + 'px',
      // 'border': '4px solid #000000',
      'border': '4px solid var(--app-color)',
    };
    return styles;
  }

  displayText(text: any) {
    // console.log('ArchivePage - displayText: ', text);
    let header = text.header;
    let message = text.message[this.language];
    this.utilService.presentToast(message);
    // this.utilService.presentToastWait(header, message, 'OK');
  }

  openWebpage(url: string) {

    console.log('ArchivePage - openWebpage: ', url);

    if (url == '') {
      const message = this.fileNotFoundText + ': ' + this.idata.name;
      this.utilService.presentToast(message);
      return;
    }

		const options: InAppBrowserOptions = {
			zoom: 'yes'
		}
		this.iab.create(url, '_system', options);
	}
}
