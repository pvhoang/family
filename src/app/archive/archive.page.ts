import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ANCESTOR } from '../../environments/environment';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage implements OnInit {

  data: any;
  idata: any;
  language: any;
  imageIds: any = [];
  showDetail:any = false;
  images: any[] = [];
  selectedImage: string;
  selectNotFoundText: any = '';
  selectPlaceholder: any = '';
  detail1:any = '';
  detail2:any = '';
  detail3:any = '';

  constructor(
    public toastController: ToastController,
    private utilService: UtilService,
    private languageService: LanguageService,
		private iab: InAppBrowser,
  ) {
  }

  ngOnInit() {
    console.log('ArchivePage - ngOnInit');
    // this.start();
    let jsonFile = './assets/data/' + ANCESTOR + '-images.json'
    this.utilService.getLocalJsonFile(jsonFile).then((data:any) => {
      console.log('data: ', data);
      // this.language = this.languageService.getLanguage();
      // console.log('language: ', this.language);

      // this.imageIds = Object.keys(data);
      this.data = data;
      // this.images = [];
      // this.imageIds.forEach(iid => {
      //   let d = data[iid];
      //   this.images.push({id: iid, name: d.title[this.language]});
      // });
      // console.log('this.imageIds: ', this.imageIds);
      this.start();
      // this.selectedImage = null;
      // this.idata = null;
      // this.selectNotFoundText = this.languageService.getTranslation('ARCHIVE_SELECT_NOT_FOUND_TEXT');
      // this.selectPlaceholder = this.languageService.getTranslation('ARCHIVE_SELECT_PLACEHOLDER');
    });
  }

  ionViewWillEnter() {
    console.log('ArchivePage - ionViewWillEnter');
    // this.showDetail = false;
    // this.selectedImage = null;
    // this.idata = null;
    this.start();
  }
	
	ionViewWillLeave() {
    console.log('ArchivePage - ionViewWillLeave');
	}

  start() {
    // let jsonFile = './assets/data/' + ANCESTOR + '-images.json'
    // this.utilService.getLocalJsonFile(jsonFile).then((data:any) => {
    //   console.log('data: ', data);
      this.language = this.languageService.getLanguage();
      // console.log('language: ', this.language);
      this.imageIds = Object.keys(this.data);
      // this.data = data;
      this.images = [];
      this.imageIds.forEach(iid => {
        let d = this.data[iid];
        this.images.push({id: iid, name: d.title[this.language]});
      });
      console.log('this.imageIds: ', this.imageIds);

      this.selectedImage = null;
      this.idata = null;
      this.showDetail = false;
      this.selectNotFoundText = this.languageService.getTranslation('ARCHIVE_SELECT_NOT_FOUND_TEXT');
      this.selectPlaceholder = this.languageService.getTranslation('ARCHIVE_SELECT_PLACEHOLDER');

    // });
  }

  show() {
    console.log('ArchivePage - show');
    if (this.showDetail)
      this.showDetail = false;
    else 
      this.showDetail = true;
  }

  close() {
    // console.log('ArchivePage - close: ', this.selectedImage);
    let data = this.data[this.selectedImage];
    if (data.type == 'image') {
      this.idata = data;
      setTimeout(() => {
        this.idata = this.updateImageArea(this.selectedImage);
      },300); 
    } else {
      this.idata = data;
      this.idata.desc =  data.description[this.language];
    }
    this.showDetail = false;
  }

  updateImageArea(id) {
    let idata = this.data[id];
    let imageEle = document.getElementById("image");
    if (imageEle)
      idata.imageEle = imageEle;
    else
      imageEle = idata.imageEle;
    let rect:any = imageEle.getBoundingClientRect();
    let imageWidth = idata.image.width;
    let imageHeight = idata.image.height;
    idata.areas.forEach((area:any) => {
      let aid = area.id;
      let x = area.coords.x;
      let y = area.coords.y;
      let text = area.coords.text;
      x = x * rect.width / imageWidth;
      y = y * rect.height / imageHeight;
      area.domid = id + '-' + aid;
      area.x = parseInt(x + rect.left);
      area.y = parseInt(y + rect.top);
      area.width = idata.area.width;
      area.height = idata.area.height;
    })
    // this.addCornerImages(idata);
    // console.log('idata: ', idata);
    // this.dislayDetailData(imageEle, idata.areas[2]);
    idata.desc = idata.description[this.language];

    console.log('idata: ', idata);

    return idata;
  }

  addCornerImages(idata) {
    let imageEle = document.getElementById("image");
    let rect:any = imageEle.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      let area: any;
      if (i == 0)
        area = {domid: 'corner-'+i, x: 0, y: 0, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 1)
        area = {domid: 'corner-'+i, x: rect.right - 200, y: 0, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 2)
        area = {domid: 'corner-'+i, x: 0, y: rect.bottom - 200, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 3)
        area = {domid: 'corner-'+i, x: rect.right - 200, y: rect.bottom - 200, width: 200, height: 200, text: 'corner-'+i};
      idata.areas.push(area);
    }  
  }

  dislayDetailData(imageEle, area) {
    let rect:any = imageEle.getBoundingClientRect();
    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    this.detail1 = 'window: scrollX='+scrollX+', scrollY='+scrollY+', viewportWidth='+viewportWidth+', viewportHeight='+viewportHeight+', '+window.outerWidth+', '+window.outerHeight;
    this.detail2 = 'image: left='+parseInt(rect.left)+', top='+parseInt(rect.top)+', right='+parseInt(rect.right)+', bottom='+parseInt(rect.bottom)+', width='+rect.width+', height='+rect.height+', offsetWidth='+imageEle.offsetWidth+', offsetHeight='+imageEle.offsetHeight;
    this.detail3 = 'area: ax='+area.x +', ay='+area.y+', width='+area.width+', height='+area.height+', X='+area.x+', Y='+area.y+ ', text='+area.text;
  }

  getAreaStyle(area: any) {
    let styles = {
      'background':'#fff',
      'display': 'block',
      // 'display': 'inline-block',
      'width': area.width + 'px',
      'height': area.height + 'px',
      'opacity': '0.2',
      'position': 'absolute',
      'top': area.y + 'px',
      'left': area.x + 'px',
      'border': '2px solid #000000',
    };
    // console.log('ArchivePage - getAreaStyle: ', styles);
    return styles;
  }

  displayText(text: any) {
    // console.log('ArchivePage - displayText: ', text);
    let header = text.header;
    let message = text.message[this.language];
    this.utilService.presentToastWait(header, message, 'OK');
  }

  openWebpage(url: string) {
		const options: InAppBrowserOptions = {
			zoom: 'yes'
		}
		this.iab.create(url, '_system', options);
	}
}
