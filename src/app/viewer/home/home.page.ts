import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS,  SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../../../environments/environment';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { PageFlip } from 'page-flip';
import { DataService } from '../../services/data.service';
import { EditorService } from '../../services/editor.service';
import { ThemeService } from '../../services/theme.service';
import { VnodePage } from '../vnode/vnode.page';
import { PersonPage } from '../person/person.page';

const FLIPPING_TIME = 500;
const PAGE_SWITCH_TIME = 500;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss','w3.scss'],
})
export class HomePage implements OnInit{

	FONTS_FOLDER = FONTS_FOLDER;

	// pageRoot: string = 'muc_luc';
	pageFlip: any;
	ancestor: any;
	nodes: any;
	// levels: any;
	modalPage: any = '';
	info: any = { name: '', location: ''};
	family: any;
	version: any;

	pageData = {
		"pha_he": { title: "", html: "", index: 0, titleText: "" },
		"pha_do": { title: "", html: "", index: 0, titleText: ""  },
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
		private editorService: EditorService,
		private utilService: UtilService,
		private themeService: ThemeService,
		private nodeService: NodeService,
		private familyService: FamilyService,
  ) {
  }

  ngOnInit() {
		this.start();
    setTimeout(() => {
			this.startBook();
    }, 1000)   
  }

	start() {
		this.dataService.readDocs().then((docs:any) => {
			if (DEBUGS.HOME)
				console.log('HomePage - docs: ', docs);
			this.dataService.readFamilyAndInfo().then((dat:any) => {
				let family = dat.family;
				let info: any = dat.info;
				this.info = info;
				family = this.familyService.buildFullFamily(family);
				this.family = family;
				this.nodes = this.nodeService.getFamilyNodes(family, true);
				// let dateid = this.utilService.getShortDateID(true);
				this.version = 'A.' + environment.version + ' (D.' + family.version + ', ' + family.date + ')';
				this.ancestor = info.id;
				// let data = this.getSystemData(family);
				// this.nodes = data.nodes;
				// this.levels = data.levels;
				this.updatePageData(docs);
				this.onMemorial();
			});
		});
	}
	
	// private getSystemData(family) {
	
	// 	let nodes = this.nodeService.getFamilyNodes(family, true);
	// 	let minLevel = 100;
	// 	let maxLevel = 0;
	// 	nodes.forEach(node => {
	// 		if (node.level > maxLevel)
	// 			maxLevel = node.level;
	// 		if (node.level < minLevel)
	// 			minLevel = node.level;
	// 	})
	// 	let yobMin = 3000;
	// 	let yobMax = 0;
	// 	nodes.forEach(node => {
	// 		if (node.level == minLevel && node.yob != '' && node.yob < yobMin)
	// 			yobMin = node.yob;
	// 		if (node.level == maxLevel && node.yob != '' && node.yob > yobMax)
	// 			yobMax = node.yob;
	// 	})
	// 	return {
	// 		nodes: nodes.length,
	// 		levels: maxLevel + ' ( ' + yobMin + '-' + yobMax + ' )'
	// 	}
	// }

	onMemorial() {
    this.familyService.passAwayFamily().then((data:any) => {
			if (data.persons.length == 0)
				return;
      if (DEBUGS.HOME)
        console.log('HomePage - onMemorial - data: ', data);
      let today = data.today;
      let msg = '<b>' + this.languageService.getTranslation('HOME_MEMORY_HEADER') + '</b><br/>' +
					'<i>' + this.languageService.getTranslation('HOME_MEMORY_TODAY') + ':  ' + today + '</i><br/></br>';
			data.persons.forEach(person => {
				msg += person[0] + ':&emsp;:&emsp;' + person[1] + '<br/>'
			});
			this.utilService.presentToast(msg, 3000);
			// this.utilService.presentToastWait(null, msg, 'OK', 8000);
    });
  }

