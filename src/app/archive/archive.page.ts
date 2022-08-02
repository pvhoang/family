import { Component, OnInit, HostListener } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage implements OnInit {

  data: any;
  idata: any;
  imageIds: any = [];
  imageId: any = 'i1';
  showDetail:any = false;
  images: any[] = [];
  translations: any;
  selectedImage: string;

  constructor(
    public toastController: ToastController,
    private utilService: UtilService,
    private languageService: LanguageService,
		private iab: InAppBrowser,
  ) {
  }

  ngOnInit() {
    this.translations = this.languageService.getTrans();

    this.utilService.getLocalJsonFile('./assets/data/images.json').then((data:any) => {
      console.log('data: ', data);
      this.imageIds = Object.keys(data);

      console.log('data: ', data);
      this.imageIds = Object.keys(data);
      this.data = data;
      this.idata = data[this.imageId]; 

      setTimeout(() => {
        this.images = [];
        // calculate position of each area
        this.imageIds.forEach(iid => {
          let d = data[iid];
          this.images.push({id: iid, name: d.title});

          if (d.type == 'image') {
            let imageEle = document.getElementById("image");
            let rect:any = imageEle.getBoundingClientRect();
            let imageWidth = d.image.width;
            let imageHeight = d.image.height;
            d.areas.forEach(area => {
              // based 0
              let aid = area.id;
              let x = area.coords.x;
              let y = area.coords.y;
              let text = area.coords.text;
              x = x * rect.width / imageWidth;
              y = y * rect.height / imageHeight;
              area.coords.x = parseInt(x) + rect.left;
              area.coords.y = parseInt(y) + + rect.top;
              area.id = iid + '-' + aid;
            })
          } else if (d.type == 'html') {
          }
        })
        // console.log('images: ', this.images);
        this.selectedImage = this.images[0].id;
        // this.idata = data[this.selectedImage]; 
      }, 500);
    });
  }

  ionViewWillEnter() {
    // console.log('ArchivePage - ionViewWillEnter');
    this.showDetail = false;
  }
	
	ionViewWillLeave() {
    // console.log('ArchivePage - ionViewWillLeave');
	}

  show() {
    // console.log('ArchivePage - show');
    if (this.showDetail)
      this.showDetail = false;
    else 
      this.showDetail = true;
    // let url = "https://gia-pha-ho-phan.web.app/assets/doc/test.html";
    // this.openWebpage(url);
  }

  close() {
    console.log('ArchivePage - close: ', this.selectedImage);
    this.imageId = this.selectedImage;
    this.idata = this.data[this.imageId];
    this.showDetail = false;
  }

  getAreaStyle(area: any) {
    let styles = {
      'background':'#fff',
      'display': 'block',
      'width': this.idata.area.width + 'px',
      'height': this.idata.area.height + 'px',
      'opacity': '0.4',
      'position': 'absolute',
      'top': area.coords.y + 'px',
      'left': area.coords.x + 'px',
    };
    // console.log('ArchivePage - getAreaStyle: ', styles);
    return styles;
  }

  displayText(text: any) {
    // console.log('ArchivePage - displayText: ', text);
    this.presentToast(text);
  }

  openWebpage(url: string) {
		const options: InAppBrowserOptions = {
			zoom: 'yes'
		}
		this.iab.create(url, '_system', options);
	}

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'primary',
      position: 'middle',
      duration: 2000
    });
    toast.present();
  }
}
