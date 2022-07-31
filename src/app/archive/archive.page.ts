import { Component, OnInit, HostListener } from '@angular/core';
import { ToastController } from '@ionic/angular';
// import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
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
    // private dataService: DataService,
    private utilService: UtilService,
    private languageService: LanguageService,
  ) {
  }

  ngOnInit() {
    this.translations = this.languageService.getTrans();

    this.utilService.getLocalJsonFile('./assets/data/images.json').then((data:any) => {
      console.log('data: ', data);
      this.imageIds = Object.keys(data);
      this.data = data;
      this.idata = data[this.imageId];
      
      setTimeout(() => {
        this.images = [];
        let imageEle = document.getElementById("image");
        let rect:any = imageEle.getBoundingClientRect();
        // let viewportWidth = window.innerWidth;
        // let viewportHeight = window.innerHeight;
        // console.log("viewportWidth, viewportHeight: ", viewportWidth, viewportHeight );
        // console.log("rect: ", rect );

        // calculate position of each area
        this.imageIds.forEach(iid => {
          let d = data[iid];
          this.images.push({id: iid, name: d.title});
          let imageWidth = d.image.width;
          let imageHeight = d.image.height;
          // let areaWidth = d.area.width;
          // let areaHeight = d.area.height;
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
          // console.log("dataid: ", d );
        })
        this.selectedImage = this.images[0].id;
      }, 500);

    });
  }

  ionViewWillEnter() {
    console.log('ArchivePage - ionViewWillEnter');
    this.showDetail = false;
  }
	
	ionViewWillLeave() {
    console.log('ArchivePage - ionViewWillLeave');
	}

  show() {
    // console.log('show');
    if (this.showDetail)
      this.showDetail = false;
    else 
      this.showDetail = true;
  }

  close() {
    console.log('close: ', this.selectedImage);
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
    // console.log('getAreaStyle: ', styles);
    return styles;
  }

  displayText(text: any) {
    // console.log('displayText: ', text);
    this.presentToast(text);
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
