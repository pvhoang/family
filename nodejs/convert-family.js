var fs = require("fs");

if (require.main === module) {
	
	// let family = readFile('./phan-family-3.json', true);
	let family = readFile('./phan-family.json', true);
	
	family = buildFullFamily(family)
	// console.log('family: ', family);
	// let nodes = getFamilyNodes(family, true);
	// console.log('nodes: ', nodes);

	function readFile (filePath, json) {
		let data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
		if (json)
			data = JSON.parse(data);
		return data;
	}

	function saveFile (filePath, text) {
		fs.writeFileSync(filePath, text, function(err) {
			if(err)
				console.log('ERROR - ', err);
			console.log('"The file : ' + filePath + ' was saved!');
		}); 
	}

	function appendFile (filePath, text) {
		fs.appendFileSync(filePath, text, function(err) {
			if(err)
				console.log('ERROR - ', err);
			console.log('"The file : ' + filePath + ' was appended!');
		});
	}

	function getFamilyNodes(family, addLevel) {
    let nodeLevel = 1;
    let nodes = [];
    family.nodes.forEach((node) => {
      if (addLevel)
        node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        getChildNodes(child, nodeLevel, nodes, addLevel);
      })
    }
    return nodes;
  }

  function getChildNodes(family, nodeLevel, nodes, addLevel) {
    family.nodes.forEach(node => {
      if (addLevel)
        node.level = nodeLevel;
      nodes.push(node);
    })
    if (family['children']) {
      nodeLevel++;
      family['children'].forEach(child => {
        getChildNodes(child, nodeLevel, nodes, addLevel);
      })
    }
  }

	function buildFullFamily(family) {
    // start at root
    let nodeLevel = 1;
    let childIdx = 1;
    let nodeIdx = 1;
    family.nodes.forEach((node) => {
      node = fillNode(node);
      node.id = '' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = nodeLevel;
      // node.nclass = this.nodeService.updateNclass(node);
      node.pnode = null;
      node.family = family;
      // node.profile = this.nodeService.getSearchKeys(node);
      // node.span = this.nodeService.getSpanStr(node);
    });
    family.iddom = 'family-' + family.nodes[0].id;
    if (family.children) {
      nodeLevel++;
      childIdx = 1;
      family['children'].forEach(child => {
        // buildChildNodes(family.nodes[0], child, nodeLevel, childIdx);
        buildChildNodes(family.nodes[0], child, nodeLevel, childIdx);
        childIdx++;
      })
    }

    // add level ranking
    // let nodes = this.nodeService.getFamilyNodes(family);
    // // console.log('getSelectedPerson - nodes2: ', nodes);
    // let levelRankingCount = {};
    // for (let i = 0; i < nodes.length; i++) {
    //   let node = nodes[i];
    //   // console.log('buildFullFamily - idlevel1: ', node.idlevel);
    //   // nodes.forEach((node:any) => {
    //   let level = '' + node.level;
    //   let id = node.id;
    //   let lastChar = id.charAt(id.length - 1);
    //   if (lastChar != '1') {
    //     // use same ranking as 1
    //     node.idlevel = nodes[i-1].idlevel;
    //   } else {
    //     if (!levelRankingCount[level])
    //       levelRankingCount[level] = 1;
    //     else
    //       levelRankingCount[level] = levelRankingCount[level] + 1;
    //     node.idlevel = level + '-' + levelRankingCount[level];
    //   }
    //   // console.log('buildFullFamily - idlevel: ', node.idlevel);
    //   node.span = this.nodeService.getSpanStr(node);
    // }
    // console.log('getSelectedPerson - nodes3: ', nodes);

    // console.log('buildFullFamily - family: ', family);

    return family;
  }

  function buildChildNodes(pnode, family, nodeLevel, childIdx) {
    let nodeIdx = 1;
    family.nodes.forEach(node => {
      node = fillNode(node);
      node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      // node.id = pnode.id + '-' + childIdx + '-' + nodeIdx++;
      node.idlevel = 'level-' + nodeLevel;
      node.level = nodeLevel;
      // node.nclass = this.nodeService.updateNclass(node);
      node.pnode = pnode;
      node.family = family;
      // node.profile = this.nodeService.getSearchKeys(node);
      // node.span = this.nodeService.getSpanStr(node);
    })

		console.log('node: ', family.nodes[0].name, family.nodes[0].pnode.name, family.nodes[0].desc);

    family.iddom = 'family-' + family.nodes[0].id;

    if (family['children']) {
      nodeLevel++;
      let cIdx = 1;
      family['children'].forEach(child => {
        buildChildNodes(family.nodes[0], child, nodeLevel, cIdx);
        cIdx++;
      })
    }
  }

	function fillNode(node) {
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
    if (!node.job) node.job = '';
    if (!node.desc) node.desc = '';
    if (!node.photo) node.photo = '';
    if (!node.dod) node.dod = '';
    return node;
  }

}
