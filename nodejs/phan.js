const fs = require('fs');

// let canArray = ["Giáp","Ất","Bính","Đinh","Mậu","Kỉ","Canh","Tân","Nhâm","Quý"]
// let chiArray = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const canArray = ["giap","at","binh","dinh","mau","ki","canh","tan","nham","quy"]
const chiArray = ["ty","suu","dan","mao","thin","ty","ngo","mui","than","dau","tuat","hoi"];
const canchiArray = [
	['04','  ','16','  ','28','  ','40','  ','52','  '],
	['  ','05','  ','17','  ','29','  ','41','  ','53'],
	['54','  ','06','  ','18','  ','30','  ','42','  '],
	['  ','55','  ','07','  ','19','  ','31','  ','43'],
	['44','  ','56','  ','08','  ','20','  ','32','  '],
	['  ','45','  ','57','  ','09','  ','21','  ','33'],
	['34','  ','46','  ','58','  ','10','  ','22','  '],
	['  ','35','  ','47','  ','59','  ','11','  ','23'],
	['24','  ','36','  ','48','  ','00','  ','12','  '],
	['  ','25','  ','37','  ','49','  ','01','  ','13'],
	['14','  ','26','  ','38','  ','50','  ','02','  '],
	['  ','15','  ','27','  ','39','  ','51','  ','03'],
]

const NODE_NAME = 'name';
const NODE_GENDER = 'gender';
const NODE_NICK = 'nick';

const NODE_YOB = 'yob';
const NODE_POB = 'pob';

const NODE_JOB = 'job';
const NODE_POR = 'por';

const NODE_YOD = 'yod';
const NODE_POD = 'pod';
const NODE_DOD = 'dod';

const NODE_DESC = 'desc';
const NODE_PHOTO = 'photo';

var errorLine = 0;
var errorFile = "";

const BRANCH = 'phan-van-nghi';

if (require.main === module) {

	
	let fileIn = './' + BRANCH + '.txt';
	// let fileOut = './' + BRANCH + '.json';
	let fileOut = './phan-family.json';
	// let fileOut = '../src/assets/common/phan-family.json';

	let familyData = fs.readFileSync(fileIn).toString();

	var family = readFamily(fileIn, familyData);
	family.version = '11';
	let str = JSON.stringify(family, null, 2);

	saveFile(fileOut, str);
	console.log('... DONE ...');
}

function readFamily(fileName, content) {

	let lines = content.split(/\r\n|\n/);
	let families = {};

	errorFile = fileName;

	for (let il = 0; il < lines.length; il++) {
		let line = lines[il];
		if (line == '' || line.indexOf('//') == 0)
			continue;
		let tabs = line.split('\t');
		// console.log('tabs: ', tabs.length);
		let gen = tabs.length;
		let text = tabs[tabs.length - 1];

		errorLine = il + 1;

		// get family from file
		let family = null;
		let idx1 = text.indexOf('{');
		let idx2 = text.indexOf('}');
		if (idx1 >= 0 && idx2 > idx1 >= 0) {

		// if (text.indexOf('{{') >= 0) {
			// get family from file
			family = getFamilyFromFile(text);
			if (family.nodes.length == 0)
				break;
				
		} else {
			let nodes = getNodes(text);
			if (nodes.length == 0)
				continue;
			family = getFamily(nodes);
		}
		// console.log('gen, family: ', gen, family);
		let genItem = '' + gen;
		if (families[genItem] == null)
			families[genItem] = [];
		families[genItem].push(family);
		// console.log('families: ', JSON.stringify(families, null, 2));
		if (gen == 1)
			continue;

		// work on parent
		let f = families['' + (gen-1)];
		// console.log('f: ', JSON.stringify(f, null, 2));
		let parent = f[f.length-1];
		// console.log('parent: ', JSON.stringify(parent, null, 2));
		parent.children.push(family);
	}
	let froot = families[1][0];
	return froot;
}

function getNodes(line) {
	// console.log('line: ', line);
	let nodes = [];
	let iStart = -1;
	for (let i = 0; i < line.length; i++) {
		if (line.charAt(i) == '[') {
			iStart = i + 1;
		} else if (line.charAt(i) == ']') {
			if (iStart > 0) {
				let str = line.substring(iStart, i);
				let node = getNode(str);
				nodes.push(node);
				iStart = -1;
			}
		}
	}
	// console.log('nodes: ', nodes);
	return nodes;
}

function getFamilyFromFile(line) {
	let fileName = line.substring(line.indexOf('{')+1, line.indexOf('}'));
	console.log('fileName: ', fileName);
	try {
		let familyData = fs.readFileSync(fileName + '.txt').toString();
		return readFamily(fileName, familyData);
		// return JSON.parse(familyData);
	} catch (err) {
		// Here you get the error when the file was not found,
		// but you also get any other error
		console.log('ERROR - getFamilyFromFile: ', err);
	}
	return { nodes: [], children: [ ] }
}

