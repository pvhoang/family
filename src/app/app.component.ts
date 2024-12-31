import { Component, OnInit, ViewChild  } from '@angular/core';
// import { Platform } from '@ionic/angular';
import { Capacitor } from "@capacitor/core";
import { environment, FONTS_FOLDER, DEBUGS, DRAGON, VILLAGE, TREE, COUNTRY, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../environments/environment';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { HtmlService } from './services/html.service';
import { ThemeService } from './services/theme.service';
import { FcmService } from './services/fcm.service';
import { LanguageService } from './services/language.service';
import { NodeService } from './services/node.service';
import { FamilyService } from './services/family.service';
import { FirebaseService } from './services/firebase.service';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

const ANCESTOR = 'phan';
const THEME = 'theme';
const LANGUAGE = 'language';
const SIZE = 'size';
const VIETNAMESE = 'vi';
const ENGLISH = 'en';

const VIEW_MODE = 'view';
const EDIT_MODE = 'edit';

// admin
// const ADMIN_CODE = '1234';
// user
const OPTION_SETTING = 'doi'
const OPTION_DELETE = 'xoa';
// debug/FCM,HOME,SEARCH
const OPTION_DEBUG = 'debug';
// 1234/debug/FILER

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
    // public platform: Platform,
    private dataService: DataService,
    private utilService: UtilService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private nodeService: NodeService,
    private familyService: FamilyService,
    private fbService: FirebaseService,
    private htmlService: HtmlService,
    private fcm: FcmService,
  ) {
    if (DEBUGS.APP)
      console.log('AppComponent - constructor');
  }

  async ngOnInit(): Promise<any> {
		
    // get URL
    let strings = window.location.href.split(window.location.host);
    let url = strings[strings.length-1];
		let dat = url.split('/');
		let ancestor = ANCESTOR;
		// url must have format: '/option'
		let option = dat[1];
		this.url = url;

		// debug/FCM,HOME,SEARCH
		// 1234/debug/FILER,FCM
		let debugCodes = '';
		if (dat.length == 3 && (dat[1] == 'debug'))
			debugCodes = dat[2];
		else if (dat.length == 4 && (dat[2] == 'debug'))
			debugCodes = dat[3];
		debugCodes.split(',').forEach (code => {
			DEBUGS[code] = true;
		})

		if (DEBUGS.APP)
			console.log('AppComponent - ngOnInit - url, dat, ancestor, option: ', url, dat, ancestor, option);

		// setup UI
		this.initializeUI().then((status) => {
			// internet must be available before start up
			this.checkNetworkStatus().then(networkStatus => {
				if (networkStatus == false) {
					this.presentToast(['APP_NO_INTERNET']);
					return;
				}
			});

			if (ancestor !== ANCESTOR) {
				this.presentToast(['APP_NO_ANCESTOR_1','APP_NO_ANCESTOR_2', 'APP_SUPER_ADMIN']);
				return;
			}

			// ancestor must be valid before doing anything else
			// this.startAncestor(ancestor).then((rdata: any) => {
			this.getLocalRdata(ancestor).then((rdata: any) => {
				if (!rdata) {
					this.presentToast(['APP_NA_ANCESTOR_1', ancestor, 'APP_NA_ANCESTOR_2', 'APP_NA_ANCESTOR_3', 'APP_SUPER_ADMIN']);
					return;
				}
				if (DEBUGS.APP)
					console.log('rdata: ', rdata);

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
				else if (option == OPTION_DEBUG) 
					this.initializeApp(rdata);
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
		// Capacitor.getPlatform(): web, android, ios
    environment.android = (Capacitor.getPlatform() === 'android');
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
  
	private startAncestor(ancestorID: any) {
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
			rdata.docs = rdata.docs[this.language];
			// save to local
			this.dataService.saveAncestorData(rdata).then((status:any) => {
				resolve(true);
			});
		});
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

	private getLocalRdata(ancestor: any) {
    return new Promise((resolve) => {
			let rdata:any = {};
      this.utilService.getLocalJsonFile('./assets/json/phan-docs.json').then((docs:any) => {
				rdata.docs = docs;
				this.utilService.getLocalJsonFile('./assets/json/phan-family.json').then((family:any) => {
					rdata.family = family;
					this.utilService.getLocalJsonFile('./assets/json/phan-info.json').then((info:any) => {
						rdata.info = info;
						this.utilService.getLocalJsonFile('./assets/json/phan-images.json').then((images:any) => {
							rdata.images = images;
							resolve(rdata);
						})
					})
				})
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
}