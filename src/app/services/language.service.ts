import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {

  translations: any = {};
  language: any;

  constructor(
    public translate: TranslateService,
  ) {
    // console.log('LanguageService - constructor');
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
    // console.log('language: ', this.translate.currentLang);
    this.translate.getTranslation(this.translate.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
      });
  }

  getTranslation(key) {
    return (this.translations[key]) ? this.translations[key] : key;
  }

  getTrans() {
    return this.translations;
  }
}
