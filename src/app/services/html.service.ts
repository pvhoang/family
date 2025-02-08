import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { LanguageService } from '../services/language.service';
import { MarkdownService } from 'ngx-markdown';
import { DEBUGS, environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class HtmlService {

	relationData = [];

  constructor(
		private mdService: MarkdownService,
		private utilService: UtilService,
    private languageService: LanguageService,
  ) { 
		if (DEBUGS.HTML) {
			let text = "- **Đời 1: Phan Văn Nghi (1754)**"
			let html = this.mdService.parse(text);
			console.log('text: ', text)
			console.log('html: ', html)
		}
	}

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
					// popup|start|text|title|heading
					let firstLine = lines[ip1];
					for (let i = ip1 + 1; i < ip2; i++)
						desc.push(lines[i]);
					htmls.push( { popupHtml: { firstLine: firstLine, desc: desc } } )
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
			
			} else if (line.indexOf('md') == 0) {
				let subHtmls = this.getMarkdownHtml(dataSource, line);
				for (let i = 0; i < subHtmls.length; i++)
					htmls.push(subHtmls[i]);

			} else if (line.indexOf('html') == 0) {
				htmls.push(this.getHtmlHtml(line));

			} else if (line.indexOf('image') == 0 && dataSource.images) 
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
					'<div class="home-text-h6"><b>' + text + ':&emsp;</b>' + dataSource.nodes.length + '</div>';
				htmls.push( { html: html } )

			} else if (line.indexOf('ITEM-COUNT') == 0 && dataSource.nodes) {
				let items = line.split('|');
				let text = items[1];
				let count = this.getTotalItemCountHtml(dataSource.nodes);
				let html = 
					'<div class="home-text-h6"><b>' + text + ':&emsp;</b>' + count + '</div>';
				htmls.push( { html: html } )

			} else if (line.indexOf('TODAY') == 0) {
				let todayLunar = this.utilService.getLunarDate();
				let today = this.utilService.getFullDateID();
				let items = line.split('|');
				let text = items[1];
				let html = '<div class="home-text-h6"><b>' + text + ':&emsp;</b>' + today + '<br>(' + todayLunar + ')</div>';
				htmls.push( { html: html } )
			
			} else if (line.indexOf('MEMORIAL') == 0 && dataSource.memorialMsg) {
				htmls.push(this.getMemorialHtml(dataSource.memorialMsg, line));

			} else if (line.indexOf('VIEW-NODE') == 0) {
				htmls.push( { viewNodeHtml: line });

			} else if (line.indexOf('SEARCH-NODE') == 0) {
				htmls.push( { searchNodeHtml: line });

			} else if (line.indexOf('VIEW-TREE') == 0) {
				htmls.push( { viewTreeHtml: line });
				
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
		let html = '<div class="home-text-p">' + line + '</div>';
		return { html: html }
	}

	private getMarkdownHtml(dataSource: any, line: any) {

// md|Hello
// md|phan ngoc tuong.md
// md|- **Đời 1: Phan Văn Nghi (1754)**  /popup/some title/md|phan ngoc tuong.md/hello/md|A line/

		let items = line.split('|');
		let text = items[1];
		let html: any;
		// parse MD line
		if (text.indexOf('/popup') > 0) {
			let idx = text.indexOf('/popup');
			let lineText = text.substring(0, idx);
			let lineHtml = this.mdService.parse(lineText);
			// process popup
			let items = line.split('/');
			let docTitle = items[2];
			let desc = [];
			for (let i = 3; i < items.length - 1; i++)
				desc.push(items[i]);
			return [{ popupHtml: { title: docTitle,  lineTitle: lineHtml, desc: desc } }];

		} else if (text.indexOf('.md') > 0) {
			let mdFile = text.trim();
			let content = dataSource.mds[mdFile]
			let desc = content.split('\r\n');
			// convert to md source
			for (let i = 0; i < desc.length; i++) {
				let line = desc[i];
				if (line.charAt(0) == '\"' && line.charAt(line.length-1) == '\"') {
					// this is normal line
					// console.log('line: ', line);
					desc[i] = line.substring(1,line.length-1);
				} else {
					// add md| before send to convert
					desc[i] = 'md|' + line;
				}
			}
			let hPages = this.convertArrayToHtmls(dataSource, desc);
			// take htmls of 1st page only
			let htmls = hPages[0];
			return htmls;

		} else {
			html = this.mdService.parse(text);
			return [{ html: html }]
		}
	}

	private getHtmlHtml(line: any) {
		// "md|<h3>Hello</h3>",
		let items = line.split('|');
		let text = items[1];
		let html = text;
		// console.log('html2: ', html);
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
			console.log('platform: ', environment.platform);
			console.log('getImageHtml - name, width, height, data: ', name, width, height, data.width, data.height);
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

		// convert to markdown
		title = '###### **' + title.trim() + '**';
		note = '<h6 align="center">' + note.trim() + '</h6>';
		title = this.mdService.parse(title);
		note = this.mdService.parse(note);
		let html = 
			'<div>' + title + '</div>' +
			'<div class="home-image-center">' + imgTag + '</div>' +
			'<div>' + note + '</div>';
		// console.log('html: ', html);
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

		// convert to markdown
		title = '###### **' + title.trim() + '**';
		note = '<h6 align="center">' + note.trim() + '</h6>';
		title = this.mdService.parse(title);
		note = this.mdService.parse(note);

		let stripName = this.utilService.stripVN(name);
		stripName = stripName.replaceAll(' ', '-');
		stripName = stripName.replaceAll('.', '-');
		let html = 
		'<div>' + title + '</div>' +
		'<video preload="auto" style="display: block;margin: auto;" width="200" height="150" controls>' +
			'<source src="' + url + '" type="video/mp4">' + 
		'</video>' +
		'<div>' + note + '</div>';

		return { html: html }
	}

	private getMemorialHtml(memorialMsg: any, line: any) {

		let items = line.split('|');
		let title = items[1];
		// add month
		const d = new Date();
		let month = ''+(d.getMonth()+1);		
		if (month.length < 2) 
			month = '0' + month;
		let year = d.getFullYear();
		let date = month + '/' + year
		let data: any = memorialMsg;

		let html = '<div class="home-text-h6"><b>' + title + ':&emsp;</b>' + date + '</div>';
		if (data.persons.length == 0) {
			html += '<p style="text-align: center;"><strong>' + this.languageService.getTranslation('HOME_MEMORY_NO_DOD') + '</strong></p>';
		} else {
			html += '<br>';
			html += 
			'<ion-grid class="home-grid">' +
			'<ion-row>' +
				'<ion-col size="8" class="column center">' + this.languageService.getTranslation('HOME_MEMORY_NAME') + '</ion-col>' +
				'<ion-col size="3" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DOD') + '</ion-col>' +
				'<ion-col size="1" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DAYS') +	'</ion-col>' +
			'</ion-row>';
			for (let i = 0; i < data.persons.length; i++) {
				let person = data.persons[i];
				let name = person[0];
				let dod = person[1].dod;
				let days = person[2];
				if (days < 0)
					days = '';
				html += 
				'<ion-row>' +
					'<ion-col size="8" class="column center">' + name + '</ion-col>' +
					'<ion-col size="3" class="column center"><i>' +	dod + '</i></ion-col>' +
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

		let html = '<div class="home-text-h6"><b>' + title + '</b></div>';
		let children = [];
		for (let i = 1; i < lines.length; i++) {
			let line = lines[i];
			let items = line.split('|');
			let type = items[0].trim();
			let name = items[1].trim();
			children.push({name: name, type: type})
		}
		if (children.length > 0) {
			html += '<ion-grid class="home-grid"><ion-row>';
			html += '<ion-col size="7" class="column center"><b>' + this.languageService.getTranslation('huy') + '</b></ion-col>';
			html += '<ion-col size="5" class="column center"><b>' + this.languageService.getTranslation('quan_he') + '</b></ion-col>';
			html += '</ion-row>';
			children.forEach((item:any) => {
				let name:any = item.name;
				if (name.charAt(name.length-1) == ')') {
					// this is name with node, trim Generation
					name = name.substring(0, name.indexOf('(')).trim();
					name = '<b>' + name + '</b>';
				} else {
					// name without node, add <i>
					name = '<i>' + name + '</i>';
				}
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
