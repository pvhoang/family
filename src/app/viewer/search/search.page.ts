import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { TypeaheadService } from '../../services/typeahead.service';
import { NodeService } from '../../services/node.service';
import { UtilService } from '../../services/util.service';
import { SearchService } from '../../services/search.service';
import MiniSearch from 'minisearch'
import { FONTS_FOLDER, DEBUGS, environment } from '../../../environments/environment';

// const RELATION_STATUS = { h: 'Chồng', w: 'Vợ', s: 'Con trai', d: 'Con gái' }
const MAX_TOTAL_SCORES = 3;
const MAX_SCORES = 1.0;

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

	@Input() caller: string;
  @Input() nodes: any;
  @Input() family: any;

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
  searchNodes = [];
  searchDescFields = [];

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
    })
		this.start();
    if (DEBUGS.SEARCH)
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
		// console.log('keyupItem - value: ', value);
		if (value.length < 2)
			return;
		this.testMiniSearch(value);
	}
  
  clearItem(item) {
    if (DEBUGS.SEARCH)
      console.log('EditPage - clearItem');
    this.values[item] = null;
  }

	start() {
		// convert nodes to searchNodes
		let searchNodes = [];
		let searchDescFields = [];

    this.nodes.forEach((node: any) => {
			let name = node.name;
			// break into first and last name
			let names = name.split(' ');
			let lastName = names[0].trim();
			let firstName = names[names.length-1].trim();
		
			// break desc to multiple names
			let desc = node.desc;
			let desc_name = {};

			if (Array.isArray(node.desc)) {
				let descID = 'desc'
				let str = '';
				let extraInfo = '';
				let id = 1;
				node.desc.forEach((item:any) => {
					let vals = this.getNameInLine(item);
					if (vals) {
						if (vals.length > 1) {
							// valid name
							let name = vals[1]
							if (name.indexOf('*') > 0)
								name = name.substring(0,name.indexOf('*'))
							str += name + ',';
							let descField = descID+'_'+(id++);
							desc_name[descField] = name;
							if (searchDescFields.length < id)
								searchDescFields.push(descField)
						}
						// ignore other item with |
					} else {
						extraInfo += item + ' ';
					}
				})
				extraInfo = extraInfo.trim();
				if (extraInfo.length > 0) {
					extraInfo = this.utilService.stripVN(extraInfo);
					str += extraInfo + ',';
					let descField = descID+'_'+(id);
					desc_name[descField] = extraInfo;
					searchDescFields.push(descField);
				}
				desc = str;
			}
			let nick = node.nick;
			let pob = (!node.pob || node.pob == '') ? 'Quảng Bình' : node.pob;
			let pod = (!node.pod || node.pod == '') ? 'Quảng Bình' : node.pod;
			let por = (!node.por || node.por == '') ? 'Quảng Bình' : node.por;
			let yob = node.yob;
			let yod = node.yod;
			let dod = node.dod;
			let snode = { id: node.id, name: name, firstName: firstName, lastName: lastName, nick: nick, pob: pob, pod: pod, por: por, yob: yob, yod: yod, dod: dod, node: node}

			for (let descID of Object.keys(desc_name)) {
				snode[descID] = desc_name[descID]
			}
      searchNodes.push(snode);
    })
		this.searchNodes = searchNodes;
		console.log('testMiniSearch - searchNodes: ', this.searchNodes);
		this.searchDescFields = searchDescFields;
		console.log('testMiniSearch - searchDescFields: ', this.searchDescFields);
	}

	testMiniSearch(value: any) {

		let searchFields = [ 'name', 'pob', 'pod', 'por', 'yob', 'yod', 'dod' ];
		// add desc fields for name
		this.searchDescFields.forEach(field => {
			searchFields.push(field);
		})
		let storeFields = [ 'firstName', 'lastName', 'node'];

		let miniSearch = new MiniSearch({

			fields: searchFields, // fields to index for full-text search
			storeFields: storeFields,

			tokenize: (string, _fieldName) => {
				// remove special characters in multi-word string
				// Richmond, Virginia | Ha-Noi
				// if (_fieldName == 'desc')
				// 	console.log('tokenize: ', string, _fieldName);
				let str:any = string;
				return str.replaceAll(',','/').replaceAll('-','/').split('/')
			},

			processTerm: (term, _fieldName) => {
				// do not process common terms like 'phan'
				if (term == 'phan') {
					// console.log('processTerm: ', term, _fieldName);
					return null;
				}
				return this.utilService.stripVN(term);
			},

			extractField: (document, fieldName) => {
				// get modified value before processing
				// convert to lower case for Vietnamese
				let value = document[fieldName];
				if (value == undefined)
					return undefined;
				return (fieldName !== 'node') ? this.utilService.stripVN(value) : value;
			},
		})

		// let searchOptions:any = { fuzzy: 0.2, boost: { 'name': 2 } };
		// match exact name, no fuzzy, no boost
		let searchOptions:any = { };

		if (value.charAt(0) == '"') {
			// match 100%
			value = value.substring(1);
			searchOptions = { combineWith: 'AND' };
		}
		miniSearch.addAll(this.searchNodes);

		let stripVal = this.utilService.stripVN(value);
		// let fuzzy = miniSearch.autoSuggest(stripVal)
		let fuzzy = miniSearch.autoSuggest(stripVal, { fuzzy: 0.2 })
		let search = miniSearch.search(stripVal, searchOptions)

    if (DEBUGS.SEARCH) {
			console.log('testMiniSearch - value: ', value);
			console.log('testMiniSearch - fuzzy: ', fuzzy);
			console.log('testMiniSearch - search: ', search);
		}

		let results = search;
		// get top MAX_TOTAL_SCORES and find the best
		let max = (results.length < 3) ? results.length : 3;
		let res = [];
		// let max = results.length;
		let result  = '';
		for (let ct = 0; ct < max; ct++) {
			let item = results[ct];
			// score is too small, ignore
			if (item.score < 2)
				break;
			let node = item.node;
			result += '<b>' + this.getMatch(node.name, item.match) + '</b><br>' + this.getNodeHtml(node, item.match) + '<br>';
			if (DEBUGS.SEARCH) {
				console.log('SCORE:' , item.score);
				for (let key of Object.keys(item.match)) {
					console.log('match - key, count, value:' , key, item.match[key]);
				}
			}
			// console.log('queryTerms:' , item.queryTerms);
			// console.log('terms:' , item.terms);
			// let nodes = this.nodes.filter((node:any) => {return node.id == item.id});
			// result += '<b>' + nodes[0].name + '</b><br>' + this.getNodeHtml(nodes[0]) + '<br>';
			// console.log('name:' , nodes[0].name);
		};
		this.searchResult = result;
		document.getElementById('detail').innerHTML = this.searchResult;
	}

	// w|Phan Viet Hoang
	private getNameInLine(line:any) {
		let items = line.split('|');
		if (items.length > 1) {
			let rel = items[0].trim();
			// let status = RELATION_STATUS[rel];
			let relation = this.utilService.getRelationStr(rel);
			// let relation = ''
			// if (rel == 'w') relation = this.languageService.getTranslation('hien_the')
			// if (rel == 'h') relation = this.languageService.getTranslation('hien_phu')
			// if (rel == 's1') relation = this.languageService.getTranslation('truong_nam')
			// if (rel == 's') relation = this.languageService.getTranslation('thu_nam')
			// if (rel == 'd1') relation = this.languageService.getTranslation('truong_nu')
			// if (rel == 'd') relation = this.languageService.getTranslation('thu_nu')
			if (relation !== '') {
				let name = items[1].trim();
				return [relation, name];
			}
			return [];
		}
		return null;
	}

	// check with match
	private getMatch(name: any, match: any) {
		let starName = false;
		if (name.indexOf('*') > 0) {
			name = name.substring(0,name.indexOf('*'))
			starName = true;
		}
		for (let key of Object.keys(match)) {
			// if (key == this.utilService.stripVN(name)) {
			if (this.utilService.stripVN(name).indexOf(key) >= 0) {
				name = "<b style='color:blue;'><i>" + name + "</i></b>";
				return name;
			}
		}
		if (starName) {
			name = "<b style='color:green;'><i>" + name + "</i></b>";
		}
		return name;
	}

	private getNodeHtml(node: any, match: any) {

		let currentYear = new Date().getFullYear();
		let pass_away =
			(node.yod && node.yod !== '') ||
			(node.dod && node.dod != '') ||
			(node.yob && node.yob != '' && (+node.yob + 100 < currentYear) )

		let parent = node.pnode;
		let html = 
		'<ion-grid class="viewer-home-grid">' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_ITEM') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_DETAIL') +
				'</ion-col>' +
			'</ion-row>';

		html += 
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_VIEW_CHILD_OF_FATHER') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + ((parent) ? this.getMatch(parent.name, match) : '') +
				'</ion-col>' +
			'</ion-row>';
		html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_YOB') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.yob, match) +
				'</ion-col>' +
			'</ion-row>';
		if (!pass_away) {
			html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_POR') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.por, match) +
				'</ion-col>' +
			'</ion-row>';
		} else {
			html +=
				'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_YOD') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.yod, match) +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_TOMB') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.pod, match) +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_DOD') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.dod, match) +
				'</ion-col>' +
			'</ion-row>';
		}

		if (Array.isArray(node.desc)) {
			node.desc.forEach((item:any) => {
				let vals = this.getNameInLine(item);
				if (vals && vals.length > 1) {
					let status = vals[0]
					let name = vals[1]
					name = this.getMatch(name, match);
					html += 
					'<ion-row>' +
					'<ion-col size="5" class="column center">' + '<b>' + status + '</b>' +
					'</ion-col>' +
					'<ion-col size="7" class="column center">' + name +
					'</ion-col>' +
					'</ion-row>';
				}
			})
			html += '</ion-grid>';
		}
		return html;
	}

}
