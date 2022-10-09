import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FamilyService } from '../services/family.service';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  constructor(
    private dataService: DataService,
    private familyService: FamilyService,
    private utilService: UtilService,
  ) { }

  getEvaluatedName(term: string) {
    return new Promise((resolve) => {
      this.dataService.readItem('names').then((result:any) => {
        console.log('term: ', term);

        let data = result.data;

        let familyNames = data['family'];
        let midMaleNames = data['middle_male'];
        let midFemaleNames = data['middle_female'];
        let firMaleNames = data['first_male'];
        let firFemaleNames = data['first_female'];

        // break term to words
        let srcName = term.toLowerCase();
        let desName = '';
        let words = srcName.split(' ');
        let gender = 0;
        let res:any = [];

        for (let i = 0; i < words.length; i++) {
          let srcWord = words[i];
          let word: any;
          if (i == 0) {
            // first word, use family name
            res = this.getWord(gender, familyNames, familyNames, srcWord);
            // do not set gender
            res[1] = 0;
          } else if (i == 1) {
            if (words.length == 2) {
              // 2-word name, use first names, try male and female
              res = this.getWord(gender, firMaleNames, firFemaleNames, srcWord);
            } else if (words.length >= 3) {
              // 3-word name, use middle name
              res = this.getWord(gender, midMaleNames, midFemaleNames, srcWord);
            }
          } else if (i == 2) {
            if (words.length == 3) {
              // 3-word name, use first name
              res = this.getWord(gender, firMaleNames, firFemaleNames, srcWord);
            } else if (words.length >= 4) {
              // 4-word name, use middle name
              res = this.getWord(gender, midMaleNames, midFemaleNames, srcWord);
            }
          } else {
            // 4-word or more name, use first name
            res = this.getWord(gender, firMaleNames, firFemaleNames, srcWord);
          }
          word = res[0];
          gender = res[1];
          if (word == null) word = srcWord;
          console.log('i, gender, srcWord, desWord: ', i, gender, srcWord, word);
          // console.log('word 2: ', word);
          desName += word + ' ';
        }
        desName = desName.trim();
        resolve(desName);
      });
    });
  }

  private getWord(gender, mNames:any, fNames:any, srcWord: any) {
    let word:any;
    let newGender = gender;
    if (gender == 0) {
      // neutral
      word = this.getVNWord(mNames, srcWord);
      if (word == null) {
        word = this.getVNWord(fNames, srcWord);
        newGender = 2;
      } else {
        newGender = 1;
      }
    } else if (gender == 1) {
      // male
      word = this.getVNWord(mNames, srcWord);
    } else if (gender == 2) {
      // female
      word = this.getVNWord(fNames, srcWord);
    }
    return [ word, newGender ];
  }

  private getVNWord(names:any, srcWord: any) {
    // srcWord: Nguyen, Nguyễn, nguyen, nguyễn, NGUYEN
    let stripWord = this.utilService.stripVN(srcWord);
    // check again available VN list
    for (let i = 0; i < names.length; i++) {
      if (stripWord == this.utilService.stripVN(names[i].name))
        return names[i].name;
    }
    return null;
  }

  getJsonNames(term: string = null): Observable<string[]> {

    return new Observable((observer) => {

      let getJsonPromise = new Promise((resolve) => {
        this.dataService.readItem('names').then((data:any) => {
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
        this.dataService.readItem(json).then((data:any) => {
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

  // async getJsonPlaces() {
  //   return await this.dataService.readItem('places');
  // }

  getJsonPlaces(): any {
    return new Promise((resolve) => {
      this.dataService.readItem('places').then((data:any) => {
        resolve(data['data']);
      });
    });
  }

  getJsonPeople(): any {
    return new Promise((resolve) => {
      this.dataService.readItem('people').then((data:any) => {
        resolve(data['data']);
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