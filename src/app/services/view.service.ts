import { Injectable } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { UtilService } from '../services/util.service';

import { Family, Node, NODE } from './family.model';

@Injectable({
  providedIn: 'root'
})
export class ViewService {

  constructor(
    private utilService: UtilService,
    private languageService: LanguageService,
  ) { }

  viewNodeDetail(node:any) {

    // let title = node.name;
    // let options = [];
    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_GENERATION'), value: node.level});
    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_CHILD_OF'), value: node.pnode.name});
    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_NICK_NAME'), value: node.nick});
    // if (node.family.children)
    //   options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_NUM_CHILDREN'), value: node.family.children.length});

    // if (node.family.nodes.length > 1) {
    //   let spouseNode = null;
    //   for (let i = 0; i < node.family.nodes.length; i++) {
    //     if (node.name == node.family.nodes[i]) {
    //       // use the other node
    //       spouseNode = (i == 0) ? node.family.nodes[1] : node.family.nodes[0]
    //       break;
    //     }
    //   }
    //   if (spouseNode) {
    //     if (spouseNode.gender == 'male')
    //       options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_HUSBAND'), value: spouseNode.name});
    //     else
    //       options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_WIFE'), value: spouseNode.name});
    //   }
    // }

    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_YOB_YOD'), value: (node.yob + ' - ' + node.yod)});
    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_POB'), value: node.pob });
    // options.push({ name: this.languageService.getTranslation('TREE_ALERT_VIEW_POR'), value: node.por });

    // let msg = this.utilService.getAlertTableMessage(options);
    // this.utilService.alertMsg(title, msg, 'alert-dialog').then((res) => {
    //   if (res.data) {
    //   }
    // });
  }
}
