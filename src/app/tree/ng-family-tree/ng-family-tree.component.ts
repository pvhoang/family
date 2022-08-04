import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

// <div id="{{node.idlevel}}">
// </div>
// <div class="top" *ngFor="let node of family.nodes">
// <span style="text-overflow:ellipsis; width:250px; display:inline-block; word-break: break-word;" 


@Component({
  selector: 'ft-tree',
  template: `
    <div class="tree">
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

          <ul>
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
