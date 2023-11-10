import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ft-leaf',
  templateUrl: './ft-leaf.component.html',
})
export class FtLeafComponent {

  @Input() view: any;
  @Input() child: any;
  
  @Output() onLeafSelected: EventEmitter<any> = new EventEmitter();
  constructor() { }
  
  _leafSelected(_leaf) {
    // console.log('_leaf: ', _leaf)
    this.onLeafSelected.emit(_leaf);
  }
}

