import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {

  translations: any;
  language: any;

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
    this.language = language;
  }

  getLanguage() {
    return this.language;
  }
  
  getTranslations() {
    this.translate.getTranslation(this.translate.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
        // console.log('translations: ', translations);
      });
  }

  getTranslation(key) {
    return this.translations[key];
  }

  getTrans() {
    return this.translations;
  }
}
