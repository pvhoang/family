import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  constructor(
    private dataService: DataService,
    private utilService: UtilService,
  ) { }

  getEvaluatedName(term: string) {
    return new Promise((resolve) => {
      this.dataService.readItem('names').then((result:any) => {
        // console.log('getEvaluatedName - term: ', term);
        let sterm = this.utilService.stripVN(term);
        if (term != sterm) {
          resolve([term]);
        }
        let data = result.data;

        let familyNames = data['family'];
        let midMaleNames = data['middle_male'];
        let midFemaleNames = data['middle_female'];
        let firMaleNames = data['first_male'];
        let firFemaleNames = data['first_female'];

        // break term to words
        let srcName = term.toLowerCase();
        // let desNames = '';
        let words = srcName.split(' ');
        let gender = 0;
        let res:any = [];
        let resNames:any = [];

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
          // gender = res[1];
          if (res[0].length == 0) {
            // capitalize src
            let c = srcWord.charAt(0);
            word = c.toUpperCase() + srcWord.substring(1);
            resNames[i] = [word];
          } else {
            resNames[i] = res[0];
          }
        }
        // console.log('getEvaluatedName - srcName, resNames: ', srcName, resNames);
        let names = [];
        for (let i = 0; i < resNames[0].length; i++) {
          // let name = '';
          let familyName = resNames[0][i];
          // name = familyName;
          if (resNames.length == 1) {
            names.push(familyName);
            continue;
          }
          // loop middle name
          for (let j = 0; j < resNames[1].length; j++) {
            let middleName = resNames[1][j];
            // name += ' ' + middleName;
            if (resNames.length >= 3) {
              // 3-word name
              for (let k = 0; k < resNames[2].length; k++) {
                let firstName1 = resNames[2][k];
                // name += ' ' + firstName1;
                if (resNames.length == 4) {
                  for (let l = 0; l < resNames[3].length; l++) {
                    let firstName2 = resNames[3][l];
                    // name += ' ' + firstName2;
                    names.push(familyName + ' ' + middleName + ' ' + firstName1 + ' ' + firstName2);
                  }
                } else {
                  names.push(familyName + ' ' + middleName + ' ' + firstName1);
                }
              }
            } else {
              names.push(familyName + ' ' + middleName);
            }
          }
        }
        // console.log('getEvaluatedName - names: ', names);
        resolve(names);
      });
    });
  }

  private getWord(gender, mNames:any, fNames:any, srcWord: any) {
    let words:any;
    let newGender = gender;
    if (gender == 0) {
      // neutral
      words = this.getVNWord(mNames, srcWord);
      if (words.length == 0) {
        words = this.getVNWord(fNames, srcWord);
        newGender = 2;
      } else {
        newGender = 1;
      }
    } else if (gender == 1) {
      // male
      words = this.getVNWord(mNames, srcWord);
    } else if (gender == 2) {
      // female
      words = this.getVNWord(fNames, srcWord);
    }
    return [ words, newGender ];
  }

  private getVNWord(names:any, srcWord: any) {
    // srcWord: Nguyen, Nguyễn, nguyen, nguyễn, NGUYEN
    let stripWord = this.utilService.stripVN(srcWord);
    let words = [];
    // check again available VN list
    for (let i = 0; i < names.length; i++) {
      if (stripWord == this.utilService.stripVN(names[i]))
        words.push(names[i]);
    }
    return words;
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
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
            // add some common middle and first name
            for (let i = 0; i < famNames.length; i++) {
              let familyName = famNames[i];
              names.push({ name: familyName + ' Văn Tên' });
              names.push({ name: familyName + ' Thị Tên' });
            }

          // two words, must be Family name + Middle name
          } else if (words.length == 2) {
            let familyName = words[0];
            term = words[1];
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x) == familyName);
            // filter middle names
            let mMaleNames = midMaleNames.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
            let mFemaleNames = midFemaleNames.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
            // select  a full name from Family and Middle
            for (let i = 0; i < famNames.length; i++) {
              familyName = famNames[i];
              for (let j = 0; j < mMaleNames.length; j++) {
                let middleName = mMaleNames[j];
                let firstName = firMaleNames[j];
                names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
              }
              for (let j = 0; j < mFemaleNames.length; j++) {
                let middleName = mFemaleNames[j];
                let firstName = firMaleNames[j];
                names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
              }
            }

          // three words, must be Family name + Middle name + First name
          } else if (words.length == 3) {

            let familyName = words[0];
            let middleName = words[1];
            term = words[2];
            let famNames = familyNames.filter((x:any) => this.utilService.stripVN(x) == familyName);
            let mMaleNames = midMaleNames.filter((x:any) => this.utilService.stripVN(x) == middleName);
            let mFemaleNames = midFemaleNames.filter((x:any) => this.utilService.stripVN(x) == middleName);
            let fMaleNames = firMaleNames.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
            let fFemaleNames = firFemaleNames.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
 
            for (let i = 0; i < famNames.length; i++) {
              familyName = famNames[i];
              for (let j = 0; j < mMaleNames.length; j++) {
                let middleName = mMaleNames[j];
                for (let k = 0; k < fMaleNames.length; k++) {
                  let firstName = fMaleNames[k];
                  names.push({ name: familyName + ' ' + middleName + ' ' + firstName });
                }
              }
              for (let j = 0; j < mFemaleNames.length; j++) {
                let middleName = mFemaleNames[j];
                for (let k = 0; k < fFemaleNames.length; k++) {
                  let firstName = fFemaleNames[k];
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
          values = data.filter((x:any) => this.utilService.stripVN(x).indexOf(term) > -1);
        }
        observer.next(values);
      });
    });
  }

  getJsonPlaces(): any {
    return new Promise((resolve) => {
      this.dataService.readItem('places').then((data:any) => {
        resolve(data['data']);
      });
    });
  }

  private sortName(names: any) {
    let d = [];
    names.forEach((element:any) => {
      if (element && element != '' && !d.includes(element))
        d.push(element);
    });
    d.sort();
    let data = [];
    d.forEach(value => {
      data.push({'name': value});
    });
    return data;
  }
}