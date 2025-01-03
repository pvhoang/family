import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
// import { DEBUGS, IMAGE_SIZE } from '../../environments/environment'; 
import { DEBUGS } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class HtmlService {

	relationData = [];

  constructor(
		private utilService: UtilService,
    private languageService: LanguageService,
  ) { }

	convertArrayToHtmls(dataSource: any, lines: any) {
		let pageHtmls = [];
		let htmls = [];

		let popupOn = false;
		let ip1 = -1;
		let ip2 = -1;
		let familyOn = false;
		let if1 = -1;
		let if2 = -1;

		for (let il = 0; il < lines.length; il++) {
			let line = lines[il].trim();
			if (line.length == 0) {
				htmls.push({ html: '<br>' });
				continue;
			} else if (line.indexOf('//') == 0) {
				continue;
			}
			if (popupOn) {
				if (line.indexOf('popup|end') == 0) {
					ip2 = il;
					let desc = [];
					// popup|start|title
					let firstLine = lines[ip1];
					let items = firstLine.split('|');
					let docTitle = items[2];
					for (let i = ip1 + 1; i < ip2; i++)
						desc.push(lines[i]);
					htmls.push( { popupHtml: { title: docTitle, desc: desc } } )
					popupOn = false
				}
				continue;
			}
			
			if (familyOn) {
				if (line.indexOf('family|end') == 0) {
					if2 = il;
					let items = [];
					for (let i = if1; i < if2; i++)
						items.push(lines[i]);
					htmls.push(this.getFamilyHtml(items));
					familyOn = false
				}
				continue;
			}
			
			if (line.indexOf('popup|start') == 0) {
				ip1 = il;
				popupOn = true;
				continue;
			}
			if (line.indexOf('family|start') == 0) {
				if1 = il;
				familyOn = true;
				continue;
			}

			else if (line.indexOf('apa') == 0)
				htmls.push(this.getTextHtml(line));
			
			else if (line.indexOf('image') == 0 && dataSource.images) 
				htmls.push(this.getImageHtml(dataSource.images, line, dataSource.textarea));
			
			else if (line.indexOf('document') == 0 && dataSource.images) {
				htmls.push(this.getDocumentHtml(dataSource.images, line));
				
			} else if (line.indexOf('video') == 0 && dataSource.images) {
				htmls.push(this.getVideoHtml(dataSource.images, line));
			
			} else if (line.indexOf('NEW-PAGE') == 0) {
				// start new page
				pageHtmls.push(htmls);
				htmls = [];

			} else if (line.indexOf('NODE-COUNT') == 0 && dataSource.nodes) {
				let items = line.split('|');
				let text = items[1];
				let html = 
					'<div class="home-text-apa2-normal"><b>' + text + ':&emsp;</b>' + dataSource.nodes.length + '</div>';
				htmls.push( { html: html } )

			} else if (line.indexOf('ITEM-COUNT') == 0 && dataSource.nodes) {
				let items = line.split('|');
				let text = items[1];
				let count = this.getTotalItemCountHtml(dataSource.nodes);
				let html = 
					'<div class="home-text-apa2-normal"><b>' + text + ':&emsp;</b>' + count + '</div>';
				htmls.push( { html: html } )

			} else if (line.indexOf('TODAY') == 0) {
				let todayLunar = this.utilService.getLunarDate();
				let today = this.utilService.getFullDateID();
				let items = line.split('|');
				let text = items[1];
				let html = 
				'<div class="home-text-apa2-normal"><b>' + text + ':&emsp;</b>' + today + '<br>(' + todayLunar + ')</div>';
				htmls.push( { html: html } )
			
			} else if (line.indexOf('MEMORIAL') == 0 && dataSource.memorialMsg) {
				let items = line.split('|');
				let text = items[1];
				htmls.push(this.getMemorialHtml(dataSource.memorialMsg, line));

			} else if (line.indexOf('VIEW-NODES') == 0) {
				let items = line.split('|');
				let text = items[1];
				htmls.push( { viewNodeHtml: text });

			} else if (line.indexOf('SEARCH-NODES') == 0) {
				let items = line.split('|');
				let text = items[1];
				htmls.push( { searchNodeHtml: text });

			} else if (line.indexOf('VIEW-TREE-ROOT') == 0) {
				let items = line.split('|');
				let text = items[1];
				htmls.push( { viewTreeHtml: text });

			} else if (line.indexOf('VIEW-TREE-NODES') == 0) {
				let items = line.split('|');
				htmls.push( { viewTreeNodeHtml: line });
				
			} else
				htmls.push(this.getNormalTextHtml(line));
		}
		pageHtmls.push(htmls);

		// loop thru all htmls and convert popupHtml
		for (let ip = 0; ip < pageHtmls.length; ip++) {
			let htmls = pageHtmls[ip];
			for (let il = 0; il < htmls.length; il++) {
				let item = htmls[il];
				if (item.popupHtml) {
					let desc = item.popupHtml.desc;
					// do a recursive call
					let hPages = this.convertArrayToHtmls(dataSource, desc);
					// take htmls of 1st page only
					item.popupHtml.htmls = hPages[0];
				}
			}
		}
		return pageHtmls;
	}

	convertHtmls2Html(pageHtmls: any) {
		let html = '';
		for (let ip = 0; ip < pageHtmls.length; ip++) {
			let htmls = pageHtmls[ip];
			for (let il = 0; il < htmls.length; il++) {
				let item = htmls[il];
				if (item.html)
					html += item.html;
			}
		}
		return html;
	}

	private getNormalTextHtml(line: any) {
		let html = '<div class="home-text-normal">' + line + '</div>';
		return { html: html }
	}

	private getTextHtml(line: any) {
		// "apa1|Nội dung",
		let items = line.split('|');
		let clas = items[0];
		let text = items[1];
		let html = '<div class="home-text-' + clas + '">' + text + '</div>';
		return { html: html }
	}

	private getImageHtml(images: any, line: any, textarea: any) {
		// image|Bài vị|Bài vị Thủy Tổ.jpg|Xây dựng năm 2001
		let items = line.split('|');
		let title = items[1];
		let name = items[2];
		let note = items[3];
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
			width = 128;
			height = 128;
		}
		const IMAGE = { width: 150, height: 100 };
		let data = { width: IMAGE.width, height: IMAGE.height };

		if (width > height) {
			// landscape
			data.height = data.width * height / width;
		} else {
			// portrait
			let w = data.height;
			data.width = w;
			data.height = w * height / width;
		}
		if (DEBUGS.HTML) {
			console.log('getImageHtml - name, width, height, data: ', name, width, height, data);
		}
		let imgTag = '';
		if (textarea) {
			// textarea container in person.page.ts, use hover
			imgTag = '<img src="' + url + '" class="home-image-hover" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '"/>';
		} else {
			// regular container, use click
			let stripName = this.utilService.stripVN(name);
			stripName = stripName.replaceAll(' ', '-');
			stripName = stripName.replaceAll('.', '-');
			let imageId = "image-id-" + this.utilService.getCurrentTime() + '-' + stripName;
			imgTag = '<img id="' + imageId + '" src="' + url + '" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + name + '" onclick=enlargeImage(\'' + imageId + '\')>';
		}
		let html = 
			'<div class="home-text-apa2">' + title + '</div>' +
			imgTag +
			// '<div class="home-text-apa4">' + note + '</div>';
			'<div class="home-text-normal-no-indent">' + note + '</div>';
		return { html: html }
	}

	private getDocumentHtml(images: any, line: any) {
		// document|title|abc.word|This is caption
		let items = line.split('|');
		let title = items[1];
		let name = items[2];
		let note = items[3];
		if (!images[name])
				return '';
		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('image') >= 0 || type.indexOf('video') >= 0)
			return '';
		return { downloadDocumentHtml: [title, name, url] }
	}

	private getVideoHtml(images: any, line: any) {
		// video|title|abc.mp4|This is caption
		let items = line.split('|');
		let title = items[1];
		let name = items[2];
		let note = items[3];

		if (!images[name])
				return '';
		let url = images[name].url;
		let type = images[name].type;
		if (type.indexOf('video') == -1)
			return '';

		let stripName = this.utilService.stripVN(name);
		stripName = stripName.replaceAll(' ', '-');
		stripName = stripName.replaceAll('.', '-');
		let videoId = "video-id-" + this.utilService.getCurrentTime() + '-' + stripName;

		let html = 
			'<div class="home-text-apa2">' + title + '</div>' +
			'<div class="home-video-wrapper">' +
			'<vg-player>' +
				'<video #media [vgMedia]="media" id="' + videoId + '" preload="auto" controls>' +
					'<source src="' + url + '" type="video/mp4">' +
				'</video>' +
			'</vg-player>' +
			'</div>' +
			'<div class="home-text-apa4">' + note + '</div>';
		return { html: html }
	}

	private getMemorialHtml(memorialMsg, line: any) {

		console.log('memorialMsg: ', memorialMsg);

		let items = line.split('|');
		let title = items[1];
		let data: any = memorialMsg;

		let html = '<div class="home-text-apa2">' + title + '</div>';
		if (data.persons.length == 0) {
			html += '<p style="text-align: center;"><strong>' + this.languageService.getTranslation('HOME_MEMORY_NO_DOD') + '</strong></p>';
		} else {
			html += 
			'<ion-grid class="viewer-home-grid">' +
			'<ion-row>' +
				'<ion-col size="8" class="column center">' + this.languageService.getTranslation('HOME_MEMORY_NAME') + '</ion-col>' +
				'<ion-col size="3" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DOD') + '</ion-col>' +
				'<ion-col size="1" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DAYS') +	'</ion-col>' +
			'</ion-row>';
			for (let i = 0; i < data.persons.length; i++) {
				let person = data.persons[i];
				let name = person[0];
				let dod = person[1];
				let days = person[2];
				html += 
				'<ion-row>' +
					'<ion-col size="8" class="column center">' + name + '</ion-col>' +
					'<ion-col size="3" class="column center">' +	dod + '</ion-col>' +
					'<ion-col size="1" class="column center">' +	days +	'</ion-col>' +
				'</ion-row>';
			};
			html += '</ion-grid>';
		}
		return { html: html }
	}

	private getFamilyHtml(lines: any) {

		let items = lines[0].split('|');
		let title = items[2];

		let html = '<div class="home-text-apa2">' + title + '</div>';
		let children = [];
		for (let i = 1; i < lines.length; i++) {
			let line = lines[i];
			let items = line.split('|');
			let type = items[0].trim();
			let name = items[1].trim();
			children.push({name: name, type: type})
		}
		if (children.length > 0) {
			html += '<ion-grid class="viewer-home-grid"><ion-row>';
			html += '<ion-col size="7" class="column center"><b>' + this.languageService.getTranslation('huy') + '</b></ion-col>';
			html += '<ion-col size="5" class="column center"><b>' + this.languageService.getTranslation('quan_he') + '</b></ion-col>';
			html += '</ion-row>';
			children.forEach((item:any) => {
				let name = item.name;
				let relation = this.utilService.getRelationStr(item.type);
				let row = '<ion-row>';
				row += '<ion-col size="7" class="column center">' + name + '</ion-col>';
				row += '<ion-col size="5" class="column center">' + relation + '</ion-col>';
				row += '</ion-row>';
				html += row;
			});
			html += '</ion-grid>';
		}
		return { html: html }
	}
	
	private getTotalItemCountHtml(nodes: any) {
		let count = nodes.length;
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			let desc = node.desc;
			let descCount = 0;
			for (let j = 0; j < desc.length; j++) {
				let items = desc[j].split('|');
				if (items.length > 1) {
					let rel = items[0].trim();
					// let status = RELATION_STATUS[rel];
					let relation = this.utilService.getRelationStr(rel);
					if (relation !== '') {
						let name = items[1].trim();
						if (name.indexOf(' (') == -1) {
							// add to count
							count++;
							descCount++;
						}
					}
				}
			}
			// console.log('name, descCount: ', node.name, descCount)
		}
		return count;
	}
}