	updatePageData(docs: any) {
		let titles = { 
			'pha_nhap': this.languageService.getTranslation('HOME_pha_nhap'),
			'pha_ky': this.languageService.getTranslation('HOME_pha_ky'),
			'pha_he': this.languageService.getTranslation('HOME_pha_he'),
			'pha_do': this.languageService.getTranslation('HOME_pha_do'),
			'ngoai_pha': this.languageService.getTranslation('HOME_ngoai_pha'),
			'phu_khao': this.languageService.getTranslation('HOME_phu_khao'),
		}

		let specialPageData: any = {};
		let pageData: any = {};
		
		let size = this.themeService.getSize();
		let fontSizePercent = (size == SMALL_SIZE) ? '80' : ((size == MEDIUM_SIZE) ? '100' : '120');
		if (DEBUGS.HOME)
			console.log('updatePageData - size, fontSizePercent: ', size, fontSizePercent);
		
		// start from pha_nhap, page index = 2; cover=0, mucluc=1
		let count = 2;
		for (var key of Object.keys(docs)) {
			let data = docs[key];
			data.titleText = titles[key];
				// html is calculated in app.component.ts
				let html = data.html;

				html = this.editorService.removeFontSize(html, fontSizePercent);
				// html = this.editorService.replaceSpecialTemplate(html, this.nodes, this.levels);
				html = this.replaceSpecialTemplate(html);

				// pages with special templates
				if (key == 'pha_he' || key == 'pha_do') {
					data.html = html;
					data.index = count++;
					pageData[key] = data;

				} else {
					// doc with multiple pages
					let pages = [];
					let texts = html.split('[PAGE]');
					let pcount = 1;
					texts.forEach((txt:string) => {
						let titleText = (texts.length == 1) ? data.titleText : data.titleText + ' (' + pcount++ + ')';
						pages.push({ titleText: titleText, html: txt, index: count++ });
					})
					specialPageData[key] = pages;
				}
			}
		this.pageData = pageData;
		this.specialPageData = specialPageData;
	}

	// https://nodlik.github.io/StPageFlip/demo.html
  
	startBook() {
		// update text from DOM
		for (var key of Object.keys(this.specialPageData)) {
			let pages = this.specialPageData[key];
			let idp = 0;
			pages.forEach(page => {
				let id = key + '_' + idp++;
				document.getElementById(id).innerHTML = page.html;
			})
		}
		for (var key of Object.keys(this.pageData)) {
			let data = this.pageData[key];
			document.getElementById(key).innerHTML = data.html;
		}
		// this.themeService.printRootProperty('startBook: ', '--app-text-font-size-medium');
		// KEEP THIS OPTION - DO NOT CHANGE - 28/01/24 - THIS IS GOOD FOR ANDROID AND IOS
		const pageFlip = new PageFlip(
			document.getElementById("book"), 
			{
				width: 550, // base page width
				height: 1000, // base page height
				size: "stretch",
				// set threshold values:
				minWidth: 315,
				maxWidth: 1000,
				minHeight: 700,
				maxHeight: 1350,
				flippingTime: FLIPPING_TIME,
				usePortrait: true,
				autoSize: true,
				maxShadowOpacity: 0.5,
				showCover: false,
				mobileScrollSupport: true // disable content scrolling on mobile devices
			}
		);
		
		this.pageFlip = pageFlip;
		// load pages
		pageFlip.loadFromHTML(document.querySelectorAll(".page"));
		
		// triggered by page turning
		pageFlip.on("flip", (e: any) => {
		});
		// triggered when the book state changes
		pageFlip.on("changeState", (e: any) => {
		});
		// triggered when page orientation changes
		pageFlip.on("changeOrientation", (e: any) => {
		});
	}

	toPage(key: string) {
		let index = 1;
		if (key != 'muc_luc') {
			let page = this.pageData[key];
			if (!page) {
				let pages = this.specialPageData[key]
				if (pages.length == 0)
					return;
				page = pages[0];
			}
			index = page.index;
		}
		// wait for src flip to complete
		setTimeout(() => {
			this.pageFlip.turnToPage(index);
		}, PAGE_SWITCH_TIME)  
	}

