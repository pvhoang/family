import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
	) { }

	public savePeoplePlacesJSON(nodes: any) {
		// console.log('savePeopleJSON: nodes:', nodes);
		// save PEOPLE.JSON
		let peopleData = [];
		let placeData = [];
		nodes.forEach(node => {
      peopleData.push(node.name);
    });
		nodes.forEach(node => {
			if (node.pob != '') {
				peopleData.push(node.pob);
				placeData.push(node.pob);
			}
			if (node.pod != '') {
				peopleData.push(node.pod);
				placeData.push(node.pod);
			}
    });
		nodes.forEach(node => {
			if (node.yob != '')
				peopleData.push(node.yob);
			if (node.yod != '')
				peopleData.push(node.yod);
    });

		let uniquePeopleData = [];
		peopleData.forEach((element) => {
			if (!uniquePeopleData.includes(element)) {
				uniquePeopleData.push(element);
			}
		});

		let uniquePlaceData = [];
		placeData.forEach((element) => {
			if (!uniquePlaceData.includes(element)) {
				uniquePlaceData.push(element);
			}
		});

		// console.log('savePeopleJSON: uniqueData:', uniqueData);
		let people = {};
    people['data'] = [];
    uniquePeopleData.forEach(value => {
      people['data'].push({'name': value});
    });
		let places = {};
    places['data'] = [];
    uniquePlaceData.forEach(value => {
      places['data'].push({'name': value});
    });

    console.log('people: ', JSON.stringify(people, null, 4));
    console.log('places: ', JSON.stringify(places, null, 4));

  }

	public stripVN(str) {
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, 'a');
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, 'e');
		str = str.replace(/ì|í|ị|ỉ|ĩ/gi, 'i');
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, 'o');
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, 'u');
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, 'y');
		str = str.replace(/đ/gi, 'd');
		str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/gi, 'A');
		str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/gi, 'E');
		str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/gi, 'I');
		str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/gi, 'O');
		str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/gi, 'U');
		str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/gi, 'Y');
		str = str.replace(/Đ/gi, 'D');
    return str.toLowerCase();
	}

}
