import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS,  SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../../../environments/environment';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { PageFlip } from '../../../assets/js/page-flip/PageFlip';
import { DataService } from '../../services/data.service';
import { HtmlService } from '../../services/html.service';
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
	family: any;
	version: any;
	info: any = { name: '', location: '', admin_name: '', admin_email: '' };
	memorialMsg: any;
	imageEnlarge: any = {};
	tableAncestors: any = [];
	rdata: any;
	pageData = {};
	pageKeys = [
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
		private htmlService: HtmlService,
		// private utilService: UtilService,
		private themeService: ThemeService,
		private nodeService: NodeService,
		private familyService: FamilyService,
  ) {
  }

	ngOnInit() {
  }

  ionViewWillEnter() {
		this.start();
    setTimeout(() => {
			// must wait for DOM ids to kick in
			this.startBook();
    }, PAGE_SWITCH_TIME)   
  }
	
	ionViewWillLeave() {
    if (DEBUGS.HOME)
      console.log('DocPage - ionViewWillLeave');
	}

	start() {
		// initialize
		this.pageKeys.forEach(key => {
			this.pageData[key] = [];
		})

		this.dataService.readAncestorData().then((rdata:any) => {
			this.rdata = rdata;
			let family = rdata.family;
			family = this.familyService.buildFullFamily(family);
			this.family = family;
			this.nodes = this.nodeService.getFamilyNodes(family, true);
			this.version = 'A.' + environment.version + ' (D.' + family.version + ', ' + family.date + ')';
			this.ancestor = rdata.info.id;
			this.info = rdata.info;
			this.memorialMsg = this.familyService.passAwayFamily(family);
			this.updatePageData();
			this.tableAncestors = this.getTableAncestors();
		});
	}
	
	updatePageData() {
		let docs = this.rdata.docs;
		let titles = { 
			'pha_nhap': this.languageService.getTranslation('HOME_pha_nhap'),
			'pha_ky': this.languageService.getTranslation('HOME_pha_ky'),
			'pha_he': this.languageService.getTranslation('HOME_pha_he'),
			'pha_do': this.languageService.getTranslation('HOME_pha_do'),
			'ngoai_pha': this.languageService.getTranslation('HOME_ngoai_pha'),
			'phu_khao': this.languageService.getTranslation('HOME_phu_khao'),
		}

		let pageData: any = {};

		// start from pha_nhap, page index = 2; cover=0, mucluc=1
		let count = 2;
		for (var key of Object.keys(docs)) {
			let doc = docs[key];
			doc.titleText = titles[key];

			// if (key == 'pha_nhap') {
			// 	// - **Đời 1: Phan Văn Nghi (1754)**
			// 	// - **Đời 1: Phan Văn Nghi (1754)**  /popup/some title/md|phan ngoc tuong.md/hello/md|A line/
			// 	doc.desc = [];
			// 	doc.desc.push('md| - **Đời 1: Phan Văn Nghi (1754)**  /popup/some title/md|phan ngoc tuong.md/hello/md|A line/')
			// }
			// calculate html for each desc line
			// doc.desc = this.getPhanDoc(key, doc.desc);

			let dataSource = { nodes: this.nodes, memorialMsg: this.memorialMsg, images: this.rdata.images, mds: this.rdata.mds }
			let pageHtmls = this.htmlService.convertArrayToHtmls(dataSource, doc.desc);

			if (DEBUGS.HOME)
				console.log('HomePage-updatePageData: key, htmls: ', key, pageHtmls);

			let pages = [];
			if (pageHtmls.length == 1) {
				pages.push({ titleText: doc.titleText, htmls: pageHtmls[0], index: count++ });
			} else {
				let pcount = 1;
				pageHtmls.forEach(htmls => {
					pages.push({ titleText: doc.titleText + ' (' + pcount++ + ')', htmls: htmls, index: count++ });
				})
			}
			pageData[key] = pages;
		}
		this.pageData = pageData;
	}

	// https://nodlik.github.io/StPageFlip/demo.html
	startBook() {
		for (var key of Object.keys(this.pageData)) {
			let pages = this.pageData[key];
			// activate all DOMs

			let idp = 0;
			pages.forEach((page:any) => {
				this.setPageDom(key, idp++, page);
			})
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

	toPage(key: any) {
		let index = -1;
		if (typeof key === 'string') {
			if (key == 'muc_luc') {
				index = 1;
			} else {
				let pages = this.pageData[key]
				// console.log('key, pages: ', key, pages);
				if (pages.length == 0)
					return;
				index = pages[0].index;
			}
		} else {
			// this is page
			index = key.index;
		}

		if (DEBUGS.HOME)
				console.log('toPage() - key, index: ', key, index);

		// wait for src flip to complete
		setTimeout(() => {
			this.pageFlip.turnToPage(index);
		}, PAGE_SWITCH_TIME)  
	}

	async onPhaDo(page: any, nodeid: any) {
		console.log('nodeid: ', nodeid);

		this.modalPage = 'pha_do';
		// tree.id = "1-1-1-1-1-1-1-1-1-1-1-1-1-1";
		const modal = await this.modalCtrl.create({
			component: VnodePage,
			componentProps: {
				'caller': 'home',
				'nodeid': nodeid,
			},
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			this.toPage(page);
		});
		return await modal.present();
	}

	async onPhaHe(page: any, person: any) {
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
			this.toPage(page);
		});
		return await modal.present();
	}

	async onPhaHeSearch(page: any) {
		const modal = await this.modalCtrl.create({
			component: SearchPage,
			componentProps: {
        'caller': 'home',
        'nodes': this.nodes,
        'family': this.family,
      },
			cssClass: 'modal-dialog',
			backdropDismiss:false
		});
		modal.onDidDismiss().then((resp) => {
			// this.toPage('pha_he');
			this.toPage(page);
		});
		return await modal.present();
	}

	async onDocDetail(page: any, html: any, title: any) {
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

	onDocumentDownload(page: any, fileName: any, url: any) {
		this.onDownload(fileName, url).then(data => {
			this.toPage(page);
		});
	}

	async onDownload(fileName: any, url: any) {
		fetch(url).then((t) => {
			return t.blob().then((b)=>{
					var a = document.createElement("a");
					a.href = URL.createObjectURL(b);
					a.setAttribute("download", fileName);
					a.click();
			});
		});
	}

	getTableAncestors() {
		let ancestors: any = [];
		let node = this.nodes[0];
		ancestors.push({
			id: node.id, name: node.name, gen: node.level, title: '1'
		});
		node = this.nodes[1];
		ancestors.push({
			id: node.id, name: node.name, gen: node.level, title: '2'
		});
		return ancestors;
	}

	setPageDom(key: any, idPage: any, page) {
		let id = key + '_' + idPage;
		let htmls = page.htmls;
		if (DEBUGS.HOME) {
			console.log('setPageDom() - key, idPage: ', key, idPage);
			console.log('setPageDom() - htmls: ', htmls);
		}
		let idHtml = 0;
		htmls.forEach((data: any) => {
			let it = id + '_' + idHtml++;
			if (data.html) {
				document.getElementById(it).innerHTML = data.html;

			} else if (data.popupHtml) {
				let obj = data.popupHtml;
				let html = '';
				for (let i = 0 ; i < obj.htmls.length; i++)
					html += obj.htmls[i].html + ' ';
				data.docHtml = html;
				data.docTitle = obj.title;
				data.lineTitle = obj.lineTitle;

			} else if (data.downloadDocumentHtml) {
				let params = data.downloadDocumentHtml;
				data.title = params[0];
				data.fileName = params[1];
				data.url = params[2];

			} else if (data.videoHtml) {
				let params = data.videoHtml;
				data.title = params[0];
				data.videoId = params[1];
				data.url = params[2];
				data.note = params[3];
				console.log('data.videoHtml: data:', data);

			} else if (data.viewTreeNodeHtml) {
				let line = data.viewTreeNodeHtml;
				let items = line.split('|');
				data.title = items[1];
				// get nodeid from name
				let name = items[2].trim();
				let nodeSelect = this.familyService.searchPeopleNodes(this.family, name);
				data.nodeid = nodeSelect.id;
			}
		})
	}
}
	
