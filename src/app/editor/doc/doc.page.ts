import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { DataService } from '../../services/data.service';
import { UtilService } from '../../services/util.service';

import { FirebaseService } from '../../services/firebase.service';

import { Editor, EditorSettings } from '../../../assets/js/tinymce.min.js';
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
    if (DEBUGS.NODE)
      console.log('DocPage - ngOnInit');
    this.setupEditor();
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.NODE)
      console.log('DocPage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.NODE)
      console.log('DocPage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readDocs().then((docs:any) => {
      if (DEBUGS.NODE)
        console.log('DocPage - startFromStorage - docs: ', docs);
      this.start(docs);
    });
  }

  start(docs: any) {

    this.pageData = docs;
    for (let key of Object.keys(this.pageData)) {
      this.pageData[key].change = false;
    };

    this.docs = [
      { id: 'pha_nhap', name: this.languageService.getTranslation('DOC_INTRO') },
      { id: 'pha_ky', name: this.languageService.getTranslation('DOC_NOTE') },
      { id: 'pha_he', name: this.languageService.getTranslation('DOC_NODE') },
      { id: 'pha_do', name: this.languageService.getTranslation('DOC_TREE') },
      { id: 'ngoai_pha', name: this.languageService.getTranslation('DOC_EXTRA') },
      { id: 'phu_khao', name: this.languageService.getTranslation('DOC_INFO') }
    ];
    this.selectDoc = this.docs[0].id;
    this.setDoc(this.selectDoc);
  }

  setupEditor() {
    this.settings = {
      base_url: '/tinymce',
      suffix: '.min',
      height: 600,
      plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'addTab', 'wordcount', 'footnotes',
      'paste' ],
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
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      setup: (editor: Editor) => {
        this.editor = editor;
      }
    };
  }

  onSave() {
    this.saveDocs();

    // const newText = this.editor.getContent({ format: 'html' });
    // if (newText != this.currentText) {
    //   this.pageData[this.selectDoc].text = newText;
    //   this.docChange = true;
    // }
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearDocs() {
    this.selectDoc = null;
  }

  closeDocs() {
    // if (DEBUGS.NODE)
    console.log('DocPage - closeDocs - selectDoc: ', this.selectDoc);
    if (this.currentDoc && this.selectDoc != this.currentDoc)
      this.updateCurrentDoc();
    this.setDoc(this.selectDoc);
  }
  
  // --------- END ng-select ----------

  updateCurrentDoc() {
    const text = this.editor.getContent({ format: 'html' });
    // console.log('DocPage - updateCurrentDoc - doc, text: ', this.currentDoc, text);
    if (this.pageData[this.currentDoc].text != text.trim()) {
      this.pageData[this.currentDoc].text = text;
      this.pageData[this.currentDoc].change = true;
      // console.log('DocPage - updateCurrentDoc - doc, change = true: ', this.currentDoc);
      // this.message += 'Change ' + this.currentDoc;
      this.setMessage();
    }
      // this.docChange = true;
  }

  setDoc(doc: any) {
    this.editor.setContent(this.pageData[doc].text);
    // console.log('DocPage - setDoc - doc, text: ', doc, this.pageData[doc].text);
    this.currentDoc = doc;
  }
  
  setMessage() {
    let msg = this.languageService.getTranslation('DOC_CHANGED');
    let count = 0;
    for (let doc of Object.keys(this.pageData)) {
      if (this.pageData[doc].change) {
        console.log('DocPage - setMessage - doc: ', doc);
        for (let i = 0; i < this.docs.length; i++) {
          if (doc == this.docs[i].id) {
            doc = this.docs[i].name;
            break;
          }
        }
        if (count != 0)
          msg += ', ';
        msg += doc;
        count++;
      }
    }
    console.log('DocPage - setMessage - msg: ', msg);
    this.message = msg;
    this.changedDocCount = count;
  }

  async saveDocs() {
    this.dataService.readItem('ANCESTOR_DATA').then((adata:any) => {
      let info = adata.info;
      let ancestor = info.id;
      adata.docs = this.pageData;
      let id = this.utilService.getDateID();
      this.fbService.saveAncestorData(adata).then((status:any) => {
        this.fbService.saveBackupDocs(ancestor, this.pageData, id).then((status:any) => {
          this.dataService.saveItem('ANCESTOR_DATA', adata).then((status:any) => {
            this.utilService.dismissLoading();
            let message = this.utilService.getAlertMessage([
              {name: 'msg', label: 'DOC_MESSAGE_1'},
              {name: 'data', label: 'ID: ' + id},
              {name: 'msg', label: 'DOC_MESSAGE_2'},
            ]);
            this.utilService.presentToast(message);
          });
        });
      });
    });
  }
}
