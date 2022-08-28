import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  constructor(
    private familyService: FamilyService,
    private utilService: UtilService,
  ) { }

  getJsonNames(term: string = null): Observable<string[]> {

    return new Observable((observer) => {

      let getJsonPromise = new Promise((resolve) => {
        this.familyService.readJson('names').then((data:any) => {
          resolve(data['data']);
        });
      });
      getJsonPromise.then((data) => {
        console.log('term: ', term);
        let names:any = [];
        if (!term) {
          names = [];
        } else if (term == '') {
          names = data['sample'];

        } else {
          let familyNames = data['family'];
          let midMaleNames = data['middle_male'];
          let midFemaleNames = data['middle_female'];
          let firMaleNames = data['first_male'];
          let firFemaleNames = data['first_female'];
          term = this.utilService.stripVN(term);
          let words = term.split(' ');
          console.log('words: ', words);

          // one word, must be Family name
          if (words.length == 1) {
            term = words[0];
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
            // add some common middle and first name
            for (let i = 0; i < famNames.length; i++) {
              let familyName = famNames[i].name;
              names.push({ name: familyName + ' Văn Tên' });
              names.push({ name: familyName + ' Thị Tên' });
            }

          // two words, must be Family name + Middle name
          } else if (words.length == 2) {
            let familyName = words[0];
            term = words[1];
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x.name) == familyName);
            // filter middle names
            let mMaleNames = midMaleNames.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
            let mFemaleNames = midFemaleNames.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
            // select  a full name from Family and Middle
            for (let i = 0; i < famNames.length; i++) {
              familyName = famNames[i].name;
              for (let j = 0; j < mMaleNames.length; j++) {
                let middleName = mMaleNames[j].name;
                let firstName = firMaleNames[j].name;
                names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
              }
              for (let j = 0; j < mFemaleNames.length; j++) {
                let middleName = mFemaleNames[j].name;
                let firstName = firMaleNames[j].name;
                names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
              }
            }

          // three words, must be Family name + Middle name + First name
          } else if (words.length == 3) {

            let familyName = words[0];
            let middleName = words[1];
            term = words[2];
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x.name) == familyName);
            let mMaleNames = midMaleNames.filter((x:any) => this.utilService.stripVN(x.name) == middleName);
            let mFemaleNames = midFemaleNames.filter((x:any) => this.utilService.stripVN(x.name) == middleName);
            let fMaleNames = firMaleNames.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
            let fFemaleNames = firFemaleNames.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
 
            for (let i = 0; i < famNames.length; i++) {
              familyName = famNames[i].name;
              for (let j = 0; j < mMaleNames.length; j++) {
                let middleName = mMaleNames[j].name;
                for (let k = 0; k < fMaleNames.length; k++) {
                  let firstName = fMaleNames[k].name;
                  names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
                }
              }
              for (let j = 0; j < mFemaleNames.length; j++) {
                let middleName = mFemaleNames[j].name;
                for (let k = 0; k < fFemaleNames.length; k++) {
                  let firstName = fFemaleNames[k].name;
                  names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
                }
              }
            }
          }
        }
        names = this.sortName(names);
        observer.next(names);
      });
    });
  }

  getJson(term: string = null, json: string): Observable<string[]> {
    // console.log('NodePage - getJson: ', json);
    return new Observable((observer) => {
      let getJsonPromise: Promise<any>;
      getJsonPromise = new Promise((resolve) => {
        this.familyService.readJson(json).then((data:any) => {
          resolve(data['data']);
        });
      });

      getJsonPromise.then((data) => {
        let values = [];
        if (!term) {
          values = [];
        } else if (term == '') {
          values = data;
        } else {
          term = this.utilService.stripVN(term);
          values = data.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
        }
        observer.next(values);
      });
    });
  }

  private sortName(names: any) {
    let d = [];
    names.forEach((element:any) => {
      if (element && element.name != '' && !d.includes(element.name))
        d.push(element.name);
    });
    d.sort();
    let data = [];
    d.forEach(value => {
      data.push({'name': value});
    });
    return data;
  }
}