import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

	tableData = [];

  constructor(private utilService: UtilService
  ) { }

	convertArrayToHtml(images: any, lines: any, textarea?: boolean) {

		let html = '';
		for (let il = 0; il < lines.length; il++) {
			let line = lines[il].trim();
			if (line.length == 0) {
				html += '<br>';
				continue;
			} else if (line.indexOf('//') == 0) {
				continue;
			}
			let paraHtml = '';
			if (line.indexOf('im|') == 0) 
				paraHtml = this.getImageHtml(images, line, textarea);
			else if (line.indexOf('vi|') == 0) 
				paraHtml = this.getVideoHtml(images, line);
			else if (line.indexOf('do|') == 0) 
				paraHtml = this.getDocumentHtml(images, line);
			else if (line.indexOf('1|') == 0 || line.indexOf('2|') == 0 || line.indexOf('3|') == 0)
				paraHtml = this.getTextHtml(line.charAt(0), line);
			else if (line.indexOf('w|') == 0 || line.indexOf('h|') == 0 || line.indexOf('s|') == 0 || line.indexOf('d|') == 0) {
				this.setTableHtml(line);
				continue;
			} else {
				html += this.getTableHtml();
				paraHtml = line;
			}
			
			// finalize html
			let lineOK = (paraHtml.indexOf('<p') == 0 && paraHtml.indexOf('</p>') > 0) ||
				(paraHtml.indexOf('<div') == 0 && paraHtml.indexOf('</div>') > 0);
			if (!lineOK)
				paraHtml += '<br>';

			html += paraHtml;
		}
		html += this.getTableHtml();
		return html;
	}

	private getTextHtml(type: any, str: any) {
		let text = str.substring(type.length + 1);
		return '<div class="viewer-home-container-text-' + type + '">' + text + '</div>';
	}

	private setTableHtml(line) {
		this.tableData.push(line);
	}

	private getTableHtml() {
		let html = '';
		let children = []
		this.tableData.forEach(line => {
			let type = line.charAt(0);
			let str = line.substring(2);
			let items = str.split('|');
			let name = items[0];
			let note = (items.length > 1) ? items[1] : '';
			children.push({name: name, note: note, type: type})
		})

		html += '<br>';
		html += '<div><table>';
		html += '<tr>' + '<th></th>' + '<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>' + '<th>THÔNG TIN</th>' + '</tr>';
		let prevType = '';

		children.forEach((item:any) => {
			if (item.type != prevType) {
				let relation = (item.type == 'w') ? 'VỢ' : ((item.type == 'h') ? 'CHỒNG' : 'CON');
				html += '<tr>' + '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>' + '<td/>' + '</tr>';
				html += '<tr>' + '<td><b>' + relation + '</b></td>' + '<td></td>' + '</tr>';
				prevType = item.type;
			}
			let name = item.name;
			let idx = name.indexOf('(*)');
			let style = '';
			if (idx > 0) {
				style = 'class="viewer-home-table"'
				name = name.substring(0, idx)
			}
			// html += '<tr><td><b><span '+ style + '>' + name + '</span></b>&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;' + item.note + '</td></tr>';
			html += '<tr>' +
					'<td><b><span '+ style + '>' + name + '</span></b></td>' +
					'<td>&nbsp;&nbsp;&nbsp;</td>' +
					'<td>' + item.note + '</td>' + 
					'</tr>';
		})
		html += '</table></div>';
		this.tableData = [];
		return html;
	}

	getImageHtml(images: any, str: any, textarea?: boolean) {
		// im|ac|1|abc.png|This is caption</im>
		str = str.substring(3);
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
