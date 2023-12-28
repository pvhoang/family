import { Injectable } from '@angular/core';
import { ECOTree, ECONode, IECONode, Orientation,Aligment,Search,Select } from "../../assets/js/econode";
import { Family, Node, NODE } from './family.model';

@Injectable({
	providedIn: 'root'
})
export class SvgTreeService {

	constructor() {}

  // buildTreeTest(family: any): ECOTree {
	// 	let myTree = this.getNewTree();

	// 	// tree.add(node.id,parent.id,node.title, node.width, node.height, node.color, node.background, node.linkColor, node.data)
	// 	myTree.add(0,-1,"Apex Node", null, null, null, null, null, { name: "Apex Node" });
	// 	myTree.add(1,0,"Left", null, null, null, null, null,  { name: "Left" });
	// 	myTree.add(2,0,"Right", null, null, null, null, null,  { name: "Right" });
	// 	myTree.UpdateTree();
	// 	return myTree;
	// }

  buildTree(family: any): ECOTree {
		// console.log('buildTree - family: ', family);
		let tree = this.getNewTree();
		let node:any = {};
		if (family.nodes.length > 0) {
			let fNode: Node = family.nodes[0];
			// node.data = { name: fNode.name, span: fNode.span, photoUrl: fNode.photoUrl }
			node.title = fNode.name;
			let boxData = this.getBoxData(tree, fNode);
			node.width = boxData[0];
			node.height = boxData[1];
			node.rows = boxData[2];
			node.data = fNode;
			node.color = '#e6d8ad'
			node.background = (fNode.gender == 'male') ? 'lightblue' : 'lightpink'
			node.linkColor = (fNode.gender == 'male') ? 'red' : 'pink'
    }
		if (family.children) {
			node.children = [];
      family.children.forEach(fam => {
        if (fam.nodes.length > 0) {
          let nFamily = this.getTreeNode(tree, fam);
          node.children.push(nFamily);
        }
      })
    }
		this.addNodes(tree, node, null);
		tree.UpdateTree();
    return tree;
  }

	getTreeNode(tree:ECOTree, family: any) {
		let node:any = {};
		if (family.nodes.length > 0) {
			let fNode: Node = family.nodes[0];
			// node.data = { name: fNode.name, span: fNode.span, photoUrl: fNode.photoUrl }
			node.title = fNode.name;
			let boxData = this.getBoxData(tree, fNode);
			node.width = boxData[0];
			node.height = boxData[1];
			node.rows = boxData[2]; 
			node.data = fNode;
			node.color = '#e6d8ad'
			node.background = (fNode.gender == 'male') ? 'lightblue' : 'lightpink'
			node.linkColor = (fNode.gender == 'male') ? 'red' : 'pink'
    }
		if (family.children) {
			node.children = [];
      family.children.forEach((fam: any) => {
        if (fam.nodes.length > 0) {
          let nFamily = this.getTreeNode(tree, fam);
          node.children.push(nFamily);
        }
      })
    }
		return node;
  }

	getNewTree() {
		let tree = new ECOTree();
		let config:any = tree.config;

		// set config
		config.iMaxDepth = 100;
		config.iLevelSeparation = 40;
		config.iSiblingSeparation = 40;
		config.iSubtreeSeparation = 80;
		config.iRootOrientation = Orientation.RO_TOP;
		// config.iNodeJustification = Aligment.NJ_BOTTOM;
		// config.iNodeJustification = Aligment.NJ_CENTER;
		config.topXAdjustment = 0;
		config.topYAdjustment = 0;
		config.linkType = "M";
		config.nodeColor = "black"
		config.nodeBorderColor = "black",
		config.nodeSelColor = "red",
		config.useTarget = true;
		config.searchMode = Search.SM_DSC;
		// config.selectMode = Select.SL_MULTIPLE;
		config.selectMode = Select.SL_SINGLE;
		// config.defaultNodeWidth = 200;
		// config.defaultNodeHeight = 30;
		config.defaultNodeWidth = 100;
		config.defaultNodeHeight = 15;
		return tree;
	}

	addNodes(tree:ECOTree,node:any,parent:any=null) {
    parent=parent || {
			id:-1,width:tree.config.defaultNodeWidth,height:tree.config.defaultNodeHeight,
			color:tree.config.nodeColor,background:tree.config.nodeBorderColor,linkColor:tree.config.nodeBorderColor
		}
    node.width=node.width || parent.width
    node.height=node.height || parent.height
		node.color=node.color || parent.color
    node.background=node.background || parent.background
    node.linkColor=node.linkColor || parent.linkColor
    // node.id=tree.nDatabaseNodes.length;
		let fNode = node.data;
		// fNode.idSvgNode = node.id;
		fNode.rows = node.rows;

    node.id=fNode.id;

		if (node.data.name == 'Phan Văn Gian') console.log('node: ', node);

		// if (fNode.name.indexOf("Phan Khắc Tuan") == 0) console.log('fNode: ', fNode);
		//  console.log('fNode: ', fNode);

		tree.add(node.id,parent.id,node.title, node.width, node.height, node.color, node.background, node.linkColor, node.data)
		if (node.children) {
			node.children.forEach((x:any)=>{
				this.addNodes(tree,x,node)
			})
		}
  }

// ---
// 	NGUYỄN VĂN TÂM (☺)
// ---
//  NGUYỄN VĂN TÂM
//       (1920)
//   Sống: Xã An Nhơn
// ---
// 	NGUYỄN VĂN TÂM (☺)
//     (1920-1985)
//   Giỗ: 25/8 Âm lịch
//     Mộ: Xã An Nhơn

