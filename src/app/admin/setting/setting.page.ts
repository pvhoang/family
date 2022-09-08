import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';

declare var ancestor;

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  title = '';

  constructor(
    private fbService: FirebaseService,
    private utilService: UtilService,
    private languageService: LanguageService,

  ) { }

  ngOnInit() {
    this.title = this.languageService.getTranslation('ADMIN_SETTING');
    // this.openAdmin();
  }

  onParams() {
    this.openAdmin();
  }

  async openAdmin() {
    this.fbService.readDocument(ancestor, 'ancestor').subscribe((fbRes:any) => {
      let data = fbRes ? JSON.parse(fbRes.data) : null;
      console.log('openAdmin - data 1:' , data);
      let msg = 'Ho: ' + ancestor;
      let inputs = [
        { name: 'admin', placeholder: 'Ten nguoi quan tri', 'value': data ? data.admin : null},
        { name: 'email', placeholder: 'Email cua nguoi quan tri', 'value': data ? data.email : null },
        { name: 'description', placeholder: 'Giai thich muc tieu cua gia pha', 'value': data ? data.description : null },
        { name: 'name', placeholder: 'Ten chi goc', 'value': data ? data.name : null},
        { name: 'family_name', placeholder: 'Ho cua dong ho', 'value': data ? data.family_name : null },
        { name: 'generation', placeholder: 'Doi goc', 'value': data ? data.generation: null }
      ];
      this.utilService.alertAdmin('Ancestor Info', msg, inputs, 'CANCEL', 'OK').then((alertRes) => {
        console.log('openAdmin - alertRes:' , alertRes)
        if (alertRes.data) {
          data = alertRes.data.values;
          console.log('openAdmin - data 2:' , data)
          // add more info
          data.date = this.utilService.getDateID();
          data.ancestor = ancestor;
          this.fbService.saveDocument(ancestor, {
            id: 'ancestor',
            data: JSON.stringify(data)
          });
          this.utilService.alertMsg('WARNING', 'Thong tin gia pha da duoc cap nhat!', 'OK').then((status) => {})
        }
      })
    });
  }
}
