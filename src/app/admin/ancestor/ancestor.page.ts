import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-ancestor',
  templateUrl: './ancestor.page.html',
  styleUrls: ['./ancestor.page.scss'],
})
export class AncestorPage implements OnInit {

  @Input() name: string;
  @Input() params: any;

  title: any;
  values: any = { };

  constructor(
    private modalCtrl: ModalController,
    public languageService: LanguageService,
    private utilService: UtilService,
  ) { }

  ngOnInit(): void {
    console.log('AncestorPage - ngOnInit - params: ', this.params);
    this.title = this.languageService.getTranslation('ADMIN_ANCESTOR_SETTING');
    this.values = this.params;
  }

  async onCancel() {
    // console.log('NodePage - onCancel - node: ', this.node);
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  async onSave() {
    console.log('AncestorPage - onSave - values: ', this.values);
    // console.log('onSave: change');
    let errorMsg = this.validateData(this.values);
    if (errorMsg != '') {
      this.utilService.alertMsg('NODE_ERROR_TITLE', errorMsg);
      return;
    }
    await this.modalCtrl.dismiss({status: 'save', values: this.values});
  }

  private validateData(values: any): string {
    // console.log('validateData: values: ', values);
    let msg = '';
    if (!values.admin ||  values.admin.length < 4)
      msg += 'Tên admin không hợp lệ. <br>';
    if (!values.email ||  values.email.length < 4)
      msg += 'Email không hợp lệ. <br>';
    if (!values.family_name ||  values.family_name.length < 4)
      msg += 'Tên tộc không hợp lệ. <br>';
    if (!values.name ||  values.name.length < 4)
      msg += 'Tên chi gốc không hợp lệ. <br>';
    if (!values.generation)
      msg += 'Đời gốc không hợp lệ. <br>';
    return msg;
  }
  
}
