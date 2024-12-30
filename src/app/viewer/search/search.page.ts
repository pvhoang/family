import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { TypeaheadService } from '../../services/typeahead.service';
import { NodeService } from '../../services/node.service';
import { UtilService } from '../../services/util.service';
import { SearchService } from '../../services/search.service';
import MiniSearch from 'minisearch'
// import { NODE_FIELDS, SEARCH_FIELDS } from '../../services/family.model';
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
					let items = item.split('|');
					if (items.length > 1) {
						// console.log('items: ', items);
						let name = items[1].trim()
						name = this.utilService.stripVN(name);
						let nameStrip = this.utilService.stripVN(name);
						if (nameStrip !== 'start' && nameStrip !== 'end' && nameStrip != 'thong tin khac') {
							// remove * for search real name
							if (name.indexOf('*') > 0)
								name = name.substring(0,name.indexOf('*'))
							str += name + ',';
							let descField = descID+'_'+(id++);
							desc_name[descField] = name;
							if (searchDescFields.length < id)
								searchDescFields.push(descField)
						}
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
			// let desc = node.desc.join('|');

			let nick = node.nick;
			let pob = (!node.pob || node.pob == '') ? 'Quảng Bình' : node.pob;
			let pod = (!node.pod || node.pod == '') ? 'Quảng Bình' : node.pod;
			let por = (!node.por || node.por == '') ? 'Quảng Bình' : node.por;
			let yob = node.yob;
			let yod = node.yod;
			let snode = { id: node.id, name: name, firstName: firstName, lastName: lastName, nick: nick, pob: pob, pod: pod, por: por, yob: yob, yod: yod, node: node}

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

	testMiniSearch(value) {

		// let searchFields = [ 'name', 'nick', 'pob', 'pod', 'por', 'yob' ];
		let searchFields = [ 'name', 'pob', 'pod', 'por', 'yob' ];
		// add desc fields for name
		this.searchDescFields.forEach(field => {
			searchFields.push(field);
		})
		let storeFields = [ 'firstName', 'lastName', 'node'];

		let miniSearch = new MiniSearch({
			fields: searchFields, // fields to index for full-text search
			storeFields: storeFields,

			tokenize: (string, _fieldName) => {
				// if (_fieldName == 'desc')
				// 	console.log('tokenize: ', string, _fieldName);
				// return string.split(' ')
				return [string]
			},

			processTerm: (term, _fieldName) => {
				// if (_fieldName == 'desc')
				// 	console.log('processTerm: ', term, _fieldName);
				if (term == 'phan')
					return null;
				return this.utilService.stripVN(term);
				// return term.toLowerCase();
			},

			extractField: (document, fieldName) => {
				// console.log('extractField: ', document, fieldName);
				// covert to lower case for Vietnamese
				let value = document[fieldName];
				if (fieldName === 'firstName' || fieldName === 'lastName') {
					return this.utilService.stripVN(value);
				// } else if (fieldName === 'desc') {
				// 	return this.searchService.getNamesFromDesc(value);
				}
				return value;
			},
		})
		let searchOptions:any = { fuzzy: 0.2, boost: { 'name': 2 } };
		if (value.charAt(0) == '"') {
			// match 100%
			value = value.substring(1);
			searchOptions = { combineWith: 'AND' };
		}
		miniSearch.addAll(this.searchNodes);

		let stripVal = this.utilService.stripVN(value);
		let suggest = miniSearch.autoSuggest(stripVal)
		let fuzzy = miniSearch.autoSuggest(stripVal, { fuzzy: 0.2 })
		let search = miniSearch.search(stripVal, searchOptions)

    if (DEBUGS.SEARCH) {
			console.log('testMiniSearch - value: ', value);
			console.log('testMiniSearch - suggest: ', suggest);
			console.log('testMiniSearch - fuzzy: ', fuzzy);
			console.log('testMiniSearch - search: ', search);
		}

		let results = search;

		// get top 3 and find the best
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
			
			result += '<b>' + this.getMatch(node.name, false, item.match) + '</b><br>' + this.getNodeHtml(node, item.match) + '<br>';
			
			// console.log('node:' , node);
			if (DEBUGS.SEARCH) {
				console.log('SCORE:' , item.score);
				console.log('match:' , item.match);
				for (let key of Object.keys(item.match)) {
					console.log('match - key, count, value:' , key, item.match[key].length, item.match[key]);
				}
			}

			// console.log('queryTerms:' , item.queryTerms);
			// console.log('terms:' , item.terms);
			// let nodes = this.nodes.filter((node:any) => {return node.id == item.id});
			// result += '<b>' + nodes[0].name + '</b><br>' + this.getNodeHtml(nodes[0]) + '<br>';
			// console.log('name:' , nodes[0].name);
		};
		if (DEBUGS.SEARCH)
			console.log('RESULT:' , result);
		
		this.searchResult = result;
		document.getElementById('detail').innerHTML = this.searchResult;
	}

	// check with match
	private getMatch(name: any, starName: any, match: any) {
		for (let key of Object.keys(match)) {
			// console.log('match - key, count, value:' , key, item.match[key].length, item.match[key]);
			if (key == this.utilService.stripVN(name)) {
				name = "<b style='color:blue;'><i>" + name + "</i></b>";
				return name;
			}
		}
		if (starName)
			name = "<b style='color:green;'><i>" + name + "</i></b>";
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
				'<ion-col size="7" class="column center">' + ((parent) ? parent.name : '') +
				'</ion-col>' +
			'</ion-row>';
		html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_YOB') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + node.yob +
				'</ion-col>' +
			'</ion-row>';
		if (!pass_away) {
			html +=
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_POR') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + node.por +
				'</ion-col>' +
			'</ion-row>';
		} else {
			html +=
				'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_YOD') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + node.yod +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_TOMB') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + node.pod +
				'</ion-col>' +
			'</ion-row>' +
			'<ion-row>' +
				'<ion-col size="5" class="column center">' + '<b>' + this.languageService.getTranslation('NODE_DOD') + '</b>' +
				'</ion-col>' +
				'<ion-col size="7" class="column center">' + node.dod +
				'</ion-col>' +
			'</ion-row>';
		}

		if (Array.isArray(node.desc)) {
			let extraDesc = false;
			let stat = { h: 'Chồng', w: 'Vợ', s: 'Con trai', d: 'Con gái' }
			node.desc.forEach((item:any) => {
				let items = item.split('|');
				if (items.length > 1) {
					let rel = items[0].trim();
					let status = stat[rel];
					let name = items[1].trim();
					let nameStrip = this.utilService.stripVN(name);
					if (nameStrip !== 'start' && nameStrip !== 'end' && nameStrip != 'thong tin khac') {
						let starName = false;
						if (name.indexOf('*') > 0) {
							name = name.substring(0,name.indexOf('*'))
							starName = true;
						}
						name = this.getMatch(name, starName, match);
						html += 
						'<ion-row>' +
						'<ion-col size="5" class="column center">' + '<b>' + status + '</b>' +
						'</ion-col>' +
						'<ion-col size="7" class="column center">' + name +
						'</ion-col>' +
						'</ion-row>';
					}
				} else {
					extraDesc = true
				}
			})
			if (extraDesc) {
				html += 
					'<ion-row>' +
					'<ion-col size="5" class="column center">' + '<b>' + 'Thông tin khác' + '</b>' +
					'</ion-col>' +
					'<ion-col size="7" class="column center">' + 'Xem Phả Hệ' +
					'</ion-col>' +
					'</ion-row>';
			}
			html += '</ion-grid>';
		}
		return html;
	}

}
