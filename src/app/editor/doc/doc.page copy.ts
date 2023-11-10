import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';
import { TypeaheadService } from '../../services/typeahead.service';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
// import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { Editor, EditorSettings } from '../../../assets/js/tinymce.min.js';

// import { Editor, EditorSettings } from 'tinymce';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

  FONTS_FOLDER = FONTS_FOLDER;
  selectDoc: string = null;
  docs: any[] = [];
  editor: Editor;
  settings: EditorSettings;

  constructor(
    public modalCtrl: ModalController,
    public popoverController: PopoverController,
    private utilService: UtilService,
    private fbService: FirebaseService,
    private familyService: FamilyService,
    private nodeService: NodeService,
    private dataService: DataService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    if (DEBUGS.NODE)
      console.log('NodePage - ngOnInit');
      this.setupEditor();

      // tinymce.init({
      //   // base_url: '/tinymce',
      //   // suffix: '.min',
      //   selector: 'textarea#basic-example',
      //   height: 500,
      //   plugins: [
      //     'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      //     'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      //     'insertdatetime', 'media', 'table', 'help', 'wordcount'
      //   ],
      //   toolbar: 'undo redo | blocks | ' +
      //   'bold italic backcolor | alignleft aligncenter ' +
      //   'alignright alignjustify | bullist numlist outdent indent | ' +
      //   'removeformat | help',
      //   content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
      // });


    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.NODE)
        console.log('NodePage - startFromStorage - data: ', data);
      this.start(data.family);
    });
  }

  start(family: any) {
    this.docs = [
      { id: 'DOC_INTRO', name: this.languageService.getTranslation('DOC_INTRO') },
      { id: 'DOC_NOTE', name: this.languageService.getTranslation('DOC_NOTE') },
      { id: 'DOC_NODE', name: this.languageService.getTranslation('DOC_NODE') },
      { id: 'DOC_TREE', name: this.languageService.getTranslation('DOC_TREE') },
      { id: 'DOC_EXTRA', name: this.languageService.getTranslation('DOC_EXTRA') },
      { id: 'DOC_INFO', name: this.languageService.getTranslation('DOC_INFO') }
    ];

  }

  setupEditor() {
    this.settings = {
      base_url: '/tinymce',
      suffix: '.min',

      height: 500,
      plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount',
      'paste'
      ],
      toolbar: 'undo redo | blocks | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help | paste',
      paste_data_images: true,

      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',

      // images_upload_handler: this.example_image_upload_handler,

      // height: 500,
      // menubar: false,
      // toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
      // plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount',
      // external_plugins: {},
      
      // images_upload_url: 'postAcceptor.php',

      /* we override default upload handler to simulate successful upload*/
      // images_upload_handler: function (blobInfo, success, failure) {
      //   console.info("blobInfo: ", blobInfo);
      //   console.info("success: ", success);
      //   console.info("failure: ", failure);

      //   setTimeout(function () {
    
      //     console.info("OK");

      //     /* no matter what you upload, we will turn it into TinyMCE logo :)*/
      //     // success('http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
      //   }, 2000);
      // },


      setup: (editor: Editor) => {
        this.editor = editor;
        // editor.uploadImages(function(success) {
        //   document.forms[0].submit();
        // });
      }
    };

    // this.editor.uploadImages(function(success) {
    //   document.forms[0].submit();
    // });
  }

  getContent() {
    const text = this.editor.getContent({ format: 'html' });
    console.info(text);
  }

  setContent() {
    this.editor.setContent('<p>Hello <b>world</b>!</p>');
  }

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearDocs() {
    this.selectDoc = null;
  }

  closeDocs() {
    if (DEBUGS.NODE)
      console.log('NodePage - closePeopleNodes - selectDoc: ', this.selectDoc);
    this.startDoc(this.selectDoc);
  }
  
  // --------- END ng-select ----------

  startDoc(doc) {
  }
  

}
