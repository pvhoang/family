import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { FONTS_FOLDER, DEBUGS } from '../../../../environments/environment';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.page.html',
  styleUrls: ['./doc.page.scss'],
})
export class DocPage implements OnInit {

	@Input() text: string;
  FONTS_FOLDER = FONTS_FOLDER;
  editor: any;
  settings: any;
  message = "";
  changedDocCount = 0;
  constructor(
    public modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ngOnInit');

      console.log('DocPage - ngOnInit - text: ', this.text);
		this.convert(this.text);
		this.setupEditor(this.text);
  }

  ionViewWillEnter() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillEnter');
  }
	
	ionViewWillLeave() {
    if (DEBUGS.DOCS)
      console.log('DocPage - ionViewWillLeave');
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
      'insertdatetime', 'media', 'table', 'help'
			],
			menubar: 'file edit view insert format tools table help images',
			toolbar:
       'undo redo | formatselect | bold italic backcolor | \
       alignleft aligncenter alignright alignjustify | \
       bullist numlist outdent indent | removeformat | help',
      // toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | indent outdent | paste ',
      paste_data_images: true,
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      setup: (editor: any) => {
        this.editor = editor;
				// https://www.tiny.cloud/blog/how-to-get-content-and-set-content-in-tinymce/
				editor.on('init', (e: any) => {
					editor.setContent(text);
				});
      }
    };
	}

	convert(text) {
		// change to json
		let json = JSON.parse(text);
	}

	async onCancel() {
    await this.modalCtrl.dismiss({
      result: false
    });
  }

  async onSave() {
		const text = this.editor.getContent({ format: 'html' });
    await this.modalCtrl.dismiss({
      result: text
    });
  }

	// save docs to local and firebase
	// saveDocs() {
	// 	// save current doc
	// 	const text = this.editor.getContent({ format: 'html' });
	// 	this.newData[this.currentDoc].text = text;
	// 	// set message
  //   let msg = this.languageService.getTranslation('DOC_CHANGED');
  //   let count = 0;
	// 	let start = true;
  //   for (let doc of Object.keys(this.newData)) {
	// 		if (this.newData[doc].text.trim() != this.currentData[doc].text.trim()) {
	// 			count++;
	// 			let docName = '';
	// 			for (let i = 0; i < this.docs.length; i++) {
  //         if (doc == this.docs[i].id) {
  //           docName = this.docs[i].name;
  //           break;
  //         }
  //       }
	// 			if (start)
	// 				start = false;
	// 			else
	// 				msg += ', ';
	// 			msg += docName;
	// 		}
	// 	}
	// 	if (count == 0) {
	// 		msg = this.languageService.getTranslation('DOC_NOT_CHANGED');
	// 		this.utilService.presentToast(msg, 1000);
	// 		return;
	// 	}
	// 	if (count > 0) {
	// 		this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((result) => {
	// 			if (result.data) {
	// 				// save to local memory and firebase
	// 				this.dataService.saveDocs(this.newData).then((status:any) => {
	// 					this.saveDocsToFirebase();
	// 				});
	// 			}
	// 		});
	// 	}
	// }

  // async saveDocsToFirebase() {
  //   this.dataService.readInfo().then((info:any) => {
  //     let ancestor = info.id;
	// 		let language = this.languageService.getLanguage();
	// 		this.fbService.saveDocsData(ancestor, language, this.newData).then((status:any) => {
	// 			this.utilService.dismissLoading();
	// 			let message = this.utilService.getAlertMessage([
	// 				{name: 'msg', label: 'DOC_MESSAGE'},
	// 			]);
	// 			this.utilService.presentToast(message, 3000);
	// 		});
	// 	})
  // }
}
