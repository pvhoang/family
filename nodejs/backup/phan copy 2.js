const fs = require('fs');

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


const BRANCH = 'phan-ngoc-luat';

if (require.main === module) {
	let fileIn = './' + BRANCH + '.txt';
	let fileOut = './' + BRANCH + '.json';

	let familyData = fs.readFileSync(fileIn).toString();

	var family = readFamily(familyData);
	family.version = '11';
	let str = JSON.stringify(family, null, 2);

	saveFile(fileOut, str);
	console.log('... DONE ...');
}

function readFamily(content) {

	let lines = content.split(/\r\n|\n/);
	let families = {};

	for (let il = 0; il < lines.length; il++) {
		let line = lines[il];
		if (line == '' || line.indexOf('//') == 0)
			continue;
		let tabs = line.split('\t');
		// console.log('tabs: ', tabs.length);
		let gen = tabs.length;
		let text = tabs[tabs.length - 1];
		let nodes = getNodes(text);
		if (nodes.length == 0)
			continue;
		let family = getFamily(nodes);
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
	// console.log('families: ', JSON.stringify(families['1'][0], null, 2));
	// console.log('families - out: ', JSON.stringify(families, null, 2));
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

function getNode(str) {
	let items = str.split(',');
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

	// console.log('items: ', items);

	// if (items[0] != null) {
	// 	node[NODE_NAME] = evalWord(items[0].trim(), NODE_NAME);
	// 	node[NODE_GENDER] = evalWord(items[0].trim(), NODE_GENDER);
	// }
	// // if (items[1] != null) node[NODE_GENDER] = evalWord(items[1].trim(), NODE_GENDER);
	// if (items[2] != null) node[NODE_NICK] = evalWord(items[2].trim(), NODE_NICK);

	// if (items[3] != null) node[NODE_YOB] = evalWord(items[3].trim(), NODE_YOB);
	// if (items[4] != null) node[NODE_POB] = evalWord(items[4].trim(), NODE_POB);

	// if (items[5] != null) node[NODE_JOB] = evalWord(items[5].trim(), NODE_JOB);
	// if (items[6] != null) node[NODE_POR] = evalWord(items[6].trim(), NODE_POR);

	// if (items[7] != null) node[NODE_YOD] = evalWord(items[7].trim(), NODE_YOD);
	// if (items[8] != null) node[NODE_POD] = evalWord(items[8].trim(), NODE_POD);
	// if (items[9] != null) node[NODE_DOD] = evalWord(items[9].trim(), NODE_DOD);

	// if (items[10] != null) node[NODE_DESC] = evalWord(items[10].trim(), NODE_DESC);
	// if (items[11] != null) node[NODE_PHOTO] = evalWord(items[11].trim(), NODE_PHOTO);

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

function getWesternYear(canchi) {

	let canArray = ["Giáp","Ất","Bính","Đinh","Mậu","Kỉ","Canh","Tân","Nhâm","Quý"]
	let chiArray = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
	let array = [
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

	let can = canchi[0];
	let chi = canchi[1];

	for (let i = 0; i < canArray.length; i++) {
		if (can == canArray[i]) {
			for (let j = 0; j < chiArray.length; j++) {
				if (chi == chiArray[i]) {
					let year = array[i][j];
					return year;
				}
			}
		}
	}
	return '';
}

function saveFile(filePath, text) {
	fs.writeFile(filePath, text, function(err) {
			if(err)
					console.log('ERROR - ', err);
			console.log('"The file : ' + filePath + ' was saved!');
	}); 
}
