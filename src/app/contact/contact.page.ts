import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';

const VERSION = '0.0.1';
const CONTACT = 'Phan Viết Hoàng - pvhoang940@gmail.com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  family: any;
  translations: any;
  version: any;
  contact: any;
  
  constructor(
    private alertController: AlertController,
    private dataService: DataService,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    console.log('ngOnInit');
    this.version = VERSION;
    this.contact = CONTACT;
    this.translations = this.languageService.getTrans();
  }

  ionViewWillEnter() {
    console.log('ContactPage - ionViewWillEnter');
    this.dataService.readFamily().then(family => {
      this.family = family;
      console.log('ContactPage - ionViewWillEnter: ', family);
    });
  } 
	
	ionViewWillLeave() {
    // console.log('ionViewWillLeave');
    // this.dataService.saveFamily(this.family);
	}

  async saveTree() {
		let confirm = await this.alertController.create({
      header: this.translations.TREE_UPDATE_HEADER,
			message: this.translations.TREE_UPDATE_MESSAGE,
      inputs: [
        {
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: this.translations.CANCEL,
          handler: (data: any) => {
          }
        },
        {
          text: this.translations.CONTINUE,
          handler: (data: any) => {
            console.log('data:' , data )
            console.log('family:' , this.family )
            let filterFamily = this.filterNodes(this.family);
            // console.log('filterFamily:' , filterFamily )
            this.dataService.saveContent({ email: data['0'], text: JSON.stringify(filterFamily) });
          }
        }
      ]
    });
    confirm.present();
	}

  private filterNodes(family: any) {
    let filterFamily = {};
    filterFamily['nodes'] = [];

    family['nodes'].forEach(node => {
      let newNode = {};
      if (node.id != '') newNode['id'] = node.id;
      if (node.relationship != '') newNode['relationship'] = node.relationship;
      if (node.name != '') newNode['name'] = node.name;
      if (node.nick != '') newNode['nick'] = node.nick;
      if (node.gender != '') newNode['gender'] = node.gender;
      if (node.yob != '') newNode['yob'] = node.yob;
      if (node.yod != '') newNode['yod'] = node.yod;
      if (node.pob != '') newNode['pob'] = node.pob;
      if (node.pod != '') newNode['pod'] = node.pod;
      if (node.por != '') newNode['por'] = node.por;
      filterFamily['nodes'].push(newNode);
    })
    // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
    if (family['children']) {
      filterFamily['children'] = [];
      family['children'].forEach(fam => {
        let newFamily = this.filterFamily(fam);
        filterFamily['children'].push(newFamily);
      })
    }
    return filterFamily;
  }

  private filterFamily(family) {
    let filterFamily = {};
    filterFamily['nodes'] = [];

    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        let newNode = {};
        if (node.id != '') newNode['id'] = node.id;
        if (node.relationship != '') newNode['relationship'] = node.relationship;
        if (node.name != '') newNode['name'] = node.name;
        if (node.nick != '') newNode['nick'] = node.nick;
        if (node.gender != '') newNode['gender'] = node.gender;
        if (node.yob != '') newNode['yob'] = node.yob;
        if (node.yod != '') newNode['yod'] = node.yod;
        if (node.pob != '') newNode['pob'] = node.pob;
        if (node.pod != '') newNode['pod'] = node.pod;
        if (node.por != '') newNode['por'] = node.por;
        filterFamily['nodes'].push(newNode);
      });
    }
    // console.log('filterFamily - nodes:' , filterFamily['nodes'] )
    if (family['children']) {
      filterFamily['children'] = [];
      family['children'].forEach(fam => {
        let nFamily = this.filterFamily(fam);
        filterFamily['children'].push(nFamily);
      })
    }
    return filterFamily;
  }
}
