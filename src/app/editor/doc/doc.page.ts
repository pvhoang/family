import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { DataService } from '../../services/data.service';
import { EditorService } from '../../services/editor.service';
import { UtilService } from '../../services/util.service';
import { FirebaseService } from '../../services/firebase.service';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  selectDoc: string = null;
  currentDoc: string = null;

  docs: any[] = [];
  editor: any;
  settings: any;
  pageData: any;
	currentData: any;
  newData: any;
	editorOK: any;
  currentText: any;
  // docChange = false;
  message = "";
  changedDocCount = 0;
  constructor(
    public modalCtrl: ModalController,
    private dataService: DataService,
    private fbService: FirebaseService,
    private utilService: UtilService,
    private editorService: EditorService,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {
		this.editorOK = false;
    if (DEBUGS.DOCS)
      console.log('DocPage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillLeave');
	}

  startFromStorage() {

		// this.setupEditor("Hello");

    this.dataService.readDocs().then((currentData:any) => {
			// let text = currentData['pha_nhap'].text;
			// this.setupEditor(text);
      // if (DEBUGS.DOCS)
        // console.log('DocPage - startFromStorage - currentData: ', currentData);
			this.currentData = currentData;
      this.start(currentData);
    });
  }

  start(data: any) {
		this.newData = JSON.parse(JSON.stringify(data));
    this.docs = [
      // { id: 'chon', name: this.languageService.getTranslation('DOC_SELECT') },
      { id: 'pha_nhap', name: this.languageService.getTranslation('DOC_INTRO') },
      { id: 'pha_ky', name: this.languageService.getTranslation('DOC_NOTE') },
      { id: 'pha_he', name: this.languageService.getTranslation('DOC_NODE') },
      { id: 'pha_do', name: this.languageService.getTranslation('DOC_TREE') },
      { id: 'ngoai_pha', name: this.languageService.getTranslation('DOC_EXTRA') },
      { id: 'phu_khao', name: this.languageService.getTranslation('DOC_INFO') }
    ];
    this.selectDoc = this.docs[0].id;
		// console.log('DocPage - startFromStorage - text: ', this.newData[this.selectDoc].text);
		// let text = (this.selectDoc == 'chon') ? '' : this.newData[this.selectDoc].text;
		// this.editor.setContent(text);
		this.currentDoc = this.selectDoc;
		this.editorOK = true;
		this.setupEditor(this.newData[this.selectDoc].text);

  }

	// https://www.tiny.cloud/docs/integrations/angular/#tinymceangulartechnicalreference

  setupEditor(text: any) {

    this.settings = {
      base_url: '/tinymce',
      suffix: '.min',
      height: 600,
      plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code',
      'insertdatetime', 'media', 'table', 'help', 
			// 'fullscreen', 'contextmenu', 'addTab', 'wordcount', 'footnotes', 'paste' 
			],
			menu: {
				images: { title: 'Hình', items: 'nesteditem' }
			},
			menubar: 'file edit view indert format tools table help images',
      toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | indent outdent | paste ',
      help_tabs: [
        {
          name: 'custom1', // new tab called custom1
          title: 'Cách sử dụng',
          items: [
            {
              type: 'htmlpanel',
              html: '<p>Thêm /PAGE/ để thêm trang.</p>',
            },
						{
              type: 'htmlpanel',
              html: '<p>Thêm "[hinh.jpg,Cỡ-Format,Chữ]" để thêm hình. Cỡ: 1/2/3-left/center/right. Chữ: dòng chữ dưới hình. Ví dụ: "[mo_to.jpg,1,Mộ tổ tại Đá Bạc]"</p>',
            },
            {
              type: 'htmlpanel',
              html: '<p>Dùng Ctrl-C/V để chép và thêm chữ và hình</p>',
            },
          ]
        },
        'shortcuts', // the default shortcuts tab
      ],
      paste_data_images: true,
			external_plugins: {
				// 'wordcount': '../../../assets/js/tinymce/plugins/wordcount/plugin.min.js',
			},
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      setup: (editor: any) => {
        this.editor = editor;
				let subitems = this.editorService.getImageItems(editor);
				// https://www.tiny.cloud/docs/tinymce/latest/creating-custom-menu-items/

				editor.ui.registry.addNestedMenuItem('nesteditem', {
					text: 'Chọn hình',
					getSubmenuItems: () => subitems
				});
				// https://www.tiny.cloud/blog/how-to-get-content-and-set-content-in-tinymce/
				// editor.on('init', function (e) {
				editor.on('init', (e: any) => {
					// editor.setContent(this.newData[this.selectDoc].text);
					editor.setContent(text);
				});
      }
    };
	}

	// getImageItems(editor: any) {
	// 	let imageItems = [];
	// 	this.dataService.readItem('photos').then((photos:any) => {
	// 		// console.log('photos: ', photos)
	// 		photos.data.forEach(photo => {
	// 			let dat = photo.split('|');
	// 			let name = dat[0];
	// 			// let caption = (dat.length > 1) ? dat[1] : '';
	// 			let caption = (dat.length > 1) ? dat[1] : name;
	// 			let sub = {
	// 				type: 'menuitem',
	// 				text: name,
	// 				onAction: () => editor.insertContent(`"[` + name + `,1,c,` + caption + `]"`)
	// 			};
	// 			imageItems.push(sub);
	// 		})
	// 		return imageItems;
	// 	});
	// 	return imageItems;
	// }

	// save docs to local and firebase
	saveDocs() {
		// save current doc
		const text = this.editor.getContent({ format: 'html' });
		this.newData[this.currentDoc].text = text;
		// set message
    let msg = this.languageService.getTranslation('DOC_CHANGED');
    let count = 0;
    for (let doc of Object.keys(this.newData)) {
			if (this.newData[doc].text.trim() != this.currentData[doc].text.trim()) {
				count++;
				let docName = '';
				for (let i = 0; i < this.docs.length; i++) {
          if (doc == this.docs[i].id) {
            docName = this.docs[i].name;
            break;
          }
        }
				msg += docName;
			}
		}

		if (count == 0) {
			msg = this.languageService.getTranslation('DOC_NOT_CHANGED');
			this.utilService.presentToast(msg, 1000);
			return;
		}
		
		if (count > 0) {
			this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((result) => {
				if (result.data) {
					// save to local memory and firebase
					this.dataService.saveDocs(this.newData).then((status:any) => {
						this.saveDocsToFirebase();
					});
				}
			});
		}
	}

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearDocs() {
		if (DEBUGS.DOCS)
			console.log('DocPage - clearDocs - selectDoc: ', this.selectDoc);
    this.selectDoc = null;
  }

	closeDocs() {
    if (DEBUGS.DOCS) {
			console.log('DocPage - closeDocs - selectDoc: ', this.selectDoc);
			// console.log('DocPage - closeDocs - text: ', this.newData[this.selectDoc].text);
		}
		
		// const text = this.editor.getContent({ format: 'html' });
		// this.editorService.convertDocsText(text);

		this.newData[this.currentDoc].text = this.editor.getContent({ format: 'html' });
		this.editor.setContent(this.newData[this.selectDoc].text);
		// this.editor.setContent(this.newData[this.selectDoc].text);
		this.currentDoc = this.selectDoc;
  }


  // closeDocs() {
  //   if (DEBUGS.DOCS) {
	// 		console.log('DocPage - closeDocs - selectDoc: ', this.selectDoc);
	// 		// console.log('DocPage - closeDocs - text: ', this.newData[this.selectDoc].text);
	// 	}
	// 	// const text = this.editor.getContent({ format: 'html' });
	// 	if (this.currentDoc != 'chon') {
	// 		this.newData[this.currentDoc].text = this.editor.getContent({ format: 'html' });
	// 	}
	// 	if (this.selectDoc == 'chon') {
	// 		this.editor.setContent('');
	// 	} else {
	// 		this.editor.setContent(this.newData[this.selectDoc].text);
	// 	}
	// 	// this.editor.setContent(this.newData[this.selectDoc].text);
	// 	this.currentDoc = this.selectDoc;
  // }
  
  // --------- END ng-select ----------

  async saveDocsToFirebase() {
    this.dataService.readInfo().then((info:any) => {
      let ancestor = info.id;
			let language = this.languageService.getLanguage();
			this.fbService.saveDocsData(ancestor, language, this.newData).then((status:any) => {
				// this.fbService.saveBackupDocs(ancestor, language, this.newData).then((status:any) => {
					this.utilService.dismissLoading();
					let message = this.utilService.getAlertMessage([
						{name: 'msg', label: 'DOC_MESSAGE'},
					]);
					this.utilService.presentToast(message, 3000);
				});
			// });
		})
  }
}
