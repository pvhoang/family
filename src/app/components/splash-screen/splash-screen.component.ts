import { Component, OnInit, Input } from "@angular/core";
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { DEBUG_SPLASH} from '../../../environments/environment';

@Component({
  selector: "splash-screen",
  templateUrl: "./splash-screen.component.html",
  styleUrls: ["./splash-screen.component.css"]
})
export class SplashScreenComponent implements OnInit {

  @Input() ancestor: any;

  windowWidth: string;
  showSplash = true;
  firstTitle:any = null;
  secTitle:any = null;
  
  constructor(
    private dataService: DataService,
    private fbService: FirebaseService,
  ) {
  }

  ngOnInit(): void {
    if (DEBUG_SPLASH)
      console.log('SplashScreenComponent - ngOnInit - ancestor: ', this.ancestor);
    this.activateSplash(this.ancestor);
  }

  activateSplash(mode: any) {
    
    if (DEBUG_SPLASH)
      console.log('SplashScreenComponent - activateSplash - mode: ', mode);
    if (!navigator.onLine || // check internet
        !mode ||              // no ancestor
        (mode == 'admin')    // wrong ancestor
      )
      return;

    this.showSplash = true;

    this.fbService.checkJsonDocument(mode).subscribe((contents:any) => {
      if (contents.length > 0) {
        this.dataService.readItem('ANCESTOR').then((data:any) => {
          if (DEBUG_SPLASH)
            console.log('SplashScreenComponent - activateSplash - ancestor: ', this.ancestor);

          if (!data) {
            // local storage not defined, read from fb
            this.fbService.readJsonDocument(mode, 'ancestor').subscribe((d:any) => {
              if (DEBUG_SPLASH)
                console.log('SplashScreenComponent - activateSplash - d: ', d);
              this.startSplash(d.description);
            });
          } else if (data.id == mode) {
            if (DEBUG_SPLASH)
              console.log('SplashScreenComponent - activateSplash - data 2: ', data);
            this.startSplash(data.data.description);
          }
        })
      }
    })
  }
  
  startSplash(description: any) {
    if (DEBUG_SPLASH)
      console.log('SplashScreenComponent - startSplash - description: ', description);
    let idx = description.indexOf('-');
    if (idx > 0) {
      this.firstTitle = description.substring(0, idx).trim();
      this.secTitle = description.substring(idx+1).trim();
    } else {
      this.firstTitle = this.ancestor.trim();
    }
    if (DEBUG_SPLASH)
      console.log('SplashScreenComponent - startSplash - showSplash: ', this.showSplash);
    setTimeout(() => {
      this.windowWidth = "-" + window.innerWidth + "px";
      setTimeout(() => {
        this.showSplash = !this.showSplash;
      }, 500);
    }, 2000);
  }
}