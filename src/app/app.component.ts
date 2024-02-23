import { Component, OnInit, ViewChild  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { environment, FONTS_FOLDER, DEBUGS, DRAGON, VILLAGE, TREE, COUNTRY, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../environments/environment';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { EditorService } from './services/editor.service';
import { ThemeService } from './services/theme.service';
import { LanguageService } from './services/language.service';
import { TranslateService } from "@ngx-translate/core";
import { NodeService } from './services/node.service';
import { FamilyService } from './services/family.service';
import { FirebaseService } from './services/firebase.service';

const THEME = 'theme';
const LANGUAGE = 'language';
const SIZE = 'size';
const VIETNAMESE = 'vi';
const ENGLISH = 'en';

const VIEW_MODE = 'view';
const EDIT_MODE = 'edit';

// superadmin
const URL_DELETE_OPEN = '/sopen';
const URL_DELETE_NEW = '/snew';
// admin
const URL_UPDATE_VERSION = 'aupdate';
const URL_EDIT = 'aedit';				// no slash !important
// user
const URL_SETTING = 'uset'
const URL_DELETE = 'udelete';

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
	size: any;
	splashTitle: any;
	email: any;

	@ViewChild('popover') popover: any;
	isOpen = false;

  constructor(
    public platform: Platform,
    private dataService: DataService,
    private utilService: UtilService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translate: TranslateService,
    private nodeService: NodeService,
    private familyService: FamilyService,
    private fbService: FirebaseService,
    private editorService: EditorService,
		private sanitizer: DomSanitizer,
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

		if (url == URL_DELETE_OPEN)
			this.deleteOpen(true);
		else if (url == URL_DELETE_NEW)
			this.deleteOpen(false);
		
		// setup UI
		this.initializeUI().then((status) => {
			if (ancestor == '') {
				let superAdmin = this.translate_instant("APP_SUPER_ADMIN");
				this.presentToast(['APP_NO_ANCESTOR_1','APP_NO_ANCESTOR_2',superAdmin]);
				return;
			} 
			// ancestor must be valid before doing anything else
			this.startAncestor(ancestor).then((stat) => {
				if (!stat) {
					let superAdmin = this.translate_instant("APP_SUPER_ADMIN");
					this.presentToast(['APP_NA_ANCESTOR_1', ancestor, 'APP_NA_ANCESTOR_2', 'APP_NA_ANCESTOR_3', superAdmin]);
					return;
				}
				if (option == URL_DELETE)
					this.deleteLocal();
				else if (option == URL_UPDATE_VERSION)
					this.updateVersion();
				else if (option == URL_SETTING)
					// this.createAncestor();
					this.setSetting();
				else if (option == '' || option == URL_EDIT) {
					if (option == URL_EDIT)
						this.mode = EDIT_MODE;
					this.initializeApp();
				} else {
					this.presentToast(['APP_NA_OPTION_1', option, 'APP_NA_OPTION_2', 'APP_NA_OPTION_3', this.email]);
				}
			});
		});
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
							console.log('initializeUI - theme, language, size: ', this.theme, this.language, this.size)
						// now read theme constants and set system properties
						let jsonFile = './assets/common/themes.json';
						this.utilService.getLocalJsonFile(jsonFile).then((themes:any) => {
							this.themeService.setSystemProperties(themes, theme, size);
							resolve(true);
						});
					});
				});
			});
		});
	}

  initializeApp() {
    // let str = this.platform.platforms().toString();
    // PLATFORM STR
    // localhost: mobile, mobileweb
    // pwa: tablet, mobile, mobileweb
    // android: android, phablet, pwa, mobile, mobileweb
    // ios: iphone, ios, phablet, mobile, mobileweb
    environment.android = this.platform.is('android');
    this.updateVersionData().then(stat => {
      this.updateAppData().then(status => {
				if (status) {
					this.splashTitle = this.translate_instant('APP_FAMILY_TREE');
					if (this.mode == EDIT_MODE)
						this.startUp = true;
					else
						this.startApp = true;
					// if (DEBUGS.APP)
					// 	console.trace("startUp, startApp: ", this.startUp, this.startApp);
				}
			});
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

  updateVersion() {
    let data = { version: environment.version };
    this.fbService.saveAppData(data).then((status:any) => {
      this.presentToast(['APP_NEW_VERSION_IS_UPDATED', environment.version]);
    });
  }
	
  deleteOpen (open: boolean) {
    this.dataService.deleteItem('ANCESTOR_DATA').then(status => {
      if (open)
        this.selectAncestors();
      else
        this.createAncestor();
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
    let title = this.translate_instant('APP_ANCESTOR');
    let cancel = this.translate_instant('CANCEL');
    let ok = this.translate_instant('OK');

    let inputs = [
      {   placeholder: this.translate_instant('APP_ANCESTOR_NAME'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.translate_instant('APP_ANCESTOR_LOCATION'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.translate_instant('APP_ANCESTOR_DESCRIPTION'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.translate_instant('APP_ANCESTOR_ROOT_NAME'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.translate_instant('APP_ANCESTOR_ROOT_YEAR'),
          attributes: { maxlength: 30 },
      },
    ]
    this.utilService.alertText(title, inputs , cancel, ok, 'alert-dialog').then(result => {
      if (result.data) {
        // create an ancestor
        let data = this.createBaseAncestor(result.data);
        this.fbService.saveAncestorData(data).then((status:any) => {
          this.dataService.saveItem('ANCESTOR_DATA', data).then((status:any) => {
            this.presentToast(['APP_OK_ANCESTOR', data.info.id]);
          });
        });
      } else {
        this.presentToast(['APP_NO_ANCESTOR']);
      }
    })
  }

  selectAncestors() {
    this.dataService.readItem('ANCESTOR_DATA').then((sdata:any) => {
      this.fbService.getAncestors().subscribe((ancestors:any) => {
        if (DEBUGS.APP)
          console.log('AppComponent - selectAncestor - ancestors: ', ancestors);
        let inputs = [];
        ancestors.forEach((ancestor: any) => {
          if (ancestor.info) {
            let info = JSON.parse(ancestor.info);
            let label = info.name + ' (' + info.id + ')';
            let checked = (sdata && info.id == sdata.info.id);
            inputs.push({ type: 'radio', label: label, value: info.id, checked: checked })
          }
        })
        this.utilService.alertRadio('ANCESTOR', '', inputs , this.translate_instant('CANCEL'), this.translate_instant('OK')).then(result => {
          if (result.data) {
            let ancestorID = result.data;
            this.setAncestor(ancestorID).then(resolve => {
              this.presentToast(['APP_NEW_ANCESTOR_1', ancestorID, 'APP_NEW_ANCESTOR_2']);
            });
          }
        });
      });
    });
  }

  private startAncestor(ancestorID: any) {
		// if (DEBUGS.APP)
		// 	console.trace("ancestorID: ", ancestorID);

    return new Promise((resolve) => {
			// check if this ancestor is in local
			this.dataService.readItem('ANCESTOR_DATA').then((sdata:any) => {
				if (!sdata || sdata.info.id != ancestorID) {
					// no local data or different ancestor, check if it is in server
					this.validateAncestor(ancestorID).then((status:any) => {
						if (!status) {
							// not exist, error
							resolve (false);
						} else {
							// read from server and save to local
							// this is new login, show 'Welcome message'
							this.fbService.readAncestorData(ancestorID).subscribe((rdata:any) => {
								this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
									this.email = rdata.info.admin_name + ' (' + rdata.info.admin_email + ')';
									// let msg1 = this.translate_instant('APP_WELCOME_FAMILY_1') + '<b>' + ancestorID + '</b><br/>';
									// let msg2 = this.translate_instant('APP_WELCOME_FAMILY_2') + '<b>' + this.email + '<br>';
									this.presentToast(['APP_WELCOME_FAMILY_1', ancestorID, 'APP_WELCOME_FAMILY_2', this.email]);
									// this.presentToast([msg1, msg2]);
									resolve (true);
								});
							});
						}
					});

				} else if (sdata && sdata.info.id == ancestorID) {
					// update data from server
					// check on family data version
					this.email = sdata.info.admin_name + '(' + sdata.info.admin_email + ')';
					let fversion = sdata.family.version;
					// now check remote version
					this.fbService.readAncestorData(sdata.info.id).subscribe((rdata:any) => {
						let rversion = rdata.family.version;
						if (rversion != fversion) {
							this.presentToast(['APP_NEW_FAMILY', rversion]);
							// check for new nodes
							this.compareFamilyVersion(sdata.family, rdata.family);
							this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
								resolve (true);
							});
						}
						resolve(true);
					});
					resolve(true);
				}
			});
		});
	}

	async validateAncestor(ancestorID: any) {
    return new Promise((resolve) => {
      this.fbService.getAncestors().subscribe((ancestors:any) => {
        if (DEBUGS.APP)
          console.log('AppComponent - selectAncestor - ancestors: ', ancestors);
        ancestors.forEach((ancestor: any) => {
          if (ancestor.info) {
            let info = JSON.parse(ancestor.info);
            if (info.id == ancestorID)
              resolve(true);
          }
        })
        resolve (false);
      });
    });
  }

	compareFamilyVersion(remoteFamily: any, localFamily: any) {
		let rFamily = this.familyService.getFilterFamily(remoteFamily);
		let lFamily = this.familyService.getFilterFamily(localFamily);
		let compareResults = this.familyService.compareFamilies(rFamily, lFamily);
		console.log('compareResults: ', compareResults);
		let newNodes = [];
		compareResults.forEach(item => {
			if (item.mode == 'ADD')
				newNodes.push(item.name);
		})
		if (newNodes.length > 0) {
			let msg = '<b>' + this.translate_instant('APP_NEW_NODE') + '</b><br/><br/>';
			newNodes.forEach(node => {
				msg += node + '<br/>'
			});
			setTimeout(() => {
				this.utilService.presentToastWait(null, msg, 'OK', 10000);
			}, 4000);
		}
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

  updateVersionData() {
    return new Promise((resolve) => {
      this.fbService.readAppData().then((rdata:any) => {
				// always read docs from Firebase and parse data before go to home.page.ts
				let remoteVersion = rdata.version;
        if (remoteVersion !== environment.version) {
          // must refresh cache
          let msg = ' (A.' + environment.version + '). ';
          this.presentToast(['APP_APP_VERSIONS_NOT_SAME_1', msg, 'APP_APP_VERSIONS_NOT_SAME_2']);
        } else {
          this.dataService.readItem('VERSION').then((version:any) => {
            if (!version || version != environment.version) {
              // version not defined or outdated, update data
              this.setJsonData('places').then((stat2:any) => {});
              this.setJsonData('names').then((stat3:any) => {});
              // save VERSION
              this.dataService.saveItem('VERSION', environment.version).then((status:any) => {});
            }
            resolve(true);
          });
        }
      });
    });
  }

  updateAppData() {
    return new Promise((resolve) => {
			this.dataService.readFamilyAndInfo().then((data:any) => {
				let family = data.family;
				let info = data.info;
				// update screen height
				let nodes = this.nodeService.getFamilyNodes(family);
				this.themeService.setScreenSize(nodes);
				// get photo names from Storage
				let ancestor = info.id;
				this.fbService.getPhotoNames(ancestor).then((names:any) => {
					this.dataService.saveItem('photos', { "id": "photos",	"data": names }).then((status:any) => {});
				})
				// always update docs and images data from Firebase
				this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
					if (!rdata.images)
						rdata.images = {};
					this.dataService.saveItem('images', rdata.images).then((status:any) => {});
					let docs = rdata.docs;
					// parse docs
					let language = this.languageService.getLanguage();
					this.updateDocs(rdata.images, docs[language]);
					resolve(true);
				});
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
				// raw is array, convert to text in string
				doc.text = this.editorService.replaceArrayToText(doc.raw);
				doc.raw = null;
			} else {
				doc.text = '';
			}
			doc.html = doc.text.slice(0);
			docs[key] = doc;
		};

		// convert html
		for (let key of Object.keys(docs)) {
			let text = docs[key].text;
			// convert image templates to HTML
			let resolves = this.editorService.convertDocumentTemplate(images, text);
			// change text to reflect image
			for (let i = 0; i < resolves.length; i++) {
				let data = resolves[i];
				let docStr = '[' + data.docStr + ']';
				let html = data.html;
				docs[key].html = docs[key].html.replaceAll(docStr, html);
			}
		}
		this.dataService.saveDocs(docs).then((status:any) => {});
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

  private setAncestor(aDes: any) {
    return new Promise((resolve) => {
      this.dataService.readItem('ANCESTOR_DATA').then((sdata:any) => {
        if (sdata) {
          // data is available, if same as ancestorID, ignore
          let aSrc = sdata.info.id;
          if (DEBUGS.APP)
            console.log('AppComponent - setAncestor - aSrc, aDes: ', aSrc, aDes);
          if (aSrc != aDes) {
            // different ancestor
            // copy existing data to local memory
            this.dataService.saveItem(aSrc, sdata).then((status:any) => {
              // read des from local memory
              this.dataService.readItem(aDes).then((ddata:any) => {
                if (ddata) {
                  // des data exists, copy to 'ANCESTOR_DATA'
                  this.dataService.saveItem('ANCESTOR_DATA', ddata).then((status:any) => {
                    resolve (true);
                  });
                } else {
                  // read data from fb
                  this.fbService.readAncestorData(aDes).subscribe((rdata:any) => {
                    this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
                      resolve (true);
                    });
                  });
                }
              });
            });
          } else {
            resolve (true);
          }
        } else {
          this.fbService.readAncestorData(aDes).subscribe((rdata:any) => {
            this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
              resolve (true);
            });
          });
        }
      });
    });
  }

  createBaseAncestor(data: any) {
    let info = {
      id: '',
      name: '',
      location: '',
      description: '',
      root_name: '',
      root_year: '',
      family_name: '',
    }
    
    info.name = data[0];
    info.location = data[1];
    info.description = data[2];
    info.root_name = data[3];
    info.root_year = data[4];
    info.family_name = data[3].substring(0, data[3].indexOf(' '));
    let dateid = this.utilService.getShortDateID();
    info.id = this.utilService.stripVN(info.family_name) + dateid;
    let rdata = {
      "info": info,
      "archive": {}, 
      "contribution": [], 
      "introduction": {}, 
      "family":  {
        version: '1',
        nodes: [ 
            { name: info.root_name, gender: 'male', yob: info.root_year} 
        ]
      }
    }
    return rdata;
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
    // msgs.push({name: 'msg', label: this.translate_instant(keys[0])});
    // if (keys.length > 1)
    //   msgs.push({name: 'data', label: keys[1]});
    // if (keys.length > 2)
    //   msgs.push({name: 'msg', label: this.translate_instant(keys[2])});
		// if (keys.length > 3)
    //   msgs.push({name: 'data', label: keys[3]});
    let message = this.utilService.getAlertMessage(msgs, true);
    // this.utilService.presentToast(message);
		this.utilService.presentToastWait(null, message, 'OK', 10000);
  }

	translate_instant(key:any) {
    // get temp translation till language service is activated
    const vi = {
			"APP_FAMILY_TREE": "Gia Phả",
			"APP_LOCAL_MEMORY_DELETED": "Dữ liệu trong máy đã được xóa!",
			"APP_NEW_VERSION_IS_UPDATED": "Ấn bản mới đã được cập nhật!",
			"APP_SETTING": "Thông số",
			"APP_NEW_SETTING": "Thông số mới đã được chọn.",
			"APP_SAME_SETTING": "Thông số không thay đổi!",
			"APP_THEME": "Giao diện",
			"APP_THEME_VILLAGE": "Làng",
			"APP_THEME_TREE": "Cây",
			"APP_THEME_DRAGON": "Rồng",
			"APP_THEME_COUNTRY": "Quê",
			"APP_LANGUAGE": "Ngôn ngữ",
			"APP_LANGUAGE_VIETNAMESE": "Tiếng Việt",
			"APP_LANGUAGE_ENGLISH": "Tiếng Anh",
			"APP_SIZE": "Kích thước chữ",
			"APP_SMALL_SIZE": "Nhỏ",
			"APP_MEDIUM_SIZE": "Vừa",
			"APP_LARGE_SIZE": "Lớn",
			"APP_ANCESTOR": "Phả tộc",
			"APP_ANCESTOR_NAME": "Gia tộc (vd. Phan Tộc)",
			"APP_ANCESTOR_LOCATION": "Quê quán (vd. Đồng Hới, Quảng Bình)",
			"APP_ANCESTOR_DESCRIPTION": "Giải thích (vd. Tộc gốc Thanh Hóa)",
			"APP_ANCESTOR_ROOT_NAME": "Hệ bắt đầu (vd. Phan Viết Hoàng)",
			"APP_ANCESTOR_ROOT_YEAR": "Năm sinh (vd. 1953)",
			"APP_OK_ANCESTOR": "Phả tộc mới đã được tạo. ID: ",
			"APP_NO_ANCESTOR": "Phả tộc chưa được tạo!",
			"APP_NEW_ANCESTOR_1": "Phả tộc '",
			"APP_NEW_ANCESTOR_2": "' đã được khởi động!<br/>Kết nối: <i>giapha.web.app</i>",
			"APP_NEW_FAMILY": "Hệ thống dùng dữ liệu mới. Ấn bản: ",
			"APP_NEW_NODE": "Hệ mới",
			"APP_WELCOME_FAMILY_1": "Chào bạn truy cập vào gia phả họ: ",
			"APP_WELCOME_FAMILY_2": "Để cập nhật thông tin, liên lạc: ",
			"APP_NA_ANCESTOR_1": "Phả tộc: ",
			"APP_NA_ANCESTOR_2": "không có trong hệ thống!",
			"APP_NA_ANCESTOR_3": "Liên lạc: ",
			"APP_SUPER_ADMIN": "Phan Viết Hoàng (Viber 0903 592 592)",
			"APP_NO_ANCESTOR_1": "Không có tên phả tộc!",
			"APP_NO_ANCESTOR_2": "Liên lạc: ",
			"APP_NA_OPTION_1": "Thông số: ",
			"APP_NA_OPTION_2": "không hợp lệ!",
			"APP_NA_OPTION_3": "Liên lạc: ",
			"APP_APP_VERSIONS_NOT_SAME_1": "Ấn bản trên máy đã cũ: ",
			"APP_APP_VERSIONS_NOT_SAME_2": ". Yêu cầu xóa cache và chạy lại (F5)!",
			"INFO": "Thông báo",
      "ERROR": "Lỗi",
      "WARNING": "Cảnh báo",
      "OK": "OK",
      "CANCEL": "Thoát",
    }
		
		const en = {
			"APP_FAMILY_TREE": "Family Tree",
			"APP_LOCAL_MEMORY_DELETED": "Local data in the machine was deleted!",
			"APP_NEW_VERSION_IS_UPDATED": "New app version is updated!",
			"APP_SETTING": "Setting",
			"APP_NEW_SETTING": "New setting is selected.",
			"APP_SAME_SETTING": "Setting not changed!",
			"APP_THEME": "Theme",
			"APP_THEME_VILLAGE": "Village",
			"APP_THEME_TREE": "Tree",
			"APP_THEME_DRAGON": "Dragon",
			"APP_THEME_COUNTRY": "Countryside",
			"APP_LANGUAGE": "Language",
			"APP_LANGUAGE_VIETNAMESE": "Vietnamese",
			"APP_LANGUAGE_ENGLISH": "English",
			"APP_SIZE": "Text size",
			"APP_SMALL_SIZE": "Small",
			"APP_MEDIUM_SIZE": "Normal",
			"APP_LARGE_SIZE": "Large",
			"APP_ANCESTOR": "Ancestor",
			"APP_ANCESTOR_NAME": "Name (eg. Phan Tộc)",
			"APP_ANCESTOR_LOCATION": "Location (eg. Đồng Hới, Quảng Bình)",
			"APP_ANCESTOR_DESCRIPTION": "Note (eg. Tộc gốc Thanh Hóa)",
			"APP_ANCESTOR_ROOT_NAME": "Root member (eg. Phan Viết Hoàng))",
			"APP_ANCESTOR_ROOT_YEAR": "Root year (eg. 1953)",
			"APP_OK_ANCESTOR": "New ancestor is created. ID: ",
			"APP_NO_ANCESTOR": "Ancestor is not available!",
			"APP_NEW_ANCESTOR_1": "Ancestor: '",
			"APP_NEW_ANCESTOR_2": "' has been chosen! <br/>Link: <i>giapha.web.app</i>",
			"APP_NEW_FAMILY": "New family data is used. Version: ",
			"APP_NEW_NODE": "New nodes",
			"APP_NA_ANCESTOR_1": "Ancestor: '",
			"APP_NA_ANCESTOR_2": "' is not available!<br/>Contact <b>Phan Viết Hoàng (Viber 0903 592 592)</b>.",
			"APP_NA_ANCESTOR": "Ancestor is not provided!<br/>Contact <b>Phan Viết Hoàng (Viber 0903 592 592)</b>.",
			"APP_NA_OPTION_1": "Parameter: '",
			"APP_NA_OPTION_2": "' is not valid!<br/>Contact  <b>Phan Viết Hoàng (Viber 0903 592 592)</b>.",
			"APP_APP_VERSIONS_NOT_SAME_1": "App is old: '",
			"APP_APP_VERSIONS_NOT_SAME_2": "'. Please refresh memory (F5)!",
			 "INFO": "Information",
			 "ERROR": "Error",
			 "WARNING": "Warning",
			"OK": "OK",
			"CANCEL": "Cancel",
    }
		if (this.language == 'vi')
			return vi[key] ? vi[key] : key;
		return en[key] ? en[key] : key;
  }
  
}