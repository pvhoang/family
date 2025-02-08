import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../../../services/util.service';
import { NodeService } from '../../../services/node.service';
import { LanguageService } from '../../../services/language.service';
import { FirebaseService } from '../../../services/firebase.service';
import { ThemeService } from '../../../services/theme.service';
import { FtTreeService } from '../../../services/ft-tree.service';
import { jsPDF, jsPDFOptions } from 'jspdf';
import { environment } from '../../../../environments/environment';
import domtoimage from 'dom-to-image';
import '../../../../assets/js/Roboto-Regular-normal.js';
import '../../../../assets/js/Pacifico-Regular-normal.js';
import { FONTS_FOLDER, DEBUGS } from '../../../../environments/environment';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.page.html',
  styleUrls: ['./tree.page.scss'],
})
export class TreePage implements OnInit {

  @Input() nodeId: any;
  @Input() familyView: any;
  @Input() info: any;
  @Input() images: any;

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  node:any;
  typeStr: string = '';

  treeClass = 'vertical-tree'
  viewMode = 3;
	
	platform: any;
	
  CANCEL: string = '';
  JPEG: string = '';
  PDF: string = '';
  TREE_POPOVER_PRINT_JPEG: string = '';
  TREE_POPOVER_PRINT_PDF: string = '';

  constructor(
    private modalCtrl: ModalController,
    private utilService: UtilService,
    private fbService: FirebaseService,
    private nodeService: NodeService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    public ftTreeService: FtTreeService,
  ) {}

  ngOnInit() {
    if (DEBUGS.TREE)
      console.log('TreePage - ngOnInit');
    this.CANCEL =  this.languageService.getTranslation('CANCEL');
    this.JPEG =  this.languageService.getTranslation('JPEG');
    this.PDF =  this.languageService.getTranslation('PDF');
    this.TREE_POPOVER_PRINT_JPEG =  this.languageService.getTranslation('TREE_POPOVER_PRINT_JPEG');
    this.TREE_POPOVER_PRINT_PDF =  this.languageService.getTranslation('TREE_POPOVER_PRINT_PDF');
    this.start();
		this.ftTreeService.reset();
		this.platform = environment.platform;
		// get view mode by platform
		this.viewMode = (this.platform == 'web') ? 4 : 3;

  }

  ionViewWillEnter() {
    if (DEBUGS.TREE)
      console.log('TreePage - ionViewWillEnter');
  }
	
	ionViewWillLeave() {
    if (DEBUGS.TREE)
      console.log('TreePage - ionViewWillLeave');
	}

  start() {
    // set photo for each node
    let nodes = this.nodeService.getFamilyNodes(this.familyView);
    if (DEBUGS.TREE)
			console.log('TreePage - familyView: ', nodes);
    this.themeService.setScreenSize(nodes, true);
    this.node = this.nodeService.getFamilyNode(this.familyView, this.nodeId);
    this.title = this.node.name;
    this.node.nclass = 'node-select';
    setTimeout(() => {
      this.scrollToNode(this.node);
    }, 1000);
  }

  onLeafSelected (node) {
    if (DEBUGS.TREE)
      console.log('TreePage - onLeafSelected - node: ', node);
  }
  
  scrollToNode(node) {
    const ele = document.getElementById(node.id);
    let options: any = {
      behaviour: 'smooth',
      block: 'center',
      inline: 'center',
    }
    ele.scrollIntoView(options);
  }

