import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { DataService } from '../../services/data.service';
import { environment, DEBUGS } from '../../../environments/environment';

@Component({
  selector: "splash-screen",
  templateUrl: "./splash-screen.component.html",
  styleUrls: ["./splash-screen.component.css"]
})
export class SplashScreenComponent implements OnInit {

  @Input() title: any;
  @Input() url: any;
  @Input() mode: any;
  @Input() lang: any;
  @Output() onComplete: EventEmitter<any> = new EventEmitter();

  windowWidth: string;
  showSplash = true;
  firstTitle:any = null;
  secTitle:any = null;
  version:any = null;
  appMode:any = null;
  clickStr: string;
  
  constructor(
    private dataService: DataService,
  ) {
  }

  ngOnInit(): void {
    if (DEBUGS.SPLASH)
      console.log('SplashScreenComponent - ngOnInit - url: ', this.url);

    if (navigator.onLine) {
      this.dataService.readItem('ANCESTOR_DATA').then((adata:any) => {
      // console.log('SplashScreenComponent - ngOnInit - adata: ', adata);
        this.showSplash = true;
        this.startSplash(adata.info.name, adata.info.location, adata.family.version);
      });
    }
  }

  startSplash(name: any, location: any, dataVersion: any) {
    // if (DEBUGS.SPLASH)
    //   console.log('SplashScreenComponent - startSplash - description: ', description);
    this.showSplash = true;
    this.firstTitle = name;
    this.secTitle = location;
    this.version = 'A.' + environment.version + ' (D.' + dataVersion + ')';
    this.appMode = (this.mode == 'view') ? this.getTranslation('VIEW') : this.getTranslation('EDIT');
    this.clickStr = this.getTranslation('CLICK');

    if (DEBUGS.SPLASH)
      console.log('SplashScreenComponent - startSplash - showSplash: ', this.showSplash);

    setTimeout(() => {
      // this.windowWidth = "-" + window.innerWidth + "px";
      // setTimeout(() => {
      //   this.showSplash = !this.showSplash;
      // }, 1000);
      // this.onComplete.emit();
      this.onDone();
    }, 5000);
  }

  onDone() {
    this.windowWidth = "-" + window.innerWidth + "px";
    setTimeout(() => {
      this.showSplash = !this.showSplash;
    }, 1000);
    this.onComplete.emit();
  }

  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "CLICK": "Nhấn",
      "VIEW": "THÔNG TIN",
      "EDIT": "ĐIỀU CHỈNH"
    }
		const en = {
      "CLICK": "Press",
      "VIEW": "VIEWER",
      "EDIT": "EDITOR"
    }
		if (this.lang == 'vi')
			return vi[key] ? vi[key] : key;
		return en[key] ? en[key] : key;
  }
}