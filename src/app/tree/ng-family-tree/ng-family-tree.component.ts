import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

// <div class="center-this">
// </div>

@Component({
  selector: 'ft-tree',
  template: `
    <div class="tree" id="tree">
      <ul>
        <li>
          <div *ngFor="let node of family.nodes">
            <span *ngIf="node.span.length == 1"
            class="node"
            [ngClass]="node.relationship ? node.relationship + '-leaf' : ''"
            (click)="_leafSelected(node)" 
            [class]="node.nclass"
            id="{{node.id}}"
            >
              {{node.span[0]}}
            </span>
          </div>
          <ul *ngIf="family.children && family.children.length > 0">
            <li *ngFor="let child of family.children" [ngStyle]="{'width': _setWidth(child) ? '100%' : 'auto'}" >
              <ft-leaf (onLeafSelected)="_leafSelected($event)" [child]="child"></ft-leaf>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./ng-family-tree.component.scss'],
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class NgFamilyTreeComponent implements OnInit {

  @Input() family: any;
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
