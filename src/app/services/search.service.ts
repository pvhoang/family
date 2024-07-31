import { Injectable } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private languageService: LanguageService,
    private utilService: UtilService,
	) { }

	public getNamesFromDesc(desc: any) {
		// collect names
		// "desc": [
		// 	"w|Hoàng Thị Hữu",
		// 	"s|Phan Viên|Mất 16/03",
		// ]
		let results = [];
		if (Array.isArray(desc)) {
			desc.forEach((item: any) => {
				let vals = item.split('|');
				if (vals.length > 0) {
					let name = vals[1];
					results.push(name);
				}
			})
			return this.utilService.stripVN(results.join(','))
		} else {
			return this.utilService.stripVN(desc);
		}
	}
 	
}
