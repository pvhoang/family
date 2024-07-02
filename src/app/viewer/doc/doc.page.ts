import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';

import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

	@Input() html: string;

  FONTS_FOLDER = FONTS_FOLDER;

  constructor(
    public modalCtrl: ModalController,
    private languageService: LanguageService,

  ) {}

  ngOnInit() {

		console.log('this.html: ', this.html)

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
