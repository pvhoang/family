import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FtTreeService {

  constructor() { }

  scaleStyle: number = 10;
	
	reset() {
		this.scaleStyle = 10;
	}

	onZoomIn() {
		this.scaleStyle--;
		if (this.scaleStyle < 8)
			this.scaleStyle = 8;
		console.log('in - scale: ', this.scaleStyle);
	}
	
	onZoomOut() {
		this.scaleStyle++;
		if (this.scaleStyle > 12)
			this.scaleStyle = 12;
		console.log('out - scale: ', this.scaleStyle);

	}

  getZoomStyle() {
    let scale = this.scaleStyle / 10;
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
