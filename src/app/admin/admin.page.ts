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
    let mode = this.route.snapshot.paramMap.get('mode');
    console.log('mode: ', mode);
    if (mode == 'save') {
      this.saveFilesToFB();
    } else if (mode == 'save-01') {
      this.saveFamily('01');
    } else if (mode == 'save-02') {
      this.saveFamily('02');
    }
  }

  saveFamily(version) {
    let jsonFile = './assets/data/' + ancestor + '-family-' + version + '.json'
    this.utilService.getLocalJsonFile(jsonFile).then(json => {
      this.fbService.saveDocument(ancestor, {
        id: 'family',
        data: JSON.stringify(json),
      });
    });
  }

  saveFilesToFB() {
    // introduction
    this.utilService.getLocalTextFile('./assets/data/' + ancestor + '-vi-intro.txt').then(viText => {
    this.utilService.getLocalTextFile('./assets/data/' + ancestor + '-en-intro.txt').then(enText => {
      this.fbService.saveDocument(ancestor, {
        id: 'intro',
        vi: viText,
        en: enText
      });
    });
    });

    // contribution
    let jsonFile = './assets/data/' + ancestor + '-contribution.json'
    this.utilService.getLocalJsonFile(jsonFile).then(json => {
      this.fbService.saveDocument(ancestor, {
        id: 'contribution',
        data: JSON.stringify(json),
      });
    });

    // images
    jsonFile = './assets/data/' + ancestor + '-images.json'
    this.utilService.getLocalJsonFile(jsonFile).then(json => {
      this.fbService.saveDocument(ancestor, {
        id: 'images',
        data: JSON.stringify(json),
      });
    });
  }
}
