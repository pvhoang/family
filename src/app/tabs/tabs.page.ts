import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  appValid: any = false;

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
    let mode = this.route.snapshot.paramMap.get('mode');
    console.log('TabsPage - mode: ', mode);
    
    this.appValid = false;
    if (!mode) {
      // this.utilService.alertMsg('ERROR', 'TAB_EMPTY_MODE_IS_NOT_VALID', 'alert-small');
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('TAB_EMPTY_MODE_IS_NOT_VALID'), 'alert-small');
      navigator['app'].exitApp();

    } else if (mode == 'admin') {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('TAB_ADMIN_IS_NOT_VALID'), 'alert-small');
      navigator['app'].exitApp();

    } else {
      this.fbService.checkJsonDocument(mode).subscribe((contents:any) => {
        if (contents.length == 0) {
          // ancestor does not exist
          let msg = this.languageService.getTranslation('TAB_ANCESTOR_NOT_EXIT_1') + mode + this.languageService.getTranslation('TAB_ANCESTOR_NOT_EXIT_2');
          this.utilService.alertMsg('ERROR', msg, 'alert-small');
          navigator['app'].exitApp();

        } else {
          // ancestor does exist but not exist locally or differ from src
          this.dataService.readItem('ANCESTOR').then((data:any) => {
            if (data && data.id != mode) {
              // ok, continue
              let msg = this.languageService.getTranslation('TAB_ANCESTOR_NOT_MATCH_1') + mode + this.languageService.getTranslation('TAB_ANCESTOR_NOT_MATCH_2');
              this.utilService.alertMsg('ERROR', msg, 'alert-small');
              navigator['app'].exitApp();
            } else {
              environment.ancestor = mode;
              this.appValid = true;
              this.router.navigate(['home'], { relativeTo: this.route });
            }
          })
        }
      });
    }
  }

  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "ERROR": "Lỗi",
      "TAB_EMPTY_MODE_IS_NOT_VALID": "Đường dẫn phải có mã số gia phả. Ví dụ: giapha.web.app/phan. Liên lạc ban biên tập.",
      "TAB_ADMIN_IS_NOT_VALID": "Từ khóa admin phải đi kèm mã số gia phả. Ví dụ: giapha.web.app/admin/phan. Liên lạc ban biên tập.",
    }
    return vi[key];
  }
}
