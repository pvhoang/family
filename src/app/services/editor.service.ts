import { Injectable } from '@angular/core';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { ThemeService } from '../services/theme.service';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor(
    private utilService: UtilService,
    private fbService: FirebaseService,
    private themeService: ThemeService,
    private dataService: DataService,

  ) { }

	getImageItems(editor: any) {
		let imageItems = [];
		this.dataService.readItem('photos').then((photos:any) => {
			// console.log('photos: ', photos)
			photos.data.forEach(photo => {
				let dat = photo.split('|');
				let name = dat[0];
				let caption = (dat.length > 1) ? dat[1] : name;
				let sub = {
					type: 'menuitem',
					text: name,
					onAction: () => editor.insertContent(`"[` + name + `,1,1,` + caption + `]"`)
				};
				imageItems.push(sub);
			})
			return imageItems;
		});
		return imageItems;
	}

	// convert a text with special template info to html text

	getHtmlText(ancestor: any, text: any, key?: any) {
		return new Promise((resolve, reject) => {
			// console.log('EditorService - getHtmlText - text: ', text);
			// collect all string with valid image files: "[abc.png,1,1,some caption]"
			let images = [];
			const matches = text.match(/"(.*?)"/g);
			if (matches) {
				for (let i = 0; i < matches.length; ++i) {
					const match = matches[i];
					// match include ""
					let imageData = this.getImageData(match);
					if (imageData)
						images.push(imageData);
				}
			}
			// no image, just return
			if (images.length == 0) {
				resolve((!key) ? { newText: text} : { key: key, newText: text } );
			}
			// now read all images to url from Firebase storage
			let promises = [];
			images.forEach((imageData: any) => {
				promises.push(
					new Promise((res) => {
						// console.log('imageData: ', imageData);
						this.fbService.downloadImage(ancestor, imageData.name).then((imageURL:any) => {
							// https://stackoverflow.com/questions/30686191/how-to-make-image-caption-width-to-match-image-width
							// <img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
							let html = 
								'<div class="' + imageData.container + '">' +
								'<img src="' + imageURL + '" width="' + imageData.width + '" height="' + imageData.height + '" alt="' + imageData.name + '"/>' +
								'</div>';
							if (imageData.caption != '')
								html += '<div class="' + imageData.container + ' home-no-expand">' + imageData.caption + '</div>';
							// console.log('html = ', html);
							res({imageStr: imageData.src, html: html});
						})
						.catch((error) => {
							console.log('ERROR - ', error)
							res(null);
						});
					})
				)
			});
			// console.log('EditorService - getHtmlText - promises: ', promises.length);
			Promise.all(promises).then(resolves => {
				console.log('resolves = ', resolves);
				// create a new text, leave text unchanged
				let newText = text.slice(0);
				// console.log('EditorService - getHtmlText - newText before : ', newText);
				for (let i = 0; i < resolves.length; i++) {
					let data = resolves[i];
					let imageStr = data.imageStr;
					let html = data.html;
					newText = newText.replaceAll(imageStr,html);
				}
				// console.log('EditorService - getHtmlText - newText after: ', newText);
				resolve((!key) ? { newText: newText} : { key: key, newText: newText } );
			});
		});
	}

	// str: "[abc.png,1,1,some caption]"
	private getImageData(str: any) {
		// console.log('EditorService - getImageData - str: ', str);
		if (str.charAt(1) != '[' || str.charAt(str.length - 2)!= ']')
			return null;
		// this is an image file name with options: [image, size, justify, caption]
		let imageStr = str.substring(2, str.length - 2);
		let imageData = imageStr.split(',');
		// validate data
		if (imageData.length != 4)
			return null;
		let fileName = imageData[0].trim();
		// console.log('EditorService - getImageData - fileName: ', fileName);
		// console.log('EditorService - getImageData - enity fileName: ', this.utilService.decodeEntities(fileName));
		fileName = this.utilService.decodeEntities(fileName);
		// valid file, check image size
		let imageSize = imageData[1].trim();
		if (imageSize == '1' || imageSize == '2' || imageSize == '3') {
			let captionFont = (imageSize == '1') 
					? this.themeService.getRootProperty('--app-text-font-size-small')
					: ((imageSize == '2') ? 
					this.themeService.getRootProperty('--app-text-font-size-medium') : 
					this.themeService.getRootProperty('--app-text-font-size-large'));
			let lineJustify = imageData[2].trim();
			if (lineJustify == '1' || lineJustify == '2' || lineJustify == '3') {
				// valid, save
				// let imageFile = imageData[0];
				let width = 200;
				let height = 150;
				if (imageData[1] == '2') { width = 250; height = 200; }
				if (imageData[1] == '3') { width = 300; height = 250; }
				let justify = (imageData[2] == '1') ? 'left' : ((imageData[2] == '2') ? 'center' : 'right');
				this.themeService.setRootProperties([['--app-justify', justify], ['--app-caption-font-size', captionFont]])
				// let container = (justify == 'center' ? 'home-container-center' : (justify == 'left' ? 'home-container-left' : 'home-container-right'));
				let container = 'home-container';
				let captionStr = imageData[3];
				let data = { src: str, name: fileName, width: width, height: height, container: container, caption: captionStr }
				// console.log('EditorService - getImageData - data: ', data);
				return data;
			}
		}
		return null;
	}

	// decodeEntities(encodedString) {
  //   var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  //   var translate = {
  //       "nbsp":" ",
  //       "amp" : "&",
  //       "quot": "\"",
  //       "lt"  : "<",
  //       "gt"  : ">"
  //   };
  //   return encodedString.replace(translate_re, function(match, entity) {
  //       return translate[entity];
  //   }).replace(/&#(\d+);/gi, function(match, numStr) {
  //       var num = parseInt(numStr, 10);
  //       return String.fromCharCode(num);
  //   });
	// }

	// decodeEntities1(encodedString: string) {
	// 	// return he.decode(encodedString);
	// }
}
