const fs = require('fs');

const NODE = {
  relationship: '',
  name: '',
  level: '',
  nick: '',
  gender: '',
  yob: '',
  yod: '',
  pob: '',
  pod: '',
  por: '',
  job: '',
  desc: '',
  photo: '',
  dod: ''
}

const NAME = 'name';
const NICK = 'nick';
const DOD = 'dod';
const GENDER = 'gender';
const YOB = 'yob';

const BRANCH = 'phan-ngoc-luat';

const ROOT = 'phan_loi_hanh';
if (require.main === module) {
	let fileIn = './' + BRANCH + '.txt';
	let fileOut = './' + BRANCH + '.json';

	// let fileOut = './phan-family.json';
	// let fileOut = '../src/assets/common/phan-family.json';
	let familyData = fs.readFileSync(fileIn).toString();

	var family = readFamily(familyData);
	family.version = '11';
	let str = JSON.stringify(family, null, 2);
	
	// let str = JSON.stringify(froot, null, 2);
	// return (str.substring(1,str.length).trim());
	// return (str);

	saveFile(fileOut, str);
	console.log('... DONE ...');
}

function readFamily(content) {

	// const NUM_LINES = 197;
	var lines = content.split(/\r\n|\n/);
	let families = {};
	let childIdx = 1;

	for (var il = 0; il < lines.length; il++) {
	// for (var il = 0; il < NUM_LINES; il++) {
		let line = lines[il];
		if (line == '')
			continue;
		let tabs = line.split('\t');
		// console.log('tabs: ', tabs.length);
		let gen = tabs.length;
		let text = tabs[tabs.length - 1];

		// if (il == 38)
			// console.log('gen, text: ', gen, text);

		let nodes = getNodes(gen, text);
		if (nodes.length == 0)
			continue;

		let family = getFamily(nodes);
		if (!families[gen])
			families[gen] = [];
		families[gen].push(family);

		if (gen == 1)
			continue;

		// work on parent
		let f = families[gen-1];
		let parent = f[f.length-1];
		parent.children.push(family);
		
	}
	let froot = families[1][0];
	return froot;

	// froot.version = '11';
	// let str = JSON.stringify(froot, null, 2);
	// return (str.substring(1,str.length).trim());
	// return (str);
}

function getNodes(gen, line) {

	// let nodeIdx = 1;
	let nodes = [];
	let iStart = -1;
	for (let i = 0; i < line.length; i++) {
		if (line.charAt(i) == '[') {
			iStart = i + 1;
		} else if (line.charAt(i) == ']') {
			if (iStart > 0) {
				let str = line.substring(iStart, i);
				items = str.split(',');
				let node = {};
				node.name = evalWord(items[0].trim(), NAME);
				node.gender = evalWord(node.name, GENDER);

				// node.id = '' + gen + '-' + nodeIdx++;
				items.forEach(item => {
					item = item.trim();
					if (item.indexOf('nick:') >= 0) node.nick = evalWord(item.substring(5), NAME);
					if (item.indexOf('yob:') >= 0) node.yob = item.substring(4);
					if (item.indexOf('dod:') >= 0) node.dod = evalWord(item.substring(4), DOD);
					if (item.indexOf('me:') >= 0) node.desc = 'Mẹ: ' + item.substring(3);
				})
				nodes.push(node);
				iStart = -1;
			}
		}
	}
	// console.log('nodes: ', nodes);
	return nodes;
}

function getFamily(nodes) {
	let family = {
		nodes: nodes,
		children: [ ]
	}
	return family;
}

function evalWord(str, type) {
	let res = '';
	if (type == NAME) {
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
	} else if (type == GENDER) {
		res = stripVN(str);
		res = (res.indexOf(' thi ') >= 0) ? 'female' : 'male';

	} else if (type == DOD) {
		res = str;
		if (res.charAt(2) == '-')
			res = str.substring(0,2) + '/' + str.substring(3);
	} else if (type == YOB) {
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

	let ary = canchi.split(' ');
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
