import { Injectable } from '@angular/core';
// import { Platform } from '@ionic/angular';
import { Capacitor } from "@capacitor/core";
import { DEBUGS } from '../../environments/environment';

const COLORS = {
	ORANGE: '#fee8b9',
	BLUE_PRIMARY: '#063970',
	WHITE: '#FFFFFF',
	GREY: '#808080',
	RED: '#C10100',
	YELLOW: '#FFFF00',
	VANILLA: '#f0e9e1',
}
// VANILLA: https://colorswall.com/palette/25978

@Injectable({
  providedIn: 'root'
})

export class ThemeService {

  themes: any;
  theme: any;
  size: any;

	constructor(
    // public platform: Platform,
  ) { }

  setSystemProperties(themes: any, theme: any, size: any) {
    if (DEBUGS.THEME) {
			console.log('setSystemProperties - themes: ', themes);
			console.log('theme: ', theme);
			console.log('size: ', size);
			console.log('platform: ', Capacitor.getPlatform());
		}

		// set by platform
		let items = themes[theme]['template'];
		let commonItems = themes[theme]['common'];
		// set size by template: small/medium/large
		let inc = { small: 0, medium: 2, large: 4 }
		items.forEach((item: any) => {
			let px = item[1];
			let value = +px.substring(0, px.indexOf('px'));
			value += inc[size];
			item[1] = '' + value + 'px';
		})
		
    let root = document.documentElement;
		items.forEach((item:any) => {
      root.style.setProperty(item[0], item[1]);
    })
		commonItems.forEach((item:any) => {
			let color = COLORS[item[1]];
			let value = (color) ? color : item[1];
      root.style.setProperty(item[0], value);
    })

		if (DEBUGS.THEME) {
			this.printRootProperty('Normal text font:', '--app-text-font-size-small');
			console.log('setSystemProperties - fonts: ', items);
			console.log('setSystemProperties - commonItems: ', commonItems);
		}
		this.size = size;
		this.theme = theme;
		this.themes = themes;
	}

	getSize() {
		return this.size;
	}
	
  setTreeBackground() {
    return this.themes[this.theme]['tree-bg'];
  }

	setRootProperties(values: any) {
    let root = document.documentElement;
		values.forEach(prop => {
			root.style.setProperty(prop[0], prop[1]);
		})
  }

	getRootProperty(property: any) {
    let root = document.documentElement;
		return root.style.getPropertyValue(property)
  }

	printRootProperty(msg: any, property: any) {
		let root = document.documentElement;
		let value = root.style.getPropertyValue(property);
		if (DEBUGS.THEME)
			console.log(msg + ' - ' + property + ' : ' + value);
	}

	setToastSize(message) {
    console.log('setToastSize: ', message);
		let lines = message.split('<br/>');
		let lineChars = 0;
		lines.forEach(line => {
			if (line.length > lineChars)
				lineChars = line.length;
		})
		if (DEBUGS.THEME) {
			console.log('setToastSize: line: ', lines);
			console.log('setToastSize: lineChars: ', lineChars);
		}
		let height = (lines.length == 1) ? 50 : ((lines.length == 2) ? 80 : 120);
		// let width = (lineChars < 30) ? 400 : ((lineChars < 50) ? 500 : 600);
    let root = document.documentElement;
    root.style.setProperty('--app-toast-height', height + 'px');
    // root.style.setProperty('--app-toast-width', width + 'px');
    root.style.setProperty('--app-toast-width', '80%');
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
    let root = document.documentElement;
    if (verticalTree)
      root.style.setProperty('--app-screen-height-vertical-tree', height + 'px');
    else
      root.style.setProperty('--app-screen-height', height + 'px');
  }
}
