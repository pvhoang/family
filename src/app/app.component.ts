import { Component, OnInit,  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment, DEBUG} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  ancestor:any = '';

  constructor(
    public platform: Platform,
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
    if (DEBUG)
      console.log('AppComponent - url2: ', url);
    let params = url.split('/');
    this.ancestor = params[1];
  }

  initializeApp() {
    environment.phabletDevice = this.platform.is('phablet');
  }
<<<<<<< Updated upstream
=======

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
			if (!rdata.images)
				rdata.images = {};
			let nodes = this.nodeService.getFamilyNodes(family);
			// update photoUrl
			nodes.forEach(node => {
				if (node.photo) {
					let image = rdata.images[node.photo];
					node.photoUrl = (image) ? image.url : null;
				}
			})
			// update screen height
			this.themeService.setScreenSize(nodes);
			if (!rdata.mds)
				rdata.mds = {};
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
							this.utilService.getLocalJsonFile('./assets/json/phan-mds.json').then((mds:any) => {
								rdata.mds = mds;
								resolve(rdata);
							})
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
>>>>>>> Stashed changes
}