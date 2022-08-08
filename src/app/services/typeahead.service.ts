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

  getJson(term: string = null, json: string): Observable<string[]> {
    return new Observable((observer) => {
      let getJsonPromise: Promise<any>;
      getJsonPromise = new Promise((resolve) => {
        this.familyService.readJson(json).then((data:any) => {
          resolve(data['data']);
        });
      });
      getJsonPromise.then((data) => {
        if (term) {
          term = this.utilService.stripVN(term);
          data = data.filter((x:any) => this.utilService.stripVN(x.name).indexOf(term) > -1);
        }
        observer.next(data);
      });
    });
  }
}