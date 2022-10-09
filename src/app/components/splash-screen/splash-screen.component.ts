import { Component, OnInit, Input } from "@angular/core";
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { DEBUG} from '../../../environments/environment';

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
    if (DEBUG)
      console.log('SplashScreenComponent - ngOnInit - ancestor: ', this.ancestor);
    this.activateSplash(this.ancestor);
  }

  activateSplash(mode: any) {
    
    if (!navigator.onLine || // check internet
        !mode ||              // no ancestor
        (mode == 'admin')    // wrong ancestor
      )
      return;

    this.fbService.checkJsonDocument(mode).subscribe((contents:any) => {
      if (contents.length > 0) {
        this.dataService.readItem('ANCESTOR').then((data:any) => {
          if (!data) {
            // local storage not defined, read from fb
            this.fbService.readJsonDocument(mode, 'ancestor').subscribe((d:any) => {
              this.startSplash(d.description);
            });
          } else if (data.id == mode) {
            this.startSplash(data.description);
          }
        })
      }
    })
  }
  
  startSplash(description: any) {
    let title = description.split('-');
    if (title.length == 2) {
      this.firstTitle = title[0].trim();
      this.secTitle = title[1].trim();
    } else {
      this.firstTitle = this.ancestor.trim();
    }
    setTimeout(() => {
      this.windowWidth = "-" + window.innerWidth + "px";
      setTimeout(() => {
        this.showSplash = !this.showSplash;
      }, 500);
    }, 2000);
  }
}