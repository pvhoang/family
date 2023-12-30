import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { DataService } from '../../services/data.service';
import { UtilService } from '../../services/util.service';
import { FirebaseService } from '../../services/firebase.service';
import { Editor, EditorSettings } from '../../../assets/js/tinymce/tinymce.min.5.10.9.js';
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
  editor: Editor;
  settings: EditorSettings;
  pageData: any;
  
	currentData: any;
  newData: any;

  currentText: any;
  // docChange = false;
  message = "";
  changedDocCount = 0;
  constructor(
    public modalCtrl: ModalController,
    private dataService: DataService,
    private fbService: FirebaseService,
    private utilService: UtilService,
    private languageService: LanguageService,
  ) {}

  ngOnInit() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ngOnInit');
    this.setupEditor();
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillEnter');
		// this.setupEditor();
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillLeave');
		// save new data
		// this.saveDocs();
		// if (this.changedDocCount > 0)
		// this.updateCurrentDoc();
		// this.dataService.saveDocs(this.pageData).then((status:any) => {});
	}

  startFromStorage() {
    this.dataService.readDocs().then((currentData:any) => {
      if (DEBUGS.NODE)
        console.log('DocPage - startFromStorage - currentData: ', currentData);
			this.currentData = currentData;
      this.start(currentData);
    });
  }

  start(data: any) {
		this.newData = JSON.parse(JSON.stringify(data));
    this.docs = [
      { id: 'chon', name: this.languageService.getTranslation('DOC_SELECT') },
      { id: 'pha_nhap', name: this.languageService.getTranslation('DOC_INTRO') },
      { id: 'pha_ky', name: this.languageService.getTranslation('DOC_NOTE') },
      { id: 'pha_he', name: this.languageService.getTranslation('DOC_NODE') },
      { id: 'pha_do', name: this.languageService.getTranslation('DOC_TREE') },
      { id: 'ngoai_pha', name: this.languageService.getTranslation('DOC_EXTRA') },
      { id: 'phu_khao', name: this.languageService.getTranslation('DOC_INFO') }
    ];
    this.selectDoc = this.docs[0].id;
		// console.log('DocPage - startFromStorage - text: ', this.newData[this.selectDoc].text);
		let text = (this.selectDoc == 'chon') ? '' : this.newData[this.selectDoc].text;
		this.editor.setContent(text);
		this.currentDoc = this.selectDoc;
  }

  setupEditor() {
    this.settings = {
      base_url: '/tinymce',
      suffix: '.min',
      height: 600,
      plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 
			// 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 
			// 'addTab', 
			// 'wordcount', 
			// 'footnotes',
      // 'paste' 
			],
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
      setup: (editor: Editor) => {
        this.editor = editor;
      }
    };
  }

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
		if (this.currentDoc != 'chon') {
			this.newData[this.currentDoc].text = this.editor.getContent({ format: 'html' });
		}
		if (this.selectDoc == 'chon') {
			this.editor.setContent('');
		} else {
			this.editor.setContent(this.newData[this.selectDoc].text);
		}
		// this.editor.setContent(this.newData[this.selectDoc].text);
		this.currentDoc = this.selectDoc;
  }
  
  // --------- END ng-select ----------

  async saveDocsToFirebase() {
    this.dataService.readItem('ANCESTOR_DATA').then((adata:any) => {
      let info = adata.info;
      let ancestor = info.id;
      adata.docs = this.newData;
      let id = this.utilService.getDateID();
      this.fbService.saveAncestorData(adata).then((status:any) => {
        this.fbService.saveBackupDocs(ancestor, this.newData, id).then((status:any) => {
          this.dataService.saveItem('ANCESTOR_DATA', adata).then((status:any) => {
            this.utilService.dismissLoading();
            let message = this.utilService.getAlertMessage([
              {name: 'msg', label: 'DOC_MESSAGE_1'},
              {name: 'data', label: 'ID: ' + id},
              {name: 'msg', label: 'DOC_MESSAGE_2'},
            ]);
            this.utilService.presentToast(message);
						// this.message = "";
						// this.changedDocCount = 0;
						// this.dataService.saveDocs(this.pageData).then((status:any) => {});
          });
        });
      });
    });
  }
}
