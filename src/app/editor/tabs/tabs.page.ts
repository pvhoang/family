import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { UtilService } from '../../services/util.service';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilService: UtilService,
  ) {}

  ngOnInit() {
    let mode = this.route.snapshot.paramMap.get('mode');
    if (DEBUGS.TABS)
      console.log('TabsPage - ngOnInit - mode: ', mode, mode);
    if (!navigator.onLine) {
      this.utilService.alertMsg(this.getTranslation('ERROR'), this.getTranslation('NO_NETWORK'), this.getTranslation('OK'), { width: 350, height: 400 } ).then(choice => {});;
      return;
    }
    this.start();
  }

  start() {
    if (DEBUGS.TABS)
      console.log('TabsPage - start!');
    this.router.navigate(['node'], { relativeTo: this.route });
    // this.router.navigate(['/memory']);
  }

  onBranch() {
    if (DEBUGS.TABS)
      console.log('TabsPage - onBranch clicked!');
    // this.router.navigate(['node'], { relativeTo: this.route });
    // this.router.navigate(['/node']);
  }

  onNode() {
    if (DEBUGS.TABS)
      console.log('TabsPage - onNode clicked!');
    // this.router.navigate(['node'], { relativeTo: this.route });
    // this.router.navigate(['/node']);

  }

  onDoc() {
    if (DEBUGS.TABS)
      console.log('TabsPage - onDoc clicked!');
    // this.router.navigate(['node'], { relativeTo: this.route });
    // this.router.navigate(['/node']);

  }

  onFile() {
    if (DEBUGS.TABS)
      console.log('TabsPage - onFile clicked!');
    // this.router.navigate(['file'], { relativeTo: this.route });
    // this.router.navigate(['/file']);
  }

  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "ERROR": "Lỗi",
      "NO_NETWORK": "Mạng chưa được kết nối!",
      "OK": "OK",
    }
    return vi[key];
  }
}
