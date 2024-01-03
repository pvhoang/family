import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router'; 
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { environment, FONTS_FOLDER, DEBUGS } from '../../../environments/environment';
import { PageFlip } from 'page-flip';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
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
		"muc_luc": { title: "", index: 0   },
		"pha_he": { title: "", text: "", index: 0  },
		"pha_do": { title: "", text: "", index: 0   },
	};

	specialPageData = {
		"pha_nhap": [],
		"pha_ky": [],
		"ngoai_pha": [],
		"phu_khao": []
	}

	constructor(
		// private route: ActivatedRoute,
		// private router: Router,
		public modalCtrl: ModalController,
		private sanitizer: DomSanitizer,
		private dataService: DataService,
    private fbService: FirebaseService,
  ) {
  }

  ngOnInit() {
		this.start();
    setTimeout(() => {
			this.startBook();
    }, PAGE_START_TIME)   
  }

	start() {
		this.dataService.readDocs(true).then((docs:any) => {
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
			});
		});
	}
	
	updatePageData(docs) {

		let specialPageData:any = {};
		let pageData:any = {};
		let count = 0;
		for (var key of Object.keys(docs)) {
			if (key != 'gia_pha' && key != 'ket_thuc') {
				let data = docs[key];
				let text = data.text;
				if (key == 'pha_nhap' || key == 'pha_ky' || key == 'ngoai_pha' || key == 'phu_khao') {
					// break into various page
					let pages = [];
					let texts = text.split('/PAGE/');
					// let title = data.title;
					let pcount = 1;
					texts.forEach((txt:string) => {
						let title = (texts.length == 1) ? data.title : data.title + ' (' + pcount++ + ')';
						pages.push({ title: title, text: txt, index: count++});
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

	// parseText2(text: string) {
	// 	if (text.indexOf('[QuanPhan.jpeg]') > 0) {
	// 		text = 'Hello <img src="https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2Fphan_viet_hoang_1953_1686213633741?alt=media&token=faf5baa6-84fc-4843-b949-a6d44dc3f52c">';
	// 	}
	// 	return text;
	// }

// 	'there goes "something here", and "here" and I have "nothing else to say"'.match(/".*?"/g)
// 	const text = 'Example words: "ABC" and "DEF".';
// 	const matches = text.match(/"(.*?)"/g);
// 	if (matches) {
// 		for (let i = 0; i < matches.length; ++i) {
// 			const match = matches[i];
// 					const substring = match.substring(1, match.length - 1);  // quotation mark removing
// 			console.log(substring);  
// 		}
// 	}

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
}

