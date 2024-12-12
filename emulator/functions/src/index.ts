import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp();

console.log('Functions start!');

exports.pushMessages = functions.firestore
	.document('/giapha/phan/notifications/activeMessage')
	.onUpdate(async (change, context) => {

		// news with id is changed, send notify
		let data = change.after.data();
		console.log('data: ', data);
		console.log('params: ', context.params);
		let msg = data.content;

		// get thru all users which match name and has tokens
		return admin.firestore().doc(`/giapha/phan/notifications/recipients`).get().then(snap => {
			// console.log('recipients: ', snap.data());
			// { phan: { name: 'Hoang', token: '12345' } }
			let recipients:any = snap.data();
			// loop thru each recipient
			for (let key of Object.keys(recipients)) {
				let vals:any = recipients[key];
				let name = vals.name;
				let token = vals.token;
				console.log('recipient key: ', key);
				console.log('recipient name: ', name);

				if (token != '') {
					// valid token, send
					console.log('token data: ', token);
					const payload = {
						notification: {
							title: name,
							body: msg
						},
						data: {
							'id': 'ID',
							'type': 'TYPE',
							'title': name,
							'text': msg
						},
						token: token
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
		});
	});
