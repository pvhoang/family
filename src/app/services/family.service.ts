import { Injectable } from '@angular/core';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
// import { Family, Node } from '../models/family.model';

@Injectable({
	providedIn: 'root'
})
export class FamilyService {

	constructor(
    private dataService: DataService,
    private utilService: UtilService,
	) {
	}

  async loadFamily(id?: any) {
    if (id)
      this.loadFamilyFromFile(id);
    else {
      // read from local
      this.readFamily().then(value => {
        if (value)
          console.log('loadFamily: data is from localStorage!');
        else
          this.loadFamilyFromFile('phan');
      });
    }
  }
  
  private loadFamilyFromFile(id: any) {
		if (id != 'phan') {
			console.log('loadFamily: data from id: ', id);
			// const id = '24-07-2022_14-43';
			this.dataService.getContentDetails(id).subscribe((content:any) => {
				let family = JSON.parse(content.text);
				// save to local storage
				this.saveFamily(family);
				// console.log('loadFamily: ', family)
			})
		} else {
			// read data from phan.json
			console.log('loadFamily: data from assets/data/phan.json.');
			this.utilService.getLocalJsonFile('./assets/data/phan.json').then((family) => {
				this.saveFamily(family);
			})
		}
	}

	async saveFamily(family) {
		localStorage.setItem('FAMILY', JSON.stringify(family));
		return await true;
	}

  async saveFullFamily(family) {
		family = this.getFilterFamily(family);
		localStorage.setItem('FAMILY', JSON.stringify(family));
		return await true;
	}
	
	async readFamily() {
		let value = localStorage.getItem('FAMILY');
    if (value)
      value = JSON.parse(value);
		return await value;
	}
	
  printFamily(family) {
		// family = this.filterNodes(family);
		console.log('filterFamily:' , JSON.stringify(family, null, 4) )
	}

  // --- printPeople

  printPeople(family: any) {
    let people = [];
		let places = [];

    // console.log('printPeople');

    family.nodes.forEach((node: any) => {
      people.push(node.name);
      people.push(node.pob); people.push(node.pod); places.push(node.por);
      people.push(node.yob); people.push(node.yod);
      places.push(node.pob); people.push(node.pod); places.push(node.por);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.printPeopleChild(child, people, places);
      })
    }
    // console.log('printPeople: ', people);

    let uniquePeopleData = [];
		people.forEach((element) => {
			if (element && element != '' && !uniquePeopleData.includes(element)) {
				uniquePeopleData.push(element);
			}
		});
    uniquePeopleData.sort();

		let uniquePlaceData = [];
		places.forEach((element) => {
			if (element && element != '' && !uniquePlaceData.includes(element))
				uniquePlaceData.push(element);
		});
    uniquePlaceData.sort();

    let data = [];
    uniquePeopleData.forEach(value => {
      data.push({'name': value});
    });
    console.log('people: ', JSON.stringify({data: data}, null, 4));

    data = [];
    uniquePlaceData.forEach(value => {
      data.push({'name': value});
    });
    console.log('places: ', JSON.stringify({data: data}, null, 4));

  }

  private printPeopleChild(family:any, people, places) {
    family.nodes.forEach((node: any) => {
      people.push(node.name);
      people.push(node.pob); people.push(node.pod); places.push(node.por);
      people.push(node.yob); people.push(node.yod);
      places.push(node.pob); people.push(node.pod); places.push(node.por);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.printPeopleChild(child, people, places);
      })
    }
  }

  // --- verifyFamily

  verifyFamily(family: any) {
    let msg = [];
    if (family.nodes[0].name.indexOf('Phan') != 0) {
      msg.push('Name not Phan: ' + family.nodes[0].name);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyNode(child, msg);
      })
    }
    return msg.length == 0 ? null : msg.join('\n');
  }

  private verifyNode(family:any, msg) {
    if (family.nodes[0].name.indexOf('Phan') != 0) {
      msg.push('Name not Phan: ' + family.nodes[0].name);
    }
    if (family['children']) {
      family['children'].forEach(child => {
        this.verifyNode(child, msg);
      })
    }
  }

  // --- getFilterFamily

  private getFilterFamily(family) {
    let filterFamily = {};
    filterFamily['nodes'] = [];

    if (family['nodes'].length > 0) {
      family['nodes'].forEach(node => {
        let newNode = {};
        // no need to save node id
        // if (node.id != '') newNode['id'] = node.id;
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
        if (fam.nodes.length > 0) {
          let nFamily = this.getFilterFamily(fam);
          filterFamily['children'].push(nFamily);
        }
      })
    }
    return filterFamily;
  }
  
  // --- getFamilyNodes

  getFamilyNodes(family: any) {
    let nodes = [];
    family.nodes.forEach((node: any) => {
      nodes.push(node);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.getChildNodes(child, nodes);
      })
    }
    return nodes;
  }

  private getChildNodes(family:any, nodes) {
    family.nodes.forEach(node => {
      nodes.push(node);
    })
    if (family['children']) {
      family['children'].forEach(child => {
        this.getChildNodes(child, nodes);
      })
    }
  }

  // --- buildFullFamily

  buildFullFamily(family: any) {
    // start at root
    let nodeLevel = 1;
    let childIdx = 1;
    let nodeIdx = 1;
		family.nodes.forEach((node: any) => {
      node = this.fillNode(node);
      this.updateNclass(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.pnode = null;
      node.parent = family;
      node.profile = this.getSearchStr(node);
    })
    if (family['children']) {
      nodeLevel++;
      childIdx = 1;
      family['children'].forEach(child => {
        this.buildChildNodes(family.nodes[0], child, nodeLevel, childIdx);
        childIdx++;
      })
    }
  }

  private buildChildNodes(pnode, family, nodeLevel, childIdx) {
    let nodeIdx = 1;
    family.nodes.forEach(node => {
      node = this.fillNode(node);
      this.updateNclass(node);
      node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.pnode = pnode;
      node.parent = family;
      node.profile = this.getSearchStr(node);
    })
    if (family['children']) {
      nodeLevel++;
      let cIdx = 1;
      family['children'].forEach(child => {
        this.buildChildNodes(family.nodes[0], child, nodeLevel, cIdx);
        cIdx++;
      })
    }
  }

	private getSearchStr(node): string {
    return node.name + ' ' + 
      node.nick + ' ' +
      node.gender + ' ' +
      node.yob + ' ' +
      node.yod + ' ' +
      node.pob + ' ' +
      node.pod + ' ' +
      node.por;
  }
  
  private fillNode(node) {
    if (!node.id) node.id = '';
    if (!node.relationship) node.relationship = '';
    if (!node.name) node.name = '';
    if (!node.nick) node.nick = '';
    if (!node.gender) node.gender = '';
    if (!node.yob) node.yob = '';
    if (!node.yod) node.yod = '';
    if (!node.pob) node.pob = '';
    if (!node.pod) node.pod = '';
    if (!node.por) node.por = '';
    if (!node.child) node.child = '';
    if (!node.spouse) node.spouse = '';
    return node;
  }

  public updateNclass(node: any): void {
    node['nclass'] = node.gender;
    if (this.isNodeMissingData(node))
      node['nclass'] = 'not-complete';
  }

  private isNodeMissingData(node: any): boolean {
    if (node['name'].length == 0)
      return true;
    if (node['yob'].length == 0)
      return true;
    if (node['pob'].length == 0)
      return true;    
    if (node['gender'].length == 0)
      return true;
    return false;
  }
}