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
	
	// convert a text with special template info to html text
	convertImageTemplate(ancestor: any, text: any, key: any) {
		return new Promise((resolve, reject) => {
			// https://stackoverflow.com/questions/71176093/how-to-extract-content-in-between-an-opening-and-a-closing-bracket
			var reg = /(?<=\[)[^\]]*(?=\])/g;
			let images = [];
			const matches = text.match(reg);
			if (matches) {
				for (let i = 0; i < matches.length; ++i) {
					const match = matches[i];
					// match does not include []
					let data = this.getImageData(match);
					if (data)
						images.push(data);
				}
			}
			// no image in text, just return
			if (images.length == 0) {
				resolve([]);
			}

			// now read all images to url from Firebase storage
			let promises = [];
			images.forEach((data: any) => {
				promises.push(
					new Promise((res) => {
						this.fbService.downloadImage(ancestor, data.name).then((imageURL:any) => {
							// https://stackoverflow.com/questions/30686191/how-to-make-image-caption-width-to-match-image-width
							let html = 
								'<div class="' + data.container + '">' +
								'<img src="' + imageURL + '" class="home-container-image" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + data.name + '"/>' +
								'</div>';
							if (data.caption != '') {
								// let size = this.themeService.getSize();
								let fontSizePercent = this.themeService.getRootProperty("--app-page-text-font-size");
								// let fontSizePercent = (size == SMALL_SIZE) ? '80' : ((size == MEDIUM_SIZE) ? '100' : '120');
								// let style = 'font-size: ' + fontSizePercent + '%;';
								let style = 'font-size: ' + fontSizePercent + ';';
								html += '<div class="' + data.container + ' home-no-expand" style="' + style + '">' + data.caption + '</div>';
							}
							res({ key: key, imageStr: data.src, html: html });
						})
						.catch((error) => {
							console.log('ERROR - ', error)
							res(null);
						});
					})
				)
			});
			Promise.all(promises).then(resolves => {
				resolve(resolves);
			});
		});
	}
	
	// IN: "[image|size|justify|caption]"  
	// "size: 1(small)/2(medium)/3(large) | justify: 1(left)/2(center)/3(right)",
	// IN: "[bai-vi-doi-1.jpg|2|2|Bài vị Thủy Tổ Họ Phan, Nhà thờ Họ Phan, Đồng Phú]"

	private getImageData(str: any) {
		// this is an image file name with options: [image|size|justify|caption]
		let imageData = str.split('|');
		// validate data
		if (imageData.length != 4)
			return null;
		let fileName = imageData[0].trim();
		fileName = this.decodeEntities(fileName);
		// valid file, check image size
		let imageSize = imageData[1].trim();
		if (imageSize == '1' || imageSize == '2' || imageSize == '3') {
			let lineJustify = imageData[2].trim();
			if (lineJustify == '1' || lineJustify == '2' || lineJustify == '3') {
				let sizes = { 
					'1': { w: '150', h: '100' },
					'2': { w: '200', h: '150' },
					'3': { w: '250', h: '200' },
				};
				let justify = {
					'1': 'left', '2': 'center', '3': 'right'
				}
				let containerClass = 'home-container-'+justify[lineJustify];
				let captionStr = imageData[3];
				let data = { src: str, name: fileName, width: sizes[imageSize].w, height: sizes[imageSize].h, container: containerClass, caption: captionStr }
				return data;
			}
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
	// IN: "[NODES]","[LEVELS]"
	// OUT: "<p><b>20</b></p>"
	replaceSpecialTemplate(str: any, nodes, levels) {
		str = str.replaceAll('[NODES]', '<b>' + nodes +'</b>');
		str = str.replaceAll('[LEVELS]', '<b>' + levels + '</b>');
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

	// IN: "1|1|1|Phan Quang Triệt", "1(center)/2(right)|1(strong)|1(em)|paragraph",
	// OUT: "<p style="text-align: center;"><strong>Phan Quang Triệt</strong></p>"
	replaceArrayToText(ary: any) {
		let str = '';
		ary.forEach((line: string) => {
			// decode line to include font and style
			let items = line.split('|');
			if (items.length == 4 && items[0].length == 1 && items[1].length == 1 && items[2].length == 1) {
				let text_align = items[0];	// 0: left, 1: center, 2: right
				let font_weight = items[1]; // 0: normal, 1: strong
				let font_style = items[2];	// 0, normal, 1: italic
				if (text_align == '1')
					str += '<p style="text-align: center;">';
				else if (text_align == '2')
					str += '<p style="text-align: right;">';
				else
					str += '<p>';
				if (font_weight == '1')
					str += '<strong>';
				if (font_style == '1')
					str += '<em>';
				str += items[3];
				if (font_style == '1')
					str += '</em>';
				if (font_weight == '1')
					str += '</strong>';
				str += '</p>';
			} else
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
