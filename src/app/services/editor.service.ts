import { Injectable } from '@angular/core';
import { DataService } from '../services/data.service';
import { ThemeService } from '../services/theme.service';
import { FirebaseService } from '../services/firebase.service';
import { DEBUGS, VietnameseEntities, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE  } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor(
    private fbService: FirebaseService,
    private themeService: ThemeService,
    private dataService: DataService,
  ) { }

	getImageItems(editor: any) {
		let imageItems = [];
		this.dataService.readItem('photos').then((photos:any) => {
			photos.data.forEach(photo => {
				let dat = photo.split('|');
				let name = dat[0];
				let caption = (dat.length > 1) ? dat[1] : name;
				let sub = {
					type: 'menuitem',
					text: name,
					onAction: () => editor.insertContent(`[` + name + `|2|1|` + caption + `]`)
				};
				imageItems.push(sub);
			})
			return imageItems;
		});
		return imageItems;
	}
	
	// convert a document with special templates info to html text 
	convertDocumentTemplate(images: any, text: any) {

		// https://stackoverflow.com/questions/71176093/how-to-extract-content-in-between-an-opening-and-a-closing-bracket
		var reg = /(?<=\[)[^\]]*(?=\])/g;
		let templates = [];
		const matches = text.match(reg);
		if (matches) {
			for (let i = 0; i < matches.length; ++i) {
				const match = matches[i];
				// match does not include []
				let data = this.getDocumentTemplate(match);
				if (data)
					templates.push(data);
			}
		}
		// no template in text, just return
		if (templates.length == 0)
			return ([]);

		// now read all images to url from Firebase storage
		let promises = [];
		templates.forEach((data: any) => {
			if (data.type == '0') {
				promises.push({ docStr: data.src, html: data.src });

			// simple template with no server access
			} else if (data.type == '1') {
				// phrase formatting
				let html = '';
				if (data.justify == '0') html = '<p>';
				if (data.justify == '1') html = '<p style="text-align: center;">';
				if (data.justify == '2') html = '<p style="text-align: right;">';
				if (data.weight == '1') html += '<strong>';
				if (data.style == '1') html += '<em>';
				html += data.phrase;
				if (data.style == '1') html += '</em>';
				if (data.weight == '1') html += '</strong>';
				html += '</p>';
				if (DEBUGS.EDITOR)
					console.log('convertDocumentTemplate - html: ', html);
				promises.push({ docStr: data.src, html: html });

			} else if (data.type == '2' || data.type == '3') {
				// console.log('convertDocumentTemplate - images[data.name]: ', images[data.name]);
				// image is not available in storage, keep src
				if (!images[data.name]) {
				// console.log('convertDocumentTemplate - data.src: ', data.src);
					promises.push({ docStr: data.src, html: '[' + data.src + ']' });
				} else {
					let url = images[data.name].url;
					let type = images[data.name].type;
					console.log('convertDocumentTemplate - type: ', type);

					let html = '';
					if (type.indexOf('image') >= 0) {
						// w=150 h=100 , w=1200 h=900 -> h = 150 * 900 / 1200, w=150
						// w=150 h=100 , w=900 h=1350 -> w = 150 * 900 / 1350, h=150
						// match width and height with image natural size 
						let iWidth = images[data.name].width;
						let iHeight = images[data.name].height;
						if (iWidth > iHeight) {
							// landscape
							data.height = data.width * iHeight / iWidth;
						} else {
							// portrait
							let width = data.width;
							let height = data.height;
							data.height = width;
							data.width = width * iWidth / iHeight;
						}
						// https://stackoverflow.com/questions/30686191/how-to-make-image-caption-width-to-match-image-width
						html = 
						'<div class="' + data.container + '">' +
						'<img src="' + url + '" class="viewer-home-container-image" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + data.name + '"/>' +
						'</div>';
						if (data.caption != '') {
							let fontSizePercent = this.themeService.getRootProperty("--app-page-text-font-size");
							let style = 'font-size: ' + fontSizePercent + ';';
							html += '<div class="' + data.container + ' viewer-home-no-expand" style="' + style + '">' + data.caption + '</div>';
						}
					} else {
						html = 
						'<div class="' + data.container + '">' +
						'<span class="viewer-home-container-label" onclick="downloadDocument(\'' + url + '\', \'' + data.name + '\')">' + data.caption + '</span>' +
						// '<span style="' + style + '" onclick="downloadDocument(\'' + url + '\', \'' + data.name + '\')">' + data.caption + '</span>' +
						'</div>';
					}
					if (DEBUGS.EDITOR)
						console.log('convertDocumentTemplate - html: ', html);
					promises.push({ docStr: data.src, html: html });
				}
			}
		});
		return (promises);
	}

	private getDocumentTemplate(str: any) {
		// console.log('str: ', str);
		// if str between [] has <. it is a html string
		if (str.indexOf('<') >= 0) {
			let data = { type: '0', src: str }
			return data;
		}
		let items = str.split('|');
		let type = items[0].trim();

		if (type == '1') {
			// TXT paragraph
			// IN: "[1 |justify|weight|style|label]" 
			// 			"justify: 0(left)/1(center)/2(right)" 
			//			"weight: 0(normal)/1(strong)"
			//			"style: 0(normal)/1(em)"
			// EG: "[1 |1|1|1|Ngành nghề truyền thống]"
			let justify = items[1].trim();
			let weight = items[2].trim();
			let style = items[3].trim();	
			if (justify == '0' || justify == '1' || justify == '2') {
				let data = { type: type, src: str, justify: justify, weight: weight, style: style, phrase: items[4].trim() }
				return data;
			}

		} else if (type == '2') {
			// DOC, PDF, TXT document
			// IN: "[2| doc|justify|label]" 
			// 			"justify: 0(left)/1(center)/2(right)" 
			// EG: "[2| Quảng Bình.doc|1|Tư liệu tỉnh Quảng Bình]"

			let fileName = items[1].trim();
			fileName = this.decodeEntities(fileName);
			let justify = items[2].trim();
			let captionStr = items[3];
			if (justify == '0' || justify == '1' || justify == '2') {
				let justifies = { '0': 'left', '1': 'center', '2': 'right' }
				let containerClass = 'viewer-home-container-'+justifies[justify];
				let data = { type: type, src: str, name: fileName, justify: justify, container: containerClass, caption: captionStr }
				return data;
			}

		} else if (type == '3') {
			// IMAGE JPG, JPEG, BNG document
			// IN: "[3| image|size|justify|caption]" 
			//			"size: 0(small)/1(medium)/2(large)
			//			"justify: 0(left)/1(center)/2(right)"
			// EG: "[3| bai-vi-doi-1.jpg|1|1|Bài vị Thủy Tổ Họ Phan, Nhà thờ Họ Phan, Đồng Phú]"

			let fileName = items[1].trim();
			fileName = this.decodeEntities(fileName);
			// valid file, check image size
			let size = items[2].trim();
			if (size == '0' || size == '1' || size == '2') {
				let sizes = { 
					'1': { w: '150', h: '100' },
					'2': { w: '200', h: '150' },
					'3': { w: '250', h: '200' },
				};
				let justify = items[3].trim();
				if (justify == '0' || justify == '1' || justify == '2') {
					let justifies = { '0': 'left', '1': 'center', '2': 'right' }
					let containerClass = 'viewer-home-container-'+justifies[justify];
					let caption = items[4];
					let data = { type: type, src: str, name: fileName, width: sizes[size].w, height: sizes[size].h, container: containerClass, caption: caption }
					return data;
				}
			}
			return null;
		}
		return null;
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

	// replace style for node.desc (person.page.ts)
	// replace special template (home.page.ts)
	// IN: 'style="text-align: center;"'
	// OUT: 'class="p-center'
	// 	'<p style="text-align: center;"><strong>1. &Ocirc;ng Phan Quang Triệt</strong></p><p style="text-align: right;"><strong>2. Vị v&ocirc; danh</strong></p>';
	// '<p class="p-center"><strong>1. &Ocirc;ng Phan Quang Triệt</strong></p><p class="p-right"><strong>2. Vị v&ocirc; danh</strong></p>';
	replaceDescTextStyle(str: any) {
		str = str.replaceAll('style="text-align: center;"', 'class="p-center"');
		str = str.replaceAll('style="text-align: right;"', 'class="p-right"');
		return str;
	}

	// "["
	// "<"
	// ">"
	// "]"

	replaceArrayToText(ary: any) {
		let str = '';
		let html = '';
		let htmlStart = false;
		ary.forEach((line: string) => {
			line = line.trim();
			if (line == '[') {
				htmlStart = true;
			} else if (line == ']') {
				htmlStart = false;
				str += '[' + html + ']';
				html = '';
 			} else if (line.charAt(0) == '[' && line.charAt(line.length - 1) == ']') {
				// do not add paragraph to special template
				str += line;
			} else if (htmlStart) {
					html += line;
			}	else
					str += '<p>' + line + '</p>';
		})
		return str;
	}

	decodeEntities(str: string) {
		let res = '';
		let idx1 = 0;
		for (;idx1 < str.length;) {
			let idx2 = str.indexOf('&', idx1);
			if (idx2 < 0) {
				res += str.substring(idx1);
				break;
			} else {
				res += str.substring(idx1, idx2);
			}
			let idx3 = str.indexOf(';', idx2);
			if (idx3 > idx2) {
				let entity = str.substring(idx2, idx3+1);
				let vnChar = VietnameseEntities[entity];
				res += (vnChar) ? vnChar : entity;
				idx1 = idx3 + 1;
			} else {
				res += str.substring(idx2);
				break;
			}
		}
		return res;
	}
}