	async onPhaDo() {
		this.modalPage = 'pha_do';
		const modal = await this.modalCtrl.create({
			component: VnodePage,
			componentProps: {
				'caller': 'home',
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			this.toPage('pha_do');
		});
		return await modal.present();
	}

	async onPhaHe() {
		const modal = await this.modalCtrl.create({
			component: PersonPage,
			componentProps: {
			'caller': 'home',
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			// let status = resp.data.status;
			this.toPage('pha_he');
		});
		return await modal.present();
	}

	replaceSpecialTemplate(str: any) {
		// console.log('str: ', str);
		if (str.indexOf('[NODE-COUNT]') >= 0) {
			str = str.replaceAll('[NODE-COUNT]', '<b>' + this.nodes.length +'</b>');
		} 
		
		if (str.indexOf('[GEN-COUNT]') >= 0) {
			let maxLevel = 0;
			this.nodes.forEach(node => {
				if (node.level > maxLevel)
					maxLevel = node.level;
			})
			str = str.replaceAll('[GEN-COUNT]', '<b>' + maxLevel + '</b>');
		}
		
		if (str.indexOf('[GEN-TABLE]') >= 0) {
			// console.log('this.nodes: ', this.nodes);
			let levels: any = {};
			this.nodes.forEach((node: any) => {
				let data = node.idlevel.split('-');
				let level = data[0];
				let rank = +data[1];
				if (!levels[level])
					levels[level] = { min: 200, max: 0, yob: 2020 };
				if (rank < levels[level].min) {
					levels[level].min = rank;
					levels[level].minNode = node;
				}
				if (rank > levels[level].max) {
					levels[level].max = rank;
					levels[level].maxNode = node;
				}
				if (node.yob != '' && levels[level].yob > +node.yob) {
					levels[level].yob = node.yob;
				}
			})

			// console.log('levels: ', levels);

			let html = '';
			html += 
			'<ion-grid class="home-grid">' +
			'<ion-row>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('GENERATION') + '<br/>(Năm, Số hệ)' +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('HOME_FIRST_NODE') +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('HOME_LAST_NODE') +
				'</ion-col>' +
			'</ion-row>';

			let keys = Object.keys(levels);
			for (let i = 0; i < 5; i++) {
				let key = keys[i];
				html += 
				'<ion-row>' +
				'<ion-col size="4" class="column">' +
					'<b>' + key + '</b>' + '<br/>(' + levels[key].yob + ',' + levels[key].max + ')' +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					levels[key].minNode.name +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					levels[key].maxNode.name +
				'</ion-col>' +
				'</ion-row>';
			};
			
			html += '[PAGE]';
			html += 
			'<ion-grid class="home-grid">' +
			'<ion-row>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('GENERATION') + '<br/>(Năm, Số hệ)' +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('HOME_FIRST_NODE') +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					this.languageService.getTranslation('HOME_LAST_NODE') +
				'</ion-col>' +
			'</ion-row>';
			for (let i = 5; i < keys.length; i++) {
				let key = keys[i];
				html += 
				'<ion-row>' +
				'<ion-col size="4" class="column">' +
					'<b>' + key + '</b>' + '<br/>(' + levels[key].yob + ',' + levels[key].max + ')' +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					levels[key].minNode.name +
				'</ion-col>' +
				'<ion-col size="4" class="column">' +
					levels[key].maxNode.name +
				'</ion-col>' +
				'</ion-row>';
			};
			html += 
			'</ion-grid>';

			// for (var key of Object.keys(levels)) {
			// 	html += 
			// 	'<ion-row>' +
			// 	'<ion-col size="4" class="column">' +
			// 		'<b>' + key + '</b>' + '<br/>(' + levels[key].yob + ',' + levels[key].max + ')' +
			// 	'</ion-col>' +
			// 	'<ion-col size="4" class="column">' +
			// 		levels[key].minNode.name +
			// 	'</ion-col>' +
			// 	'<ion-col size="4" class="column">' +
			// 		levels[key].maxNode.name +
			// 	'</ion-col>' +
			// 	'</ion-row>';
			// };
		
			if (DEBUGS.HOME)
				console.log('replaceSpecialTemplate - html: ', html);
			str = str.replaceAll('[GEN-TABLE]', html);
		}
		return str;
	}
}

