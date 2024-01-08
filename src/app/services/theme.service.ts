import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { DRAGON, VILLAGE, TREE, COUNTRY, SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE } from '../../environments/environment';

const ORANGE = '#fee8b9';
const BLUE_PRIMARY = '#063970';
const WHITE = '#FFFFFF';
const GREY = '#808080';
const RED = '#C10100';
const YELLOW = '#FFFF00';

const themes = {

  dragon : {
    // 'android': [
    //   ['--ion-font-family', 'Roboto' ],
    //   ['--app-text-font-size-tiny', '10px' ],
    //   ['--app-text-font-size-small', '12px' ],
    //   ['--app-text-font-size-medium', '14px' ],
    //   ['--app-text-font-size-large', '16px' ],

    //   ['--app-alert-font-size', '12px' ],
    //   ['--app-toast-font-size', '12px' ],

    //   ['--app-icon-font-size-tiny', '10px' ],
    //   ['--app-icon-font-size-small', '12px' ],
    //   ['--app-icon-font-size-medium', '14px' ],
    //   ['--app-icon-font-size-large', '16px' ],

    //   ['--app-color', YELLOW ],
    //   ['--app-background-color', RED ],
    //   ['--ion-color-medium', RED ],
    //   ['--app-logo', 'url("./../../../assets/common/dragon/gia-pha.jpg")'],
    //   ['--app-three-dots', 'url("./../../../assets/icon/three-dots-red.svg")'],
    //   ['--url-ion-content-splash', 'url("../assets/common/dragon/dragon-20.png")' ],
    //   ['--url-ion-content-node', 'url("../assets/common/dragon/dragon-100.png")' ],
    //   ['--url-ion-content-file', 'url("../assets/common/dragon/dragon-20.png")' ],
    //   ['--url-ion-content-alert', 'url("../assets/common/dragon/dragon-20.png")' ],
    // ],
    // 'ios': [
    //   ['--ion-font-family', 'Roboto' ],

    //   ['--app-text-font-size-tiny', '10px' ],
    //   ['--app-text-font-size-small', '12px' ],
    //   ['--app-text-font-size-medium', '14px' ],
    //   ['--app-text-font-size-large', '16px' ],

    //   ['--app-alert-font-size', '12px' ],
    //   ['--app-toast-font-size', '12px' ],

    //   ['--app-icon-font-size-tiny', '10px' ],
    //   ['--app-icon-font-size-small', '12px' ],
    //   ['--app-icon-font-size-medium', '14px' ],
    //   ['--app-icon-font-size-large', '16px' ],
      
    //   ['--app-color', YELLOW ],
    //   ['--app-background-color', RED ],
    //   ['--ion-color-medium', RED ],
    //   ['--app-logo', 'url("./../../../assets/common/dragon/gia-pha.jpg")'],
    //   ['--app-three-dots', 'url("./../../../assets/icon/three-dots-red.svg")'],
    //   ['--url-ion-content-splash', 'url("../assets/common/dragon/dragon-20.png")' ],
    //   ['--url-ion-content-node', 'url("../assets/common/dragon/dragon-100.png")' ],
    //   ['--url-ion-content-file', 'url("../assets/common/dragon/dragon-20.png")' ],
    //   ['--url-ion-content-alert', 'url("../assets/common/dragon/dragon-20.png")' ],
    // ],
    'css': [
      ['--ion-font-family', 'Roboto' ],

      ['--app-text-font-size-tiny', '10px' ],
      ['--app-text-font-size-small', '12px' ],
      ['--app-text-font-size-medium', '14px' ],
      ['--app-text-font-size-large', '16px' ],
      ['--app-text-font-size-extra-large', '18px' ],
      
      ['--app-icon-font-size-tiny', '10px' ],
      ['--app-icon-font-size-small', '12px' ],
      ['--app-icon-font-size-medium', '14px' ],
      ['--app-icon-font-size-large', '16px' ],
      ['--app-icon-font-size-extra-large', '16px' ],
      
      // ['--app-alert-font-size', '14px' ],
      ['--app-alert-width', '350px'],
      ['--app-alert-height', '150px' ],

      // ['--app-toast-font-size', '18px' ],
      ['--app-toast-height', '100px' ],
      ['--app-toast-width', '400px' ],

      ['--app-color', YELLOW ],
      ['--app-background-color', RED ],
      ['--ion-color-medium', RED ],

      // ['--app-logo', 'url("./../../../assets/icon/gia-pha-dragon.png")'],
      ['--app-logo', 'url("./../../../assets/common/dragon/gia-pha.jpg")'],
      ['--app-three-dots', 'url("./../../../assets/icon/three-dots-red.svg")'],

      // ['--url-ion-content-splash', 'url("../assets/common/dragon/1.jpg")' ],
      // ['--url-ion-content-memory', 'url("../assets/common/dragon/2.jpg")' ],
      // ['--url-ion-content-node', 'url("../assets/common/dragon/3.jpg")' ],
      // ['--url-ion-content-file', 'url("../assets/common/dragon/4.jpg")' ],
      // ['--url-ion-content-alert', 'url("../assets/common/dragon/dragon-20.jpg")' ],

      ['--url-ion-content-splash', 'url("../assets/common/dragon/dragon-20.png")' ],
      ['--url-ion-content-memory', 'url("../assets/common/dragon/dragon-20.png")' ],
      ['--url-ion-content-node', 'url("../assets/common/dragon/dragon-100.png")' ],
      ['--url-ion-content-file', 'url("../assets/common/dragon/dragon-20.png")' ],
      ['--url-ion-content-alert', 'url("../assets/common/dragon/dragon-20.png")' ],
    ],
    'tree-bg':  "../assets/common/dragon/dragon-20.png",
    'splash-bg':  "../assets/common/dragon/dragon-20.png",
  },

  village: { 
    // 'android': [
    //   ['--ion-font-family', 'Roboto' ],

    //   ['--app-text-font-size-tiny', '16px' ],
    //   ['--app-text-font-size-small', '18px' ],
    //   ['--app-text-font-size-medium', '19px' ],
    //   ['--app-text-font-size-large', '20px' ],
    //   ['--app-text-font-size-extra-large', '22px' ],
      
    //   ['--app-icon-font-size-tiny', '16px' ],
    //   ['--app-icon-font-size-small', '18px' ],
    //   ['--app-icon-font-size-medium', '19px' ],
    //   ['--app-icon-font-size-large', '20px' ],
    //   ['--app-icon-font-size-extra-large', '22px' ],

    //   ['--app-alert-font-size', '14px' ],
    //   ['--app-alert-width', '350px'],
    //   ['--app-alert-height', '150px' ],

    //   ['--app-toast-font-size', '18px' ],
    //   ['--app-toast-height', '100px' ],
    //   ['--app-toast-width', '400px' ],

    //   ['--app-color', ORANGE ],
    //   ['--app-background-color', BLUE_PRIMARY ],
    //   ['--ion-color-medium', BLUE_PRIMARY ],
    //   ['--app-logo', 'url("./../../../assets/icon/gia-pha-village.png")'],
    //   ['--app-three-dots', 'url("./../../../assets/icon/three-dots-blue.svg")'],
      
    //   ['--url-ion-content-splash', 'url("../assets/common/village/5-20.png")' ],
    //   ['--url-ion-content-memory', 'url("../assets/common/village/2.jpg")' ],
    //   ['--url-ion-content-node', 'url("../assets/common/village/3.jpg")' ],
    //   ['--url-ion-content-file', 'url("../assets/common/village/4.jpg")' ],
    //   ['--url-ion-content-alert', 'url("../assets/common/village/5-20.png")' ],
    // ],
    // 'ios': [
    //   ['--ion-font-family', 'Roboto' ],

    //   ['--app-text-font-size-tiny', '16px' ],
    //   ['--app-text-font-size-small', '18px' ],
    //   ['--app-text-font-size-medium', '19px' ],
    //   ['--app-text-font-size-large', '20px' ],
    //   ['--app-text-font-size-extra-large', '22px' ],
      
    //   ['--app-icon-font-size-tiny', '16px' ],
    //   ['--app-icon-font-size-small', '18px' ],
    //   ['--app-icon-font-size-medium', '19px' ],
    //   ['--app-icon-font-size-large', '20px' ],
    //   ['--app-icon-font-size-extra-large', '22px' ],

    //   ['--app-color', ORANGE ],
    //   ['--app-background-color', BLUE_PRIMARY ],
    //   ['--ion-color-medium', BLUE_PRIMARY ],
    //   ['--app-logo', 'url("./../../../assets/icon/gia-pha-village.png")'],
    //   ['--app-three-dots', 'url("./../../../assets/icon/three-dots-blue.svg")'],
      
    //   ['--url-ion-content-splash', 'url("../assets/common/village/5-20.png")' ],
    //   ['--url-ion-content-memory', 'url("../assets/common/village/2.jpg")' ],
    //   ['--url-ion-content-node', 'url("../assets/common/village/3.jpg")' ],
    //   ['--url-ion-content-file', 'url("../assets/common/village/4.jpg")' ],
    //   ['--url-ion-content-alert', 'url("../assets/common/village/5-20.png")' ],
    // ],
    'css': [
      // ['--ion-font-family', 'Pacifico' ],
      ['--ion-font-family', 'Roboto' ],

      ['--app-text-font-size-tiny', '12px' ],
      ['--app-text-font-size-small', '14px' ],
      ['--app-text-font-size-medium', '16px' ],
      ['--app-text-font-size-large', '20px' ],
      ['--app-text-font-size-extra-large', '22px' ],
          
      ['--app-icon-font-size-tiny', '12px' ],
      ['--app-icon-font-size-small', '14px' ],
      ['--app-icon-font-size-medium', '16px' ],
      ['--app-icon-font-size-large', '20px' ],
      ['--app-icon-font-size-extra-large', '22px' ],

      // ['--app-alert-font-size', '14px' ],
      ['--app-alert-width', '350px'],
      ['--app-alert-height', '150px' ],

      // ['--app-toast-font-size', '18px' ],
      ['--app-toast-height', '100px' ],
      ['--app-toast-width', '400px' ],

      ['--app-color', ORANGE ],
      ['--app-background-color', BLUE_PRIMARY ],
      ['--ion-color-medium', BLUE_PRIMARY ],
      ['--app-logo', 'url("./../../../assets/icon/gia-pha-village.png")'],
      ['--app-three-dots', 'url("./../../../assets/icon/three-dots-blue.svg")'],
        
      ['--url-ion-content-splash', 'url("../assets/common/village/5-20.png")' ],
      ['--url-ion-content-memory', 'url("../assets/common/village/2.jpg")' ],
      ['--url-ion-content-node', 'url("../assets/common/village/3.jpg")' ],
      // ['--url-ion-content-node', 'url("../assets/icon/gia-pha-frame.png")' ],
      ['--url-ion-content-file', 'url("../assets/common/village/4.jpg")' ],
      ['--url-ion-content-alert', 'url("../assets/common/village/5-20.png")' ],
    ],
    'tree-bg':  "../assets/icon/gia-pha-frame.png",
    // 'tree-bg':  "../assets/common/village/5-20.png",
    // 'tree-bg':  "../assets/icon/gia-pha-frame.jpg",
    'splash-bg':  "../assets/common/village/5-20.png"
  },
  
  tree: { 
    'css': [
      ['--ion-font-family', 'Dancing' ],
      
      ['--app-text-font-size-tiny', '14px' ],
      ['--app-text-font-size-small', '18px' ],
      ['--app-text-font-size-medium', '20px' ],
      ['--app-text-font-size-large', '22px' ],
      ['--app-text-font-size-extra-large', '24px' ],

      ['--app-icon-font-size-tiny', '14px' ],
      ['--app-icon-font-size-small', '18px' ],
      ['--app-icon-font-size-medium', '20px' ],
      ['--app-icon-font-size-large', '22px' ],
      ['--app-icon-font-size-extra-large', '24px' ],
      
			['--app-alert-width', '350px'],
      ['--app-alert-height', '150px' ],
      ['--app-toast-height', '100px' ],
      ['--app-toast-width', '400px' ],

      ['--app-color', ORANGE ],
      ['--app-background-color', BLUE_PRIMARY ],
      ['--ion-color-medium', BLUE_PRIMARY ],
      ['--app-logo', 'url("./../../../assets/icon/gia-pha.png")'],
      ['--app-three-dots', 'url("./../../../assets/icon/three-dots-blue.svg")'],
      
      ['--url-ion-content-splash', 'url("../assets/common/tree/tree-20.png")' ],
      ['--url-ion-content-memory', 'url("../assets/common/tree/tree.png")' ],
      ['--url-ion-content-node', 'url("../assets/common/tree/tree.png")' ],
      ['--url-ion-content-file', 'url("../assets/common/tree/tree.png")' ],
      ['--url-ion-content-alert', 'url("../assets/common/tree/tree-20.png")' ],
    ],
    'tree-bg':  "../assets/common/tree/tree-20.png",
    'splash-bg':  "../assets/common/tree/tree-20.png"
  },

  country: { 
    'css': [
      // ['--ion-font-family', 'Family Tree' ],
      // ['--ion-font-family', "'Poltawski Nowy', serif" ],
      ['--ion-font-family', 'BraahOne' ],
      
			['--app-text-font-size-tiny', '12px' ],
      ['--app-text-font-size-small', '14px' ],
      ['--app-text-font-size-medium', '16px' ],
      ['--app-text-font-size-large', '18px' ],
      ['--app-text-font-size-extra-large', '20px' ],

      ['--app-icon-font-size-tiny', '12px' ],
      ['--app-icon-font-size-small', '14px' ],
      ['--app-icon-font-size-medium', '16px' ],
      ['--app-icon-font-size-large', '18px' ],
      ['--app-icon-font-size-extra-large', '20px' ],
      
			['--app-alert-width', '350px'],
      ['--app-alert-height', '150px' ],
      ['--app-toast-height', '100px' ],
      ['--app-toast-width', '400px' ],

      ['--app-color', WHITE ],
      ['--app-background-color', GREY ],
      ['--ion-color-medium', GREY ],
      ['--app-logo', 'url("./../../../assets/icon/gia-pha.png")'],
      ['--app-three-dots', 'url("./../../../assets/icon/three-dots-red.svg")'],
      
      ['--url-ion-content-splash', 'url("../assets/common/country/1.jpg")' ],
      ['--url-ion-content-memory', 'url("../assets/common/country/2.jpg")' ],
      ['--url-ion-content-node', 'url("../assets/common/country/3.jpg")' ],
      ['--url-ion-content-file', 'url("../assets/common/country/4.jpg")' ],
      ['--url-ion-content-alert', 'url("../assets/common/country/country-20.png")' ],
    ],
    'tree-bg':  "../assets/common/country/country-20.png",
    'splash-bg':  "../assets/common/country/country-20.png",
  },
}