	onPDF() {
    let node = this.node;
    let fileName = node.name + '.pdf';
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_1'},
      {name: 'data', label: fileName},
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_2'},
    ]);
    this.utilService.alertConfirm('ANNOUNCE', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
				console.log('PDF OK', res.data);
				this.utilService.presentLoading('TREE_BUILD_PDF');
				let iddom = 'screen';
        const ele = document.getElementById(iddom);
				console.log('onPDF: ele: ', ele);
				// if (DEBUGS.TREE)
					console.log('onPDF: clientWidth, clientHeight in pixel: ', ele.clientWidth, ele.clientHeight);
        const options = { bgcolor: 'white', width: ele.clientWidth, height: ele.clientHeight, quality: 1.0 };
        domtoimage.toPng(ele, options).then((dataUrl:any) => {
          this.getPDFImages(dataUrl, ele).then((data: any) => {
            this.printPDF(data, fileName, node);
            this.utilService.dismissLoading();
          })
        })
				.catch((error:any) => {
					if (DEBUGS.TREE)
						console.log('onPDF - error: ', error);
					this.utilService.dismissLoading();
					let message = this.languageService.getTranslation('TREE_ERROR_SAVE_FILE')
					this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 200 }).then(choice => {});
				});
      }
    });
  }

	private getPDFImages(imgData: any, ele: any) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgData;
      // load img to canvas
      img.onload = () => {
				// let dim = this.getPDFDimension(ele);
        // let images = dim.images;
        // for (let i = 0; i < images.length; ++i) {
        //   let data = images[i].image;
        //   var canvas = document.createElement('canvas');
        //   canvas.width = data.w;
        //   canvas.height = data.h;
        //   let context = canvas.getContext('2d');
        //   context.drawImage(img, 0, data.y, data.w, data.h, 0, 0, canvas.width, canvas.height);
        //   data.canvas = canvas.toDataURL();
        // }
        // resolve(dim);
				let data = { w: ele.clientWidth, h: ele.clientHeight, canvas: '' }
				var canvas = document.createElement('canvas');
				canvas.width = data.w;
				canvas.height = data.h;
				let context = canvas.getContext('2d');
				context.drawImage(img, 0, 0, data.w, data.h, 0, 0, canvas.width, canvas.height);
				data.canvas = canvas.toDataURL();
        resolve(data);
      };
    });
  }

	// private getPDFDimension(ele: any) {
  //   // use A4: width = 210mm, height = 297mm
  //   // let pageWidth = 210;
  //   // let pageHeight = 297;
  //   let marginLeft = 30;
  //   let marginRight = 30;
  //   let marginTop = 40;
  //   let marginBottom = 20;
  //   let textHeight = 30;
	// 	let imageWidth = ele.clientWidth;
	// 	let imageHeight = ele.clientHeight;
	// 	let pageWidth = imageWidth + marginLeft + marginRight;
  //   let pageHeight = imageHeight + marginTop + textHeight + marginBottom;
  //   let images = [];
  //   images.push({ 
  //     page: { x: marginLeft, y: marginTop + textHeight, w: imageWidth, h: pageHeight },
  //     image: { x: 0, y: 0, w: imageWidth, h: imageHeight }
  //   })
  //   return { textHeight: textHeight, marginLeft: marginLeft, marginTop: marginTop, pageWidth: pageWidth, pageHeight: pageHeight, images: images };
  // }

	private printPDF(imageData: any, fileName: any, node: any) {

		console.log('printPDF: data: ', imageData.w, imageData.h );
		// calculate page dimension from image width and height

		let imageWidth = imageData.w;
		let imageHeight = imageData.h;
		let marginLeft = Math.round(imageWidth / 10);
		let marginRight = marginLeft;
		let marginTop = Math.round(imageHeight / 20);
		let marginBottom = marginTop;

		let topText = marginTop;
		let topImage = topText + marginTop / 2;

		// let marginRight = Math.round(imageData.w / 10);
		// let marginTop = Math.round(imageData.h / 10);
		// let marginBottom = Math.round(imageData.h / 10);
		// let textHeight = Math.round(imageData.h / 10);

		// let marginLeft = 30;
		// let marginRight = 30;
		// let marginTop = 2000;
		// let marginBottom = 30;
		// let textHeight = 0;
		
		let pageWidth = marginLeft + imageWidth + marginRight;
    let pageHeight = topImage + imageHeight + marginBottom;

		// let pageWidth = imageData.w + 10;
		// let pageHeight = imageData.h + 10;
		// let imageX = 5;
    // let imageY = 5;

		const doc = new jsPDF({
			orientation: "p",
			unit: "px",
			format: [pageWidth, pageHeight],
			hotfixes: ["px_scaling"],
		});

		// https://github.com/simonbengtsson/jsPDF-AutoTable/issues/343
		let url = this.themeService.setTreeBackground();
		doc.internal.events.subscribe('addPage', () => {
			doc.addImage(url, 'PNG', 0, 0, pageWidth, pageHeight); 
		});
		doc.deletePage(1)
		doc.addPage()
		this.printText(node, doc, pageWidth, topText, { large: 24, small: 20, spacing: 50 });
    doc.addImage(imageData.canvas, 'PNG', marginLeft, topImage, imageWidth, imageHeight);
    doc.save(fileName, { 'returnPromise': true }).then((status:any) => {});
  }

	private printText(node: any, doc: any, pWidth: any, text_top: any, fontSize: any) {

    let messages = this.getPDFData(node);
		console.log('printText - messages: ', messages);

    // set custom font
    // doc.setFont('Roboto-Regular'); // set custom font
    doc.setFont('Pacifico-Regular'); // set custom font
    
    let name = messages[0].value;
    let ym = text_top;
    doc.setTextColor("black");
    doc.setFontSize(fontSize.large);
    let xm = (pWidth - doc.getTextWidth(name))/2
    doc.text(name, xm, ym);

    let location = messages[1].value;
    ym += fontSize.spacing;
    doc.setTextColor("black");
    doc.setFontSize(fontSize.large);
    xm = (pWidth - doc.getTextWidth(location))/2
    doc.text(location, xm, ym);

    let nodeDetail = messages[2].name + ': ' + messages[2].value + ' - ' + messages[3].name + ': ' + messages[3].value;
    ym += fontSize.spacing;
    doc.setTextColor("black");
    doc.setFontSize(fontSize.small);
    xm = (pWidth - doc.getTextWidth(nodeDetail))/2
    doc.text(nodeDetail, xm, ym);
  }

	getPDFData(node: any) {
    let options = [];
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: this.info.name});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: this.info.location});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: node.name});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_GENERATION'), value: node.level});
    return options;
  }

	async onCancel() {
    // reset nclass
    this.node.nclass = this.nodeService.updateNclass(this.node);
    await this.modalCtrl.dismiss({status: 'cancel'});
  }
}


