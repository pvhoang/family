const fs = require('fs');

if (require.main === module) {

	var args = process.argv.slice(2);
	console.log('args: ' + args, args.length);

	if (args.length != 7) {
		// console.log('--- ERROR ---');
		// console.log('node fs phan "hoang" "pvhoang940@gmail.com" 123456 "Gia phả Nguyễn Tộc" Nguyễn "Nguyễn Văn Dũng"');
		// process.exit();
	}
	
	if (args.length == 2) {
		console.log('args: ',  args);
		// let year = +args[0] * 60 + +args[1];
		// console.log('year: ', year);
		// console.log('name: ', getYearName(year));
		let startYear = +args[0];
		let name = args[1];
		let year = getYear(name, startYear);
		console.log('year: ', year);
		console.log('name: ', getYearName(year));
	} else {
		let fileFamily = './family-0.7.txt';
		let familyData = fs.readFileSync(fileFamily).toString();
		var res = readFamily(familyData);
	}
	
	console.log('... DONE ...');
}

function readFamily(content) {

	var lines = content.split(/\r\n|\n/);
	let ptCost = {};

	for (var il = 1; il < lines.length; il++) {
		let line = lines[il];
		if (line.trim().length > 0) {
			// console.log('line: ', line);
			// let items = line.split(' ');
			// ptCost[items[0]] = {quan: items[2], ao: items[3]};
		}
	}
	// console.log('ptCost: ', ptCost);
	console.log('year: ',  getYear(1927));

	return ptCost;
	// return [sizes, limits, s];
}

function getDetail(line) {
	// https://liengtam.com/cach-tinh-nam-duong-lich-ra-nam-can-chi/
	// y = x * 60 + 42
	// 2022 -> (33 * 60) + 42 -> Nham Dan
	// 1927 -> (32 * 60) + 07 -> Dinh Mao

	// ten (tuc:, gioi:, sinh:1920, tu:1950, nsinh:, ntu:, nsong:, nghe:, mat:20/05/Dinh Mao:),
	// ten (vo, ),
	// ten (chong, )

	let str = node.name + ',' + 
        (node.nick ? node.nick : '') + ',' +
        (node.gender ? node.gender : '') + ',' +
        (node.yob ? node.yob : '') + ',' +
        (node.yod ? node.yod : '') + ',' +
        (node.pob ? node.pob : '') + ',' +
        (node.pod ? node.pod : '') + ',' +
        (node.por ? node.por : '') + ',' +
        (node.desc ? node.desc :  '') + ',' +
        (node.dod ? node.dod : '');
}

function getYearName(year) {
	const cans = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const chis = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
	return  cans[(year+6)%10] + " " + chis[(year-4)%12];
}

function getYear(canChiName, cycle) {
	const cans = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const chis = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
	const chiCanTable = [
		"Chi/Can	Giáp	Ất	Bính	Đinh	Mậu	Kỷ	Canh	Tân	Nhâm	Quý",
		"Tý	04		16		28		40		52	",
		"Sửu		05		17		29		41		53",
		"Dần	54		06		18		30		42	",
		"Mão		55		07		19		31		43",
		"Thìn	44		56		08		20		32	",
		"Tị		45		57		09		21		33",
		"Ngọ	34		46		58		10		22	",
		"Mùi		35		47		59		11		23",
		"Thân	24		36		48		00		12	",
		"Dậu		25		37		49		01		13",
		"Tuất	14		26		38		50		02	",
		"Hợi		15		27		39		51		03"
	]
	canChiName = stripVN(canChiName);
	let names = canChiName.split(' ');
	// let can = names[0].trim().toLowerCase();
	// let chi = names[1].trim().toLowerCase();
	// console.log('can: ',  can);
	// console.log('chi: ',  chi);
	let ican = -1;
	for (let i = 0; i < cans.length; i++) {
		if (names[0] == stripVN(cans[i])) {
			ican = i;
			break;
		}
	}
	let ichi = -1;
	for (let i = 0; i < chis.length; i++) {
		if (names[1] == stripVN(chis[i])) {
			ichi = i;
			break;
		}
	}
	console.log('ican: ',  ican);
	console.log('ichi: ',  ichi);

	let vals = chiCanTable[ichi+1].split('\t');
	console.log('vals: ', vals);

	console.log('chiCanTable: ',  chiCanTable[ichi+1]);
	// console.log('chiCanValue: ',  chiCanTable[ichi+1][ican+1]);
	console.log('chiCanValue: ',  vals[ican+1]);
	// console.log('chiCanValue: ',  chiCanTable[ican+1][ichi+1]);

	return cycle + +vals[ican+1];
	// return  cans[(year+6)%10] + " " + chis[(year-4)%12];
}

function stripVN(str) {
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

	// let ican = -1;
	// for (let i = 0; i < cans.length; i++) {
	// 	if (can == cans[i]) {
	// 		ican = i;
	// 		break;
	// 	}
	// }
	// let ichi = -1;
	// for (let i = 0; i < chis.length; i++) {
	// 	if (chi == chis[i]) {
	// 		ichi = i;
	// 		break;
	// 	}
	// }

	// https://liengtam.com/cach-tinh-nam-duong-lich-ra-nam-can-chi/
	// y = x * 60 + 42
	// 2022 -> (33 * 60) + 42 -> Nham Dan
	// 1927 -> (32 * 60) + 07 -> Dinh Mao
	// console.log('ican, ichi: ', ican, ichi);
	// return  cans[(year+6)%10] + " " + chis[(year-4)%12];

