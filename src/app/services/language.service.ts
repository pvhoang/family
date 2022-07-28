import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {

  translations: any;

  constructor(
    public translate: TranslateService,
  ) {
    this.setLanguage('vi');
  }

  setLanguage(language) {
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.getTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.getTranslations();
    });
  }

  getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translate.getTranslation(this.translate.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
        // console.log('translations: ', translations);
      });
  }

  getTrans() {
    return this.translations;
  }
}