import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

	relationData = [];

  constructor(private utilService: UtilService
  ) { }

	convertArrayToHtml(images: any, lines: any, textarea?: boolean) {

		let htmls = [];
		let textLines = [];
		let relationLines = [];

		for (let il = 0; il < lines.length; il++) {
			let line = lines[il].trim();
			if (line.length == 0) {
				htmls.push('<br>');
				continue;
			} else if (line.indexOf('//') == 0) {
				continue;
			}
			if (line.indexOf('im|') == 0)
				// image
				htmls.push(this.getImageHtml(images, line, textarea));
			else if (line.indexOf('vi|') == 0)
				// video
				htmls.push(this.getVideoHtml(images, line));
			else if (line.indexOf('do|') == 0)
				// document
				htmls.push(this.getDocumentHtml(images, line));
			else if (line.indexOf('1|') == 0 || line.indexOf('2|') == 0 || line.indexOf('3|') == 0) {
				// line
				htmls.push(this.getTextHtml(line.charAt(0), line));
			} else if (line.indexOf('ts|') == 0) {
				// text group starts
				textLines = [line];
			} else if (line.indexOf('te|') == 0) {
				// text group ends
				htmls.push(this.getTextGroupHtml(textLines));
				textLines = []
			}	else if (line.indexOf('rs|') == 0) {
				// relation group starts
				relationLines = [line]
			}	else if (line.indexOf('re|') == 0) {
				// relation group ends
				// convert to html
				htmls.push(this.getRelationHtml(relationLines));
				relationLines = [];
			}	else if (line.indexOf('w|') == 0 || line.indexOf('h|') == 0 || line.indexOf('s|') == 0 || line.indexOf('d|') == 0) {
				relationLines.push(line);
			} else {
				if (textLines.length > 0)
					textLines.push(line);
				else
					htmls.push(line);
			}
		}
		return htmls.join(' ');
	}

	private getTextHtml(type: any, str: any) {
		let text = str.substring(type.length + 1);
		// return '<div class="viewer-home-container-text-' + type + '">' + text + '</div>';
		return '<div class="viewer-home-container-text label">' + text + '</div>';
	}

	private getTextGroupHtml(textLines: any) {
		let html = '';
		let title = textLines[0].substring('ts|'.length);
		html += 
			'<div class="person-desc" *ngIf="selectedNode">' + 
				'<ion-card-header class="person-section">' +
					'<span class="span"><b>' + title + '</b></span>' +
				'</ion-card-header>' + 
			'</div>';
		for (let i = 1; i < textLines.length; i++) {
			html += textLines[i] + '<br>';
		}
		return html;
	}

	private getRelationHtml(relationLines: any) {
		let html = '';
		let title = relationLines[0].substring('rs|'.length);
		html += 
			'<div class="person-desc" *ngIf="selectedNode">' +
				'<ion-card-header class="person-section">' +
					'<span class="span"><b>' + title + '</b></span>' +
				'</ion-card-header>' +
			'</div>';
		let children = [];
		relationLines.forEach(line => {
			let type = line.charAt(0);
			let str = line.substring(2);
			let items = str.split('|');
			let name = items[0];
			children.push({name: name, type: type})
		})
		// console.log('children: ', children);

		if (children.length > 0) {

			html += '<ion-grid class="app-grid-small"><ion-row>';
			html += '<ion-col size="6" class="column center"><span class="label">Tên</span></ion-col>';
			html += '<ion-col size="6" class="column center"><span class="label">Quan hệ</span></ion-col>';
			html += '</ion-row>';

			children.forEach((item:any) => {
			// console.log('item: ', item);
				let name = item.name;
				let color = '';
				let rowStart = '<ion-row>';
				if (name.indexOf('*') > 0) {
					rowStart = '<ion-row style="color: yellow;">'
					color = 'style="color: red;"';
					name = name.substring(0,name.indexOf('*'))
				}
				let relation = (item.type == 'w') ? 'Vợ' : ( (item.type == 'h') ? 'Chồng' : ( (item.type == 's') ? 'Con trai' : 'Con gái' ));
				let row = '<ion-row>';
				row += '<ion-col size="6" class="column center" ' + color + '><b>' + name + '</b></ion-col>';
				row += '<ion-col size="6" class="column center"><b>' + relation + '</b></ion-col>';
				row += '</ion-row>';
				html += row;
			});
			html += '</ion-grid>';
		}
		return html;
	}
	
	getImageHtml(images: any, str: any, textarea?: boolean) {
		// im|ac|1|abc.png|This is caption</im>
		str = str.substring(3);
		let items = str.split('|');

		// console.log('items: ', items);

		let align = items[0];
		if (align !== 'al' && align !== 'ac' && align !== 'ar') align = 'ac'

		let size = items[1];
		if (size != '1' && size != '2' && size != '3') size = '2'
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
			
		let width = images[name].width;
		let height = images[name].height;
		if (!url) {
			url = "../assets/icon/male-avatar.jpg";
			width = 1000;
			height = 1000;
		}
		let data = { width: sizeValues[size].width, height: sizeValues[size].height };
		if (width > height) {
			// landscape
			data.height = data.width * height / width;
		} else {
			// portrait
			let w = data.width;
			data.height = w;
			data.width = w * width / height;
		}

		// console.log('data: ', data);

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
			'</div>';
		if (caption != '')
			html += '<div class="' + containers[align] + ' viewer-home-no-expand">' + caption + '</div>';
		return html;
	}

	getDocumentHtml(images: any, str: any) {
		// do|ac|abc.word|This is caption
		str = str.substring(3);
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
		// vi|ac|abc.mp4|This is caption
		str = str.substring(3);

		let items = str.split('|');
		let align = items[0];
		if (align !== 'al' && align !== 'ac' && align !== 'ar') align = 'ac'

		let name = items[1];
		let caption = items[2];

		const containers = { 'al': 'viewer-home-container-left', 'ac': 'viewer-home-container-center', 'ar': 'viewer-home-container-right' };
		const wrappers = { 'al': 'viewer-home-player-wrapper-left', 'ac': 'viewer-home-player-wrapper-center', 'ar': 'viewer-home-player-wrapper-right' };
		
		if (!images[name])
				return '';
		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('video') == -1)
			return '';

		let	html =
			'<div class="' + wrappers[align] + '">' +
			'<vg-player>' +
				'<video #media [vgMedia]="media" id="singleVideo" preload="auto" controls>' +
					'<source src="' + url + '" type="video/mp4" >' +
				'</video>' +
			'</vg-player>' +
			'</div>';
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

}
