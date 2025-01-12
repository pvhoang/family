import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { UtilService } from './util.service';
import { JsonEditorOptions } from '../components/jsoneditor/jsoneditor.component';
import { fieldNames, familyNodeFieldNames, valueOptions } from './jsoneditor.schema';

@Injectable({
	providedIn: 'root'
})
export class JsoneditorService {

	editorOptions: JsonEditorOptions;
  data: any;
  showData: any;
	familyName: any;

  constructor(
    private languageService: LanguageService,
    private utilService: UtilService,
  ) {}
  
	getEditorOptions() {
		return this.editorOptions;
	}

	getFieldNames() {
		let fNames = [];
		familyNodeFieldNames.map(name => {
			fNames.push(this.languageService.getTranslation(name))
		})
		return fNames;
	}

	// validate new fields
	validateFieldNames(json: any) {
		let title = json.title;
		let validFields = title ? fieldNames[title] : [];
		if (validFields.length == 0)
			return [];
	
		// convert to text
		let text: any = JSON.stringify(json);
		let match = text.match(/"([^"]*)":/g);
		// console.log('convertJsonFieldNames - match: ', match);
		let unique = match.filter((value: any, index: any, array: any) => {
			return array.indexOf(value) === index;
		});
		// console.log('convertJsonFieldNames - unique: ', unique);
		let errorFields = [];
		// change to new field names, unique has "...", "nodes": -> "HỆ":
		unique.map((name: any) => {
			let n = name.substring(1, name.length-2);
			if (validFields[n]) {
				// valid field
			} else {
				errorFields.push(n);
			}
		})
		return errorFields;
	}

	startEditor(familyName: any) {

		this.familyName = familyName;

		let options = new JsonEditorOptions();
		this.editorOptions = options;
		options.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
		options.mode = 'tree';
		options.expandAll = true;
		options.onClassName = (node) => {
			// console.log('onClassName: ', node);
			const path = node.path // array with strings and numbers
			if (path[path.length-1] === 'nodes' || path[path.length-1] === 'children')
				return 'jsoneditor-class-nodes'
			else if (!Number.isInteger(path[path.length-1]))
				return 'jsoneditor-class-name'
			return undefined
		}

		options.autocomplete = {
      filter: 'contain',
      trigger: 'focus',
			getOptions: (text, path, input, editor) => {
				return this.getOptions(text, path, input, editor);
			}
		}
		options.onCreateMenu = (items: Array<any>, data: any) => {
			return this.getMenu(items, data);
		};

	}

	private getMenu(items: Array<any>, data: any) {

		let path = data.path;
		let lastItem = path[path.length-1];

		console.log('getMenu - data :', data);
		console.log('getMenu - lastItem, path, type :', lastItem, path, data.type);

		// DOCS
		if (lastItem == 'vi' || lastItem == 'en' || 
				lastItem == 'pha_nhap' || lastItem == 'pha_ky' || lastItem == 'pha_he' || lastItem == 'pha_do' ||
				lastItem == 'ngoai_pha' || lastItem == 'phu_khao' 
		)
			return [];

		// FAMILY
		if (lastItem == 'title' || lastItem == 'version' || lastItem == 'date') {
			return [];
		}
		
		if (lastItem == 'nodes') {
			if (data.type == 'single')
				return [];
			if (data.type == 'append') {
				// ['HẬU DUỆ', 0, 'HẬU DUỆ', 2, 'TỘC HỆ', <empty array>]
				// append 'WIFE/HUSBAND'
				let nItems = items.filter(item => {return item.text == 'Append';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_WIFE'),
					title: 'Append',
					className: 'jsoneditor-type-object',
					click: function () {
						// this.utilService.alertMsg('ERROR', 'HELLO', 'OK', { width: 350, height: 450 }).then(choice => {
							data.node._onAppend('', 
								{
									"name": this.familyName + ' ...',
									"gender": '',
								});
						// });
					}
				};
				return nItems;
			}
		}

		if (lastItem == 'children') {
			if (data.type == 'single')
				return [];
			if (data.type == 'append') {
				// ['HẬU DUỆ', 0, 'HẬU DUỆ', <empty array>]
				// append 'child'
				let nItems = items.filter(item => {return item.text == 'Append';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_CHILDREN'),
					title: 'Append',
					className: 'jsoneditor-type-object',
					click: function () {
						data.node._onAppend('', 
							{
								"nodes": [
									{
										"name": this.familyName + ' ...',
										"gender": '',
									},
								],
								"children": []
							}
						);
					}
				};
				return nItems;
			}
		}

		if (lastItem == 'desc') {
			if (data.type == 'single')
				return [];
			if (data.type == 'append') {
				// ['DESC', <empty array>]
				// append 'DESCRIPTION'
				let nItems = items.filter(item => {return item.text == 'Append';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_DESCRIPTION'),
					title: 'Append',
					className: 'jsoneditor-type-string',
					click: function () {
						data.node._onAppend('', '', 'string');
					}
				};
				return nItems;
			}
		}

		if (Number.isInteger(lastItem)) {
			let preLastItem = path[path.length-2];

			if (preLastItem == 'nodes') {
				// ['HẬU DUỆ', 0, 'HẬU DUỆ', 2, 'TỘC HỆ', 0]
				// - insert 'WIFE/HUSBAND'
				// - remove
				let nItems = items.filter(item => {return item.text == 'Insert' || item.text == 'Remove';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_WIFE'),
					title: 'Insert',
					className: 'jsoneditor-type-object',
					// click: function () {
					click: () => {
						// this.utilService.alertMsg('ERROR', 'HELLO', 'OK', { width: 350, height: 450 }).then(choice => {
							data.node._onInsertAfter('', 
								{
									"name": this.familyName + ' ...',
									"gender": '',
								});
						// });

						// data.node._onInsertAfter('', 
						// {
						// 	"name": this.familyName + ' ...',
						// 	"gender": '',
						// });
					}
				};
				nItems[1].text = this.languageService.getTranslation("FILE_JSON_EDITOR_REMOVE");
				return nItems;
			}

			if (preLastItem == 'children') {
				// ['HẬU DUỆ', 0]
				// - insert 'CHILD'
				// - remove
				let nItems = items.filter(item => {return item.text == 'Insert' || item.text == 'Remove';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_CHILDREN'),
					title: 'Insert',
					className: 'jsoneditor-type-object',
					click: function () {
						data.node._onInsertAfter('', 
						{
							"nodes": [
								{
									"name": this.familyName + ' ...',
									"gender": '',
								},
							],
							"children": []
						});
					}
				};
				nItems[1].text = this.languageService.getTranslation("FILE_JSON_EDITOR_REMOVE");
				return nItems;
			}

			if (preLastItem == 'desc') {
				// ['DESC', 0]
				// - insert 'DESCRIPTION'
				// - remove
				let nItems = items.filter(item => {return item.text == 'Insert' || item.text == 'Remove';});
				nItems[0] = {
					text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_DESCRIPTION'),
					title: 'Insert',
					className: 'jsoneditor-type-string',
					click: function () {
						data.node._onInsertAfter('', '', 'string');
					}
				};
				nItems[1].text = this.languageService.getTranslation("FILE_JSON_EDITOR_REMOVE");
				return nItems;
			}


		} else {
			// ['HẬU DUỆ', 0, 'HẬU DUỆ', 2, 'TỘC HỆ', 0, 'DANH TÍNH']
			// - insert 'ITEM'
			// - remove
			let nItems = items.filter(item => {return item.text == 'Insert' || item.text == 'Remove';});
			nItems[0] = {
				text: this.languageService.getTranslation('FILE_JSON_EDITOR_ADD_INFO'),
				title: 'Insert',
				className: 'jsoneditor-insert',
				click: function () {
					data.node._onInsertAfter('', '', 'string');
				},
			};
			nItems[1].text = this.languageService.getTranslation("FILE_JSON_EDITOR_REMOVE");
			return nItems;
		}
		return items;
	}

	private getOptions(text, path, input, editor) {
		// console.log('getOptions - text, path, input: ', text, path, input);
		if (typeof path[path.length-1] === 'string') {
			if (input === 'field') {
				const fields = this.getFieldNames();
				let options = fields.filter(item => {return item != text;});
				return options;
			} else if (input === 'value') {
				// change value
				let fieldName = path[path.length-1];
				let options = this.getValueOptions(fieldName);
				return options;
			}
		}
		return null;
	}

	private getValueOptions(field: any) {
		let newField =  this.languageService.getReverseTranslation(field);
		if (valueOptions[newField])
			return valueOptions[newField];
		return null;
	}


}
