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

const RESET_DATA = false;

const VIEW_MODE = 'view';
const EDIT_MODE = 'edit';

// superadmin
const URL_DELETE_OPEN = '/sopen';
const URL_DELETE_NEW = '/snew';

// admin
const URL_UPDATE_VERSION = '/aupdate';
const URL_EDIT = 'aedit';				// no slash !important

// user
const URL_SETTING = '/uset'
const URL_DELETE = '/udelete';

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
    if (DEBUGS.APP)
      console.log('AppComponent - ngOnInit -  url: ', url);
    this.url = url;
		this.initializeUI().then((status) => {
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
			else if (url == URL_SETTING)
				// this.createAncestor();
				this.setSetting();
			else {
				this.selectAncestor(url).then((status) => {
					if (status)
						this.initializeApp();
				})
			}
		});
  }

  initializeUI() {
		return new Promise((resolve) => {
			this.loadTheme().then((theme:any) => {
				this.theme = theme;
				this.loadLanguage().then((language:any) => {
					this.language = language;
					this.loadSize().then((size:any) => {
						this.size = size;
						if (DEBUGS.APP)
							console.log('theme, language, size: ', this.theme, this.language, this.size)
						this.utilService.printVariable('initializeUI', '--app-text-font-size-medium');

						resolve (true);
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
					this.splashTitle = this.translate_instant('APP_FAMILY_TREE')
					this.startUp = true;
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

		this.utilService.printVariable('before alertSelect', '--app-text-font-size-medium');

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
				console.log('AppComponent - setSetting - data: ', result.data);
				if (result.data.status == 'save') {
					console.log('AppComponent - setSetting - before: ', this.theme, this.language, this.size);
					let values = result.data.values;
					console.log('AppComponent - setSetting - after: ', values);
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
					
					this.utilService.printVariable('after alertSelect', '--app-text-font-size-medium');
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
        this.utilService.alertRadio('ANCESTOR', '', inputs , this.translate_instant('CANCEL'), this.translate_instant('OK')).then(result => {
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
      this.dataService.readItem(THEME).then((theme:any) => {
        console.log('AppComponent - loadTheme - theme: ', theme);
        if (!theme) {
          this.themeService.setTheme(DRAGON);
        } else
          this.themeService.setTheme(theme);
        resolve (theme);
      });
    })
  }

	loadSize() {
    return new Promise((resolve) => {
      this.dataService.readItem(SIZE).then((size:any) => {
        console.log('AppComponent - loadSize - size: ', size);
        if (!size) {
          this.themeService.setSize(MEDIUM_SIZE);
        } else
          this.themeService.setSize(size);
        resolve (size);
      });
    })
  }

  loadLanguage() {
    return new Promise((resolve) => {
      this.dataService.readItem(LANGUAGE).then((language:any) => {
        console.log('AppComponent - loadLanguage - language: ', language);
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
    return new Promise((resolve) => {
			this.dataService.readFamilyAndInfo().then((data:any) => {
				let family = data.family;
				let info = data.info;
				if (DEBUGS.APP)
					console.log('AppComponent - updateAppData - local family version: ', family.version);
				// update screen height
				let nodes = this.nodeService.getFamilyNodes(family);
				this.themeService.setScreenSize(nodes);
				// this.themeService.setScreen();
				// get photo names from Storage
				let ancestor = info.id;
				this.fbService.getPhotoNames(ancestor).then((names:any) => {
					this.dataService.saveItem('photos', { "id": "photos",	"data": names }).then((status:any) => {});
				})
				// always update docs data from Firebase
				this.fbService.readAncestorData(ancestor).subscribe((rdata:any) => {
					if (DEBUGS.APP)
						console.log('AppComponent - updateAppData - rdata: ', rdata);
					let docs = rdata.docs;
					// docs by language
					console.log('AppComponent - updateAppData - language: ', this.language);
					// parse docs
					let language = this.languageService.getLanguage();
					this.updateDocs(ancestor, docs[language]).then(status => {
						resolve(true);
					});
				});
			});
		});
  }

	updateDocs(ancestor: any, docs: any) {
			return new Promise((resolve) => {
				if (DEBUGS.APP)
					console.log('AppComponent - updateDocs - docs: ', docs);
				// collect all image files: '"[abc.png]"'
				for (var key of Object.keys(docs)) {
					this.editorService.getHtmlText(ancestor, docs[key].text, key).then((result:any) => {
						// update 
						console.log('AppComponent - updateDocs - newText: ', result.key, result.newText);
						docs[result.key].newText = result.newText;
					})
				}
				// console.log('AppComponent - updateDocs - after docs 1: ', docs);
				setTimeout(() => {
				this.dataService.saveDocs(docs).then((status:any) => {
					console.log('AppComponent - updateDocs - after docs: ', docs);
					resolve(true);
				});
				}, 1000);
		})
	}
	
	// updateDocsSAVE(ancestor: any, docs: any) {
	// 	if (DEBUGS.APP)
  //       console.log('AppComponent - updateDocs - docs: ', docs);
	// 	let newDocs:any = {};
	// 	// collect all image files: '"[abc.png]"'
	// 	let images = [];
	// 	for (var key of Object.keys(docs)) {
	// 		let data = docs[key];
	// 		// create new text for all docs
	// 		docs[key].newText = data.text.slice(0);
	// 		// collect all images data between quotation ""
	// 		const matches = data.text.match(/"(.*?)"/g);
	// 		if (matches) {
	// 			for (let i = 0; i < matches.length; ++i) {
	// 				const match = matches[i];
	// 				// match include ""
	// 				if (match.charAt(1) == '[' && match.charAt(match.length - 2) == ']') {
	// 					// this is an image file name with options: image, size, caption
	// 					let imageStr = match.substring(2, match.length - 2);
	// 					if (images.indexOf(imageStr) == -1) {
	// 						images.push(imageStr);
	// 				}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	// now convert to url from Firebase storage
	// 	let promises = [];
	// 	images.forEach(imageStr => {
	// 		promises.push(
	// 			new Promise((resolve) => {
	// 				// break down detail: image,size,caption
	// 				console.log('imageStr: ', imageStr);
	// 				// phan-loi-hanh.jpg,small,Hello Gia pha
	// 				// phan-loi-hanh.jpg,2,phan-loi-hanh.txt

	// 				let items = imageStr.split(',');
	// 				let imageFile = items[0];
					
	// 				let size = '1';
	// 				if (items.length > 1)	size = items[1];
	// 				let width = 200;
	// 				let height = 150;
	// 				if (size == '2') {
	// 					width = 250;
	// 					height = 200;
	// 				} else if (size == '3') {
	// 					width = 300;
	// 					height = 200;
	// 				}

	// 				let justify = 'c';
	// 				if (items.length > 2) justify = items[2];
	// 				let container = (justify == 'c' ? 'home-container-center' : (justify == 'l' ? 'home-container-left' : 'home-container-right'));

	// 				let captionStr: string = '';
	// 				if (items.length > 3) captionStr = items[3];

	// 				// check if captionStr is text file
	// 				// let captionFile = (captionStr.endsWith('.txt')) ? captionStr : '';
	// 				let captionFile = '';

	// 				// caption is file txt
	// 				this.fbService.downloadImage(ancestor, imageFile).then((imageURL:any) => {
	// 					// <img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">

	// 					let html = '<img src="' + imageURL + '"';
						
	// 					// let size = style.charAt(0);
	// 					// let justify = 'center';
	// 					// if (style.length > 1)
	// 						// justify = style.charAt(1) == 'l' ? 'left' : (style.charAt(1) == 'c' ? 'center' : 'right');
						
	// 					// let container = (justify == 'c' ? 'home-container-center' : (justify == 'l' ? 'home-container-left' : 'home-container-right'));
					
	// 					// https://stackoverflow.com/questions/30686191/how-to-make-image-caption-width-to-match-image-width
	// 					html += ' width="' + width + '" height="' + height + '" alt="' + imageFile + '">'
	// 					if (captionFile != '') {
	// 						this.fbService.downloadText(ancestor, captionFile).then((text:any) => {
	// 							captionStr = text;
	// 							html = 
	// 							'<br/>' +
	// 							'<div class="' + container + '">' + html + '/div>' +
	// 							'<div class="' + + container + ' home-no-expand">' + captionStr + '</div>' +
	// 							'<br/>'
	// 							resolve({imageStr: '"[' + imageStr + ']"', html: html});
	// 						});
	// 					} else {
	// 						html = 
	// 							'<br/>' + 
	// 							'<div class="' + container + '">' + html + '</div>';
	// 						if (captionStr != '')
	// 							html += 
	// 							'<div class="' + container + ' home-no-expand">' + captionStr + '</div>';
	// 						html += '<br/>'
	// 						console.log('html = ', html);
	// 						resolve({imageStr: '"[' + imageStr + ']"', html: html});
	// 					}
						
	// 					// if (captionStr != '')
	// 					// 	html = '<div class="home-container">' + html + '<div class="home-no-expand">' + captionStr + '</div>'
	// 					// resolve({imageStr: '"[' + imageStr + ']"', html: html});

	// 				})
	// 				.catch((error) => {
	// 					resolve(null);
	// 				});
	// 			})
	// 		)
	// 	})
	// 	Promise.all(promises).then(resolves => {
	// 		console.log('resolves = ', resolves);
	// 		for (let i = 0; i < resolves.length; i++) {
	// 			let data = resolves[i];
	// 			let imageStr = data.imageStr;
	// 			let html = data.html;
	// 			for (var key of Object.keys(docs)) {
	// 				let data = docs[key];
	// 				let text = data.text.slice(0);
	// 				let newText = text.replaceAll(imageStr,html);
	// 				docs[key].newText = newText;
	// 			}
	// 		}
	// 		this.dataService.saveDocs(docs).then((docs:any) => {});
	// 	});
  // }

  private setJsonData(json: string) {
    return new Promise((resolve) => {
      let jsonFile = './assets/common/' + json + '.json';
      this.utilService.getLocalJsonFile(jsonFile).then((jsonData:any) => {
				// console.log('setJsonData data: ', jsonData.data);
				// console.log('setJsonData data: ', jsonData.data.toString());
				this.dataService.saveItem(json, jsonData).then((status:any) => {});
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
    msgs.push({name: 'msg', label: this.translate_instant(keys[0])});
    if (keys.length > 1)
      msgs.push({name: 'data', label: keys[1]});
    if (keys.length > 2)
      msgs.push({name: 'msg', label: this.translate_instant(keys[2])});
    let message = this.utilService.getAlertMessage(msgs);
		console.log('message: ', message);
    this.utilService.presentToast(message);
    // this.utilService.presentToastWait(this.translate_instant('INFO'), message, this.translate_instant('OK') );
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
			"APP_NA_LINK_1": "Đường dẫn '",
			"APP_NA_LINK_2": "' không hợp lệ!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
			"APP_EMPTY_ANCESTOR": "Phả tộc chưa được kích hoạt trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.'",
			"APP_NEW_FAMILY": "Hệ thống dùng dữ liệu mới. Ấn bản: ",
			"APP_NA_ANCESTOR_1": "Phả tộc '",
			"APP_NA_ANCESTOR_2": "' không có trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
			"APP_APP_VERSIONS_NOT_SAME_1": "Ấn bản trên máy đã cũ: ",
			"APP_APP_VERSIONS_NOT_SAME_2": ". Yêu cầu xóa cache và chạy lại (F5)!",
			"INFO": "Thông báo",
      "ERROR": "Lỗi",
      "WARNING": "Cảnh báo",
      "OK": "OK",
      "CANCEL": "Thoát",

			// "APP_ANCESTOR": "Phả tộc",
      // "APP_NO_ANCESTOR": "Phả tộc chưa được tạo!",
      // "APP_OK_ANCESTOR": "Phả tộc mới đã được tạo. ID: ",
      // "APP_LOCAL_MEMORY_DELETED": "Dữ liệu trong máy đã được xóa!",
      // "APP_NEW_VERSION_IS_UPDATED": "Ấn bản mới đã được cập nhật!",
      // "APP_APP_VERSIONS_NOT_SAME_1": "Ấn bản trên máy đã cũ: ",
      // "APP_APP_VERSIONS_NOT_SAME_2": ". Yêu cầu xóa cache và chạy lại (F5)!",

      // "APP_NA_LINK_1": "Đường dẫn '",
      // "APP_NA_LINK_2": "' không hợp lệ!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",

      // "APP_NA_ANCESTOR_1": "Phả tộc '",
      // "APP_NA_ANCESTOR_2": "' không có trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
      // "APP_NEW_ANCESTOR_1": "Phả tộc '",
      // "APP_NEW_ANCESTOR_2": "' đã được khởi động!<br/>Kết nối: <i>giapha.web.app</i>",
      // "APP_EMPTY_ANCESTOR": "Phả tộc chưa được kích hoạt trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.'",

      // "APP_ANCESTOR_NAME": "Gia tộc (vd. Phan Tộc)",
      // "APP_ANCESTOR_LOCATION": "Quê quán (vd. Đồng Hới, Quảng Bình)",
      // "APP_ANCESTOR_DESCRIPTION": "Giải thích (vd. Tộc gốc Thanh Hóa)",
      // "APP_ANCESTOR_ROOT_NAME": "Hệ bắt đầu (vd. Phan Viết Hoàng)",
      // "APP_ANCESTOR_ROOT_YEAR": "Năm sinh (vd. 1953)",

      // "APP_SETTING": "Thông số",

      // "APP_NEW_THEME": "Hệ thống dùng theme mới: ",
      // "APP_THEME": "Theme",
      // "APP_THEME_VILLAGE": "Làng",
      // "APP_THEME_TREE": "Cây",
      // "APP_THEME_DRAGON": "Rồng",
      // "APP_THEME_COUNTRY": "Quê",

      // "APP_NEW_LANGUAGE": "Hệ thống dùng ngôn ngữ mới: ",
      // "APP_LANGUAGE": "Ngôn ngữ",
      // "APP_LANGUAGE_VIETNAMESE": "Tiếng Việt",
      // "APP_LANGUAGE_ENGLISH": "Tiếng Anh",

			// "APP_NEW_SIZE": "Hệ thống dùng font size mới: ",
      // "APP_SIZE": "Cỡ font",
      // "APP_SMALL_SIZE": "Nhỏ",
      // "APP_MEDIUM_SIZE": "Vừa",
      // "APP_LARGE_SIZE": "Lớn",

      // "APP_ANCESTOR": "Phả tộc",
			// "APP_LOCAL_MEMORY_DELETED": "Dữ liệu trong máy đã được xóa!",
			// "APP_NEW_VERSION_IS_UPDATED": "Ấn bản mới đã được cập nhật!",
			// "APP_OK_ANCESTOR": "Phả tộc mới đã được tạo. ID: ",
			// "APP_NO_ANCESTOR": "Phả tộc chưa được tạo!",
			// "APP_NA_LINK_1": "Đường dẫn '",
			// "APP_NA_LINK_2": "' không hợp lệ!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
			// "APP_EMPTY_ANCESTOR": "Phả tộc chưa được kích hoạt trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.'",
			// "APP_NEW_FAMILY": "Hệ thống dùng dữ liệu mới. Ấn bản: ",
			// "APP_NA_ANCESTOR_1": "Phả tộc '",
			// "APP_NA_ANCESTOR_2": "' không có trong hệ thống!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
			// "APP_NEW_ANCESTOR_1": "Phả tộc '",
			// "APP_NEW_ANCESTOR_2": "' đã được khởi động!<br/>Kết nối: <i>giapha.web.app</i>",
			// "APP_APP_VERSIONS_NOT_SAME_1": "Ấn bản trên máy đã cũ: ",
			// "APP_APP_VERSIONS_NOT_SAME_2": ". Yêu cầu xóa cache và chạy lại (F5)!",
			// "APP_NEW_THEME": "Hệ thống dùng theme mới: ",
			// "APP_THEME": "Theme",
			// "APP_THEME_VILLAGE": "Làng",
			// "APP_THEME_TREE": "Cây",
			// "APP_THEME_DRAGON": "Rồng",
			// "APP_THEME_COUNTRY": "Quê",
			// "APP_LANGUAGE_NEW": "Hệ thống dùng ngôn ngữ mới: ",
			// "APP_LANGUAGE": "Ngôn ngữ",
			// "APP_LANGUAGE_VIETNAMESE": "Tiếng Việt",
			// "APP_LANGUAGE_ENGLISH": "Tiếng Anh",

      // "INFO": "Thông báo",
      // "ERROR": "Lỗi",
      // "WARNING": "Cảnh báo",
      // "OK": "OK",
      // "CANCEL": "Thoát",
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
			"APP_NA_LINK_1": "Link '",
			"APP_NA_LINK_2": "' is not valid!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.",
			"APP_EMPTY_ANCESTOR": "Ancestor is not available!<br/>Liên lạc <i>pvhoang940@gmail.com</i>.'",
			"APP_NEW_FAMILY": "New family data is used. Version: ",
			"APP_NA_ANCESTOR_1": "Ancestor: '",
			"APP_NA_ANCESTOR_2": "' is not available!<br/>Contact <i>pvhoang940@gmail.com</i>.",
			"APP_APP_VERSIONS_NOT_SAME_1": "App is old: ",
			"APP_APP_VERSIONS_NOT_SAME_2": ". Please refresh memory (F5)!",
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