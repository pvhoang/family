import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ft-tree',
  templateUrl: './ng-family-tree.component.html',
  styleUrls: ['./ng-family-tree.component.scss', './vertical-tree.component.scss'],
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class NgFamilyTreeComponent implements OnInit {

  @Input() family: any;
  @Input() class: any;
  @Output() onLeafSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  _leafSelected(_leaf) {
    this.onLeafSelected.emit(_leaf);
  }

  _setWidth(child: any) {
    return child.nodes && child.nodes[0].relationship === 'self' && child.children.length < 2;
  }
}
