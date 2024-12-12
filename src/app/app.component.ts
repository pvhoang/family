import { Component, OnInit,  } from '@angular/core';
import { Platform } from '@ionic/angular';
<<<<<<< Updated upstream
import { environment, DEBUG} from '../environments/environment';
=======
import { environment, FONTS_FOLDER, DEBUGS, DRAGON, VILLAGE, TREE, COUNTRY, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../environments/environment';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { EditorService } from './services/editor.service';
import { ThemeService } from './services/theme.service';
import { FcmService } from './services/fcm.service';
import { LanguageService } from './services/language.service';
import { NodeService } from './services/node.service';
import { FamilyService } from './services/family.service';
import { FirebaseService } from './services/firebase.service';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

const THEME = 'theme';
const LANGUAGE = 'language';
const SIZE = 'size';
const VIETNAMESE = 'vi';
const ENGLISH = 'en';

const VIEW_MODE = 'view';
const EDIT_MODE = 'edit';

// superadmin
const URL_CREATE_ANCESTOR = '/s_create';
const URL_DELETE_ANCESTOR = '/s_delete';
// ancestor
const URL_PHAN_ANCESTOR = '/phan';
// admin
const ADMIN_CODE = '1234';
// user
const OPTION_SETTING = 'doi'
const OPTION_DELETE = 'xoa';
>>>>>>> Stashed changes

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  ancestor:any = '';

  constructor(
    public platform: Platform,
<<<<<<< Updated upstream
=======
    private dataService: DataService,
    private utilService: UtilService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private nodeService: NodeService,
    private familyService: FamilyService,
    private fbService: FirebaseService,
    private editorService: EditorService,
    private fcm: FcmService,
>>>>>>> Stashed changes
  ) {
    if (DEBUG)
      console.log('AppComponent - constructor');
    this.initializeApp();
  }

  async ngOnInit(): Promise<any> {

    if (DEBUG)
      console.log('AppComponent - ngOnInit');

    let strings = window.location.href.split(window.location.host);
    let url = strings[strings.length-1];
<<<<<<< Updated upstream
    if (DEBUG)
      console.log('AppComponent - url2: ', url);
    let params = url.split('/');
    this.ancestor = params[1];
  }

  initializeApp() {
    environment.phabletDevice = this.platform.is('phablet');
  }
=======
		let dat = url.split('/');
		if (DEBUGS.APP)
			console.log('AppComponent - ngOnInit - url, dat: ', url, dat);
		// url must have format: '/ancestor/option'
		let ancestor = dat[1];
		let option = (dat.length > 2) ? dat[2] : '';
		this.url = url;

		// setup UI
		this.initializeUI().then((status) => {

			// internet must be available before start up
			this.checkNetworkStatus().then(networkStatus => {
				if (networkStatus == false) {
					this.presentToast(['APP_NO_INTERNET']);
					return;
				}
			});

		// --- superadmin tasks

			if (url == URL_CREATE_ANCESTOR) {
				this.createAncestor();
				return;
			} else if (url == URL_DELETE_ANCESTOR) {
				this.deleteAncestor();
				return;
			} 
			
			if (ancestor == '') {
				this.presentToast(['APP_NO_ANCESTOR_1','APP_NO_ANCESTOR_2', 'APP_SUPER_ADMIN']);
				return;
			}

			// ancestor must be valid before doing anything else
			this.startAncestor(ancestor).then((rdata: any) => {
				if (!rdata) {
					this.presentToast(['APP_NA_ANCESTOR_1', ancestor, 'APP_NA_ANCESTOR_2', 'APP_NA_ANCESTOR_3', 'APP_SUPER_ADMIN']);
					return;
				}
				let info = rdata.info;
				let email = info.admin_name + ' (' + info.admin_email + ')';

				// --- admin tasks
				if (option == info.admin_code) {
					this.mode = EDIT_MODE;
					this.startUp = false;
					this.startApp = true;
					this.initializeApp(rdata);

				// --- user tasks
				} else if (option == OPTION_DELETE)
					this.deleteLocal();
				else if (option == OPTION_SETTING)
					this.setSetting();
				else if (option == '')
					this.initializeApp(rdata);
				else {
					// token registration for notification
					// this option is recipient, http://localhost:8102/phan/hoang
					let recipient = option;
					this.fcm.getRecipientData(ancestor, recipient).then((recData:any) => {
						console.log('getRecipientData: ', recData, recipient);
						if (!recData) {
							// recipient is not valid, notifications/recipients/id
							this.presentToast(['APP_NA_OPTION_1', recipient, 'APP_NA_OPTION_2', 'APP_NA_OPTION_3', email]);
						} else {
							this.fcm.requestPermissions(ancestor, recipient, recData).then((status:any) => {
								this.presentToast([status]);
							});
						}
					})
				}
			});
		});
  }

	// https://programatically.com/how-to-detect-internet-connection-status-in-angular-13
	checkNetworkStatus() {
		return new Promise((resolve) => {
			this.networkStatus = navigator.onLine;
			this.networkStatus$ = merge(
				of(null),
				fromEvent(window, 'online'),
				fromEvent(window, 'offline')
			)
			.pipe(map(() => navigator.onLine))
			.subscribe(status => {
				this.networkStatus = status;
				resolve (status);
			});
		})
	}

	initializeUI() {
		return new Promise((resolve) => {
			this.dataService.readItem(THEME).then((theme:any) => {
        if (!theme)
					theme = DRAGON;
					// theme = TREE;
				this.theme = theme;
				this.dataService.readItem(LANGUAGE).then((language:any) => {
					if (!language)
							language = VIETNAMESE;
					else
						this.languageService.setLanguage(language);
					this.language = language;
					
					this.dataService.readItem(SIZE).then((size:any) => {
						if (!size)
								size = MEDIUM_SIZE;
						this.size = size;
						size = MEDIUM_SIZE;
						if (DEBUGS.APP)
							console.log('initializeUI - theme, language, size: ', this.theme, this.language, this.size);

						// now read language translation table, theme table, and set system properties
						let langFile = './assets/i18n/' + language + '.json';
						let themeFile = './assets/common/' + theme + '/themes.json';
						this.utilService.getLocalJsonFile(langFile).then((lang:any) => {
							this.langTable = lang;
							this.utilService.getLocalJsonFile(themeFile).then((themes:any) => {
								this.themeService.setSystemProperties(themes, theme, size);
								resolve(true);
							});
						});
					});
				});
			});
		});
	}

  initializeApp(rdata: any) {
    // let str = this.platform.platforms().toString();
    // PLATFORM STR
    // localhost: mobile, mobileweb
    // pwa: tablet, mobile, mobileweb
    // android: android, phablet, pwa, mobile, mobileweb
    // ios: iphone, ios, phablet, mobile, mobileweb

    environment.android = this.platform.is('android');
      this.updateAppData(rdata).then(status => {
				if (DEBUGS.APP)
					console.log('initializeApp - status, mode: ', status, this.mode);
				if (status) {
					this.splashTitle = this.translate_instant('APP_FAMILY_TREE');
					if (this.mode == EDIT_MODE)
						this.startUp = true;
					else
						this.startApp = true;
				}
				this.fcm.initPush();
			});
    // });
  }

  onSplashComplete(event: any) {
    this.startApp = true;
  }

  deleteLocal() {
    this.dataService.deleteItem('ANCESTOR_DATA').then(status => {
      this.dataService.deleteItem('LANGUAGE').then(stat => {});
      this.dataService.deleteItem('THEME').then(stat => {});
      this.dataService.deleteItem('VERSION').then(stat => {});
      this.presentToast(['APP_LOCAL_MEMORY_DELETED']);
    });
  }

	async setSetting() {
		let title = this.translate_instant('APP_SETTING');
    let cancel = this.translate_instant('CANCEL');
    let ok = this.translate_instant('OK');
    let selects = [
      {   id: THEME,
					value: this.theme,
					label: this.translate_instant('APP_THEME'),
					placeholder: this.translate_instant('APP_THEME'),
					items: [
						{ label: this.translate_instant('APP_THEME_DRAGON'), value: DRAGON },
						{ label: this.translate_instant('APP_THEME_VILLAGE'), value: VILLAGE },
						{ label: this.translate_instant('APP_THEME_TREE'), value: TREE },
						{ label: this.translate_instant('APP_THEME_COUNTRY'), value: COUNTRY },
					]
      },
			{   id: LANGUAGE,
					value: this.language,
					label: this.translate_instant('APP_LANGUAGE'),
					placeholder: this.translate_instant('APP_LANGUAGE'),
					items: [
						{ label: this.translate_instant('APP_LANGUAGE_VIETNAMESE'), value: VIETNAMESE },
						{ label:  this.translate_instant('APP_LANGUAGE_ENGLISH'), value: ENGLISH },
					]
      },
			{   id: SIZE,
					value: this.size,
					label: this.translate_instant('APP_SIZE'),
					placeholder: this.translate_instant('APP_SIZE'),
					items: [
						{ label: this.translate_instant('APP_SMALL_SIZE'), value: SMALL_SIZE },
						{ label: this.translate_instant('APP_MEDIUM_SIZE'), value: MEDIUM_SIZE },
						{ label: this.translate_instant('APP_LARGE_SIZE'), value: LARGE_SIZE },
					]
      }
    ]
    this.utilService.alertSelect(title, selects , cancel, ok).then((result:any) => {
      if (result.data) {
				if (result.data.status == 'save') {
					let values = result.data.values;
					let count = 0;
					if (values[THEME] && values[THEME] != this.theme) {
						this.dataService.saveItem(THEME, values[THEME]).then((status:any) => {});
						count++;
					}
					if (values[LANGUAGE] && values[LANGUAGE] != this.language) {
						this.dataService.saveItem(LANGUAGE, values[LANGUAGE]).then((status:any) => {});
						count++;
					}
					if (values[SIZE] && values[SIZE] != this.size) {
						this.dataService.saveItem(SIZE, values[SIZE]).then((status:any) => {});
						count++;
					}
					if (count > 0)
						this.presentToast(['APP_NEW_SETTING']);
					else
						this.presentToast(['APP_SAME_SETTING']);
				} else {
					this.presentToast(['APP_SAME_SETTING']);
				}
      }
    })
  }
  
  createAncestor() {
    let title = this.translate_instant('APP_NEW_ANCESTOR');
    let cancel = this.translate_instant('CANCEL');
    let ok = this.translate_instant('OK');

    let inputs = [
			// type =  "text", "password", "email", "number", "search", "tel", "url", 'checkbox' | 'radio' | 'textarea';
			{  
				type: 'text',
				value: 'phan',
				placeholder: this.translate_instant('APP_ANCESTOR_ID'),
				attributes: { maxlength: 6 },
      },
      {   
				type: 'text',
				value: 'Phan Tộc',
				placeholder: this.translate_instant('APP_ANCESTOR_NAME'),
				attributes: { maxlength: 20 },
      },
      {  
				type: 'text',
				value: 'Đồng Hới, Quảng Bình',
				placeholder: this.translate_instant('APP_ANCESTOR_LOCATION'),
				attributes: { maxlength: 30 },
      },
      {   
				type: 'text',
				value: 'Phan',
				placeholder: this.translate_instant('APP_ANCESTOR_FAMILY_NAME'),
				attributes: { maxlength: 30 },
      },
      {   
				type: 'text',
				value: 'Phan Lợi Hành',
				placeholder: this.translate_instant('APP_ANCESTOR_ROOT_NAME'),
				attributes: { maxlength: 25 },
      },
      {   
				type: 'number',
				value: '1900',
				placeholder: this.translate_instant('APP_ANCESTOR_ROOT_YEAR'),
				attributes: { maxlength: 4 },
      },
			{   
				type: 'text',
				value: 'Phan Viết Hoàng',
				placeholder: this.translate_instant('APP_ANCESTOR_ADMIN_NAME'),
				attributes: { maxlength: 25 },
      },
			{   
				type: 'text',
				value: 'Viber 0903 592 592',
				placeholder: this.translate_instant('APP_ANCESTOR_ADMIN_EMAIL'),
				attributes: { maxlength: 30 },
      },
			{   
				type: 'number',
				value: '1234',
				placeholder: this.translate_instant('APP_ANCESTOR_ADMIN_CODE'),
				attributes: { maxlength: 4 },
      },
    ]
    this.utilService.alertText(title, inputs , cancel, ok,  { width: 350, height: 500 }).then(result => {
      if (result.data) {
				// validate id
				const ancestor = result.data[0];
				if (ancestor == '') {
					let heading = this.translate_instant('ERROR');
					let msg = this.translate_instant('APP_ANCESTOR_ID_NOT_EMPTY');
					this.utilService.alertMsg(heading, msg, 'OK', { width: 350, height: 200 }).then(stat => {});
					return;
				} else {
					this.fbService.getAncestor(ancestor).then((data:any) => {
						if (data) {
							let heading = this.translate_instant('ERROR');
							// already exist, can not add
							this.presentToast(['APP_ANCESTOR_ID_EXIST_1', ancestor, 'APP_ANCESTOR_ID_EXIST_2']);
						} else {
							this.createBaseAncestor(result.data).then((rdata:any) => {
								console.log('AppComponent - createAncestor - rdata: ', rdata);
								this.fbService.saveAncestorData(rdata).then((status:any) => {
									this.presentToast(['APP_OK_ANCESTOR', rdata.info.id]);
								});
							});
						}
					})
				}
      }
    })
  }

	deleteAncestor() {
		this.fbService.getAncestors().then((ancestors:any) => {
			if (DEBUGS.APP)
				console.log('AppComponent - deleteAncestor - ancestors: ', ancestors);
			let inputs = [];
			ancestors.forEach((ancestor: any) => {
				if (ancestor.info) {
					let info = JSON.parse(ancestor.info);
					let label = info.name + ' (' + info.id + ')';
					inputs.push({ type: 'radio', label: label, value: info.id, checked: false })
				}
			})
			let heading = this.translate_instant('APP_DELETE_ANCESTOR');
			this.utilService.alertRadio(heading, '', inputs , this.translate_instant('CANCEL'), this.translate_instant('OK')).then(result => {
				if (result.data) {
					let ancestorID = result.data;
					let heading = this.translate_instant('APP_DELETE_ANCESTOR');
					this.utilService.alertConfirm(heading, ancestorID, 'CANCEL', 'OK').then((res) => {
						if (res.data) {
							this.fbService.deleteAncestor(ancestorID).then(() => {
								this.presentToast(['APP_DELETE_ANCESTOR_1', ancestorID, 'APP_DELETE_ANCESTOR_2']);
							});
						}
					});
				}
			});
		});
  }

	private createBaseAncestor(data: any) {

		return new Promise((resolve) => {
			this.utilService.getLocalJsonFile('./assets/common/info-template.json').then((info:any) => {
			this.utilService.getLocalJsonFile('./assets/common/docs-template.json').then((docs:any) => {
			this.utilService.getLocalJsonFile('./assets/common/family-template.json').then((family:any) => {

				info.id = data[0];
				info.name = data[1];
				info.location = data[2];
				info.family_name = data[3];
				info.root_name = data[4];
				info.root_year = data[5];
				info.admin_name = data[6];
				info.admin_email = data[7];
				info.admin_code = data[8];

				family.date = this.utilService.getShortDateID('/');
				family.nodes[0].name = info.root_name;
				family.nodes[0].gender = "male";
				family.nodes[0].yob = info.root_year;

				let rdata = {
					"info": info,
					"branch": {}, 
					"images": {}, 
					"docs": docs, 
					"family": family
				}
				resolve (rdata);
			});
			});
			});
		});
  }

