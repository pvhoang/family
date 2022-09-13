import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { FirebaseService } from '../services/firebase.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

declare var ancestor;

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
    private dataService: DataService,
    private fbService: FirebaseService,
    private languageService: LanguageService,
		private iab: InAppBrowser,
  ) {
  }

  ngOnInit() {
    console.log('ArchivePage - ngOnInit');
    this.dataService.readLocalJson(ancestor, 'archive').then((data:any) => {
    // this.fbService.readDocument(ancestor, 'archive').subscribe((res:any) => {
    // this.fbService.readDocument(ancestor, 'images').subscribe((res:any) => {
      // this.data = JSON.parse(res.data);
      this.data = data;
      // this.data['i2']['src'] = "https://gphphan.web.app/assets/imgs/phan-dinh-1971.jpg";
      // this.data['i3']['src'] = "https://gphphan.web.app/assets/doc/ngay-gio.html";
      this.start();
    });
  }

  ionViewWillEnter() {
    console.log('ArchivePage - ionViewWillEnter');
    this.start();
  }
	
	ionViewWillLeave() {
    console.log('ArchivePage - ionViewWillLeave');
	}

  start() {
    this.language = this.languageService.getLanguage();
    this.imageIds = Object.keys(this.data);
    this.images = [];
    this.imageIds.forEach(iid => {
      let d = this.data[iid];
      this.images.push({id: iid, name: d.title[this.language]});
    });
    console.log('this.imageIds: ', this.imageIds);

    this.selectedImage = null;
    this.idata = null;
    this.showDetail = false;
    this.selectPlaceholder = this.languageService.getTranslation('ARCHIVE_SELECT_PLACEHOLDER');
    this.selectNotFoundText = this.languageService.getTranslation('ARCHIVE_SELECT_ITEM_NOT_FOUND');
  }

  show() {
    console.log('ArchivePage - show');
    if (this.showDetail)
      this.showDetail = false;
    else 
      this.showDetail = true;
  }

  close() {
    let data = this.data[this.selectedImage];
    if (data.type == 'image') {
      this.idata = data;
      setTimeout(() => {
        this.idata = this.updateImageArea(this.selectedImage);
        // console.log('this.idata.src = ', this.idata.src);
      },300); 
    } else {
      this.idata = data;
      this.idata.desc =  data.description[this.language];
    }
    this.showDetail = false;
  }

  updateImageArea(id) {
    let idata = this.data[id];
    // container includes 'row' and 'image'
    let rowEle = document.getElementById("row");
    let rectRow:any = rowEle.getBoundingClientRect();
    let imageEle = document.getElementById("image");
    let rectImage:any = imageEle.getBoundingClientRect();
    
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
    // this.addCornerImages(idata);
    // this.dislayWindowData();
    // this.dislayDOMCrds('outer', 'outer');
    // this.dislayDOMCrds('row', 'row');
    // this.dislayDOMCrds('image', 'image');
    // this.dislayAreaData('Danh', idata.areas[1]);

    idata.desc = idata.description[this.language];
    // const fileName = "phan-11-09-2022-16-42-phan-dinh-1971.jpg";
    // idata.src = "../../assets/imgs/phan-dinh-1971.jpg";
    // this.fbService.downloadImage(fileName,idata.src).then((url:any) => {
    //   const img = document.getElementById('image');
    //   img.setAttribute('src', url);
    // })
    console.log('idata: ', idata);
    return idata;
  }

  addCornerImages(idata) {
    let imageEle = document.getElementById("image");
    let rect:any = imageEle.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      let area: any;
      if (i == 0)
        area = {domid: 'corner-'+i, x: rect.left, y: rect.top, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 1)
        area = {domid: 'corner-'+i, x: rect.right - 200, y: rect.top, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 2)
        area = {domid: 'corner-'+i, x: rect.left, y: rect.bottom - 200, width: 200, height: 200, text: 'corner-'+i};
      else if (i == 3)
        area = {domid: 'corner-'+i, x: rect.right - 200, y: rect.bottom - 200, width: 200, height: 200, text: 'corner-'+i};
      idata.areas.push(area);
    }
    idata.areas.push({domid: 'corner-top-left', x: 0, y: 28, width: 200, height: 200, text: 'corner-top=left' });
    idata.areas.push({domid: 'corner-top-left', x: 1200-200, y: 28, width: 200, height: 200, text: 'corner-top=left' });
  }

  dislayWindowData() {
    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    this.detail1 = 'window: ' + 
      '  scrollX='+scrollX+', scrollY='+scrollY+
      ', viewportWidth='+viewportWidth+', viewportHeight='+viewportHeight+
      ', outerWidth='+window.outerWidth+', outerHeight='+window.outerHeight;
    console.log('ArchivePage - detail1: ', this.detail1);
  }

  dislayAreaData(message, area) {
    this.detail3 = message + ' - area: ' +
      'x='+parseInt(area.x) +', y='+parseInt(area.y)+', width='+parseInt(area.width)+', height='+parseInt(area.height)+
      ', text='+area.text;
    console.log('ArchivePage - detail3: ', this.detail3);
  }

  dislayDOMCrds(message, id) {
    let ele:any = document.getElementById(id);
    let rect:any = ele.getBoundingClientRect();
    let detail3 = message + ' - area: ' +
      'x='+parseInt(rect.left) +', y='+parseInt(rect.top)+', width='+parseInt(rect.width)+', height='+parseInt(rect.height);
    console.log('ArchivePage - detail3: ', detail3);
  }

  getAreaStyle(area: any) {
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
    this.utilService.presentToastWait(header, message, 'OK');
  }

  openWebpage(url: string) {
		const options: InAppBrowserOptions = {
			zoom: 'yes'
		}
		this.iab.create(url, '_system', options);
	}
}
