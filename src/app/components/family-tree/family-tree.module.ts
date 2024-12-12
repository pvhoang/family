import { NgModule } from '@angular/core';
import { FamilyTreeComponent } from './family-tree.component';
import { FtLeafComponent } from './ft-leaf.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [FamilyTreeComponent, FtLeafComponent],
  imports: [
    CommonModule,
  ],
  exports: [FamilyTreeComponent]
})
export class FamilyTreeModule { }
