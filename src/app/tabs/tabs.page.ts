import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { FONTS_FOLDER, DEBUG_TABS } from '../../environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  appValid: any = false;
  FONTS_FOLDER = FONTS_FOLDER;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private fbService: FirebaseService,
    private utilService: UtilService,
    private dataService: DataService,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {

    // mode = phan-123456-reset
    let mode = this.route.snapshot.paramMap.get('mode');
    if (DEBUG_TABS)
      console.log('TabsPage - ngOnInit - mode: ', mode);

    if (!navigator.onLine) {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('NO_NETWORK'), 'alert-small');
      return;
    }

    this.appValid = false;
    if (!mode) {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('TAB_EMPTY_MODE_IS_NOT_VALID'), 'alert-small');

    } else if (mode == 'admin') {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('TAB_ADMIN_IS_NOT_VALID'), 'alert-small');

    } else {
      let srcMode = mode;
      let keys = mode.split('-');
      mode = keys[0];
      this.fbService.checkJsonDocument(mode).subscribe((contents:any) => {
        if (contents.length == 0) {
          // ancestor does not exist
          let msg = this.utilService.getAlertMessage([
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_1'},
            {name: 'data', label: srcMode},
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_2'},
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_3'},
          ]);
          this.utilService.alertMsg('ERROR', msg, 'alert-small');

        } else {
          // ancestor does exist but not exist locally or differ from src
          this.dataService.readItem('ANCESTOR').then((data:any) => {
            if (data && ((data.id != mode) || (keys.length > 1 && data.keycode != keys[1]))) {
              // error, continue
              let msg = this.utilService.getAlertMessage([
                {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_1'},
                {name: 'data', label: srcMode},
                {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_2'},
                {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_3'},
                {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_4'},
              ]);
              this.utilService.alertMsg('ERROR', msg, 'alert-small');
            } else {
              if (DEBUG_TABS)
                console.log('TabsPage - mode 1: ', mode);

              this.dataService.setAncestor(mode).then(dat => {
                // if (keys.length == 2 && dat.keycode == keys[1]) {
                //   this.router.navigate(['admin'+'/'+keys[0]], { relativeTo: this.route });
                // } else if (keys.length == 3 && dat.keycode == keys[1]) {
                //     this.router.navigate(['admin'+'/'+keys[2]], { relativeTo: this.route });
                // } else {
                  if (DEBUG_TABS)
                    console.log('TabsPage - dat: ', dat);
                  this.appValid = true;
                  this.router.navigate(['home'], { relativeTo: this.route });
                // }
              });
            }
          })
        }
      });
    }
  }
  
  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "ERROR": "L???i",
      "TAB_EMPTY_MODE_IS_NOT_VALID": "???????ng d???n ph???i c?? m?? s??? gia ph???. V?? d???: giapha.web.app/phan. Li??n l???c ban bi??n t???p.",
      "TAB_ADMIN_IS_NOT_VALID": "T??? kh??a admin ph???i ??i k??m m?? s??? gia ph???. V?? d???: giapha.web.app/admin/phan. Li??n l???c ban bi??n t???p.",
      "NO_NETWORK": "M???ng ch??a ???????c k???t n???i!"
    }
    return vi[key];
  }
}
