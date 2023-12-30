import { Component, OnInit, ViewChild  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { environment, DEBUGS, DRAGON, VILLAGE, TREE, COUNTRY } from '../environments/environment';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { ThemeService } from './services/theme.service';
import { LanguageService } from './services/language.service';
import { NodeService } from './services/node.service';
import { FamilyService } from './services/family.service';
import { FirebaseService } from './services/firebase.service';

const RESET_DATA = false;

const VIEW_MODE = 'view';
const EDIT_MODE = 'edit';

// superadmin
const URL_DELETE_OPEN = '/sopen';
const URL_DELETE_NEW = '/snew';

// admin
const URL_UPDATE_VERSION = '/aupdate';
const URL_EDIT = 'aedit';
const URL_DOWNLOAD = '/adownload';
const URL_UPLOAD = '/aupload';

// user
const URL_THEME = '/utheme'
const URL_LANGUAGE = '/ulang'
const URL_DELETE = '/udel';

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
	uploadMode = false;
	downloadMode = false;
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
		private sanitizer: DomSanitizer,

  ) {
    if (DEBUGS.APP)
      console.log('AppComponent - constructor');
  }

  async ngOnInit(): Promise<any> {
    // get URL
    let strings = window.location.href.split(window.location.host);
    let url = strings[strings.length-1];

    if (DEBUGS.APP)
      console.log('AppComponent - ngOnInit -  url: ', url);
    this.url = url;

    this.themeService.setTheme(VILLAGE, true);

    if (RESET_DATA)
			this.setJsonPhanFamily().then((status) => {});

    if (url == URL_DELETE)
      this.deleteLocal();
    else if (url == URL_DELETE_OPEN)
      this.deleteOpen(true);
    else if (url == URL_DELETE_NEW)
      this.deleteOpen(false);
    else if (url == URL_UPDATE_VERSION)
      this.updateVersion();
    else if (url == URL_THEME)
      this.selectTheme();
    else if (url == URL_LANGUAGE)
      this.selectLanguage();
		else if (url == URL_DOWNLOAD)
			this.download();
		else if (url == URL_UPLOAD)
			this.upload();

    else {
      this.selectAncestor(url).then((status) => {
        if (status)
          this.initializeApp();
      })
    }
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
      this.updateAppData();
      // load app theme and language
      this.loadTheme().then((stat:any) => {});
      this.loadLanguage().then((stat:any) => {});
      this.startUp = true;
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

	
	download() {
		// download family data from Firebase to local file for editing
		this.dataService.readFamilyAndInfo().then((data:any) => {
      let family = data.family;
      let info = data.info;
			let ancestor = info.id;
			this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
				// clean family data before save to local
				let cleanFamily = this.familyService.getFilterFamily(rdata.family, true);
				let data = JSON.stringify(cleanFamily, null, 2);
				// console.log('data: ', data);
				const blob = new Blob([data], {
					type: 'application/octet-stream'
				});
				this.fileName = ancestor + '-' + family.version + '.json';
				this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
				this.downloadMode = true;
			});
		});
  }

	upload() {
		this.uploadMode = true;
	}

	presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }
	
	onFileSelect(event: any): void {
    const files = [...event.target.files]
		const file = files[0];
		this.fileName = file.name;
		console.log('file: ', file);
		this.onFileUpload(file);
  }

	onFileUpload(file:File) {
    console.log('FilePage - onFileUpload');
    const name:string = file.name;
    // get extension
    const type = name.substring(name.lastIndexOf('.')+1);
		console.log('type: ', type);
    this.uploadFile(file).then((res: any) => {
      if (DEBUGS.APP)
        console.log('onFileUpload - res: ', res);
      if (res.text) {
        // validate json file
        // let family = JSON.parse(res.text);
				// console.log('FilePage - onFileUpload - family: ', family);
				let family = this.getValidateData(res.text);
        if (family) {
					this.dataService.readFamilyAndInfo().then((ldata:any) => {
						let ancestor = ldata.info.id;
						this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
							rdata.family = family;
							this.fbService.saveAncestorData(rdata).then((status:any) => {
								this.presentToast(['APP_UPLOAD', name]);
							});
						});
					});
        } else {
					this.presentToast(['APP_FILE_INVALID', name]);
				}
      } else {
				this.presentToast(['APP_FILE_EMPTY', name]);
      }
    });
  }

	uploadFile(file:File) {
    return new Promise((resolve) => {
      const name = file.name;
      var myReader: FileReader = new FileReader();
			myReader.readAsText(file);
			myReader.onload = ((event:any) => {
				let text:any = event.target.result;
			// always parse json (string) to object
				resolve({text: text});
			});
    });
  }

	getValidateData(text: any) {
		let family: any = null;
		try {
			family = JSON.parse(text);
			if (!family.version || !family.nodes || !family.children)
				return null;
		} catch (error) {
			console.log('getValidateData - error: ', error);
		}		
    return family;
  }

  deleteOpen (open: boolean) {
    this.dataService.deleteItem('ANCESTOR_DATA').then(status => {
      if (open)
        this.selectAncestors();
      else
        this.createAncestor();
    });
  }

  selectTheme() {
    let inputs = [
      { type: 'radio', label: this.getTranslation('APP_THEME_DRAGON'), value: DRAGON, checked: true },
      { type: 'radio', label: this.getTranslation('APP_THEME_VILLAGE'), value: VILLAGE, checked: false },
      { type: 'radio', label: this.getTranslation('APP_THEME_TREE'), value: TREE, checked: false },
      { type: 'radio', label: this.getTranslation('APP_THEME_COUNTRY'), value: COUNTRY, checked: false }
    ];
    this.utilService.alertRadio(this.getTranslation('APP_THEME'), '', inputs , this.getTranslation('CANCEL'), this.getTranslation('OK')).then(result => {
      if (DEBUGS.APP)
        console.log('AppComponent - selectThemes - result: ', result);
      if (result.data) {
        let theme = result.data;

        console.log('AppComponent - selectTheme - theme: ', theme);

        this.dataService.saveItem('THEME', theme).then((status:any) => {
          let themeText = '';
          for (let i = 0; i < inputs.length; i++) {
            if (theme == inputs[i].value) {
              themeText = inputs[i].label;
              break;
            }
          }
          this.presentToast(['APP_NEW_THEME', themeText]);
        });
      }
    });
  }

  selectLanguage() {
    let inputs = [
      { type: 'radio', label: this.getTranslation('APP_LANGUAGE_VIETNAMESE'), value: 'vi', checked: true },
      { type: 'radio', label:  this.getTranslation('APP_LANGUAGE_ENGLISH'), value: 'en', checked: false },
    ];
    this.utilService.alertRadio(this.getTranslation('APP_LANGUAGE'), '', inputs , this.getTranslation('CANCEL'), this.getTranslation('OK')).then(result => {
      if (DEBUGS.APP)
        console.log('AppComponent - selectLanguage - result: ', result);
      if (result.data) {
        let lang = result.data;
        // this.languageService.setLanguage(lan);
        this.dataService.saveItem('LANGUAGE', lang).then((status:any) => {
          let langStr = (lang == 'vi') ? this.getTranslation('APP_LANGUAGE_VIETNAMESE') : this.getTranslation('APP_LANGUAGE_ENGLISH');
          this.presentToast(['APP_NEW_LANGUAGE', langStr]);
        });
      }
    });
  }

  createAncestor() {
    let title = this.getTranslation('APP_ANCESTOR');
    let cancel = this.getTranslation('CANCEL');
    let ok = this.getTranslation('OK');

    let inputs = [
      {   placeholder: this.getTranslation('APP_ANCESTOR_NAME'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.getTranslation('APP_ANCESTOR_LOCATION'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.getTranslation('APP_ANCESTOR_DESCRIPTION'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.getTranslation('APP_ANCESTOR_ROOT_NAME'),
          attributes: { maxlength: 30 },
      },
      {   placeholder: this.getTranslation('APP_ANCESTOR_ROOT_YEAR'),
          attributes: { maxlength: 30 },
      },
    ]
    this.utilService.alertText(title, inputs , cancel, ok, 'alert-dialog').then(result => {
      console.log('getAncestor - res1: ', result);
      if (result.data) {
        // create an ancestor
        let data = this.createBaseAncestor(result.data);
        if (DEBUGS.APP)
          console.log('getAncestor - rdata: ', data);
        this.fbService.saveAncestorData(data).then((status:any) => {
          if (DEBUGS.APP)
            console.log('DataService - createAncestor - status:' , status);
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
        this.utilService.alertRadio('ANCESTOR', '', inputs , this.getTranslation('CANCEL'), this.getTranslation('OK')).then(result => {
          if (DEBUGS.APP)
            console.log('AppComponent - selectAncestor - result: ', result);
          if (result.data) {
            let ancestorID = result.data;
            this.setAncestor(ancestorID).then(resolve => {
              // this.initializeApp();
              this.presentToast(['APP_NEW_ANCESTOR_1', ancestorID, 'APP_NEW_ANCESTOR_2']);
            });
          }
        });
      });
    });
  }

  private selectAncestor(url: any) {
    return new Promise((resolve) => {
      let dat = url.split('/');
      if (DEBUGS.APP)
        console.log('AppComponent - selectAncestor - dat: ', dat);
      if (dat.length > 2) {
        this.presentToast(['APP_NA_LINK_1', url, 'APP_NA_LINK_2']);
        resolve(false);
      } else {
        let ancestorID = dat[1];
        if (ancestorID == URL_EDIT) {
          this.mode = EDIT_MODE;
          resolve(true);
        } else if (ancestorID == '') {
          this.dataService.readItem('ANCESTOR_DATA').then((sdata:any) => {
            // console.log('sdata: ', JSON.stringify(sdata, null, 2));
            if (!sdata) {
              this.presentToast(['APP_EMPTY_ANCESTOR']);
              resolve(false);
            } else {
							// localhost:8100 - sdata is available
							// check on family data version
							let fversion = sdata.family.version;
							if (DEBUGS.APP)
								console.log('AppComponent - selectAncestor - fversion: ', fversion);
								// now check remote version
								this.fbService.readAncestorData(sdata.info.id).subscribe((rdata:any) => {
									let rversion = rdata.family.version;
									console.log('AppComponent - selectAncestor - fversion, rversion: ', fversion, rversion);
									if (rversion != fversion) {
										this.presentToast(['APP_NEW_FAMILY', rversion]);
										this.dataService.saveItem('ANCESTOR_DATA', rdata).then((status:any) => {
											resolve (true);
										});
									}
									resolve(true);
								});
              resolve(true);
            }
          });
        } else {
          this.validateAncestor(ancestorID).then((status:any) => {
            // check if ancestorID available in fb
            if (!status) {
              // not exist
              this.presentToast(['APP_NA_ANCESTOR_1', ancestorID, 'APP_NA_ANCESTOR_2']);
            } else {
              this.setAncestor(ancestorID).then((res) => {
                this.presentToast(['APP_NEW_ANCESTOR_1', ancestorID, 'APP_NEW_ANCESTOR_2']);
                resolve(false);
              })
            }
          });
        }
      }
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

  loadTheme() {
    return new Promise((resolve) => {
      this.dataService.readItem('THEME').then((theme:any) => {
        console.log('AppComponent - loadTheme - theme: ', theme);
        if (!theme) {
          this.themeService.setTheme(DRAGON);
        } else
          this.themeService.setTheme(theme);
        resolve (true);
      });
    })
  }

  loadLanguage() {
    return new Promise((resolve) => {
      this.dataService.readItem('LANGUAGE').then((language:any) => {
        console.log('AppComponent - loadLanguage - language: ', language);
        if (!language) {
          language = 'vi';
          this.dataService.saveItem('LANGUAGE', 'vi').then((status:any) => {});
        }
        this.languageService.setLanguage(language);
        resolve (true);
      });
    })
  }

  updateVersionData() {
    return new Promise((resolve) => {
      this.fbService.readAppData().then((rdata:any) => {
				if (RESET_DATA)
					this.setJsonData('docs').then((stat2:any) => {});
        let remoteVersion = rdata.version;
				if (DEBUGS.APP) {
					console.log('AppComponent - updateVersionData -  remote app version: ', remoteVersion);
				}
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
    this.dataService.readFamilyAndInfo().then((data:any) => {
      let family = data.family;
      let info = data.info;
      if (DEBUGS.APP)
        console.log('AppComponent - updateAppData - local family version: ', family.version);
      // update screen height
      let nodes = this.nodeService.getFamilyNodes(family);
      this.themeService.setScreenSize(nodes);
      // this.themeService.setScreen();

      // update photo for all nodes from firestore
      let ancestor = info.id;
      this.fbService.getPhotoList(ancestor).then((photoList:any) => {
        // if (DEBUGS.APP)
        //   console.log('AppComponent - updateAppData -  photoList: ', photoList);
        nodes.forEach(node => {
          let photoName = this.nodeService.getPhotoName(node);
          let list = photoList.filter((item:any) => {
            // separate yob and level
            let name = photoName.substring(0, photoName.lastIndexOf('_'));
            return (item[0].indexOf(name) == 0);
          });
          if (list.length > 0) {
            // if (DEBUGS.APP)
            //   console.log('AppComponent - updateAppData -  list: ', list);
            list.sort((item1: any, item2:any) => {
              return (+item2[1]) - (+item1[1]);
            })
            node.photo = list[0][0] + '_' + list[0][1];
          } else 
            node.photo = '';
        });
        this.dataService.saveFamily(family).then((family:any) => {});
      })
    });
  }

  private setJsonData(json: string) {
    return new Promise((resolve) => {
      let jsonFile = './assets/common/' + json + '.json';
      this.utilService.getLocalJsonFile(jsonFile).then((jsonData:any) => {
        if (json == 'docs') {
          console.log('docs: ', JSON.stringify(jsonData));
					this.dataService.saveDocs(jsonData).then((status:any) => {});
        } else {
					this.dataService.saveItem(json, jsonData).then((status:any) => {});
				}
        resolve(true);
      });
    });
	}

  private setJsonPhanFamily() {
    return new Promise((resolve) => {
      let jsonFile = './assets/common/phan-family.json';
      this.utilService.getLocalJsonFile(jsonFile).then((family:any) => {
				if (DEBUGS.APP)
					console.log('AppComponent - setJsonPhanFamily -  family: ', family);
        this.dataService.saveFamily(family).then((fam:any) => {
					// this.dataService.deleteAllBranches();
          this.dataService.readItem('ANCESTOR_DATA').then((sdata:any) => {
            console.log('sdata: ', sdata);
          });
        });
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
                  console.log('AppComponent - setAncestor - read from fb, aDes: ', aDes);
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
    msgs.push({name: 'msg', label: this.getTranslation(keys[0])});
    if (keys.length > 1)
      msgs.push({name: 'data', label: keys[1]});
    if (keys.length > 2)
      msgs.push({name: 'msg', label: this.getTranslation(keys[2])});
    let message = this.utilService.getAlertMessage(msgs);
    this.utilService.presentToast(message);
    // this.utilService.presentToastWait(this.getTranslation('INFO'), message, this.getTranslation('OK') );
  }

  getTranslation(key:any) {
    // get temp translation till language service is activated
    const vi = {
      "APP_ANCESTOR": "Phả tộc",
      "APP_NO_ANCESTOR": "Phả tộc chưa được tạo!",
      "APP_OK_ANCESTOR": "Phả tộc mới đã được tạo. ID: ",
      "APP_LOCAL_MEMORY_DELETED": "Dữ liệu trong máy đã được xóa!",
      "APP_NEW_VERSION_IS_UPDATED": "Ấn bản mới đã được cập nhật!",
      "APP_APP_VERSIONS_NOT_SAME_1": "Ấn bản trên máy đã cũ: ",
      "APP_APP_VERSIONS_NOT_SAME_2": ". Yêu cầu xóa cache và chạy lại (F5)!",

      "APP_NA_LINK_1": "Đường dẫn '",
      "APP_NA_LINK_2": "' không hợp lệ!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",

      "APP_NA_ANCESTOR_1": "Phả tộc '",
      "APP_NA_ANCESTOR_2": "' không có trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
      "APP_NEW_ANCESTOR_1": "Phả tộc '",
      "APP_NEW_ANCESTOR_2": "' đã được khởi động!<br/>Kết nối: <i>giapha.web.app</i>",
      "APP_EMPTY_ANCESTOR": "Phả tộc chưa được kích hoạt trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.'",

      "APP_ANCESTOR_NAME": "Gia tộc (vd. Phan Tộc)",
      "APP_ANCESTOR_LOCATION": "Quê quán (vd. Đồng Hới, Quảng Bình)",
      "APP_ANCESTOR_DESCRIPTION": "Giải thích (vd. Tộc gốc Thanh Hóa)",
      "APP_ANCESTOR_ROOT_NAME": "Hệ bắt đầu (vd. Phan Viết Hoàng)",
      "APP_ANCESTOR_ROOT_YEAR": "Năm sinh (vd. 1953)",

      "APP_NEW_THEME": "Hệ thống dùng theme mới: ",
      "APP_THEME": "Theme",
      "APP_THEME_VILLAGE": "Làng",
      "APP_THEME_TREE": "Cây",
      "APP_THEME_DRAGON": "Rồng",
      "APP_THEME_COUNTRY": "Quê",

      "APP_NEW_LANGUAGE": "Hệ thống dùng ngôn ngữ mới: ",
      "APP_LANGUAGE": "Ngôn ngữ",
      "APP_LANGUAGE_VIETNAMESE": "Tiếng Việt",
      "APP_LANGUAGE_ENGLISH": "Tiếng Anh",

			"APP_NEW_FAMILY": "Hệ thống dùng dữ liệu mới. Ấn bản: ",

      "APP_UPLOAD": "Upload file lên Firebase: ",
      "APP_FILE_INVALID": "File không hợp lệ!",
      "APP_FILE_EMPTY": "File không có dữ liệu!",
			
      "INFO": "Thông báo",
      "ERROR": "Lỗi",
      "WARNING": "Cảnh báo",
      "OK": "OK",
      "CANCEL": "Thoát",
    }
    return vi[key];
  }
}