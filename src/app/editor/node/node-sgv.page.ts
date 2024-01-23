import { Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from '../../components/popover/popover.component';
import { UtilService } from '../../services/util.service';
import { LanguageService } from '../../services/language.service';
import { FamilyService } from '../../services/family.service';
import { SvgTreeService } from '../../services/svg-tree.service';
import { NodeService } from '../../services/node.service';
import { DataService } from '../../services/data.service';
import { FirebaseService } from '../../services/firebase.service';

import { Orientation,IECONode, ECONode, ECOTree} from "../../../assets/js/econode";
import * as d3 from "d3";
import { EditPage } from './edit/edit.page';
import { TypeaheadService } from '../../services/typeahead.service';
import { ThemeService } from '../../services/theme.service';
import { Family, Node, FAMILY} from '../../services/family.model';
import { FONTS_FOLDER, DEBUGS } from '../../../environments/environment';

// http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38

@Component({
  selector: 'app-node',
  templateUrl: './node.page.html',
  styleUrls: ['./node.page.scss'],
})
export class NodePage implements OnInit, AfterViewInit {

  FONTS_FOLDER = FONTS_FOLDER;
  modalDataResponse: any;
  family:Family = FAMILY;
  familyView:Family = FAMILY;
  selectPeople: string = null;
  selectPeoplePlaceholder: string = null;
  title: string = '';
  peopleNodes: Node[] = [];
  justClicked = false;
  doubleClicked = false;
  selectedNode: Node = null;
  selectedNodeName: string = '';
  isChildOK = false;

  viewMode = 0;
  treeClass = 'tree';

  scaleStyle: number = 10;
  isPopover = false;
  timeEnter: number = 0;
  info: any;
  nodeItems: Array<any>;
  nodeItem: any;
  nodeItemPlaceholder: any = '';
  nodeItemMessage: any = '';
	data:IECONode;
	// tree:ECOTree = new ECOTree();
	tree:ECOTree;
	svg:any;
	zoom:any;
	zoomer:any;

  constructor(
    public modalCtrl: ModalController,
    public popoverController: PopoverController,
    private utilService: UtilService,
    private familyService: FamilyService,
    private svgTreeService: SvgTreeService,
    private nodeService: NodeService,
    private dataService: DataService,
    private fbService: FirebaseService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private typeahead: TypeaheadService,
  ) {}

  ngOnInit() {
    if (DEBUGS.NODE)
      console.log('NodePage - ngOnInit');
    this.startFromStorage();
  }

  ionViewWillEnter() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillEnter');
    this.startFromStorage();
  }
	
	ionViewWillLeave() {
    if (DEBUGS.NODE)
      console.log('NodePage - ionViewWillLeave');
	}

  startFromStorage() {
    this.dataService.readFamilyAndInfo().then((data:any) => {
      if (DEBUGS.NODE)
        console.log('NodePage - startFromStorage - data: ', data);
      this.info = data.info;
      this.title = this.info.description;
      this.start(data.family);
    });
  }

  start(family: any) {
    this.family = this.familyService.buildFullFamily(family);
		// this.tree = this.svgTreeService.buildTree(this.family);
		// this.setNodeText();
    this.peopleNodes = this.getPeopleNodes (this.family);
    this.nodeItems = this.nodeService.getInfoList();
    this.nodeItem = null;
    this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    this.familyView = this.family;
    this.selectPeoplePlaceholder = this.languageService.getTranslation('NODE_SELECT');
    this.selectPeople = null;
    this.nodeItemPlaceholder = this.languageService.getTranslation('NODE_SELECT_EMPTY_DATA');
		this.getSVGNodeImages();
  }

	getPeopleNodes (family: any, item?: any) {
    let nodes = this.nodeService.getFamilyNodes(family);
    // if (DEBUGS.NODE)
    //   console.log('NodePage - getPeopleNodes - nodes: ', nodes.length);
    nodes.forEach(node => {
      if (!item)
        // all visible
        node.visible = true;
      else {
        // visible only if item == ''
        node.visible = (node[item] == '');
        if (item == 'pod' || item == 'dod') {
          // show if yod != ''
          if (node.visible && node.yod == '')
            node.visible = false;
        }
      }       
    })
    return this.familyService.getPeopleList(family);
  }

	//
  // ------------- SVG-TREE -------------
  //

	ngAfterViewInit() {
		if (DEBUGS.NODE)
			console.log('NodePage - ngAfterViewInit');
		let width = 14000;
		let height = 500;

		this.setNodeText();

		let svg = d3.select("#svg-id");
		let zoom = d3.zoom().scaleExtent([0.3,2]).on("zoom", function() {
			svg.select("g").attr("transform", d3.event.transform);
		})
		svg.call(zoom);

		// let svg = d3.select("#svg-id").call(
		// 	d3.zoom().on("zoom", function() {
		// 		// svg.selectAll("g").attr("transform", d3.event.transform);
		// 		svg.select("g").attr("transform", d3.event.transform);
		// 	})
		// )
		
		// let svg = d3.select("#svg-id");
		// let zoom = d3.zoom().scaleExtent([0.3,2]).on("zoom", function() {
		// 	svg.select("g").attr("transform", d3.event.transform);
		// })
		// svg.call(zoom);

		// var zoomer = svg.append("rect")
		// 	.attr("width", width)
		// 	.attr("height", height)
		// 	.style("fill", "none")
		// 	.style("pointer-events", "all")
		// 	// .call(zoom);
		// zoomer.call(zoom)
		// console.log('NodePage - zoomer: ', zoomer);

		this.zoom = zoom;
		// this.zoomer = zoomer;

		this.svg = svg;
	}

	ngAfterViewInit1() {
		if (DEBUGS.NODE)
			console.log('NodePage - ngAfterViewInit');

		let svg = d3.select("#svg-id").call(
			d3.zoom().on("zoom", function() {
				// svg.selectAll("g").attr("transform", d3.event.transform);
				svg.select("g").attr("transform", d3.event.transform);
			})
		)
		// this.testRect(svg);

		// console.log('svgRect: ',svg.select("g").node().getBBox());
		// console.log('tree width-height: ',this.tree.width,this.tree.height);

		// svgRect:  SVGRectheight: 465width: 6683.3330078125x: -210y: 42[[Prototype]]: SVGRect
		// node.page.ts:151 tree width-height:  6473.333333333333 507
		// node.page.ts:472 node=1: name, x, y, w, h:  Phan Văn Nghi 3159.166666666666 42 undefined undefined

		// let svg = d3.select("svg");
		this.svg = svg;

		// let svgRect = svg.select("g").node().getBBox();
		// let dx = 3159 - svgRect.x;
		// let dy = 42 - svgRect.y;
		// let dx = 100;
		// let dy = 100;
		// svg.select('g').attr('transform', 'translate(' + dx + ',' + dy + ')') 
		// d3.zoom().on("zoom", () => {
		// 	svg.select("g").attr("transform", d3.event.transform);
		// })

		this.setNodeText();
		// svg.select('g').style('transform', 'translate(5%, 5%)');
		// svg.select('g').attr('transform', 'translate(300, 300)') 
		// d3.zoom().on("zoom", () => {
		// 	svg.select("g").attr("transform", d3.event.transform);
		// })

		// svg.on("click", () => {
		// 	var mouse = d3.mouse(this);
		// 	// var mouse = d3.mouse(this);
		// 	console.log('ngAfterViewInit - mouse: ', mouse);
		// 	// console.log('SGV - click - width,height,rootXOffset,rootYOffset: ', this.tree.width, this.tree.height, this.tree.rootXOffset, this.tree.rootYOffset);
		// 	// console.log('SGV - tree - nDatabaseNodes: ', this.tree.nDatabaseNodes);
		// });

		// this.testTransform(svg);
		// this.testCircle(svg);
	}

	resetViewport(){
		const svg = d3.select("svg");//  svgElement is a nativeElement.
  // Need to update the current viewport.
		const g = svg.select("g")
		g.attr('transform', 'translate(0,0) scale(1.0)');
  // The below resets the scale and positioning of the viewport for subsequent move / zoom calls.
		const zoom = d3.zoom();
		svg.call(zoom.transform, d3.zoomIdentity);
	}

	testZoom(){

		var zoom = d3.zoom()
		.scaleExtent([0.3,2])
		.on("zoom", zoomed);

		var svg = d3.select("#viz")
		// let svgRect = svg.select("g").node().getBBox();
		// console.log('testZoom - svgRect: ', svgRect);
		svg.attr("width", 800);
		svg.attr("height", 800);
		
		var width = svg.attr("width");
		var height = svg.attr("height");
		
		console.log('testZoom - width, height: ', width, height);

		var zoomer = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all")
		.call(zoom);
			
		var g = svg.append("g");

		// var aCircle = g.append("circle")
		// .style("stroke", "gray")
		// .style("fill", "white")
		// .attr("r", 40)
		// .attr("cx", 200)
		// .attr("cy", 200)
		// .on("mousedown", () => centerNode(200, 200));

		// var bCircle = g.append("circle")
		// .style("stroke", "gray")
		// .style("fill", "white")
		// .attr("r", 40)
		// .attr("cx", 400)
		// .attr("cy", 400)
		// .on("mousedown",  () => centerNode(400, 400));

		// var cCircle = g.append("circle")
		// .style("stroke", "gray")
		// .style("fill", "white")
		// .attr("r", 40)
		// .attr("cx", 600)
		// .attr("cy", 600)
		// .on("mousedown",  () => centerNode(600, 600));

		var bRect = g.append("rect")
		.style("stroke", "gray")
		.style("fill", "white")
		.attr("width", 40)
		.attr("height", 40)
		.attr("x", 600)
		.attr("y", 600)
		.on("mousedown",  () => centerNode(600, 600));

		function zoomed() {
			g.attr("transform", d3.event.transform);
		}

		function centerNode(xx, yy){
			g.transition()
			.duration(500)
			.attr("transform", "translate(" + (width/2 - xx) + "," + (height/2 - yy) + ")scale(" + 1 + ")")
			.on("end", function(){ zoomer.call(zoom.transform, d3.zoomIdentity.translate((width/2 - xx),(height/2 - yy)).scale(1))});
		}
	}


	testRect(svg: any) {

		var width = svg.attr("width");
		var height = svg.attr("height");
		console.log('testRect - width: ', width, height);

		var g = svg.select("g");

		var bRect = g.append("rect")
		.style("stroke", "gray")
		.style("fill", "white")
		.attr("width", 40)
		.attr("height", 40)
		.attr("x", 600)
		.attr("y", 600)
		.on("mousedown",  () => centerNode(600, 600));

		var rects = g.selectAll("rect")
		console.log('testRect - rects: ', rects);
		rects.on("mousedown", (d: any) => {
			g.transition()
				.duration(500)
				.attr("transform", "translate(" + (250 - d.x) + "," + (150 - d.y) + ")")
		})

		// this.mouse_over_highlight();
		function centerNode(xx, yy){
			const zoom = d3.zoom();
			g.transition()
			.duration(500)
			.attr("transform", "translate(" + (width/2 - xx) + "," + (height/2 - yy) + ")scale(" + 1 + ")")
			.on("end", function() { 
				// zoomer.call(zoom.transform, d3.zoomIdentity.translate((width/2 - xx),(height/2 - yy)).scale(1))});
				svg.call(zoom.transform, d3.zoomIdentity.translate((width/2 - xx),(height/2 - yy)).scale(1))});
		}
	}

	mouse_over_highlight() {
    d3.selectAll("rect")
        .on("mouseover", function () {
          d3.select(this)
              .transition()
              .attr("fill", "red");
        })
        .on("mouseout", function (d) {
          d3.select(this)
              .transition()
              .attr("fill", function () {
                return "rgb(50, 0, " + Math.floor(d.val) + ")";
              })
              .attr("opacity", 0.6);
        })
      // print to console when clicking on bar = good for debugging
        .on("click", function (d) {
          console.log(d);
        });
  }

	testCircle(svg: any) {
		// var svg = d3.select("svg-circle");
		var g = svg.append("g")
		var circles = g.selectAll(null)
			.data(d3.range(20).map(function() {
				return {
					x: Math.random() * 500,
					y: Math.random() * 300
				}
			}))
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return d.x
			})
			.attr("cy", function(d) {
				return d.y
			})
			.attr("r", 10)
			.style("fill", "lime")
			.style("cursor", "pointer");

		circles.on("click", function(d: any) {
			console.log('circles - d: ', d);
			g.transition()
				.duration(1000)
				.attr("transform", "translate(" + (250 - d.x) + "," + (150 - d.y) + ")")
			// this.resetViewport();
		})
	}

	
	testTransform(svg: any) {
		// https://stackoverflow.com/questions/38224875/how-can-d3-transform-be-used-in-d3-v4
		
		svg.on("click", () => {
			var mouse = d3.mouse(this);
			console.log('mouse: ', mouse);

			let g = d3.select("g");
			let svgRect: SVGRect = g.node().getBBox();
			console.log('svgRect: ', svgRect);
			g.attr("transform", "translate(" +  (svgRect.width/2 - mouse.x) + "," + (svgRect.height/2 - mouse.y) + ")");
		});
	}
	
	testTransform1(svg: any) {
		let g = d3.select("g");
		g.on("click", function(d: any) {
			console.log('ngAfterViewInit - mouse: ', d3.mouse(this));
			g.transition()
				.duration(500)
				.attr("transform", "translate(" + (250 - d.x) + "," + (150 - d.y) + ")")
		})
	}

	getSVGNodeImages() {
    // get photo for all nodes
		let ancestor = this.info.id;
    let nodes = this.nodeService.getFamilyNodes(this.family);
		let promises = [];
		let nodePromises = [];
    nodes.forEach((node:any) => {
			node.photoUrl = '';
			if (node.photo != '') {
				promises.push(this.fbService.downloadImage(ancestor, node.photo));
				nodePromises.push(node);
			}
		});
		if (promises.length == 0) {
			// nothing to change
			this.tree = this.svgTreeService.buildTree(this.family);
			// this.tree.UpdateTree();
		} else {
			Promise.all(promises).then(resolves => {
				// console.log('resolves = ', resolves);
				for (let i = 0; i < resolves.length; i++) {
					let url = resolves[i];
					let node = nodePromises[i];
					node.photoUrl = url;
				}
				this.tree = this.svgTreeService.buildTree(this.family);
				// this.setNodeText();
				// this.tree.UpdateTree();
			});
		}
  }

	onNodeSelected (node: ECONode, option: string) {
		console.log('node, option: ', node, option)
		if (option == 'collapse') {
			this.tree.collapseNode(node.id, true);
		} else if (option == 'select') {
			this.tree.selectNode(node.id, true);

			this.transformSelectNode(node);

			// this.svg.append("g").attr("transform","translate(200,200)")
			// let svg = d3.select("svg").call(
			// 	d3.zoom().on("zoom", function() {
			// 		svg.selectAll("g").attr("transform", d3.event.transform);
			// 	}),
			// )
			// let d = d3.select("g").node().getBBox();
			// console.log('BBox: ', d);
			// let g = d3.select("g");
			// console.log('BBox: ', g.getBBox());

			// let currentx = d3.transform(d3.select(this).attr("transform")).translate[0];
			// let currentx = 10;

			// get x position
			// let currentx = d3.transform(g.attr("transform")).translate[0];
			// let currentx = g.attr("transform").translate[0];
			// let currentx = node.XPosition;

			// console.log('currentx: ', currentx);

			// // set x position
			// g.attr("transform", "translate(" + (currentx + 200) + ",0)");



			// d3.select("g").attr("align","center");

			// this.svg.append("g").attr("transform","translate(200,100)")
			// // this.svg.append("g").attr("cx", 400).attr("cy", 400);
			// this.tree.UpdateTree();


			// this.svg.append("svg").attr("cx", (d:any) => {
			// 	console.log('cx: ', d);
			// }).attr("cy", (d:any) => {
			// 	console.log('cy: ', d);
			// });

			// .attr("cx", function (d) { return d; })
      //                  .attr("cy", function (d) { return d; })

			setTimeout(() => {
				this.onNodeSelect(node.data, true);
			}, 200);
		}
  }

	transformSelectNode(node: ECONode) {

		console.log('transformSelectNode: ', node.data.name);

		let g = this.svg.select("g");
		let svgRect: SVGRect = g.node().getBBox();
		let width = svgRect.width;
		let height = svgRect.height;
		let xx = node.XPosition;
		let yy = node.YPosition;

		console.log('name, svgRect: ', node.data.name, svgRect);

		g.transition()
		.duration(500)
		.attr("transform", "translate(" + (width/2 - xx) + "," + (height/2 - yy) + ")scale(" + 1 + ")")
		// .on("end", function(){ this.zoomer.call(this.zoom.transform, d3.zoomIdentity.translate((width/2 - xx),(height/2 - yy)).scale(1))});
		// .on("end", () => { this.svg.call(this.zoom.transform, d3.zoomIdentity.translate((width/2 - xx),(height/2 - yy)).scale(1))});
		// .on("end", () => { this.svg.call(this.zoom.transform, d3.zoomIdentity)});
		.on("end", () => { this.svg.call(d3.zoom().transform, d3.zoomIdentity)});
	
		// const svg = d3.select("svg");//  svgElement is a nativeElement.
		// // Need to update the current viewport.
		// 	const g = svg.select("g")
		// 	g.attr('transform', 'translate(0,0) scale(1.0)');
		// The below resets the scale and positioning of the viewport for subsequent move / zoom calls.
			// const zoom = d3.zoom();
			// this.svg.call(this.zoom.transform, d3.zoomIdentity);
	
	
	
	}

	// transformSelectNode1(node: ECONode) {
	// 	// https://stackoverflow.com/questions/38224875/how-can-d3-transform-be-used-in-d3-v4

	// 	let g = d3.select("g");
	// 	let svgRect: SVGRect = g.node().getBBox();
	// 	let xNode = node.XPosition;
	// 	let yNode = node.YPosition;

	// 	console.log('name: ', node.data.name);
	// 	console.log('svgRect: ', svgRect);
	// 	console.log('xNode, yNode: ', xNode, yNode);
	// 	console.log('tree: width, height: ', this.tree.width, this.tree.height);

	// 	// xSVG, width, xNode, yNode:  -490 14856.666015625 1090 252
	// 	// var currentx = d3.select('g').attr("transform").translate[0];
	// 	// console.log('currentx: ', currentx);

	// 	let dx = svgRect.width - xNode;
	// 	let dy = 0;
	// 	// let dy = svgRect.height - yNode;
	// 	// g.attr("transform", "translate(" + (xSVG + xNode) + ",0)");

	
	// 	g.transition()
	// 	.duration(1000)
	// 	// .attr("transform", "translate(" + (svgRect.width/2 - xNode) + "," + (svgRect.height/2 - yNode) + ")")
	// 	.attr("transform", "translate(" + 100 + "," + 100 + ")")

	// 	// g.attr("transform", "translate(" +  (svgRect.width/2 - xNode) + "," + (svgRect.height/2 - yNode) + ")");

	// 	g.attr('transform', 'translate(0,0) scale(1.0)');
	// 	// The below resets the scale and positioning of the viewport for subsequent move / zoom calls.
	// 	const zoom = d3.zoom();
	// 	this.svg.call(zoom.transform, d3.zoomIdentity);


	// 	// this.resetViewport();
	// 	// g.attr("transform", "translate(" + (dx) + ",0)");
	// 	// this.tree.UpdateTree();
		
	// }

	getElementID(node: ECONode) {
		return 'node_' + node.id;
	}

	getRectStyle(node: ECONode) {
		if (node.isSelected)
			return "fill: lightgreen;";
		return "fill: " + node.bc + "; stroke: " + node.c + "; stroke-width: 2;"
	}

	// getNodeText(node: ECONode) {
	// 		let fNode: Node = node.data;
	// 		let elementId = 'node_' + node.id;

	// 		let xCenter = node.XPosition + node.w / 2;
	// 		let yCenter = node.YPosition + node.h / 2;
	// 		let dy = node.h / 4;
	// 		let html = '';		
	// 		let photo = (fNode.photo) ? fNode.photo : '';
	// 		let yob = (fNode.yob) ? fNode.yob : '';
	// 		let yod = (fNode.yod) ? fNode.yod : '';
	// 		let dod = (fNode.dod) ? fNode.dod : '';
	// 		let pod = (fNode.pod) ? fNode.pod : '';
	// 		let por = (fNode.por) ? fNode.por : '';

	// 	// 	NGUYỄN VĂN TÂM (☺)
	// 	//     (1920-1985)
	// 	//   Giỗ: 25/8 Âm lịch
	// 	//     Mộ: Xã An Nhơn

	// 	//  NGUYỄN VĂN TÂM
	// 	//       (1920)
	// 	//   Sống: Xã An Nhơn

	// 		let row1 = fNode.name + ((photo != '') ? ' (☺)' : '');
	// 		// if (n == 1) console.log('row1: ', row1);

	// 		let pre = '<tspan x=\"' + xCenter + '\" y=\"' + yCenter + '\" dy=\"';
	// 		let anchor = '\" text-anchor=\"middle\" dominant-baseline=\"central\" ';
	// 		let bold = 'style=\"font-weight:bold\">';
	// 		let italic = 'style=\"font-style: italic\">';
	// 		let post = '</tspan>';

	// 		let row2 = (yob == '' && yod == '') ? ' ' : ((yob == '') ? ('(-' + yod + ')') : ('(' + yob + '-' + yod + ')'));
	// 		let row3 = (dod != '') ? ('Giỗ: ' + dod + ' Âm lịch') : '';
	// 		let row4 = (pod != '') ? ('Mộ: ' + pod) : '';

	// 		if (row2 != '' && row3 != '' && row4 != '') {
	// 			html += pre + 0 + anchor + bold + row1 + post;
	// 			html += pre + dy + anchor + italic + row2 + post;
	// 			html += pre + 2 * dy + anchor + row3 + post;
	// 			html += pre + 3 * dy + anchor + row4 + post;
	// 		} else if (row2 != '' && row3 != '' && row4 == '') {
	// 			html += pre + 0 + anchor + bold + row1 + post;
	// 			html += pre + dy + anchor + italic + row2 + post;
	// 			html += pre + 2 * dy + anchor + row3 + post;
	// 		} else if (row2 != '' && row3 == '' && row4 == '') {
	// 			html += pre + 0 + anchor + bold + row1 + post;
	// 			html += pre + dy + anchor + italic + row2 + post;
	// 		} else {
	// 			html += pre + dy + anchor + bold + row1 + post;
	// 		}
	// 		// if (fNode.name.indexOf("Phan Dinh") == 0)
	// 		// 	console.log('html: ', html);
	// 		// document.getElementById(elementId).innerHTML = html;
	// 		return html;
	// }

	private	setNodeText() {

		// console.log('SGV - tree - width,height,rootXOffset,rootYOffset: ', this.tree.width, this.tree.height, this.tree.rootXOffset, this.tree.rootYOffset);
		// console.log('SGV - tree - nDatabaseNodes: ', this.tree.nDatabaseNodes);

		for (let n = 0; n < this.tree.nDatabaseNodes.length; n++) {
			let node = this.tree.nDatabaseNodes[n];
			let fNode: Node = node.data;
			let elementId = 'node_' + node.id;

			if (node.id == 0) {
				console.log('node=1: name, x, y, w, h: ', fNode.name, node.XPosition, node.YPosition, node.width, node.height);
			}
			
		// if (fNode.name.indexOf("Phan Văn Gian") == 0) console.log('fNode: ', fNode);
		//  console.log('fNode: ', fNode);

			
			// let yCenter = node.YPosition + node.h / 2;
			let y = node.YPosition;

			// let dy = node.h / 4;
			let html = '';	
			
			let xCenter = node.XPosition + node.w / 2;

			let photo = (fNode.photo) ? fNode.photo : '';
			if (photo != '')
				xCenter = node.XPosition + (node.w - 50) / 2;

			// let yob = (fNode.yob) ? fNode.yob : '';
			// let yod = (fNode.yod) ? fNode.yod : '';
			// let dod = (fNode.dod) ? fNode.dod : '';
			// let pod = (fNode.pod) ? fNode.pod : '';
			// let por = (fNode.por) ? fNode.por : '';

		// 	NGUYỄN VĂN TÂM (☺)
		//     (1920-1985)
		//   Giỗ: 25/8 Âm lịch
		//     Mộ: Xã An Nhơn

		//  NGUYỄN VĂN TÂM
		//       (1920)
		//   Sống: Xã An Nhơn

			// let row1 = fNode.name + ((photo != '') ? ' (☺)' : '');
			// if (n == 1) console.log('row1: ', row1);

			let anchor = '\" text-anchor=\"middle\" dominant-baseline=\"central\" ';
			let bold = 'style=\"font-weight:bold;font-size:10px\">';
			let normal = 'style=\"font-weight:normal;font-size:10px\">';
			let italic = 'style=\"font-style:italic;font-size:10px\">';
			let post = '</tspan>';
			let rows = fNode['rows'];
			// let dx = -5;
			let dx = 0;
			let dy = this.tree.config.defaultNodeHeight;
			for (let i = 0; i < rows.length; i++) {
				let pre = '<tspan x=\"' + xCenter + '\" y=\"' + y + '\" dx=\"' + dx + '\" dy=\"';
				let style = (rows[i][1] == 'bold') ? bold : (rows[i][1] == 'italic' ? italic : normal);
				html += pre + dy + anchor + style + rows[i][0] + post;
				dy += this.tree.config.defaultNodeHeight;
			}

			// let row2 = (yob == '' && yod == '') ? ' ' : ((yob == '') ? ('(-' + yod + ')') : ('(' + yob + '-' + yod + ')'));
			// let row3 = (dod != '') ? ('Giỗ: ' + dod + ' Âm lịch') : '';
			// let row4 = (pod != '') ? ('Mộ: ' + pod) : '';

			// if (row2 != '' && row3 != '' && row4 != '') {
			// 	html += pre + 0 + anchor + bold + row1 + post;
			// 	html += pre + dy + anchor + italic + row2 + post;
			// 	html += pre + 2 * dy + anchor + row3 + post;
			// 	html += pre + 3 * dy + anchor + row4 + post;
			// } else if (row2 != '' && row3 != '' && row4 == '') {
			// 	html += pre + 0 + anchor + bold + row1 + post;
			// 	html += pre + dy + anchor + italic + row2 + post;
			// 	html += pre + 2 * dy + anchor + row3 + post;
			// } else if (row2 != '' && row3 == '' && row4 == '') {
			// 	html += pre + 0 + anchor + bold + row1 + post;
			// 	html += pre + dy + anchor + italic + row2 + post;
			// } else {
			// 	html += pre + dy + anchor + bold + row1 + post;
			// }
			// if (fNode.name.indexOf("Phan Dinh") == 0)
				// console.log('html: ', html);
			document.getElementById(elementId).innerHTML = html;
		}
	}

	// --- Image setup based on type
	getImageUrl(node: ECONode, type: string) {
		if (type == 'collapse')
			return (node.canCollapse) ? (node.isCollapsed ? '../../assets/icon/plus.gif' : '../../assets/icon/less.gif') : null;
		return node.data.photoUrl;
	}

	//
  // ------------- END SVG-TREE -------------
  //

  // ------------- ng-select -------------
  // -------TYPE NEW WORD (Enter) OR SELECT -------
  // ------------------------------------- 

  clearPeopleNodes() {
    this.selectPeople = null;
  }

  closePeopleNodes() {
    if (DEBUGS.NODE)
      console.log('NodePage - closePeopleNodes - selectPeople: ', this.selectPeople);
    this.selectedNode = null;
    if (this.selectPeople)
      this.startSearch(this.selectPeople);
  }
  
  keyupPeopleNodes(event) {
    if (DEBUGS.NODE)
      console.log('NodePage - keyup: ', event.target.value);
    if (event.key !== 'Enter')
      return;
  }

  onNodeInfoPopover(item: any) {
    if (DEBUGS.NODE)
      console.log('NodePage - onNodeInfoPopover: ', item);
    this.nodeItem = item.id;
    if (this.nodeItem == 'all')
      this.nodeItem = null;
    this.peopleNodes = this.getPeopleNodes (this.family, this.nodeItem)
    this.selectPeople = null;
    if (this.nodeItem == null) {
      this.nodeItemMessage = this.languageService.getTranslation('NODE_NUM_NODES') + this.peopleNodes.length;
    } else {
    this.nodeItemMessage = this.languageService.getTranslation('NODE_MISSING_ITEM_1') + item.name +
    this.languageService.getTranslation('NODE_MISSING_ITEM_2') + this.peopleNodes.length;
    }
  }

  // --------- END ng-select ----------

  startSearch(searchStr) {
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - searchStr: ', searchStr)
    // remove Generation
    // name: Đoàn Văn Phê
    searchStr = searchStr.substring(0, searchStr.indexOf(' ('));
    let parentName = '';
    // remove Parent if any
    let idx = searchStr.indexOf('(');
    if (idx > 0) {
      // this is node with parent name
      parentName = searchStr.substring(idx+1, searchStr.length-1)
      searchStr = searchStr.substring(0, idx)
    }
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - searchStr, parentName: ', searchStr, parentName);
    let sNodes:Node[] = [];
    // search thru all nodes
    let nodes:Node[] = this.nodeService.getFamilyNodes(this.family);
    nodes.forEach((node:Node) => {
      // reset nclass
      node.nclass = this.nodeService.updateNclass(node);
      let strProfile = node.name;
      if (strProfile.indexOf(searchStr) >= 0) {
        if (parentName != '') {
          // get real node
          let words = node.pnode.name.split(' ');
          let pname = (words.length > 2) ? words[2] : words[1];
          if (pname == parentName) {
            // found the node
            sNodes.push(node);
          }
        } else
          sNodes.push(node);
      }
    })
    if (DEBUGS.NODE)
      console.log('NodePage - startSearch - sNodes: ', sNodes)
      // set select on 1st node
		let node:Node = sNodes[0];

    node['nclass'] = 'select'

		// console.log('NodePage - idSvgNode: ', node['idSvgNode'])
		let idSvgNode = node.id;

		this.tree.selectNode(idSvgNode, true);
		let svgNode = this.tree.getNodeById(idSvgNode);
		this.transformSelectNode(svgNode);

		// let nodeId = 'node_' + node['idSvgNode'];
		// d3.select("#svg-id")
		// .attr("align","center");
		
		// setTimeout(() => {
		// 	this.onNodeSelect(node, true);
    // }, 200);

  }
  
  onNodeSelect(node: Node, openTask?: any) {

    if (DEBUGS.NODE)
      console.log('NodePage - onNodeSelect - node: ', node);

			
    // reset nclass
    if (this.selectedNode)
      this.selectedNode.nclass = this.nodeService.updateNclass(this.selectedNode);

    this.selectedNode = node;
    this.selectedNodeName = node.name;
    this.selectPeople = node.name + this.nodeService.getFullDetail(node)
    let ancestorName = this.info.family_name;
    this.isChildOK = this.nodeService.isAncestorName(ancestorName, node);
    this.selectedNode.nclass = 'node-select';
    
		setTimeout(() => {
      if (openTask)
        this.presentSelectPopover();
    }, 500);
  }

  async presentSelectPopover() {
    this.themeService.setAlertSize({ width: 250, height: 320 });
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        'node': this.selectedNode,
        'isChildOK': this.isChildOK,
        'isBranchOK': this.isChildOK,
        'header': this.languageService.getTranslation('NODE_POPOVER_HEADER')
      },
      cssClass:'popover',
      side: 'right',
      alignment: 'end',
      // translucent: true,
      dismissOnSelect: true,
      // backdropDismiss: false
      backdropDismiss: true
    });
    popover.onDidDismiss().then((result) => {
      if (DEBUGS.NODE)
        console.log('NodePage - presentSelectPopover - result: ', result);
      this.isPopover = false;
      switch (result.data) {
        case 'onEdit':
          this.onEdit();
          break;
        case 'onAdd':
          this.onAdd();
          break;
        case 'onAddBranch':
            this.onAddBranch();
            break;
        case 'onDelete':
          this.onDelete();
          break;
      }
    });
    await popover.present();
  }

  onEdit() {
    this.openEditModal(this.selectedNode);
  }

  async openEditModal(node: Node) {
    if (DEBUGS.NODE)
      console.log('NodePage - openEditModal - node: ', node);
    const modal = await this.modalCtrl.create({
      component: EditPage,
      componentProps: {
        'caller': 'editor',
        'node': node,
        'family': this.family,
        'info': this.info,
      },
			cssClass: 'modal-dialog',
			backdropDismiss:false
    });

    modal.onDidDismiss().then((resp) => {
      let status = resp.data.status;
      if (status == 'cancel') {
        // do nothing
      } else if (status == 'save') {
        // update node from values
        let values = resp.data.values;
        if (DEBUGS.NODE)
          console.log('NodePage - openEditModal - values, node : ', values, node);
        let change = this.nodeService.updateNode(node, values);
        if (change) {
          // there is change
          if (DEBUGS.NODE)
            console.log('TreePage - onDidDismiss : change');
          this.updateSystemData(node);
          this.selectPeople = node.name + this.nodeService.getFullDetail(node);
          if (DEBUGS.NODE)
            console.log('TreePage - onDidDismiss : OK');
        }
      }
    });
    return await modal.present();
  }

  async onAdd() {

    let node = this.selectedNode;

    let inputs = [];
    if (!node.pnode)
      // root node, add father
      inputs.push({type: 'radio', label: this.languageService.getTranslation('FATHER'), value: 'FATHER', checked: false });
    if (node.gender == 'female')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('HUSBAND'), value: 'HUSBAND' });
    else if (node.gender == 'male')
      inputs.push({type: 'radio', label: this.languageService.getTranslation('WIFE'), value: 'WIFE' });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('SON'), value: 'SON', checked: true });
    inputs.push({type: 'radio', label: this.languageService.getTranslation('DAUGHTER'), value: 'DAUGHTER', checked: false });

    this.utilService.alertRadio('NODE_ADD_RELATION_HEADER', '', inputs , 'CANCEL', 'OK').then((res) => {
      console.log('onAdd- res: ', res);
      if (res.data) {

        let relation = res.data;
        let ancestorName = this.nodeService.getChildFamilyName(this.selectedNode);

        // let firstChar = ancestorName.charAt(0);
        // ancestorName = firstChar + ancestorName.substring(1);

        let gender = (relation == 'FATHER' || relation == 'HUSBAND' || relation == 'SON') ? 'male' : 'female';
        // let lName = this.utilService.stripVN(ancestorName);

        let mName = (gender == 'male') ? 'văn' : 'thị';
        let fName = (gender == 'male') ? 'nam' : 'nữ';
        // let name = this.utilService.stripVN(ancestorName) + ' ...';
        let name = ancestorName + ' ' + mName + ' ' + fName + ' ...';
        let node: any;
        if (relation == 'FATHER') {
          this.addFather(name);
        } else {
          if (relation == 'SON' || relation == 'DAUGHTER')
            node = this.nodeService.addChild(this.selectedNode, name, gender, relation);
          else
            node = this.nodeService.addSpouse(this.selectedNode, name, gender, relation);
          this.updateSystemData(node);
          this.onNodeSelect(node);
        }
      }
    });
  }

	// add branch

	async onAddBranch() {

    let node: Node = this.selectedNode;
    console.log('NodePage - onAddBranch - node: ', node);

    this.dataService.readBranchNames().then((names:[]) => {
      console.log('NodePage - onAddBranch - names: ', names);

      let inputs = [];
      names.forEach((name: string) => {
        inputs.push({type: 'radio', label: name, value: name, checked: false });
      })
      console.log('NodePage - onAddBranch - inputs: ', inputs);

      this.utilService.alertRadio('NODE_ADD_RELATION_HEADER', '', inputs , 'CANCEL', 'OK').then((res) => {
        console.log('onAddBranch - res: ', res);
        if (res.data) {
          let branch = res.data;
          this.dataService.readBranch(branch).then((bFamily: Family) => {
            console.log('NodePage - onAddBranch - bFamily: ', bFamily);
            let bNode: any = bFamily.nodes[0];
            let relation = 'SON';
            bNode.pnode = node;
            bNode.family = bFamily;
            bNode.relation = this.languageService.getTranslation(relation);
            node.family.children.push(bFamily);

						// rebuild family with new nodes
						this.family = this.familyService.buildFullFamily(this.family);
            this.familyView = this.family;

						// and update
            this.updateSystemData(node);
            this.onNodeSelect(node);
          });
        }
      });
    });
  }

  onDelete() {
    let node = this.selectedNode;
    let msg = this.utilService.getAlertMessage([
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_1'},
      {name: 'data', label: node.name},
      {name: 'msg', label: 'NODE_DELETE_NODE_MESSAGE_2'},
    ]);
    this.utilService.alertConfirm('NODE_DELETE_NODE_MESSAGE', msg, 'CANCEL', 'OK').then((res) => {
      console.log('onDelete - res:' , res)
      if (res.data) {
        this.nodeService.deleteNode(this.family, node);
        this.updateSystemData(node);
        if (node == this.selectedNode)
          // reset search box
          this.clearPeopleNodes();
      }
    });
  }

  addFather(name: string) {
    // this.dataService.readFamily().then((family:any) => {
    //   let node: Node = { name: name, gender: 'male', yob: '1900' } 
    //   let newFamily: Family= {
    //     version: family.version,
    //     nodes: [ node ],
    //     children: [ { nodes: family.nodes, children: family.children } ]
    //   };
    //   this.dataService.saveFamily(newFamily).then(status => {
    //     this.startFromStorage();
    //   });
    // });
  }

  updateSystemData(node: any) {
    // update data for node
    node.span = this.nodeService.getSpanStr(node);
    // save full family to local memory and update people list
    this.familyService.saveFullFamily(this.family).then(status => {
      this.peopleNodes = this.getPeopleNodes (this.family);
    });
  }

}
