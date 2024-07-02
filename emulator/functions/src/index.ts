import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { getMessaging } from "firebase-admin/messaging";

import { Configuration, OpenAIApi } from "openai";
const API_KEY = "sk-proj-49T6MTRUIeg746BRZBR6T3BlbkFJB5asds9ub7AzkLGwInG4";

admin.initializeApp();

exports.pushNews = functions.firestore
	.document('/news/{id}')
	.onUpdate(async (change, context) => {
		// news with id is changed, send notify
	let newsData = change.after.data();

	console.log('newsData: ', newsData);
	console.log('params: ', context.params);

	const recipient = newsData.recipient;
	const newsId = context.params.id;

	// get thru all users which match recipient type
	return admin.firestore().collection(`users`).get().then(users => {
		admin.firestore().collection(`tokens`).get().then(tokens => {
			users.docs.forEach((userDoc) => {
				// userDoc.id = email
				admin.firestore().doc(`users/${userDoc.id}`).get().then(user => {
					let userData:any = user.data();
					console.log('user data: ', userData);
					// take only user with recipient=role and tokem available
					if (userData.role == recipient) {
						// tokenDoc.id = email
						admin.firestore().doc(`tokens/${userData.email}`).get().then(token => {
							if (token) {
								const tokenData: any = token.data();
								console.log('token data: ', tokenData);
								const payload = {
									notification: {
										title: newsData.title,
										body: newsData.text,
									},
									data: {
										'id': newsId,
										'type': newsData.type,
										'title': newsData.title,
										'text': newsData.text
									},
									token: tokenData['fcmToken']
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
						});
					}
				});
			});
		}, err => {
				console.log('err: ', err);
		})
		});
	});

// https://stackoverflow.com/questions/75637545/accessing-chatgpt-api-through-firebase-cloud-function
exports.generateText = functions.https.onCall(async (data) => {
	// console.log("Start generateText: ", data);
	const configuration = new Configuration({
		apiKey: API_KEY
	});
	const openai = new OpenAIApi(configuration);
	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content: data.prompt,
			},
		],
	});
	const [choice] = completion.data.choices;
	// console.log("Complete generateText: ", choice);
	return { response: choice.message	};
});

