import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor(private utilService: UtilService
  ) { }

	convertArrayToHtml(images: any, lines: any, textarea?: boolean) {

		let html = '';
		for (let il = 0; il < lines.length; il++) {
			let line = lines[il].trim();
			if (line.length == 0) {
				// html += '<p>&nbsp;</p>';
				html += '<br>';
				continue;
			} else if (line.indexOf('//') == 0) {
				continue;
			}
			let paraHtml = '';
			// check line type
			if (line.indexOf('<im>') == 0 && line.indexOf('</im>') > 0)
				// decode image formatting
				paraHtml = this.getUIHtml(line, images, ['IMAGE', '<im>', '</im>'], textarea);
			else if (line.indexOf('<do>') == 0 && line.indexOf('</do>') > 0)
				paraHtml = this.getUIHtml(line, images, ['DOCUMENT', '<do>', '</do>']);
			else if (line.indexOf('<vi>') == 0 && line.indexOf('</vi>') > 0)
				paraHtml = this.getUIHtml(line, images, ['VIDEO', '<vi>', '</vi>']);
			else
				// regular text, decode standard formatting
				paraHtml = this.getParagraphHtml(line);
			// console.log('paraHtml1: ', paraHtml);
			// finalize html
			let lineOK = (paraHtml.indexOf('<p') == 0 && paraHtml.indexOf('</p>') > 0) ||
				(paraHtml.indexOf('<div') == 0 && paraHtml.indexOf('</div>') > 0);
			if (!lineOK)
				paraHtml += '<br>';
			
			html += paraHtml;
		}
		return html;
	}

	private getParagraphHtml(srcStr: any) {
		// https://stackoverflow.com/questions/42698757/if-a-p-and-span-tag-both-have-an-em-font-size-what-is-the-actual-height
		let str = srcStr;
		const specialCharsMap = new Map([
			['<al>', ''],['</al>', ''],			// left
			['<ar>', ''],['</ar>', ''],		// right
			['<ac>', ''],['</ac>', ''],		// center
			
			['<10>', ''],['</10>', ''],		// padding-left 10px
			['<20>', ''],['</20>', ''],		// padding-left 20px
			['<30>', ''],['</30>', ''],		// padding-left 30px

			['<s>', '<strong>'], ['</s>', '</strong>'],		// strong
			['<e>', '<em>'], ['</e>', '</em>'],						// italic
			['<u>', '<span style="text-decoration: underline;">'], ['</u>', '</span>'],	// underline
			['<3>', '<span style="font-size: 0.7em;">'], ['</3>', '</span>'],	// size 3, smallest
			['<2>', '<span style="font-size: 1.0em;">'], ['</2>', '</span>'],	// size 2, normal
			['<1>', '<span style="font-size: 1.3em;">'], ['</1>', '</span>'],	// size 1, big
			['<g>', '<span style="color: #00ff00;">'], ['</g>', '</span>'],	// green
			['<r>', '<span style="color: #ff0000;">'], ['</r>', '</span>'],	// red
			['<b>', '<span style="color: #0000ff;">'], ['</b>', '</span>'],	// blue
		]);
		function replaceSpecialChars(string: any) {
			for (const [key, value] of specialCharsMap) {
				string = string.replace(new RegExp(key, "g"), value);
			}
			return string;
		}
		let html = replaceSpecialChars(str);

		// tags for padding-left

		// let padding = '';
		// if (srcStr.indexOf('<10>') >= 0)
		// 	padding = 'style="padding-left: 10px;"';
		// else if (srcStr.indexOf('<20>') >= 0)
		// 	padding = 'style="padding-left: 20px;"';
		// else if (srcStr.indexOf('<30>') >= 0)
		// 	padding = 'style="padding-left: 30px;"';

		let padding = '';
		if (srcStr.indexOf('<10>') >= 0)
			padding = 'viewer-home-container-padding-10';
		else if (srcStr.indexOf('<20>') >= 0)
			padding = 'viewer-home-container-padding-20';
		else if (srcStr.indexOf('<30>') >= 0)
			padding = 'viewer-home-container-padding-30';

		// add special tags for alignment (see image)

		if (srcStr.indexOf('<ar>') >= 0) {
			// html = '<div class="viewer-home-container-right ' + padding + '">' + html + '</div>';
			html = '<div class="viewer-home-container-right">' + html + '</div>';
		} else if (srcStr.indexOf('<ac>') >= 0) {
			html = '<div class="viewer-home-container-center">' + html + '</div>';
		} else {
			html = '<div class="viewer-home-container-left ' + padding + '">' + html + '</div>';
		}

		// if (srcStr.indexOf('<al>') >= 0) {
		// 	html = '<div class="viewer-home-container-left" ' + padding + '>' + html + '</div>';
		// } else if (srcStr.indexOf('<ar>') >= 0) {
		// 	html = '<div class="viewer-home-container-right" ' + padding + '>' + html + '</div>';
		// } else if (srcStr.indexOf('<ac>') >= 0) {
		// 	html = '<div class="viewer-home-container-center" ' + padding + '>' + html + '</div>';
		// }
		return html;
	}

	getUIHtml(paraHtml: any, images: any, keys: any, textarea?: boolean) {
		let reg = new RegExp(keys[1] + '(.*?)' + keys[2], "g");
		// console.log('reg: ', reg);
		let matches = paraHtml.match(reg);
		if (matches) {
			for (let i = 0; i < matches.length; ++i) {
				// console.log('matches[i]: ', matches[i]);
				let str = matches[i].substring(keys[1].length,  matches[i].length - keys[2].length);
				let html = '';
				if (keys[0] == 'IMAGE') {
					html = this.getImageHtml(images, str, textarea);
				} else if (keys[0] == 'DOCUMENT') {
					html = this.getDocumentHtml(images, str)
				} else if (keys[0] == 'VIDEO') {
					html = this.getVideoHtml(images, str)
				}
				if (html != '')
					paraHtml = paraHtml.replaceAll(matches[i], html);
			}
		}
		return paraHtml;
	}

	getImageHtml(images: any, str: any, textarea?: boolean) {

		// <im>ac|1|abc.png|This is caption</im>
		let items = str.split('|');
		let align = items[0];
		if (align !== 'al' && align !== 'ac' && align !== 'ar') align = 'ac'

		let size = items[1];
		if (size != '1' || size != '2' || size != '3') size = '2'
		let name = items[2];
		let caption = items[3];

		const containers = { 'al': 'viewer-home-container-left', 'ac': 'viewer-home-container-center', 'ar': 'viewer-home-container-right' };
		const sizeValues = { '3': { width: 150, height: 100 }, '2': { width: 200, height: 150 }, '1': { width: 250, height: 200 } };
		if (!images[name])
				return '';

		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('image') == -1)
			return '';
			
		let data = { width: sizeValues[size].width, height: sizeValues[size].height };
		let iWidth = images[name].width;
		let iHeight = images[name].height;
		if (iWidth > iHeight) {
			// landscape
			data.height = data.width * iHeight / iWidth;
		} else {
			// portrait
			let width = data.width;
			data.height = width;
			data.width = width * iWidth / iHeight;
		}

		let imgTag = '';
		if (textarea) {
			// textarea container in person.page.ts, use hover
			imgTag = '<img src="' + url + '" class="viewer-home-container-image" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '"/>';

		} else {
			// regular container, use click
			let stripName = this.utilService.stripVN(name);
			stripName = stripName.replaceAll(' ', '-');
			stripName = stripName.replaceAll('.', '-');
			let imageId = "image-id-" + this.utilService.getCurrentTime() + '-' + stripName;
			imgTag = '<img id="' + imageId + '" src="' + url + '" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '" onclick=enlargeImage(\'' + imageId + '\')>';
		}
		
		let html = 
			'<div class="' + containers[align] + '">' +
				imgTag +
				// '<img src="' + url + '" class="viewer-home-container-image" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '"/>' +
				// '<img id="' + imageId + '" src="' + url + '" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '" onclick=enlargeImage(\'' + imageId + '\')>' +
			'</div>';
		if (caption != '')
			html += '<div class="' + containers[align] + ' viewer-home-no-expand">' + caption + '</div>';
			// html += '<div class="' + containers[align] + '"' + caption + '</div>';
		console.log('html: ', html);
		return html;
	}

	getDocumentHtml(images: any, str: any) {

		// <do>ac|abc.word|This is caption</do>
		let items = str.split('|');
		let align = items[0];
		if (align !== 'al' && align !== 'ac' && align !== 'ar') align = 'ac'
		let name = items[1];
		let caption = items[2];

		// console.log('str: ', str, align);
		let containers = { 'al': 'viewer-home-container-left', 'ac': 'viewer-home-container-center', 'ar': 'viewer-home-container-right' };
		if (!images[name])
				return '';
				
		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('image') >= 0 || type.indexOf('video') >= 0)
			return '';
		let	html =
			'<div class="' + containers[align] + '">' +
			'<span id="document-download" class="viewer-home-container-label" onclick="downloadDocument(\'' + url + '\', \'' + name + '\')">' + caption + '</span>' +
			'</div>';
		return html;

	}

	getVideoHtml(images: any, str: any) {
		// <vi>ac|abc.mp4|This is caption</vi>
		let items = str.split('|');
		let align = items[0];
		if (align !== 'al' && align !== 'ac' && align !== 'ar') align = 'ac'

		let name = items[1];
		let caption = items[2];

		// const pretags = { 'al': '<p style="text-align: left;">', 'ac': '<p style="text-align: center;">', 'ar': '<p style="text-align: right;">' };
		const containers = { 'al': 'viewer-home-container-left', 'ac': 'viewer-home-container-center', 'ar': 'viewer-home-container-right' };
		const wrappers = { 'al': 'viewer-home-player-wrapper-left', 'ac': 'viewer-home-player-wrapper-center', 'ar': 'viewer-home-player-wrapper-right' };
		
		if (!images[name])
				return '';
		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('video') == -1)
			return '';

		// let pretag = pretags[align];
		// let postag = '</p>';

		let	html =
			'<div class="' + wrappers[align] + '">' +
			'<vg-player>' +
				'<video #media [vgMedia]="media" id="singleVideo" preload="auto" controls>' +
					'<source src="' + url + '" type="video/mp4" >' +
				'</video>' +
			'</vg-player>' +
			'</div>';
		// html = pretag + html + postag;
		html += '<div class="' + containers[align] + ' viewer-home-no-expand">' + caption + '</div>';
		return html;
	}

	// must remove this for font-size option in page-text (home.page.html) (home.page.ts)
	// font-size: 12pt; -> font-size: font-size: 80%, 100%, 120%
	removeFontSize(str: string, newPercent: any) {
		let res = '';
		let idx1 = 0;
		for (;idx1 < str.length;) {
			let idx2 = str.indexOf('font-size:', idx1);
			if (idx2 < 0) {
				res += str.substring(idx1);
				break;
			} else {
				res += str.substring(idx1, idx2);
			}
			let idx3 = str.indexOf('pt;', idx2);
			if (idx3 > idx2) {
				res += 'font-size: ' + newPercent + '%;';
				idx1 = idx3 + 'pt;'.length;
			} else {
				res += str.substring(idx2);
				break;
			}
		}
		return res;
	}

	// replace special template (home.page.ts)
	// IN: "[NODES]","[LEVELS]","[GEN_TABLE]"
	replaceSpecialTemplate(str: any, nodes, levels) {
		str = str.replaceAll('[NODE-COUNT]', '<b>' + nodes +'</b>');
		str = str.replaceAll('[GEN-COUNT]', '<b>' + levels + '</b>');

		if (str.indexOf("[GEN-TABLE]") >= 0) {
			let html = '';
			html += 
			'<ion-grid class="grid">' +
      '<ion-row>' +
        '<ion-col size="2" class="column">' +
          // {{ 'FILE_COMPARE_NAME' | translate }}
        '</ion-col>' +
        '<ion-col size="5" class="column">' +
          // {{ 'FILE_COMPARE_DETAIL' | translate }}
        '</ion-col>' +
				'<ion-col size="5" class="column">' +
				// {{ 'FILE_COMPARE_DETAIL' | translate }}
				'</ion-col>' +
			'</ion-row>' +

			'</ion-grid>';
			str = str.replaceAll('[GEN_TABLE]', html);
		}
		return str;
	}

	
}
