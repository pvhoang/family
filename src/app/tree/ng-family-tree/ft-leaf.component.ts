
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ft-leaf',
  template: `

    <div *ngFor="let node of child.nodes">
      <span *ngIf="node.span.length == 1"
          class="node"
          [ngClass]="node.relationship ? node.relationship + '-leaf' : ''"
          (click)="_leafSelected(node)" 
          [class]="node.nclass"
          id="{{node.id}}"
      >
        {{node.span[0]}}
      </span>
      
      <span *ngIf="node.span.length == 2"
          class="node"
          [ngClass]="node.relationship ? node.relationship + '-leaf' : ''"
          (click)="_leafSelected(node)" 
          [class]="node.nclass"
          id="{{node.id}}"
      >
        {{node.span[0]}}<br/>{{node.span[1]}}
      </span>

      <span *ngIf="node.span.length == 3"
          class="node"
          [ngClass]="node.relationship ? node.relationship + '-leaf' : ''"
          (click)="_leafSelected(node)" 
          [class]="node.nclass"
          id="{{node.id}}"
      >
        {{node.span[0]}}<br/>{{node.span[1]}}<br/>{{node.span[2]}}
      </span>

    </div>

    <ul *ngIf="child.children && child.children.length > 0">
      <li *ngFor="let row of child.children" [ngStyle]="{'width': child.children.length === 1 ? '100%' : 'auto'}">
        <ft-leaf (onLeafSelected)="_leafSelected($event)" [child]="row"></ft-leaf>
      </li>
    </ul>

  `
})
export class FtLeafComponent {

  @Input() child: any;
  @Output() onLeafSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  _leafSelected(_leaf) {
    // console.log('_leaf: ', _leaf)
    this.onLeafSelected.emit(_leaf);
  }

}

