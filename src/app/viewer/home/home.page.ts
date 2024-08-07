import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS,  SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../../../environments/environment';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { PageFlip } from '../../../assets/js/page-flip/PageFlip';
import { DataService } from '../../services/data.service';
import { EditorService } from '../../services/editor.service';
import { ThemeService } from '../../services/theme.service';
import { VnodePage } from '../vnode/vnode.page';
import { PersonPage } from '../person/person.page';
import { SearchPage } from '../search/search.page';
import { DocPage } from '../doc/doc.page';

const FLIPPING_TIME = 1000;
const PAGE_SWITCH_TIME = 1000;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

	FONTS_FOLDER = FONTS_FOLDER;

	pageFlip: any;
	pageIndex: any;
	ancestor: any;
	nodes: any;
	modalPage: any = '';
	info: any = { name: '', location: ''};
	family: any;
	version: any;
	memorialMsg: any;
	tableTrees: any = [];
	tableAncestors: any = [];

	pageData = {
		"ngay_gio": { title: "", html: "", index: 0, titleText: "" },
	};

	specialPageData = {
		"pha_nhap": [],
		"pha_he": [],
		"pha_do": [],
		"ngoai_pha": [],
		"phu_khao": []
	}

	specialKeys = [
		'pha_nhap',
		'pha_ky',
		'pha_he',
		'pha_do',
		'ngoai_pha',
		'phu_khao'
	]

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
		this.dataService.readAncestorData().then((dat:any) => {
			if (DEBUGS.HOME)
				console.log('HomePage - dat: ', dat);
			let docs = dat.docs;
			let family = dat.family;
			let info: any = dat.info;
			this.info = info;
			family = this.familyService.buildFullFamily(family);
			this.family = family;
			this.nodes = this.nodeService.getFamilyNodes(family, true);
			this.version = 'A.' + environment.version + ' (D.' + family.version + ', ' + family.date + ')';
			this.ancestor = info.id;
			this.memorialMsg = this.familyService.passAwayFamily(family);
			this.updatePageData(docs);
			this.tableAncestors = this.getTableAncestors();
			this.tableTrees = this.getTableTrees();
		});
	}
	
	updatePageData(docs: any) {
		// add special key: 'ngay_gio' to docs
		docs.ngay_gio = { html: '[MEMORIAL]' };

		let titles = { 
			'pha_nhap': this.languageService.getTranslation('HOME_pha_nhap'),
			'pha_ky': this.languageService.getTranslation('HOME_pha_ky'),
			'pha_he': this.languageService.getTranslation('HOME_pha_he'),
			'pha_do': this.languageService.getTranslation('HOME_pha_do'),
			'ngoai_pha': this.languageService.getTranslation('HOME_ngoai_pha'),
			'phu_khao': this.languageService.getTranslation('HOME_phu_khao'),
			'ngay_gio': this.languageService.getTranslation('HOME_ngay_gio'),
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
			html = this.replaceSpecialTemplate(html);

			// get special popup
			let htmls = this.buildPopupHtml(html);
			// console.log('htmls: ', key, htmls);

			// pages with special templates
			// if (key == 'pha_he' || key == 'pha_do' || key == 'ngay_gio') {
			if (key == 'ngay_gio') {
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
					pages.push({ titleText: titleText, html: txt, htmls: htmls, index: count++ });
				})
				specialPageData[key] = pages;
			}
		}
		this.pageData = pageData;
		this.specialPageData = specialPageData;
	}

	// https://nodlik.github.io/StPageFlip/demo.html
  
	startBook() {

		for (var key of Object.keys(this.specialPageData)) {
			let pages = this.specialPageData[key];
			let idp = 0;
			pages.forEach(page => {
				this.setPageDom(key, idp++, page);
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
				// size: "stretch",
				// size: SizeType.STRETCH,
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
				startZIndex: -1,
				mobileScrollSupport: true,
				showPageCorners: false,
				// clickEventForward: false,
				// disableFlipByClick: true // false
			}
		);
		
		this.pageFlip = pageFlip;
		this.pageIndex = 0;

		// load pages
		pageFlip.loadFromHTML(document.querySelectorAll(".page"));
		
		// triggered by page turning
		pageFlip.on("init", (e: any) => {
			if (DEBUGS.HOME)
				console.log('on "init" - index, e: ', this.pageFlip.getCurrentPageIndex(), e);
		});

		// triggered by page turning
		pageFlip.on("flip", (e: any) => {
			if (DEBUGS.HOME) {
				console.log('on "flip" - index, e: ', this.pageFlip.getCurrentPageIndex(), e);
			}
		});
		// triggered when the book state changes
		pageFlip.on("changeState", (e: any) => {
			if (DEBUGS.HOME)
				console.log('on "changeState" - index, e: ', this.pageFlip.getCurrentPageIndex(), e);

			if (e.data == 'flipping') {
				let i = this.pageFlip.getCurrentPageIndex();
			}

		});
		// triggered when page orientation changes
		pageFlip.on("changeOrientation", (e: any) => {
			if (DEBUGS.HOME)
				console.log('on "changeOrientation" - index, e: ', this.pageFlip.getCurrentPageIndex(), e);
		});
	}

	setPageDom(key, idPage, page) {
		let id = key + '_' + idPage;
		let htmls = page.htmls;
		// if (DEBUGS.HOME)
		// 	console.log('setPageDom() - htmls: ', htmls);

		let idHtml = 0;
		htmls.forEach(data => {
			let it = id + '_' + idHtml++;
			// console.log('it: ' + it);
			if (data.html) {
				// console.log('html: ' + data.html);
				document.getElementById(it).innerHTML = data.html;
			} else if (data.popupHtml) {
				// console.log('data.popupHtml: ' + data.popupHtml);
				let idxContent = data.popupHtml.indexOf('[CONTENT]');
				let titleHtml = data.popupHtml.substring(0, idxContent);
				let html = data.popupHtml.substring(idxContent + '[CONTENT]'.length);
				data.docHtml = html;
				// if (titleHtml.indexOf('<br>') == 0)
					// titleHtml = titleHtml.substring(4, titleHtml.length - 4);
				let idx1 = titleHtml.indexOf('</div>') + 5;
				let idx2 = titleHtml.indexOf('<br>', idx1);
				titleHtml = titleHtml.substring(idx1, idx2);
				// <br>
				// <div><table><tr><th></th><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>THÔNG TIN</th></tr></table></div>
				// Phả ký dòng họ<br><br><div><table><tr><th></th><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>THÔNG TIN</th></tr></table></
				
				// add branch if titleHtml contains name
				titleHtml = this.getPopupTitleByName(titleHtml);
				data.docTitle = titleHtml;
			}
		})
	}

	toPage(key: any) {

		let index = 1;
		if (typeof key === 'string') {
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
		} else {
			// this is page
			index = key.index;
		}

		// if (DEBUGS.HOME)
				// console.log('toPage() - key, index: ', key, index);

		// wait for src flip to complete
		setTimeout(() => {
			this.pageFlip.turnToPage(index);
		}, PAGE_SWITCH_TIME)  
	}

	async onPhaDo(tree: any) {
		this.modalPage = 'pha_do';
		const modal = await this.modalCtrl.create({
			component: VnodePage,
			componentProps: {
				'caller': 'home',
				'nodeid': tree.id,
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			// this.tableTrees = this.getTableTrees();
			this.toPage('pha_do');
		});
		return await modal.present();
	}

	async onPhaHe(person: any) {
		const modal = await this.modalCtrl.create({
			component: PersonPage,
			componentProps: {
			'caller': 'home',
			'nodeid': person ? person.id : '',
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

	async onPhaHeSearch() {
		const modal = await this.modalCtrl.create({
			component: SearchPage,
			componentProps: {
        'caller': 'home',
        'nodes': this.nodes,
        'family': this.family,
        'info': this.info,
      },
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			this.toPage('pha_he');
		});
		return await modal.present();
	}

	async onDocDetail(page: any, html: any, title: any) {

		console.log('html: ', html)
		const modal = await this.modalCtrl.create({
			component: DocPage,
			componentProps: {
				'caller': 'DocPage',
				'html': html,
				'title': title,
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			this.toPage(page);
		});
		return await modal.present();
	}

	getTableTrees() {
		let trees: any = [];
		this.nodes.forEach((node: any) => {
			let tree = { id: node.id, name: node.name, gen: node.level, branch: '', sub_branch: '', sub_sub_branch: '' };
			if (node.root) {
			} else if (node.branchStart) {
				tree.branch = node.branch;
			} else if (node.subBranchStart) {
				tree.branch = node.branch;
				tree.sub_branch = node.sub_branch;
			} else if (node.subSubBranchStart) {
				tree.branch = node.branch;
				tree.sub_branch = node.sub_branch;
				tree.sub_sub_branch = node.sub_sub_branch;
			} else
				tree = null;
			if (tree)
				trees.push(tree);
		});
		return trees;
	}

	getTableAncestors() {
		let ancestors: any = [];
		let node = this.nodes[0];
		ancestors.push({
			id: node.id, name: node.name, gen: node.level, title: 'To khao 1'
		});
		node = this.nodes[1];
		ancestors.push({
			id: node.id, name: node.name, gen: node.level, title: 'To khao 2'
		});
		return ancestors;
	}

	buildPopupHtml(srcHtml: any) {

		// str = 'abcd[START-POPUP]12345 abcd[END-POPUP]end end[START-POPUP]start[END-POPUP]1234[START]';
		let htmls = [];
		let popupHtmls = [];
		let popupCount = 0;

		// "pha_do": {
		for (let i1 = 0; i1 < srcHtml.length;) {

			let i2 = srcHtml.indexOf('[START-POPUP]', i1);

			if (i2 >= i1) {
				if (i2 > i1)
					htmls.push( {html: srcHtml.substring(i1, i2)} );
				let i3 = srcHtml.indexOf('[END-POPUP]', i2);
				if (i3 > i2) {
					// found the popup html
					let popupHtml = srcHtml.substring(i2 + '[START-POPUP]'.length, i3);
					htmls.push( {popupHtml: popupHtml });
					i1 = i3 + '[END-POPUP]'.length;
				} else {
					// final
					let html = srcHtml.substring(i2);
					htmls.push({ html: html });
					break;
				}
			} else {
				let html = srcHtml.substring(i1);
				htmls.push({ html: html });
				break;
			}
		}
		return htmls;
	}

	replaceSpecialTemplate(str: any) {
		// console.log('replaceSpecialTemplate - str: ', str);
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

		if (str.indexOf('[TODAY]') >= 0) {
			let today = this.utilService.getShortDateID('/');
			let html = '<p style="text-align: center;"><strong>' + today + '</strong></p>';
			str = str.replaceAll('[TODAY]', html);
		}

		if (str.indexOf('[MEMORIAL]') >= 0) {
			let data: any = this.memorialMsg;
			if (DEBUGS.HOME)
					console.log('HomePage - replaceSpecialTemplate - data: ', data);

			let today = this.utilService.getShortDateID('/');
			let lunarYear = this.utilService.getLunarYear(+("20"+today.substring(6)));
			let html = '<p style="text-align: center;">' +
				this.languageService.getTranslation('HOME_MEMORY_TODAY') + ':  ' +
				'<strong>' + today + ' (' + data.today + ' ' + lunarYear + ')</strong></p>';
			if (data.persons.length == 0) {
				html += '<p style="text-align: center;"><strong>' + this.languageService.getTranslation('HOME_MEMORY_NO_DOD') + '</strong></p>';
			} else {
				html += 
				'<ion-grid class="viewer-home-grid">' +
				'<ion-row>' +
					'<ion-col size="6" class="column center">' + this.languageService.getTranslation('HOME_MEMORY_NAME') + '</ion-col>' +
					'<ion-col size="4" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DOD') + '</ion-col>' +
					'<ion-col size="2" class="column center">' +	this.languageService.getTranslation('HOME_MEMORY_DAYS') +	'</ion-col>' +
				'</ion-row>';
				for (let i = 0; i < data.persons.length; i++) {
					let person = data.persons[i];
					let name = person[0];
					let dod = person[1];
					let days = person[2];
					if (days == '0') {
						name = '<b>' + name + '</b>'
						dod = '<b>' + dod + '</b>'
						days = '';
					}
					html += 
					'<ion-row>' +
						'<ion-col size="6" class="column center"><b>' + name + '</b></ion-col>' +
						'<ion-col size="4" class="column center"><b>' +	dod + '</b></ion-col>' +
						'<ion-col size="2" class="column center"><b>' +	days +	'</b></ion-col>' +
					'</ion-row>';
				};
				html += '</ion-grid>';
			}
			str = str.replaceAll('[MEMORIAL]', html);
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
			'<ion-grid class="viewer-home-grid">' +
			'<ion-row>' +
				'<ion-col size="4" class="column center">' +
					this.languageService.getTranslation('GENERATION') + '<br/>(Năm, Số hệ)' +
				'</ion-col>' +
				'<ion-col size="4" class="column center">' +
					this.languageService.getTranslation('HOME_FIRST_NODE') +
				'</ion-col>' +
				'<ion-col size="4" class="column center">' +
					this.languageService.getTranslation('HOME_LAST_NODE') +
				'</ion-col>' +
			'</ion-row>';

			let keys = Object.keys(levels);
			// for (let i = 0; i < 5; i++) {
			for (let i = 0; i < keys.length; i++) {
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
			if (DEBUGS.HOME)
				console.log('replaceSpecialTemplate - html: ', html);
			str = str.replaceAll('[GEN-TABLE]', html);
		}
		return str;
	}

	getPopupTitleByName(name) {
		for (let i = 0; i < this.nodes.length; i++) {
			let node = this.nodes[i];
			if (name.trim() === node.name)
				return node.name + this.nodeService.getFullDetail(node);
		}
		return name;
	}
}
