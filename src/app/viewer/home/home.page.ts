import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';
import { PageFlip } from 'page-flip';
import { DataService } from '../../services/data.service';
import { VnodePage } from '../vnode/vnode.page';
import { PersonPage } from '../person/person.page';

const FLIPPING_TIME = 500;
const PAGE_START_TIME = 500;
const PAGE_SWITCH_TIME = 1000;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  // styleUrls: ['home.page.scss'],
  styleUrls: ['home.page.scss','w3.scss'],
  // styleUrls: ['w3.scss'],
})
export class HomePage implements OnInit{

	FONTS_FOLDER = FONTS_FOLDER;

	pageRoot: string = 'muc_luc';
	pageIndex: number = 0;
	pageFlip: any;
	ancestor: any;

	pageData = {
		"muc_luc": { title: "", text: "", index: 0, titleText: "" },
		"pha_he": { title: "", text: "", index: 0, titleText: "" },
		"pha_do": { title: "", text: "", index: 0, titleText: ""  },
	};

	specialPageData = {
		"pha_nhap": [],
		"pha_ky": [],
		"ngoai_pha": [],
		"phu_khao": []
	}

	constructor(
		public modalCtrl: ModalController,
    private languageService: LanguageService,
		private dataService: DataService,
		private utilService: UtilService,
		private familyService: FamilyService,
  ) {
  }

  ngOnInit() {
		this.start();
    setTimeout(() => {
			this.startBook();
    }, PAGE_START_TIME)   
  }

	start() {
		this.dataService.readDocs().then((docs:any) => {
			if (DEBUGS.DOCS)
				console.log('HomePage - docs: ', docs)
			// this.pageData = docs;
			this.dataService.readFamilyAndInfo().then((dat:any) => {
				let family = dat.family;
				let info = dat.info;
				this.ancestor = info.id;
				// this.title1 = info.name;
				// this.title2 = info.location;
				// this.title3 = 'A.' + environment.version + ' (D.' + family.version + ')';
				this.updatePageData(docs);
				this.onMemorial();
			});
		});
	}
	