private startAncestor(ancestorID: any) {
	// if (DEBUGS.APP)
	// 	console.trace("ancestorID: ", ancestorID);

	return new Promise((resolve) => {
		this.fbService.getAncestor(ancestorID).then((data:any) => {
			if (!data) {
				// ancestorID not exist!
				resolve (false);
			} else {
				this.fbService.readAncestorData(ancestorID).subscribe((rdata:any) => {
						resolve (rdata);
				});
			}
		})
		.catch((error: any) => {
			console.log('AppComponent - startAncestor - error: ', error);
			resolve (false);
		})
	});
	}

	async validateAncestor(ancestorID: any) {
		return new Promise((resolve) => {
			this.fbService.getAncestor(ancestorID).then((data:any) => {
				resolve (data ? true : false);
			})
			.catch((error: any) => {
				console.log('AppComponent - validateAncestor - error: ', error);
				resolve (false);
			})
		});
	}

	updateAppData(rdata: any) {
    return new Promise((resolve) => {

			this.setJsonData('places').then((stat2:any) => {});
			this.setJsonData('names').then((stat3:any) => {});
			let family = rdata.family;
			
			// update screen height
			let nodes = this.nodeService.getFamilyNodes(family);
			this.themeService.setScreenSize(nodes);
			if (!rdata.images)
				rdata.images = {};
			rdata.docs = this.updateDocs(rdata.images, rdata.docs[this.language]);

			// save to local
			this.dataService.saveAncestorData(rdata).then((status:any) => {
				resolve(true);
			});
		});
  }

	updateDocs(images: any, docs: any) {
		// if (DEBUGS.APP)
		// 	console.log('AppComponent - updateDocs - docs: ', docs);
		// if (DEBUGS.APP)
		// 	console.log('AppComponent - updateDocs - images: ', images);

		// create text from desc, if necessary
		for (var key of Object.keys(docs)) {
			let doc = docs[key];
			if (doc.text) {
				// do nothing
			} else if (doc.desc && Array.isArray(doc.desc)) {
				// desc is array, convert to html
				doc.text = this.editorService.convertArrayToHtml(images, doc.desc);
				// if (key == 'pha_he')
				// 	this.testDoc(images);
				doc.desc = null;
			} else {
				doc.text = '';
			}
			doc.html = doc.text.slice(0);
			docs[key] = doc;
		};
		return docs;
	}
	
	private testDoc(images: any) {

		// const keywords = {
		// 	'[[START-POPUP]]': '[[END-POPUP]]',
		// 	'[[VIEW-NODES]]': '',
		// 	'[[SEARCH-NODES]]': '',
		// };

		// let desc = [
		// 	"",
		// 	"[[START-POPUP]]",
		// 	"Tài liệu phả ký",
		// 	"[CONTENT]",
		// 	"im|ac|2|Bài vị Thủy Tổ.jpg|Bài vị Thủy Tổ, Nhà thờ Phan Tộc",
		// 	"[[END-POPUP]]",
		// 	"[[VIEW-NODES]]",
		// 	"[[SEARCH-NODES]]"
		// ]

		let desc = [
			"",
			"[[VIEW-NODES]]",
			"[[SEARCH-NODES]]"
		]

		let htmls = [];

			// 		htmls.push( {html: srcHtml.substring(i1, i2)} );

		let html = this.editorService.convertArrayToHtml(images, desc);
		console.log('desc: ', desc);
		console.log('html: ', html);
		let dataOK = true;
		let i1 = 0;

		for (; i1 < html.length && dataOK;) {
			// search for [[
			let i2 = html.indexOf('[[', i1);
			if (i2 > i1) {
				// found it, search for ]]
				let i3 = html.indexOf(']]', i2);
				if (i3 > i2) {
					// found the keyword
					let keyword = html.substring(i2+2, i3);
					console.log('keyword: ', keyword);
					
					let html1 = html.substring(i1, i2);
					htmls.push({ html: html1 });

					i3 += 2;
					if (keyword == 'START-POPUP') {
						// search for END-POPUP
						let i4 = html.indexOf('[[END-POPUP]]', i3);
						if (i4 > i3) {
							htmls.push( {popupHtml: html.substring(i3, i4) });
							i1 = i4 + '[[END-POPUP]]'.length
						}
					} else {
						let k = '';
						if (keyword == 'VIEW-NODES') k = 'viewNodeHtml';
						if (keyword == 'SEARCH-NODES') k = 'searchNodeHtml';
						if (keyword == 'VIEW-ROOT') k = 'viewRootHtml';
						if (keyword == 'VIEW-TREE') k = 'viewTreeHtml';
						htmls.push({ [k]: keyword });
						i1 = i3;
					}
				} else {
					dataOK = false
					// wrong data, break
					// html = html.substring(i1);
					// htmls.push({ html: html });
					// break;
				}
			} else {
				dataOK = false
				// wrong data, break
				// html = html.substring(i1);
				// htmls.push({ html: html });
				// break;
			}

		}
		if (!dataOK) {
			htmls.push({ html: html.substring(i1) });
		}
		// html = html.substring(i1);
		// htmls.push({ html: html });
				// break;

		console.log('htmls: ', htmls);

			// for (var key of Object.keys(keywords)) {
			// 	let i2 = html.indexOf(key, i1);
			// 	if (i2 > i1) {
			// 		//
			// 	}
			// }


			// let i2 = srcHtml.indexOf('[START-POPUP]', i1);
			// if (i2 >= i1) {
			// 	if (i2 > i1)
			// 		htmls.push( {html: srcHtml.substring(i1, i2)} );
			// 	let i3 = srcHtml.indexOf('[END-POPUP]', i2);
			// 	if (i3 > i2) {
			// 		// found the popup html
			// 		let popupHtml = srcHtml.substring(i2 + '[START-POPUP]'.length, i3);
			// 		htmls.push( {popupHtml: popupHtml });
			// 		i1 = i3 + '[END-POPUP]'.length;
			// 	} else {
			// 		// final
			// 		let html = srcHtml.substring(i2);
			// 		htmls.push({ html: html });
			// 		break;
			// 	}
			// } else {
			// 	let html = srcHtml.substring(i1);
			// 	htmls.push({ html: html });
			// 	break;
			// }
		// return htmls;
// [SEARCH-NODES]		Tìm hệ
// [VIEW-TREE]				Xem phả đồ theo Đời-Chi-Phái-Nhánh
// [VIEW-ROOT]				Xem phả đồ theo Tổ phụ

	}

	private setJsonData(json: string) {
    return new Promise((resolve) => {
      let jsonFile = './assets/common/' + json + '.json';
      this.utilService.getLocalJsonFile(jsonFile).then((jsonData:any) => {
				this.dataService.saveItem(json, jsonData).then((status:any) => {});
        resolve(true);
      });
    });
	}

  presentToast(keys: any) {
    let msgs = [];
		keys.forEach((key:any) => {
			let item = {};
			let msg = this.translate_instant(key);
			if (!msg) {
				// key is not translatable
				item = {name: 'data', label: '&emsp;' + key};
			} else {
				// key is translatable
				item = {name: 'msg', label: msg};
			}
			msgs.push(item);
		})
    let message = this.utilService.getAlertMessage(msgs, true);
		this.utilService.presentToastWait(null, message, 'OK', 10000);
  }

	translate_instant(key:any) {
		return this.langTable[key];
	}
>>>>>>> Stashed changes
}