function getNode(str) {
	let items = str.split('|');
	let node = {};
	node.name = evalWord(items[0].trim(), NODE_NAME);
	node.gender = evalWord(node.name, NODE_GENDER);
	
	items.forEach(item => {
		item = item.trim();
		if (item.indexOf('gender:') >= 0) node.nick = evalWord(item.substring(6), NODE_GENDER);
		if (item.indexOf('nick:') >= 0) node.nick = evalWord(item.substring(5), NODE_NICK);
		if (item.indexOf('yob:') >= 0) node.yob = evalWord(item.substring(4), NODE_YOB);
		if (item.indexOf('yod:') >= 0) node.yod = evalWord(item.substring(4), NODE_YOD);
		if (item.indexOf('dod:') >= 0) node.dod = evalWord(item.substring(4), NODE_DOD);
		if (item.indexOf('desc:') >= 0) node.desc = item.substring(5);
	})
	return node;
}

function getFamily(nodes) {
	return { nodes: nodes, children: [ ] }
}

function evalWord(str, type) {
	let res = '';

	if (type == NODE_NAME) {
		// name: Phan Văn Nghi] [THÁI THỊ TÔN NƯƠNG]
		// break to words
		let srcName = str.toLowerCase();
		// let desNames = '';
		let words = srcName.split(' ');
		let name = '';
		for (let i = 0; i < words.length; i++) {
			let w = convert(words[i]);
			let word = w.charAt(0).toUpperCase() + w.substring(1);
			if (i != 0)
				name += ' ';
			name += word;
		}
		res = name;

	} else if (type == NODE_GENDER) {
		// console.log('NODE_GENDER: ', str);
		res = stripVN(str);
		res = (res.indexOf(' thi ') >= 0) ? 'female' : 'male';

	} else if (type == NODE_NICK) {
		res = evalWord(str, NODE_NAME)
	
	} else if (type == NODE_YOB) {
		res = str;
		// console.log('NODE_YOB: ', res);

		if (isNaN(str))
			res = '' + getWesternYear(res);



	} else if (type == NODE_DOD) {
		res = str;
		if (res.charAt(2) == '-')
			res = str.substring(0,2) + '/' + str.substring(3);

	} else if (type == NODE_YOD) {
		res = str;
		if (isNaN(str))
			res = '' + getWesternYear(res);
	}

	return res;
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

function convert(word) {
	const words = [
		['nguyen', 'nguyễn'],
		['van', 'văn'],
		['khac', 'khắc'],
	]
	for (let i = 0; i < words.length; i++) {
		if (word == words[i][0])
			return words[i][1];
	}
	return word;
}

function getWesternYear(str) {
	let d = str.split(',');
	if (d.length == 1) {
		printError('getWesternYear() - no start year (ex. Ất Tỵ,1860): ' + str);
		// console.log('--- ERROR ---');
		// console.log('getWesternYear() - no start year (ex. Ất Tỵ,1860): ' + str);
		// console.trace();
		// console.log('-------------');
		// process.exit();
	}
	let canchi = d[0].trim();
	let arys = canchi.split(' ');
	if (arys.length == 1) {
		printError('getWesternYear() - canchi is wrong (ex. Ất Tỵ,1860): ' + str);
		// console.log('--- ERROR ---');
		// console.log('getWesternYear() - canchi is wrong (ex. Ất Tỵ,1860): ' + str);
		// console.trace();
		// console.log('-------------');
		// process.exit();
	}
	let startYear = (d.length > 1) ? +d[1].trim() : 0;

	// console.log('getWesternYear: ', canchi);
	let can = stripVN(arys[0]);
	let chi = stripVN(arys[1]);
	let found = false;
	let year = '';

	for (let i = 0; i < canArray.length && !found; i++) {
		if (can == canArray[i]) {
	// console.log('getWesternYear10: ', can);
			for (let j = 0; j < chiArray.length && !found; j++) {
				if (chi == chiArray[j]) {
	// console.log('getWesternYear11: ', chi, i, j);
					year = canchiArray[j][i];
					found = true;
				}
			}
		}
	}
	// console.log('getWesternYear1: ', year);
	return +year + startYear;
}

function saveFile(filePath, text) {
	fs.writeFile(filePath, text, function(err) {
			if(err)
					console.log('ERROR - ', err);
			console.log('"The file : ' + filePath + ' was saved!');
	}); 
}

function printError(msg) {
	console.log('--- ERROR --- File: ' + errorFile + ' --- Line: ' + errorLine);
	console.log(msg);
	// console.trace();
	console.log('-------------');
	process.exit();
}
