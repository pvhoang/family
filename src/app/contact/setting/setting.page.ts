import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { ANCESTOR } from '../../../environments/environment';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  @Input() name: string;
  @Input() setting: any;
  title: any;
  values: any = {};
  languages: Array<any>;
  ancestors: Array<any>;

  constructor(
    private modalCtr: ModalController,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {

    console.log('SettingPage - ngOnInit - setting: ', this.setting);

    this.title = this.languageService.getTranslation('SETTING');
    this.languages = [
      { id: 'vi', name: this.languageService.getTranslation('VIETNAMESE') },
      { id: 'en', name: this.languageService.getTranslation('ENGLISH') }
    ];

    let ancestorText = this.languageService.getTranslation(ANCESTOR);
    let translation = ancestorText.name;
    this.ancestors = [
      { id: ANCESTOR, name: translation },
    ];

    this.values.language = this.setting.language;
    this.values.ancestor = this.setting.ancestor;
  }

  async onCancel() {
    await this.modalCtr.dismiss({status: 'cancel'});
  }

  async onSave() {
    console.log('SettingPage - onSave - values: ', this.values);
    await this.modalCtr.dismiss({status: 'save', values: this.values});
  }

}
