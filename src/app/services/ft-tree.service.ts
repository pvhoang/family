import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

const SMALL = 6;
const NORMAL = 8;
const LARGE = 10;
const MOBILE = 8;

@Injectable({
  providedIn: 'root'
})
export class FtTreeService {

  constructor(
    public platform: Platform,
	) { }

  scaleStyle: number = NORMAL;
	
	isMobilePlatform() {
		return (this.platform.is('android') || this.platform.is('ios'))
	}

	reset() {
		this.scaleStyle = NORMAL;
	}

	onZoomIn() {
		this.scaleStyle--;
		if (this.scaleStyle < SMALL)
			this.scaleStyle = SMALL;
		console.log('in - scale: ', this.scaleStyle);
	}
	
	onZoomOut() {
		this.scaleStyle++;
		if (this.scaleStyle > LARGE)
			this.scaleStyle = LARGE;
		console.log('out - scale: ', this.scaleStyle);
	}

  getZoomStyle() {
		let scale = this.isMobilePlatform() ? MOBILE : this.scaleStyle;
		// let scale = this.scaleStyle / 10;
    scale /= 10;
    let styles = {
      'zoom': scale,
      '-moz-transform': 'scale(' + scale + ')',
      '-moz-transform-origin': '0 0',
      '-o-transform': 'scale(' + scale + ')',
      '-o-transform-origin': '0 0',
      '-webkit-transform': 'scale(' + scale + ')',
      '-webkit-transform-origin': '0 0'
    };
    return styles;
  }

}
