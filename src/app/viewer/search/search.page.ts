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
	miniSearch: any;
	searchOptions: any;
  // searchNodes = [];
  // searchFields = [];
  // storeFields = [];

	// selectPeople: string = null;
  // selectPeoplePlaceholder: string = null;
	// selectedNode: any = null;
  // selectedNodeName: string = '';
  // peopleNodes: any = [];

	selectItem: string = null;
  itemPlaceholder: string = null;
  // selectedNodeName: string = '';
  items: any = [];

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

	start() {

		this.items = [];
		this.itemPlaceholder = '';

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

							// if (name.indexOf('*') > 0)
								// name = name.substring(0,name.indexOf('*'))
							if (name.indexOf(' (') > 0)
								name = name.substring(0,name.indexOf(' ('))

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

		let searchFields = [ 'name', 'pob', 'pod', 'por', 'yob', 'yod', 'dod' ];
		// add desc fields for name
		searchDescFields.forEach(field => {
			searchFields.push(field);
		})
		let storeFields = [ 'firstName', 'lastName', 'node'];

    if (DEBUGS.SEARCH) {
			console.log('storeFields: ', storeFields);
			console.log('searchNodes: ', searchNodes);
			console.log('searchFields: ', searchFields);
		}

		this.miniSearch = new MiniSearch({
	
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
		// match exact name, no fuzzy, no boost
		this.searchOptions = { fuzzy: 0.2, boost: { 'name': 2 } };
		this.miniSearch.addAll(searchNodes);
	}

	async onExit() {
    await this.modalCtrl.dismiss({
      result: false
    });
  }

	// ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // -------------------------------------

	clearItem() {
    this.selectItem = null;
  }

  closeItem() {
    if (DEBUGS.SEARCH)
      console.log('closeItem - selectItem: ', this.selectItem);
    if (this.selectItem) {
			this.search(this.selectItem, true).then((results:any) => {
				if (DEBUGS.SEARCH)
					console.log('closeItem - results: ', results);
				this.items = [];
			});
		}
  }
  
  keyupItem(event) {
		let value = event.target.value;
		let key = event.key;
		if (DEBUGS.SEARCH)
			console.log('keyupItem - value, key: ', value, key);
		if (!value || value === '' || key === 'Enter') {
			this.items = [];
			return;
		}
		this.search(value).then((suggests:any) => {
			if (DEBUGS.SEARCH)
				console.log('keyupItem - suggests: ', suggests);
			if (suggests.length == 0) {
				this.items = [];
			} else {
				this.items = suggests;
			}
		});
  }

	// --------- END ng-select ----------
	
	search(value: any, enter?: any) {
		return new Promise((resolve) => {
			let stripVal = this.utilService.stripVN(value);
			let results = [];
			let suggest = this.miniSearch.autoSuggest(stripVal, { fuzzy: 0.2 })
			console.log('testMiniSearch - suggest: ', suggest);
			if (suggest.length > 0)
				results = suggest[0].terms;  
			if (enter)
				results = this.showSearchResults(value);
			resolve(results);
		});
	}

	showSearchResults(value: any) {
		let searchOptions = this.searchOptions;
		if (value.charAt(0) == '"') {
			// match 100%
			value = value.substring(1);
			searchOptions = { combineWith: 'AND' };
		}
		let miniSearch = this.miniSearch;
		let stripVal = this.utilService.stripVN(value);
		let search = miniSearch.search(stripVal, searchOptions)

    if (DEBUGS.SEARCH) {
			console.log('testMiniSearch - value: ', value);
			console.log('testMiniSearch - search: ', search);
		}

		let results = search;
		// get top MAX_TOTAL_SCORES and find the best
		let max = (results.length < MAX_TOTAL_SCORES) ? results.length : MAX_TOTAL_SCORES;

		let res = [];
		// let max = results.length;
		let result  = '';
		for (let ct = 0; ct < max; ct++) {
			let item = results[ct];
			// score is too small, ignore
			// if (item.score < 2)
			// 	break;
			let node = item.node;
			let name = node.name + ' (' + this.nodeService.getGenerationShort(node) + ')';
			result += '<b>' + name + '</b><br>' + this.getNodeHtml(node, item.match) + '<br>';
			// result += '<b><i>' + this.getMatch(node.name, item.match) + '</i></b><br>' + this.getNodeHtml(node, item.match) + '<br>';
			if (DEBUGS.SEARCH) {
				console.log('SCORE:' , item.score);
				for (let key of Object.keys(item.match)) {
					console.log('match - key, count, value:' , key, item.match[key]);
				}
			}
		};
		document.getElementById('detail').innerHTML = result;
		return results;
	}

	// w|Phan Viet Hoang
	private getNameInLine(line:any) {
		let items = line.split('|');
		if (items.length > 1) {
			let rel = items[0].trim();
			// let status = RELATION_STATUS[rel];
			let relation = this.utilService.getRelationStr(rel);
			if (relation !== '') {
				let name = items[1].trim();
				return [relation, name];
			}
			return [];
		}
		return null;
	}

	// check with match
	private getMatch(name: any, match: any, extraStr?: any) {
		let starName = false;
		if (name.indexOf('*') > 0) {
			name = name.substring(0,name.indexOf('*'))
			starName = true;
		}
		if (extraStr)
			name += extraStr;

		for (let key of Object.keys(match)) {
			// if (key == this.utilService.stripVN(name)) {
			if (this.utilService.stripVN(name).indexOf(key) >= 0) {
				if (starName)
					// name = "<b style='color:blue;'><i>" + name + "🌲</i></b>";
					name = "<span style='color:blue;'>" + name + "🌲</span>"
				else
					// name = "<style='color:blue;'><i>" + name + "</i></b>";
					name = "<span style='color:blue;'>" + name + "</span>"
				return name;
			}
		}
		if (starName) {
			name = "<span style='color:green;'>" + name + "🌲</span>";
			// name = "<b style='color:green;'><i>" + name + "🌲</i></b>";
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
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_VIEW_CHILD_OF_FATHER') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + ((parent) ? this.getMatch(parent.name, match) : '') +
				'</ion-col>' +
			'</ion-row>';
		html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_YOB') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.yob, match) +
				'</ion-col>' +
			'</ion-row>';
		if (!pass_away) {
			html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_POR') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.por, match) +
				'</ion-col>' +
			'</ion-row>';
		} else {
			html +=
				'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_YOD') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.yod, match) +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_TOMB') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.pod, match) +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + this.languageService.getTranslation('NODE_DOD') +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + this.getMatch(node.dod, match) +
				'</ion-col>' +
			'</ion-row>';
		}
		// html += '</ion-grid>';

		if (Array.isArray(node.desc) && node.desc.length > 0) {
			let relHtmls = [];
			node.desc.forEach((item:any) => {
				let vals = this.getNameInLine(item);
				if (vals && vals.length > 1) {
					let status = vals[0]
					let name = vals[1]
					name = this.getMatch(name, match);
					relHtmls.push([status, name]);
				}
			});
			if (relHtmls.length > 0) {
				html += 
						'<ion-grid class="viewer-home-grid">' +
						'<ion-row>' +
							'<ion-col size="5" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_ITEM') +
							'</ion-col>' +
							'<ion-col size="7" class="column center">' + this.languageService.getTranslation('SEARCH_NODE_RELATION') +
							'</ion-col>' +
						'</ion-row>';
				relHtmls.forEach(rel => {
					html += 
					'<ion-row>' +
					'<ion-col size="5" class="column center">' + rel[0] +
					'</ion-col>' +
					'<ion-col size="7" class="column center">' + rel[1] +
					'</ion-col>' +
					'</ion-row>';
				})
			}

			// node.desc.forEach((item:any) => {
			// 	let vals = this.getNameInLine(item);
			// 	if (vals && vals.length > 1) {
			// 		let status = vals[0]
			// 		let name = vals[1]
			// 		name = this.getMatch(name, match);
			// 		html += 
			// 		'<ion-row>' +
			// 		'<ion-col size="5" class="column center">' + status +
			// 		'</ion-col>' +
			// 		'<ion-col size="7" class="column center">' + name +
			// 		'</ion-col>' +
			// 		'</ion-row>';
			// 	}
			// })
		// }
			// html += '</ion-grid>';
		}
		html += '</ion-grid>';
		return html;
	}

}