@Injectable({
  providedIn: 'root'
})

export class ThemeService {

  theme: any;
  
  constructor(
    public platform: Platform,
    private dataService: DataService,
  ) { }

  setTheme(theme: any) {

    console.log('theme1: ', theme);

    let root = document.documentElement;
    if (!theme)
      theme = DRAGON;
    if (!themes[theme])
      return;

    let items = [];
    if (theme == DRAGON || theme == VILLAGE) {
      // set by platform
      // if (this.platform.is('android'))
      //   items = themes[theme]['android'];
      // else if (this.platform.is('ios')) {
      //   // alert('is IOS')
      //   items = themes[theme]['ios'];
      // } else
        items = themes[theme]['css'];
    } else {
      items = themes[theme]['css'];
    }

    console.log('items: ', items);

    items.forEach((item:any) => {
      root.style.setProperty(item[0], item[1]);
    })
    this.theme = theme;
    console.log('theme: ', theme);
		this.dataService.saveItem('THEME', theme).then((status:any) => {});
  }

	setSize(size: any) {

		let root = document.documentElement;

		// let val = root.get('--app-text-font-size-tiny');
		// let val = root.style.getPropertyValue('--app-text-font-size-tiny')
    // console.log('val: ', val);
		// let val1 = root.style.getPropertyValue('--app-color')
    // console.log('val1: ', val1);

		let systemSizes = [
			['--app-text-font-size-tiny', root.style.getPropertyValue('--app-text-font-size-tiny')],
			['--app-text-font-size-small', root.style.getPropertyValue('--app-text-font-size-small')],
			['--app-text-font-size-medium', root.style.getPropertyValue('--app-text-font-size-medium')],
			['--app-text-font-size-large', root.style.getPropertyValue('--app-text-font-size-large')],
			['--app-text-font-size-extra-large', root.style.getPropertyValue('--app-text-font-size-extra-large')],
			['--app-icon-font-size-tiny', root.style.getPropertyValue('--app-icon-font-size-tiny')],
			['--app-icon-font-size-small', root.style.getPropertyValue('--app-icon-font-size-small')],
			['--app-icon-font-size-medium', root.style.getPropertyValue('--app-icon-font-size-medium')],
			['--app-icon-font-size-large', root.style.getPropertyValue('--app-icon-font-size-large')],
			['--app-icon-font-size-extra-large', root.style.getPropertyValue('--app-icon-font-size-extra-large')]
		];
		console.log('systemSizes: ', systemSizes);
		let diff = (size == SMALL_SIZE) ? -2 : ((size == MEDIUM_SIZE) ? 0 : 2);
		systemSizes.forEach(item => {
			let pixel = item[1].substring(0, item[1].length - 2);
			root.style.setProperty(item[0], '' + (+pixel + diff) + 'px');
		})
		let val2 = root.style.getPropertyValue('--app-text-font-size-tiny')
    console.log('val2: ', val2);

  }

  setTreeBackground() {
    return themes[this.theme]['tree-bg'];
  }

  setAlertSize(dimension?: any) {
    if (!dimension)
      dimension = { width: 350, height: 50 };
    let root = document.documentElement;
    root.style.setProperty('--app-alert-min-width', dimension.width + 'px');
    root.style.setProperty('--app-alert-height', dimension.height + 'px');
  }

  setScreenSize(nodes: any, verticalTree?) {
    let maxRows = 0;
    nodes.forEach((node:any) => {
      if (node.level > maxRows)
        maxRows = node.level;
    })
    // 60 pixel / level in horizontal tree
    // add 5 lines extra
    let nodePixel = 60;
    if (verticalTree)
      nodePixel *= 2;
		let height = 5 * nodePixel + maxRows * nodePixel;
    // console.log('maxRows, nodePixel, height: ', maxRows, nodePixel, height);
    let root = document.documentElement;
    if (verticalTree)
      root.style.setProperty('--app-screen-height-vertical-tree', height + 'px');
    else
      root.style.setProperty('--app-screen-height', height + 'px');

  }
}
