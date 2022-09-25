import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

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
    console.log('AdminPage - mode: ', mode);
    this.appValid = false;

    if (mode == 'clear') {
      this.dataService.deleteItem('ANCESTOR');
      this.dataService.deleteItem('FAMILY');
      // this.utilService.alertMsg('Thông báo', 'System is clear!', 'alert-small');
      alert('System is clear!');
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
              this.router.navigate(['edit'], { relativeTo: this.route });
            }
          })
        }
      });
    }
  }

}

