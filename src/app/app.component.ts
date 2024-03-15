import { Component, OnInit, ViewChild  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment, FONTS_FOLDER, DEBUGS, DRAGON, VILLAGE, TREE, COUNTRY, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../environments/environment';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { EditorService } from './services/editor.service';
import { ThemeService } from './services/theme.service';
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
// user
const OPTION_SETTING = 'doi'
const OPTION_DELETE = 'xoa';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  url:any = '';
  mode:any = VIEW_MODE;
  startUp:any = false;
  startApp:any = false;
	fileUrl: any;
	fileName: any;
	theme: any;
	language: any;
	langTable: any;
	size: any;
	splashTitle: any;
	email: any;
	networkStatus: boolean = false;
	networkStatus$: Subscription = Subscription.EMPTY;

	@ViewChild('popover') popover: any;
	isOpen = false;

  constructor(
    public platform: Platform,
    private dataService: DataService,
    private utilService: UtilService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private nodeService: NodeService,
    private familyService: FamilyService,
    private fbService: FirebaseService,
    private editorService: EditorService,
  ) {
    if (DEBUGS.APP)
      console.log('AppComponent - constructor');
  }

  async ngOnInit(): Promise<any> {
		
    // get URL
    let strings = window.location.href.split(window.location.host);
    let url = strings[strings.length-1];
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
				else
					this.presentToast(['APP_NA_OPTION_1', option, 'APP_NA_OPTION_2', 'APP_NA_OPTION_3', this.email]);
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
				this.theme = theme;
				this.dataService.readItem(LANGUAGE).then((language:any) => {
					if (!language)
							language = VIETNAMESE;
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
							this.utilService.getLocalJsonFile(themeFile).then((themes:any) => {
								this.langTable = lang;
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
    // this.updateVersionData(rdata).then(stat => {
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
		// this.utilService.printVariable('before alertSelect', '--app-text-font-size-medium');
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
		// type =  "text", "password", "email", "number", "search", "tel", "url", 'checkbox' | 'radio' | 'textarea';

    let inputs = [
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
	if (DEBUGS.APP)
		console.trace("ancestorID: ", ancestorID);
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

  loadLanguage() {
    return new Promise((resolve) => {
      this.dataService.readItem(LANGUAGE).then((language:any) => {
        if (!language) {
          language = VIETNAMESE;
          this.dataService.saveItem(LANGUAGE, 'vi').then((status:any) => {});
        }
        this.languageService.setLanguage(language);
        resolve (language);
      });
    })
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
			let language = this.languageService.getLanguage();
			rdata.docs = this.updateDocs(rdata.images, rdata.docs[language]);

			// save to local
			this.dataService.saveAncestorData(rdata).then((status:any) => {
				resolve(true);
			});
		});
  }

	updateDocs(images: any, docs: any) {
		if (DEBUGS.APP)
			console.log('AppComponent - updateDocs - docs: ', docs);

		// create text from raw, if necessary
		for (var key of Object.keys(docs)) {
			let doc = docs[key];
			if (doc.text) {
				// do nothing
			} else if (doc.raw && Array.isArray(doc.raw)) {
				// raw is array, convert to html
				doc.text = this.editorService.convertArrayToHtml(images, doc.raw);
				doc.raw = null;
			} else {
				doc.text = '';
			}
			doc.html = doc.text.slice(0);
			docs[key] = doc;
		};
		return docs;
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
			if (msg == key) {
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
}