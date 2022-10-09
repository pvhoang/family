import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { DataService } from '../services/data.service';
// import { environment } from '../../environments/environment';
import { FONTS_FOLDER } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

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
    console.log('AdminPage - mode: ', mode);
    
    this.appValid = false;
    if (!navigator.onLine) {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('NO_NETWORK'), 'alert-small');
      // navigator['app'].exitApp();
      return;
    }

    // if (mode == 'reset') {
    //   this.dataService.readItem('ANCESTOR').then((data:any) => {
    //     let header = this.getTranslation('ADMIN_SYSTEM_RESET_HEADER');
    //     let message = (data) ? this.getTranslation('ADMIN_SYSTEM_RESET_MESSAGE_1') + data.id :
    //     this.getTranslation('ADMIN_SYSTEM_RESET_MESSAGE_2');
    //     this.utilService.alertConfirm(header, message, this.getTranslation('CANCEL'), 'OK').then((res) => {
    //       if (res.data) {
    //         this.dataService.deleteItem('ANCESTOR');
    //         this.dataService.deleteItem('FAMILY');
    //         navigator['app'].exitApp();
    //       }
    //     });
    //   });
    // } else {

      let srcMode = mode;
      let keys = mode.split('-');
      mode = keys[0];

      this.fbService.checkJsonDocument(mode).subscribe((contents:any) => {
        if (contents.length == 0) {
          // ancestor does not exist
          
          // let msg = this.languageService.getTranslation('TAB_ANCESTOR_NOT_EXIT_1') + mode + this.languageService.getTranslation('TAB_ANCESTOR_NOT_EXIT_2');
          
          let msg = this.utilService.getAlertMessage([
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_1'},
            {name: 'data', label: srcMode},
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_2'},
            {name: 'msg', label: 'TAB_ANCESTOR_NOT_EXIT_3'},
          ]);
          
          this.utilService.alertMsg('ERROR', msg, 'alert-small');
          // navigator['app'].exitApp();

        } else {
          // ancestor does exist but not exist locally or differ from src
          
          this.dataService.readItem('ANCESTOR').then((data:any) => {
            if (data && (
              (data.id != mode) ||
              // (keys.length > 1 && data.keycode != keys[1]) ||
              // (keys.length > 2 && 'reset' != keys[2])
              (keys.length > 1 && 'reset' != keys[1])
            )) {
            // if (data && data.id != mode) {
              // not ok, check more
              // if (mode == 'reset') {
              //   let message = this.languageService.getTranslation('ADMIN_SYSTEM_RESET_MESSAGE') + data.id;
              //   this.utilService.alertConfirm('SYSTEM_RESET_HEADER', message, 'CANCEL', 'OK').then((res) => {
              //     if (res.data) {
              //       this.dataService.deleteItem('ANCESTOR');
              //       this.dataService.deleteItem('FAMILY');
              //       navigator['app'].exitApp();
              //     }
              //   });
              // } else {

                let msg = this.utilService.getAlertMessage([
                  {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_1'},
                  {name: 'data', label: srcMode},
                  {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_2'},
                  {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_3'},
                  {name: 'msg', label: 'TAB_ANCESTOR_NOT_MATCH_4'},
                ]);

                // let msg = this.languageService.getTranslation('TAB_ANCESTOR_NOT_MATCH_1') + mode + this.languageService.getTranslation('TAB_ANCESTOR_NOT_MATCH_2');
                this.utilService.alertMsg('ERROR', msg, 'alert-small');
                // navigator['app'].exitApp();
              // }
            } else {
              console.log('AdminPage - keys: ', keys );
              this.dataService.setAncestor(mode).then(dat => {
                // if (keys.length == 2 && dat.keycode == keys[1]) {
                if (keys.length == 1) {
                  this.appValid = true;
                  this.router.navigate(['edit'], { relativeTo: this.route });
                  // this.router.navigate(['admin'+'/'+keys[0]], { relativeTo: this.route });

                // } else if (keys.length == 3 && dat.keycode == keys[1]) {
                } else if (keys.length == 2) {

                  // if (keys[2] == 'reset') {
                  if (keys[1] == 'reset') {
                    let header = this.getTranslation('ADMIN_SYSTEM_RESET_HEADER');
                    let message = (data) ? this.getTranslation('ADMIN_SYSTEM_RESET_MESSAGE_1') + data.id :
                    this.getTranslation('ADMIN_SYSTEM_RESET_MESSAGE_2');
                    this.utilService.alertConfirm(header, message, this.getTranslation('CANCEL'), 'OK').then((res) => {
                      if (res.data) {
                        this.dataService.deleteItem('ANCESTOR');
                        this.dataService.deleteItem('FAMILY');
                        // navigator['app'].exitApp();
                      }
                    });
                  }
                  
                } else {
                    // let msg = this.utilService.getAlertMessage([
                    //   {name: 'msg', label: 'TAB_ANCESTOR_NOT_VALID_1'},
                    //   {name: 'data', label: srcMode},
                    //   {name: 'msg', label: 'TAB_ANCESTOR_NOT_VALID_2'},
                    // ]);
                    // this.utilService.alertMsg('ERROR', msg, 'alert-small');
                    // navigator['app'].exitApp();
                }
              });
            }
          })
        }
      });
    // }
  }

  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "ADMIN_SYSTEM_RESET_HEADER": "Thông báo",
      "ADMIN_SYSTEM_RESET_MESSAGE_1": "Xóa gia phả trong máy với mã số: ",
      "ADMIN_SYSTEM_RESET_MESSAGE_2": "Xóa gia phả trong máy",
      "NO_NETWORK": "Mạng chưa được kết nối!",
      "OK": "OK",
      "CANCEL": "Hủy",
    }
    return vi[key];
  }
}

