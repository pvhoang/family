import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp();

console.log('Functions start!');

exports.pushMessages_phan = functions.firestore
	.document('/giapha/phan/notifications/activeMessage')
	.onUpdate(async (change, context) => {
		// news with id is changed, send notify
		let data = change.after.data();
		console.log('content, params: ', data.content, context.params);
		// console.log('params: ', context.params);
		// let msg = data.content;
		// get thru all users which match name and has tokens
		return admin.firestore().doc(`/giapha/phan/notifications/recipients`).get().then(snap => {
			evalMessage(data, snap);
		});
	});

function evalMessage(data: any, snap: any) {

	let msg = data.content;
	let recipients:any = snap.data();
	console.log('recipients: ', recipients);

	// loop thru each recipient
	for (let key of Object.keys(recipients)) {
		let vals:any = recipients[key];
		let name = vals.name;
		let token = vals.token;
		console.log('recipient vals: ', key, name, (token != '') ? 'OK' : 'NO TOKEN');
		if (token != '') {
			// valid token, send
			// console.log('token data: ', token);
			const payload = {
				
				notification: {
					title: name,
					body: msg
					// icon: 'https://firebasestorage.googleapis.com/v0/b/family-c5b45.appspot.com/o/phan%2Fgia-pha.png?alt=media&token=8b145e3f-62ae-4586-8047-034ba9297964'
				},
				data: {
					'id': 'ID',
					'type': 'TYPE',
					'title': name,
					'text': msg
				},
				token: token,
			};
			getMessaging()
			.send(payload)
			.then((response) => {
				console.log("Successfully sent message: ", response);
			})
			.catch((error) => {
				console.log("Error sending message: ", error);
			});
		}
	};

}