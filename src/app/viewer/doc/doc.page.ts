import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

	@Input() title: string;
	@Input() heading: string;
	@Input() html: string;

  FONTS_FOLDER = FONTS_FOLDER;

	text: any;

  constructor(
    public modalCtrl: ModalController,
  ) {}

  ngOnInit() {
		// let values = this.title.split('/');
		// if (values.length > 1) {
		// 	this.heading = values[0];
		// 	this.text = values[1];
		// } else {
		// 	this.heading = '';
		// 	this.text = this.title;
		// }
		document.getElementById('detail').innerHTML = this.html;
  }

  ionViewWillEnter() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillEnter');
  }
	
	ionViewWillLeave() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillLeave');
	}

	async onCancel() {
    await this.modalCtrl.dismiss({
      result: false
    });
  }
  
}