	private	getBoxData(tree:ECOTree, fNode: Node) {
		let photo = (fNode.photo) ? fNode.photo : '';
		let yob = (fNode.yob) ? fNode.yob : '';
		let yod = (fNode.yod) ? fNode.yod : '';
		let dod = (fNode.dod) ? fNode.dod : '';
		let pod = (fNode.pod) ? fNode.pod : '';
		let por = (fNode.por) ? fNode.por : '';
		let dy = tree.config.defaultNodeHeight;
		let width = tree.config.defaultNodeWidth;
		if (photo != '')
			width += width / 3;
		// if (fNode.name.indexOf('(') > 0)
		// 	console.log('name: ', fNode.name);

		let name = (fNode.name.indexOf('(') > 0) ? fNode.name.substring(0,fNode.name.indexOf('(')).trim() : fNode.name;
		// let rows = [ [name + ((photo != '') ? ' (☺)' : ''), 'bold']];
		let rows = [ [name, 'bold']];
		
		let nLines = 1;
		if (yob != '' && yod == '') {
			nLines = 3;
			rows.push(['(' + yob + ')', 'italic']);
			rows.push(['Sống: ' + por, 'normal']);
		} else if (yod != '') {
			nLines = 4;
			rows.push(['(' + yob + '-' + yod + ')', 'italic']);
			rows.push(['Giỗ: ' + dod + ' Âm lịch', 'normal']);
			rows.push(['Mộ: ' + pod, 'normal']);
		} else {
		}
		let height = (nLines + 1) * dy;
		return [width, height, rows];
	}

// 	// set Tree node from Family node
// 	setTreeNode(tree:ECOTree, fNode: Node) {

// 		let node: any = {};
// 		node.id = fNode.id;
// 		node.title = fNode.name;
// 		node.width = tree.config.defaultNodeWidth;
// 		node.height = tree.config.defaultNodeHeight;
// 		node.data = fNode;
// 		node.color = '#e6d8ad'
// 		node.background = (fNode.gender == 'male') ? 'lightblue' : 'lightpink';
// 		node.linkColor = (fNode.gender == 'male') ? 'red' : 'pink';

	
// 	}



// private	setText(tree:ECOTree, fNode: Node) {

// 	let photo = (fNode.photo) ? fNode.photo : '';
// 	let yob = (fNode.yob) ? fNode.yob : '';
// 	let yod = (fNode.yod) ? fNode.yod : '';
// 	let dod = (fNode.dod) ? fNode.dod : '';
// 	let pod = (fNode.pod) ? fNode.pod : '';
// 	let por = (fNode.por) ? fNode.por : '';
	
// 	let nLines = 0;
// 	let pre = '<tspan x=\"' + xCenter + '\" y=\"' + yCenter + '\" dy=\"';
// 	let anchor = '\" text-anchor=\"middle\" dominant-baseline=\"central\" ';
// 	let bold = 'style=\"font-weight:bold\">';
// 	let italic = 'style=\"font-style: italic\">';
// 	let post = '</tspan>';

// 	let dy = tree.config.defaultNodeHeight / 4;

// 	let row1 = fNode.name + ((photo != '') ? ' (☺)' : '');

// 	if (yob != '') {

// 	} else if (yod != '') {

// 	} else {
// 		nLines = 1;
// 	}

// 	let xCenter = node.XPosition + node.w / 2;
// 			let yCenter = node.YPosition + node.h / 2;
	
// 	|| yod != '') {

// 	}

// }


// 		// if (fNode.name.indexOf("Phan Khắc Tuan") == 0) console.log('fNode: ', fNode);
// 		//  console.log('fNode: ', fNode);

// 			let xCenter = node.XPosition + node.w / 2;
// 			let yCenter = node.YPosition + node.h / 2;
// 			let dy = node.h / 4;
// 			let html = '';		
// 			let photo = (fNode.photo) ? fNode.photo : '';
// 			let yob = (fNode.yob) ? fNode.yob : '';
// 			let yod = (fNode.yod) ? fNode.yod : '';
// 			let dod = (fNode.dod) ? fNode.dod : '';
// 			let pod = (fNode.pod) ? fNode.pod : '';
// 			let por = (fNode.por) ? fNode.por : '';

// 			let row1 = fNode.name + ((photo != '') ? ' (☺)' : '');
// 			// if (n == 1) console.log('row1: ', row1);

// 			let row2 = (yob == '' && yod == '') ? ' ' : ((yob == '') ? ('(-' + yod + ')') : ('(' + yob + '-' + yod + ')'));
// 			let row3 = (dod != '') ? ('Giỗ: ' + dod + ' Âm lịch') : '';
// 			let row4 = (pod != '') ? ('Mộ: ' + pod) : '';

// 			if (row2 != '' && row3 != '' && row4 != '') {
// 				html += pre + 0 + anchor + bold + row1 + post;
// 				html += pre + dy + anchor + italic + row2 + post;
// 				html += pre + 2 * dy + anchor + row3 + post;
// 				html += pre + 3 * dy + anchor + row4 + post;
// 			} else if (row2 != '' && row3 != '' && row4 == '') {
// 				html += pre + 0 + anchor + bold + row1 + post;
// 				html += pre + dy + anchor + italic + row2 + post;
// 				html += pre + 2 * dy + anchor + row3 + post;
// 			} else if (row2 != '' && row3 == '' && row4 == '') {
// 				html += pre + 0 + anchor + bold + row1 + post;
// 				html += pre + dy + anchor + italic + row2 + post;
// 			} else {
// 				html += pre + dy + anchor + bold + row1 + post;
// 			}
// 			// if (fNode.name.indexOf("Phan Dinh") == 0)
// 			// 	console.log('html: ', html);
// 			document.getElementById(elementId).innerHTML = html;
// 		}
// 	}


}