import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  data: any;
  slides: any = [];

  constructor(
    public toastController: ToastController,
    private dataService: DataService,
  ) { }

  ngOnInit() {
     this.dataService.getLocalJsonFile('./assets/data/slides.json').then((data:any) => {
      console.log('data: ', data);
      this.slides = Object.keys(data);
      this.data = data;
     });
  }

  displayName(name: any) {
    console.log('displayName: ', name);
    this.presentToast(name);
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
