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
								'<img src="' + imageURL + '" width="' + data.width + 'px" height="' + data.height + 'px" alt="' + data.name + '"/>' +
								'</div>';
							if (data.caption != '') {
								let size = this.themeService.getSize();
								let fontSizePercent = (size == SMALL_SIZE) ? '80' : ((size == MEDIUM_SIZE) ? '100' : '120');
								let style = 'font-size: ' + fontSizePercent + '%;';
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
					'1': { w: '50', h: '30' },
					// '1': { w: '150', h: '100' },
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
	
	// must remove this for font-size option in page-text (doc.page.html) 
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
