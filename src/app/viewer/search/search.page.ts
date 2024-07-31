import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { TypeaheadService } from '../../services/typeahead.service';
import { NodeService } from '../../services/node.service';
import { UtilService } from '../../services/util.service';
import { SearchService } from '../../services/search.service';
import MiniSearch from 'minisearch'
import { NODE_FIELDS, SEARCH_FIELDS } from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS, environment } from '../../../environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

	@Input() caller: string;
  @Input() nodes: any;
  @Input() family: any;
  @Input() info: any;

	@ViewChild('popover') popover:any;

  FONTS_FOLDER = FONTS_FOLDER;

  title: any;
  isOpen = false;
  values: any = {};
  results = [];
	value: any;
	placeHolder = '';
  searchNames = [];
	searchResult = '';

  constructor(
    public modalCtrl: ModalController,
    private languageService: LanguageService,
    private typeahead: TypeaheadService,
    private nodeService: NodeService,
    private utilService: UtilService,
    private searchService: SearchService,
	) { }

	ngOnInit(): void {
    this.title = 'SEARCH';
    this.values = this.nodeService.loadValues(this.nodes[0]);
    this.typeahead.getJsonPlaces().then((data:any) => {
      // this.locations = data;
    })
    if (DEBUGS.EDIT)
      console.log('EditPage - ngOnInit - values: ', this.values);
  }


	async onExit() {
    await this.modalCtrl.dismiss({
      result: false
    });
  }

	// ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // -------------------------------------

  presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  onName(name: any) {
    this.isOpen = false;
    this.values.name = name;
  }

	keyupItem(event: any, item: any) { 
    let value = event.target.value;
		console.log('keyupItem - value: ', value);
		if (value.length < 2)
			return;
		this.testMiniSearch(value);
	}
  
  clearItem(item) {
    if (DEBUGS.EDIT)
      console.log('EditPage - clearItem');
    this.values[item] = null;
  }

	testMiniSearch(value) {

		let stripVal = this.utilService.stripVN(value);
		let miniSearch = new MiniSearch({
			fields: SEARCH_FIELDS, // fields to index for full-text search
			storeFields: NODE_FIELDS,
			extractField: (document, fieldName) => {
				// console.log('document: ', document, fieldName);
				// covert to lower case for Vietnamese
				let value = document[fieldName];
				if (fieldName === 'name' || fieldName === 'pob' || fieldName === 'pod' ) {
					return this.utilService.stripVN(value);
				} else if (fieldName === 'desc') {
					return this.searchService.getNamesFromDesc(value);
				}
				return value;
			}
		})
		// Index all documents
		miniSearch.addAll(this.nodes);

		let suggests = miniSearch.autoSuggest(stripVal)
		console.log('testMiniSearch - value, suggests: ', value, suggests);

		suggests = miniSearch.autoSuggest(stripVal, { fuzzy: 0.2 })
		console.log('testMiniSearch - value, fuzzy: ', value, suggests);

		// let results = miniSearch.search(stripVal)
		let results = miniSearch.search(stripVal, { combineWith: 'AND' })
		
		// miniSearch.search('motorcycle art', { combineWith: 'AND' })


		// console.log('testMiniSearch - value, results: ', value, results);
		// get top 5
		let max = (results.length < 3) ? results.length : 3;
		let result  = '';
		for (let ct = 0; ct < max; ct++) {
			let item = results[ct];
			if (item.score < 2)
				break;
			console.log('SCORE:' , item.score);
			console.log('name:' , item.name);
			console.log('desc:' , item.desc);
			console.log('match:' , item.match);
			console.log('queryTerms:' , item.queryTerms);
			console.log('terms:' , item.terms);

			let nodes = this.nodes.filter(node => {return node.id == item.id});
			result += '<b>' + nodes[0].name + '</b><br>' + this.getNodeHtml(nodes[0]) + '<br>';
			// result += '<b>' + nodes[0].name + '</b><br>' + this.getPhaKy() + '<br>';
			
		};
		this.searchResult = result;
		document.getElementById('detail').innerHTML = this.searchResult;

	}

	private getNodeHtml(node) {

		let parent = node.pnode;
		let html = 
		'<ion-grid class="viewer-home-grid">' +
			'<ion-row>' +
				'<ion-col size="6" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_ITEM') +
				'</ion-col>' +
				'<ion-col size="6" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_DETAIL') +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="6" class="column">' + '<b>' + this.languageService.getTranslation('NODE_NICK') + '</b>' +
				'</ion-col>' +
				'<ion-col size="6" class="column">' + node.nick +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="6" class="column">' + '<b>' + this.languageService.getTranslation('NODE_VIEW_CHILD_OF_FATHER') + '</b>' +
				'</ion-col>' +
				'<ion-col size="6" class="column">' + parent.name +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="6" class="column">' + '<b>' + this.languageService.getTranslation('NODE_YOB') + '</b>' +
				'</ion-col>' +
				'<ion-col size="6" class="column">' + node.yob +
				'</ion-col>' +
			'</ion-row>' +

			'</ion-grid>';
		return html;
	}

	// private getNodeHtml1(node) {
	// 	// Tuc, Cha, Sinh, Tu, Sinh quan, Tru quan, Mo phan
	// 	let parent = node.pnode;
	// 	let html = '';
	// 	html += '<br>';
	// 	html += '<div><table>';
	// 	html += '<tr><th>Thong tin</th><th>Giai thich</th></tr>';
	// 	// html += '<tr>' + '<td><b><span '+ style + '>' + name + '</span></b></td>' +
	// 	html += '<tr><td><b>' + this.languageService.getTranslation('NODE_NICK') + '</b></td><td>' + node.nick + '</td></tr>';
	// 	html += '<tr><td><b>' + this.languageService.getTranslation('NODE_VIEW_CHILD_OF_FATHER') + '</b></td><td>' + parent.name + '</td></tr>';
	// 	html += '<tr><td><b>' + this.languageService.getTranslation('NODE_YOB') + '</b></td><td>' + node.yob + '</td></tr>';
	// 	html += '</table></div>';
	// 	return html;
	// }

	// private getPhaKy() {

	// 	let html = '';
	// 		html += 
	// 		'<ion-grid class="viewer-home-grid">' +
	// 		'<ion-row>' +
	// 			'<ion-col size="4" class="column center">' +
	// 				this.languageService.getTranslation('GENERATION') + '<br/>(Năm, Số hệ)' +
	// 			'</ion-col>' +
	// 			'<ion-col size="4" class="column center">' +
	// 				this.languageService.getTranslation('HOME_FIRST_NODE') +
	// 			'</ion-col>' +
	// 			'<ion-col size="4" class="column center">' +
	// 				this.languageService.getTranslation('HOME_LAST_NODE') +
	// 			'</ion-col>' +
	// 		'</ion-row>';
			// let keys = Object.keys(levels);
			// // for (let i = 0; i < 5; i++) {
			// for (let i = 0; i < keys.length; i++) {
			// 	let key = keys[i];
			// 	html += 
			// 	'<ion-row>' +
			// 	'<ion-col size="4" class="column">' +
			// 		'<b>' + key + '</b>' + '<br/>(' + levels[key].yob + ',' + levels[key].max + ')' +
			// 	'</ion-col>' +
			// 	'<ion-col size="4" class="column">' +
			// 		levels[key].minNode.name +
			// 	'</ion-col>' +
			// 	'<ion-col size="4" class="column">' +
			// 		levels[key].maxNode.name +
			// 	'</ion-col>' +
			// 	'</ion-row>';
			// };
	// 		html += 
	// 		'</ion-grid>';
	// 	return html;
	// }

	// miniSearch(nodes, values) {
	// 	// console.log('values: ', values)		
	// 	// console.log('nodes: ', nodes)
	// 	let miniSearch = new MiniSearch({
	// 		fields: ['name', 'pob', 'pod'], // fields to index for full-text search
	// 		storeFields: ['name', 'gender'], // fields to return with search results
	// 		extractField: (document, fieldName) => {
	// 			// console.log('document: ', document, fieldName);
	// 			// If field name is 'pubYear', extract just the year from 'pubDate'
	// 			// if (fieldName === 'name') {
	// 			// 	let val = document['name']
	// 			// 	console.log('name: ', val)
	// 			// 	// if (val == 'Hải')
	// 			// 	// 	val = 'hai'
	// 			// 	// // return pubDate && pubDate.getFullYear().toString()
	// 			// 	return val;
	// 			// }
	// 			return document[fieldName];
	// 		}
	// 	})
		
	// 	// Index all documents
	// 	miniSearch.addAll(nodes)
		
	// 	// Search with default options
	// 	let results = miniSearch.search(values.name)
	// 	// add all names
	// 	let result  = '';
	// 	results.forEach(item => {
	// 		result += '<b>' + item.name + '</b><br>'
	// 	});
	// 	this.searchResult = result;
	// }

}
