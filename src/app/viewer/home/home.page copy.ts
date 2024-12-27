import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS,  SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../../../environments/environment';
import { LanguageService } from '../../services/language.service';
import { UtilService } from '../../services/util.service';
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
	info: any = { name: '', location: ''};
	family: any;
	version: any;
	memorialMsg: any;
	// tableTrees: any = [];
	tableAncestors: any = [];
	rdata: any;
	pageData: any;
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
    }, PAGE_SWITCH_TIME)   
  }

	start() {
		this.dataService.readAncestorData().then((rdata:any) => {
			this.rdata = rdata;
			console.log('rdata1: ', rdata);

			let family = rdata.family;
			family = this.familyService.buildFullFamily(family);
			this.family = family;
			this.nodes = this.nodeService.getFamilyNodes(family, true);
			this.version = 'A.' + environment.version + ' (D.' + family.version + ', ' + family.date + ')';
			this.ancestor = rdata.info.id;
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
		
		let size = this.themeService.getSize();
		let fontSizePercent = (size == SMALL_SIZE) ? '80' : ((size == MEDIUM_SIZE) ? '100' : '120');
		if (DEBUGS.HOME)
			console.log('HomePage-updatePageData: size, fontSizePercent: ', size, fontSizePercent);
		
		// this.rdata.images = {
		// 	"Bài vị Thủy Tổ.jpg": {
		// 		"url":"https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2Fxuan%20son.jpg?alt=media&token=ce4eff99-9c69-45d7-beac-e579ab8162b4",
		// 		"type":"image/jpeg","size":"87,942","width":640,"height":480
		// 	},
		// 	"xuan son.jpg": {
		// 		"url":"https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2Fxuan%20son.jpg?alt=media&token=ce4eff99-9c69-45d7-beac-e579ab8162b4",
		// 		"type":"image/jpeg","size":"87,942","width":640,"height":480
		// 	},
		// 	"Quảng Bình.doc": {
		// 		"url":"https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2FQu%E1%BA%A3ng%20B%C3%ACnh.doc?alt=media&token=5c05259f-fdbd-43e3-954a-c2a8cfed366d",
		// 		"type":"application/msword","size":"35,511"
		// 	},
		// 	"buddha.mp4": {
		// 		"url":"https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2Fbuddha.mp4?alt=media&token=7a3a18e7-c050-48f5-9de8-c4d7f743acb4",
		// 		"type":"video/mp4","size":"23,636,358"
		// 	},
		// }

		// start from pha_nhap, page index = 2; cover=0, mucluc=1
		let count = 2;
		for (var key of Object.keys(docs)) {
			let doc = docs[key];
			console.log('HomePage-updatePageData: key, doc: ', key, doc);
			doc.titleText = titles[key];

			// calculate html for each desc line
			// doc.desc = this.getPhanDoc(key, doc.desc);

			let dataSource = { nodes: this.nodes, memorialMsg: this.memorialMsg, images: this.rdata.images }
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

	getPhanDoc(key: any, desc: any) {

		desc = [];
		if (key == 'pha_nhap') {

desc.push(""),
desc.push("Chim có tổ người có tông, cây có cội, nước có nguồn."),
desc.push(""),
desc.push("Những câu ca dao nói lên đạo lý của con người Việt Nam chúng ta đã lưu truyền bao đời nay dẫu cho xã hội có nhiều biến động, thay đổi. Vì vậy việc truy tìm nguồn gốc tổ tiên, chăm lo mồ mả ông bà, là những điều gần như nằm trong tiềm thức của mỗi một con người Việt Nam."),
desc.push(""),
desc.push("Dòng họ Phan ta đã lập nghiệp tại Làng Phú Ninh nay là Phường Đồng Phú này hơn 300 năm. Các bậc tổ tiên đã cần cù lao động xây dựng nề nếp cho con cháu đời sau với tiền đồ sáng lạn. Đất nước ta từ bao đời đã trải qua chinh chiến từ thời kỳ này qua thời kỳ khác, tổ tiên ta đã lao động chiến đấu xã thân tạo dựng cơ đồ. Tất cả tấm gương đó là những gương sáng để con cháu đời sau tiếp nối học tập noi theo, tiếp tục truyển thống của gia đình và dòng họ để phấn đấu xây dựng một cuộc sống ấm no hạnh phúc cho chính bản thân mình và góp phần xây dựng cộng đồng xã hội."),
desc.push(""),
desc.push("Nhằm có thể hệ thống hóa được phần nào lịch sử vẻ vang và có thể hệ thống hóa được phần nào phả hệ, phả đồ của dòng họ, Chi Phái và muốn hoàn thành tâm nguyện bản thân cũng như muốn dâng lên tổ tiên vong linh hiển khảo Phan Văn Ba, Tôi Phan Thanh Dũng con cháu đời thứ 16 dòng họ Phan tính từ Ông Thủy Tổ Ông Phan Văn Tác, Đời thứ 6 tính từ tổ Chi Phan Lợi Hành (Phan Văn Tự) sau khi bàn bạc,  lên kế hoạch,  tìm hiểu đã viết nên cuốn gia phả này để cùng các Ông, Bác, Chú và cũng như con cháu sau này có thêm tài liệu để tham khảo có thể hoàn thành lại tốt hơn."),
desc.push(""),
desc.push("Việc dựng lại gia phả này quả lá quá khó khăn do kinh nghiệm nghiên cứu còn non kém nhưng tôi cũng quyết tâm hoàn thành, chắc chắn rằng sẻ không ít thiếu sót, khiếm khuyết. Công việc xây dựng gia phả lại là công việc cần được tiến hành thường xuyên và liên tục, tôi  mong rằng toàn thể bà con dòng họ Phan chúng ta hãy cùng nhau tiếp tục góp sức xây dựng, bổ sung để gia phả của chúng ta ngày càng hoàn chỉnh."),
desc.push(""),
desc.push("Qua đây tôi xin chân thành cám ơn Ông Phan Văn Hân, Chú Phan Văn Năm…, cùng các vị cao niên trong làng đã tận tình hướng dẫn giúp đỡ cung cấp thông tin tài liệu, kể những câu chuyện mà chỉ có thể gặp khi thực hiện viết cuốn gia phả này. Đồng thời tài liệu này được sinh động là nhờ hoàn toàn các tài liệu quý mà tôi được có từ Cha tôi là Phan Văn Ba đã cất công nghiên cứu sưu tầm để tôi có thể nối tiếp rõ ràng hơn lịch sử họ Phan Đồng Phú."),
desc.push("Xin cùng chia sẻ cùng quý vị."),
desc.push(""),
desc.push("Chào thân ái!"),
desc.push("Cháu Phan Thanh Dũng"),
desc.push("Đời thứ XVI họ phan Đồng Phú")

		} else if (key == 'pha_ky') {

desc.push("apa2|Hình ảnh dòng tộc"),
desc.push("image|Bài vị Thủy Tổ|Bài vị Thủy Tổ.jpg|Đặt tại Nhà thờ Phan Tộc, Đồng Hới, Quảng Bình")
		
		} else if (key == 'pha_he') {

desc.push("VIEW-NODES|Xem tất cả hệ")
desc.push("SEARCH-NODES|Tìm thông tin hệ")

		} else if (key == 'pha_do') {

			desc.push("VIEW-TREE-ROOT|Từ đời tổ")

		} else if (key == 'ngoai_pha') {

		} else if (key == 'phu_khao') {
			
		}
		return desc;
	}

	getTestDoc1(key, desc: any) {

		desc = [];
		if (key == 'pha_nhap') {
			desc.push("apa1|Pha Nhap")
			desc.push("NODE-COUNT|Tổng số hệ")

			desc.push("NEW-PAGE")
			desc.push("hello world - Xây dựng năm 2001")
			desc.push("image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn")

		} else if (key == 'pha_ky') {
			desc.push("apa2|Spatial Ability")
			desc.push("apa3|Test One")
			desc.push("NEW-PAGE")
			desc.push("apa4|Teachers with Training")
			desc.push("apa5|Teacher Assistants")
		
		} else if (key == 'pha_he') {

			desc.push("VIEW-NODES|Xem tất cả hệ")
			desc.push("SEARCH-NODES|Tìm thông tin hệ")

			desc.push("family|start|Gia tộc nhánh Phan Quang Phục")
			desc.push("    w|Phan Thi Lien")
			desc.push("    s|Phan Van Trai")
			desc.push("    d|Phan Thi Gai")
			desc.push("family|end")

		} else if (key == 'pha_do') {

			desc.push("VIEW-TREE-ROOT|Từ đời tổ")
			desc.push("VIEW-TREE-NODES|Nhánh Phan Dính (Đời 7)|Phan Dính (Đời 7)")

		} else if (key == 'ngoai_pha') {
			desc.push("video|Buddha|buddha.mp4|Buddha Vipassana")

		} else if (key == 'phu_khao') {
			desc.push("TODAY|Hôm nay")
			desc.push("MEMORIAL|Giỗ hôm nay")
			desc.push("document|Quảng Bình|Quảng Bình.doc|Quang binh que ta")

			desc.push("popup|start|Hình nhánh Phan Văn Tám (Đời 8)")
			desc.push("   apa1|Results")
			desc.push("   image|Từ thiện|xuan son.jpg|Trường TH Xuân Sơn")
			desc.push("popup|end")
		}

		return desc;
	}


	// https://nodlik.github.io/StPageFlip/demo.html
  
	startBook() {

		for (var key of Object.keys(this.pageData)) {
			let pages = this.pageData[key];
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

	async onPhaDo(page: any, nodeid) {
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
        'info': this.info,
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
		if (DEBUGS.HTML)
			console.log('setPageDom() - htmls: ', htmls);

		let idHtml = 0;
		htmls.forEach(data => {
			let it = id + '_' + idHtml++;
			// console.log('it: ' + it);

			if (data.html) {
				// console.log('html: ' + data.html);
				document.getElementById(it).innerHTML = data.html;

			} else if (data.popupHtml) {
				let obj = data.popupHtml;
				console.log('data.popupHtml: ', obj);
				let html = '';
				for (let i = 0 ; i < obj.htmls.length; i++)
					html += obj.htmls[i].html + ' ';
				data.docHtml = html;
				data.docTitle = obj.title;
				console.log('data: ', data);

			} else if (data.viewTreeNodeHtml) {
				let line = data.viewTreeNodeHtml;
				console.log('data.viewTreeNodeHtml: ', line);
				// VIEW-TREE-NODES|Xem phả đồ theo nhánh|Phan Dính (Đời 7)
				let items = line.split('|');
				data.title = items[1];
				// get nodeid from name
				let name = items[2].trim();
				let nodeSelect = this.familyService.searchPeopleNodes(this.family, name);
				data.nodeid = nodeSelect.id;
				console.log('data.viewTreeNodeHtml: data:', data);

			}
		})
	}
	
}