	onMemorial1() {
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_1'},
      {name: 'data', label: "hello"},
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_2'},
    ]);
		this.utilService.presentToast(msg, 3000);
  }

	onMemorial() {
    this.familyService.passAwayFamily().then((data:any) => {
      if (DEBUGS.DOCS)
        console.log('HomePage - onMemorial - data: ', data);
      let today = data.today;
      let header =
      '<b>' + this.languageService.getTranslation('HOME_MEMORY_TODAY') + '</b>: &emsp;' + today + '<br/><br/>';
      let msg = '';
      if (data.persons.length > 0) {
        msg = '<i>' + this.languageService.getTranslation('HOME_MEMORY_NAME') + 
        '</i>\t\t\t<i>' + this.languageService.getTranslation('HOME_MEMORY_DOD') + '</i>' + '<br/>';
        data.persons.forEach(person => {
          let str = '';
          // check number of words in name
          let words = person[0].split(' ');
          if (words.length > 3) {
            str = person[0] + '\t' + person[1]
          } else {
            str = person[0] + '\t\t' + person[1];
          }
          msg += str + '<br/>';
        })
      } else {
        msg = this.languageService.getTranslation('HOME_MEMORY_NO_DOD');
      }
      // msg += '<br/><br/>';
      msg = header + msg;
			console.log('HomePage - onMemorial - msg: ', msg);
      // this.utilService.alertMsg('HOME_ALERT_MEMORIAL_HEADER', msg, 'alert-small');
			this.utilService.presentToast(msg, 5000);
			// this.utilService.presentToastWait("MEMORIAL", msg, 'OK');
    });
  }

	updatePageData(docs: any) {

		// let root = document.documentElement;
		// let value = root.style.getPropertyValue('--app-icon-font-size-medium')
		// let fontSize = +value.substring(0, value.length - 2);

		let titles = { 
			'gia_pha': this.languageService.getTranslation('HOME_TITLE'),
			'pha_nhap': this.languageService.getTranslation('HOME_pha_nhap'),
			'pha_ky': this.languageService.getTranslation('HOME_pha_ky'),
			'pha_he': this.languageService.getTranslation('HOME_pha_he'),
			'pha_do': this.languageService.getTranslation('HOME_pha_do'),
			'ngoai_pha': this.languageService.getTranslation('HOME_ngoai_pha'),
			'phu_khao': this.languageService.getTranslation('HOME_phu_khao'),
			'ket_thuc': this.languageService.getTranslation('HOME_ket_thuc'),
		}
		let specialPageData:any = {};
		let pageData:any = {};
		let count = 0;
		for (var key of Object.keys(docs)) {

			if (key != 'gia_pha' && key != 'ket_thuc') {
				let data = docs[key];
				data.titleText = titles[key];

				// let text = data.text;
				// use html data
				let text = data.newText;
				if (key == 'pha_nhap' || key == 'pha_ky' || key == 'ngoai_pha' || key == 'phu_khao') {
					// break into various page
					// let p = this.getPages(text);
					// console.log('p: ', p);
					let pages = [];
					let texts = text.split('/PAGE/');
					// var(--app-icon-font-size-medium);
					// let texts = this.getPages(text, fontSize);

					// let title = data.title;
					let pcount = 1;
					texts.forEach((txt:string) => {
						// let title = (texts.length == 1) ? data.title : data.title + ' (' + pcount++ + ')';
						let titleText = (texts.length == 1) ? data.titleText : data.titleText + ' (' + pcount++ + ')';
						pages.push({ titleText: titleText, text: txt, index: count++});
						// title = '';
					})
					specialPageData[key] = pages;
				} else {
					// data.index = count++;
					data.index = count++;
					pageData[key] = data;
				}
				// });
			}
		};
		this.pageData = pageData;
		this.specialPageData = specialPageData;
	}

	// https://nodlik.github.io/StPageFlip/demo.html
  
	startBook() {
		const pageFlip = new PageFlip(
			document.getElementById("book"),
			{
				width: 350, // base page width
				height: 600, // base page height
				size: "stretch",
				// set threshold values:
				minWidth: 350,
				maxWidth: 600,
				minHeight: 600,
				maxHeight: 900,

				flippingTime: FLIPPING_TIME,
				usePortrait: true,
				autoSize: true,
				maxShadowOpacity: 0.5, // Half shadow intensity
				showCover: false,
				mobileScrollSupport: true // disable content scrolling on mobile devices
			}
		);
		this.pageFlip = pageFlip;

		// load pages
		pageFlip.loadFromHTML(document.querySelectorAll(".page"));

		// triggered by page turning
		pageFlip.on("flip", (e: any) => {
			this.pageIndex = pageFlip.getCurrentPageIndex();
			// console.log('flip - after flip: ', this.pageIndex);
		});

		// triggered when the book state changes
		pageFlip.on("changeState", (e: any) => {
		});

		// triggered when page orientation changes
		pageFlip.on("changeOrientation", (e: any) => {
		});
	}

	toPage(key: string) {
		// wait for src flip to complete
		if (key == 'root') {
			key = 'muc_luc';
		}
		let page = this.pageData[key];
		if (!page)
			page = this.specialPageData[key][0];

		console.log('toPage - current, page ', this.pageIndex, page, page.index);

		setTimeout(() => {
			this.pageFlip.turnToPage(page.index);
			this.pageRoot = 'muc_luc';
		}, PAGE_SWITCH_TIME)  
	}

	async onPhaDo() {
		const modal = await this.modalCtrl.create({
			// component: NodePage,
			component: VnodePage,
			componentProps: {
				'caller': 'home',
			},
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			let status = resp.data.status;
			this.toPage('pha_do');
			this.pageRoot = 'gia_pha';
		});
		return await modal.present();
	}

	async onPhaHe() {
		const modal = await this.modalCtrl.create({
			component: PersonPage,
			componentProps: {
			'caller': 'home',
			},
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			let status = resp.data.status;
			this.toPage('pha_he');
			this.pageRoot = 'gia_pha';
		});
		return await modal.present();
	}

	// https://stackoverflow.com/questions/62483639/split-long-string-into-small-chunks-without-breaking-html-tags-and-words
	getPages(text: any, fontSize: number) {
		let wordsArray = text.split(" ")
		let chunks = Array()
		const wordsInChunkCount = this.getWordsPerPage(1, fontSize);
		console.log('wordsInChunkCount, fontSize:', wordsInChunkCount, fontSize);
		let temp = wordsInChunkCount
		let str = ''
		wordsArray.forEach(item => {
			if (temp > 0) {
				str += ' ' + item
				temp--
			} else {
				chunks.push(str)
				str = ''
				temp = wordsInChunkCount
			}
		})
		console.log('chunks:', chunks);

		return chunks;
	}

// https://www.bookdesignmadesimple.com/calculate-book-page-count-using-word-count/
// To calculate the page count for a 5″ × 8″ book:
// 10 pt type – divide your word count by 400
// 11 pt type – divide your word count by 350
// 12 pt type – divide your word count by 300

// To calculate the page count for a 5.5″ × 8.5″ book:
// 10 pt type – divide your word count by 475
// 11 pt type – divide your word count by 425
// 12 pt type – divide your word count by 350

// To calculate the page count for a 6″ × 9″ book:
// 10 pt type – divide your word count by 600
// 11 pt type – divide your word count by 500
// 12 pt type – divide your word count by 425

	getWordsPerPage(pageSize, fontSize) {
		let size = { 
			'10': 300,
			'12': 280, 
			'14': 250, 
			'16': 220, 
			'18': 200, 
			'20': 180, 
			'22': 150, 
		}
		return size[''+fontSize];

		// fontSize = (fontSize > 16) ? 12 : 11;
		// if (pageSize == 1)
		// 	return (fontSize == 10) ? 400 : ((fontSize == 11) ? 100 : 300);
		// else if (pageSize == 2)
		// 	return (fontSize == 10) ? 475 : ((fontSize == 11) ? 425 : 350);
		// return (fontSize == 10) ? 600 : ((fontSize == 11) ? 500 : 425);
	}

	
}

