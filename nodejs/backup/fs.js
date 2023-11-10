// https://firebase.google.com/docs/firestore/quickstart#web-version-8
// https://sajid576.medium.com/firebase-cloud-firestore-queries-using-javascript-nodejs-3bef2e105745

const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
	projectId: 'family-c5b45',
	appId: '1:123668295235:web:669b452792b87cff2caef6',
	storageBucket: 'family-c5b45.appspot.com',
	locationId: 'us-central',
	apiKey: 'AIzaSyD2P1usKTKWDTnT6qAn9aOuIsTqxDIhQvU',
	authDomain: 'family-c5b45.firebaseapp.com',
	messagingSenderId: '123668295235',
};

if (require.main === module) {

	var args = process.argv.slice(2);
	console.log('args: ' + args, args.length);
	if (args.length != 7) {
		console.log('--- ERROR ---');
		console.log('node fs phan "hoang" "pvhoang940@gmail.com" 123456 "Gia phả Nguyễn Tộc" Nguyễn "Nguyễn Văn Dũng"');
		process.exit();
	}
	var ancestorID = args[0];
	var admin = args[1];
	var email = args[2];
	var keycode = args[3];
	var desription = args[4];
	var familyName = args[5];
	var rootName = args[6];

	firebase.initializeApp(firebaseConfig);
	const db = firebase.firestore();

	// build ancestor
	let ancestor = {
    "id": "ancestor",
    "data": {
			"admin":admin,
			"email":email,
			"keycode":keycode,
			"description": desription,
			"name": rootName,
			"family_name": familyName,
			"generation":"1"
    }
	};

	// build family
	let family = {
		"id": "family",
    "data": {
			version: '0.1', 
			nodes: [ 
				{ name: rootName, gender: 'male'} 
			]
		}
	}

	// build archive
	let archive = {
		"id": "archive",
		"data": {}
	}

	// build contribution
	let contribution = {
    "id": "contribution",
    "data": []
	};

	// build introduction
	let introduction = {
    "id": "introduction",
    "data": {
			"vi": '',
			"en": ''
		}
	};

	setDocument(db, ancestorID, ancestor)
	setDocument(db, ancestorID, family)
	setDocument(db, ancestorID, archive)
	setDocument(db, ancestorID, contribution)
	setDocument(db, ancestorID, introduction)

	console.log('... DONE ...');
}

function setDocument(db, collection, document)  {
	
	// always stringify document.data
	document.data = JSON.stringify(document.data),
	db.collection(collection).doc(document.id).set(document)
	.then(() => {
			console.log("Document written to collection: " + collection + " with id: " + document.id);
	})
	.catch((error) => {
			console.log("Error adding document: ", error);
	});
}
