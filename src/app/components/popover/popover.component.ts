import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, } from '@ionic/angular';
import { FONTS_FOLDER } from '../../../environments/environment';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  @Input() header: any;
  @Input() node: any;
  @Input() isChildOK: any;
  @Input() isBranchOK: any;

  isDeleteOK = false;
  isAddOK = false;
  isAddBranchOK = false;

  FONTS_FOLDER = FONTS_FOLDER;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    // ok to delele leaf node
    this.isDeleteOK = !this.node.family.children || this.node.family.children.length == 0;
    this.isAddOK = this.isChildOK;
    this.isAddBranchOK = this.isBranchOK;
  }
  onView() {
    this.popoverController.dismiss('onView');
  }
  onEdit() {
    this.popoverController.dismiss('onEdit');
  }
  onAdd() {
    this.popoverController.dismiss('onAdd');
  }
  onAddBranch() {
    this.popoverController.dismiss('onAddBranch');
  }
  onDelete() {
    this.popoverController.dismiss('onDelete');
  }
  onTree() {
    this.popoverController.dismiss('onTree');
  }
}
