import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../../../services/util.service';
import { NodeService } from '../../../services/node.service';
import { LanguageService } from '../../../services/language.service';
import { FirebaseService } from '../../../services/firebase.service';
import { ThemeService } from '../../../services/theme.service';
import { FtTreeService } from '../../../services/ft-tree.service';
import { jsPDF, jsPDFOptions } from 'jspdf';
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

  FONTS_FOLDER = FONTS_FOLDER;
  title: any = '';
  node:any;
  typeStr: string = '';
  treeClass = 'vertical-tree'
  viewMode = 2;
  CANCEL: string = '';
  JPG: string = '';
  PDF: string = '';
  TREE_POPOVER_PRINT_JPG: string = '';
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
    this.JPG =  this.languageService.getTranslation('JPG');
    this.PDF =  this.languageService.getTranslation('PDF');
    this.TREE_POPOVER_PRINT_JPG =  this.languageService.getTranslation('TREE_POPOVER_PRINT_JPG');
    this.TREE_POPOVER_PRINT_PDF =  this.languageService.getTranslation('TREE_POPOVER_PRINT_PDF');
    this.start();
		this.ftTreeService.reset();
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
    nodes.forEach((node:any) => {
      this.getPhotoUrl(node).then((url:any) => {
        node.photoUrl = url;
      });
    })
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

  // https://github.com/tsayen/dom-to-image
  onJPG() {
    let iddom = 'screen';
    let node = this.node;
    // let keys = this.utilService.stripVN(node.name).split(' ');
    // let nameStr = keys.join('_');
    let fileName = node.name + '.jpg';
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'TREE_SELECT_PRINT_JPG_MSG_1'},
      {name: 'data', label: fileName},
      {name: 'msg', label: 'TREE_SELECT_PRINT_JPG_MSG_2'},
    ]);
    this.utilService.alertConfirm('ANNOUNCE', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
				if (DEBUGS.TREE)
					console.log('onJPG - res: ', res);
        this.utilService.presentLoading();
        const ele = document.getElementById(iddom);
        const dashboardHeight = ele.clientHeight;
        const dashboardWidth = ele.clientWidth;
        let opts = { bgcolor: 'white', width: dashboardWidth, height: dashboardHeight, quality: 1.0 };
				console.log('onJPG - ele: ', ele);
        domtoimage.toPng(ele, opts).then((imgData:any) => {
				// domtoimage.toJpeg(ele, opts).then((imgData:any) => {
					// console.log('onJPG - imgData: ', imgData);
					if (imgData) {
						var link = document.createElement('a');
						link.download = fileName;
						link.href = imgData;
						link.click();
					}
          this.utilService.dismissLoading();
        })
				.catch((error:any) => {
					this.utilService.dismissLoading();
					let message = this.languageService.getTranslation('TREE_ERROR_SAVE_FILE')
					this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 200 }).then(choice => {});
					// console.error('oops, something went wrong!: error', error);
				});
      }
    });
  }

  onPDF() {
    let iddom = 'screen';
    let node = this.node;
    // let keys = this.utilService.stripVN(node.name).split(' ');
    // let nameStr = keys.join('_');
    let fileName = node.name + '.pdf';
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_1'},
      {name: 'data', label: fileName},
      {name: 'msg', label: 'TREE_SELECT_PRINT_PDF_MSG_2'},
    ]);
    this.utilService.alertConfirm('ANNOUNCE', msg, 'CANCEL', 'CONTINUE').then((res) => {
      if (res.data) {
        this.utilService.presentLoading();
        const ele = document.getElementById(iddom);
				if (DEBUGS.TREE)
					console.log('onPDF: clientWidth, clientHeight: ', ele.clientWidth, ele.clientHeight);
        const options = { bgcolor: 'white', width: ele.clientWidth, height: ele.clientHeight, quality: 1.0 };
        domtoimage.toPng(ele, options).then((imgData:any) => {
          this.getPDFImages(imgData, ele).then((dim: any) => {
						if (DEBUGS.TREE)
							console.log('onPDF - dim: ', dim);
            this.printPDF(dim, fileName, node);
            this.utilService.dismissLoading();
          })
        })
				.catch((error:any) => {
					this.utilService.dismissLoading();
					let message = this.languageService.getTranslation('TREE_ERROR_SAVE_FILE')
					this.utilService.alertMsg('ERROR', message, 'OK', { width: 350, height: 200 }).then(choice => {});
					// console.error('oops, something went wrong!: error', error);
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
        let dim = this.getPDFDimension(ele);
        let images = dim.images;
        for (let i = 0; i < images.length; ++i) {
          let data = images[i].image;
          var canvas = document.createElement('canvas');
          canvas.width = data.w;
          canvas.height = data.h;
          let context = canvas.getContext('2d');
          context.drawImage(img, 0, data.y, data.w, data.h, 0, 0, canvas.width, canvas.height);
          data.canvas = canvas.toDataURL();
        }
        resolve(dim);
      };
    });
  }

  showJpg(img: any, fileName: any) {
    var link = document.createElement('a');
    link.download = fileName;
    link.href = img;
    link.click();
  }

  private getPDFDimension(ele: any) {
    // use A4: width = 210mm, height = 297mm
    let pageWidth = 210;
    let pageHeight = 297;
    let marginLeft = 30;
    let marginRight = 30;
    let marginTop = 40;
    let marginBottom = 20;
    let textHeight = 30;
    let xImage = 0;
    let wImage = ele.clientWidth; // ele.clientWidth
    // calculate ratio between image and page
    let imageWidth = pageWidth - (marginLeft + marginRight);
    let wRatio = imageWidth / ele.clientWidth;
    let imageHeight = parseInt(''+wRatio * ele.clientHeight);
    let hRatio = ele.clientHeight / imageHeight;

    let yImage = 0;
    let yPage = 0;
    let images = [];

    // first page
    let hPage = pageHeight - marginTop - marginBottom - textHeight;
    let hImage = hPage * hRatio;
    images.push({ 
      page: { x: marginLeft, y: marginTop + textHeight, w: imageWidth, h: hPage },
      image: { x: xImage, y: yImage, w: wImage, h: hImage }
    })

    yPage += hPage;
    yImage += hImage;

    if (imageHeight > yPage) {
      // following pages
      hPage = pageHeight - marginTop - marginBottom;
      hImage = hPage * hRatio;
      let nImages = parseInt(''+(imageHeight - yPage) / hPage);
      console.log('printPDF: nImages: ', nImages);
      for (let i = 0; i < nImages; i++) {
        images.push({ 
          page: { x: marginLeft, y: marginTop, w: imageWidth, h: hPage },
          image: { x: xImage, y: yImage - 2, w: wImage, h: hImage + 2 }
        })
        yPage += hPage;
        yImage += hImage;
      }
      // last page
      let hLastPage = imageHeight - yPage;
      if (hLastPage > 0) {
        hPage = hLastPage;
        hImage = hPage * hRatio;
        images.push({ 
          page: { x: marginLeft, y: marginTop, w: imageWidth, h: hPage },
          image: { x: xImage, y: yImage - 2, w: wImage, h: hImage + 2 }
        })
        yImage += hImage;
      }
    }
    return { textHeight: textHeight, marginLeft: marginLeft, marginTop: marginTop, pageWidth: pageWidth, pageHeight: pageHeight, images: images };
  }

  // https://stackoverflow.com/questions/29578721/image-in-pdf-cut-off-how-to-make-a-canvas-fit-entirely-in-a-pdf-page

  private printPDF(dim: any, fileName: any, node: any) {

    let pWidth = dim.pageWidth;
    let pHeight = dim.pageHeight;
    let marginTop = dim.marginTop;
    let images = dim.images;
    const doc = new jsPDF();
    let url = this.themeService.setTreeBackground()
    
    // 1st page
    doc.addImage(url, "PNG", 0, 0, pWidth, pHeight);
    // this.drawBorder(doc, pWidth, pHeight);
    this.printText(node, doc, pWidth, pHeight, marginTop + 10);
    let image = images[0];
    doc.addImage(image.image.canvas, 'PNG', image.page.x, image.page.y, image.page.w, image.page.h);

    // next pages
    for (let i = 1; i < images.length; i++) {
      let image = images[i];
      doc.addPage();
      doc.addImage(url, "PNG", 0, 0, pWidth, pHeight);
      // this.drawBorder(doc, pWidth, pHeight);
      doc.addImage(image.image.canvas, 'PNG', image.page.x, image.page.y, image.page.w, image.page.h);
    }
    doc.save(fileName, { 'returnPromise': true }).then((status:any) => {});
  }

  // private drawBorder(doc: any, pWidth: any, pHeight: any) {
  //   // draw border lines
  //   doc.setDrawColor(255, 0, 0); // draw red lines
  //   doc.setLineWidth(1.0);
  //   doc.line(0, 0, pWidth, 0);
  //   doc.line(0, 0, 0, pHeight);
  //   doc.line(pWidth, 0, pWidth, pHeight);
  //   doc.line(0, pHeight, pWidth, pHeight);
  // }

  private printText(node: any, doc: any, pWidth: any, pHeight: any, text_top: any) {

    let messages = this.getPDFData(node);
    // set custom font
    // doc.setFont('Roboto-Regular'); // set custom font
    doc.setFont('Pacifico-Regular'); // set custom font
    
    let name = messages[0].value;
    let ym = text_top;
    doc.setTextColor("black");
    doc.setFontSize(14);
    let xm = (pWidth - doc.getTextWidth(name))/2
    doc.text(name, xm, ym);

    let location = messages[1].value;
    ym += 7;
    doc.setTextColor("black");
    doc.setFontSize(14);
    xm = (pWidth - doc.getTextWidth(location))/2
    doc.text(location, xm, ym);

    let nodeDetail = messages[2].name + ': ' + messages[2].value + ' - ' + messages[3].name + ': ' + messages[3].value;
    ym += 10;
    doc.setTextColor("black");
    doc.setFontSize(12);
    xm = (pWidth - doc.getTextWidth(nodeDetail))/2
    doc.text(nodeDetail, xm, ym);
  }

  async onCancel() {
    // reset nclass
    this.node.nclass = this.nodeService.updateNclass(this.node);
    await this.modalCtrl.dismiss({status: 'cancel'});
  }

  getPhotoUrl(node) {
    return new Promise((resolve) => {
      let photoName = node.photo;
      if (photoName == '') {
        let avatar = (node.gender == 'male') ? "male-avatar.jpg" : "female-avatar.jpg";
        let url = "../assets/icon/" + avatar;
        resolve(url)
      } else {
        let ancestor = this.info.id;
        this.fbService.downloadImage(ancestor, photoName).then((imageURL:any) => {
          resolve(imageURL)
        })
        .catch((error) => {
          console.log('ERROR: getPhotoUrl: ', error);
        });
      }
    });
  }

  getPDFData(node: any) {
    let options = [];
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: this.info.name});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: this.info.location});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_NAME'), value: node.name});
    options.push({ name: this.languageService.getTranslation('TREE_VIEW_GENERATION'), value: node.level});
    return options;
  }
}


