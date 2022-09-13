import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { FamilyService } from '../services/family.service';
import { FirebaseService } from '../services/firebase.service';

declare var ancestor;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  title = 'Admin';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService,
    private utilService: UtilService,
    private dataService: DataService,
    private familyService: FamilyService,
    private fbService: FirebaseService,
  ) { }

  ngOnInit() {
    
  }

  onEditor() {
    console.log('AdminPage - onEditor');
    this.router.navigateByUrl(`/admin/editor`);
  }

  onFile() {
    console.log('AdminPage - onEditor');
    this.router.navigateByUrl(`/admin/file`);
  }

}
