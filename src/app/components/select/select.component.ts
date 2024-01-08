import { Component, OnInit, ViewChild, Input} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { FONTS_FOLDER } from '../../../environments/environment';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {

	@Input() selects: any;

  FONTS_FOLDER = FONTS_FOLDER;

  title: any;
	values: any = {};
	defaultValue: any;

	constructor(
    private modalCtrl: ModalController,
    private languageService: LanguageService,
  ) { 
  }

	ngOnInit(): void {
		this.title = "Hello";
		console.log('selects: ', this.selects)
		let select = this.selects[0];
		this.defaultValue = select.value;
		console.log('defaultValue: ', this.defaultValue)

	}
	
  async onCancel() {
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  async onSave() {
    await this.modalCtrl.dismiss({status: 'save', values: this.values });
  }

	handleChange(e: any, sel: any) {
    // console.log('ionChange fired with value: ', e);
    console.log('ionChange fired with value: ' + e.detail.value);
    console.log('ionChange fired with sel: ', e.detail.value, sel);
		this.values[sel.id] = e.detail.value;
  }

  handleCancel() {
    console.log('ionCancel fired');
  }

  handleDismiss() {
    console.log('ionDismiss fired');
  }

}

