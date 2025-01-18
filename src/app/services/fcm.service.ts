import { Injectable } from '@angular/core';
import {
  FirebaseMessaging,
  GetTokenOptions,
} from "@capacitor-firebase/messaging";
// import { Capacitor } from "@capacitor/core";
// import { Platform } from '@ionic/angular';
import { IonicSafeString } from '@ionic/angular';
import { Firestore, doc, addDoc, deleteDoc, setDoc, collection, collectionData } from '@angular/fire/firestore';
import { environment, DEBUGS, ROOT_COLLECTION } from '../../environments/environment';
import { FirebaseService } from '../services/firebase.service';
import { UtilService } from '../services/util.service';

// https://capawesome.io/blog/the-push-notifications-guide-for-capacitor/

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  public token = "";

  constructor(
    // public platform: Platform,
    private firestore: Firestore,
    private fbService: FirebaseService,
    private utilService: UtilService
	) {
	}

	public initPush() {
		FirebaseMessaging.requestPermissions().then(settings => {
			if (DEBUGS.FCM)
				console.log('settings.receive: ' + settings.receive)
		});

		FirebaseMessaging.addListener('tokenReceived', (event) => {
			// console.info('Registration token: ', token.value);
			if (DEBUGS.FCM)
				console.log("tokenReceived: ", { event });
		});

    FirebaseMessaging.addListener("notificationReceived", (event) => {
			if (DEBUGS.FCM)
				console.log("notificationReceived: ", { event });
    });
    FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
			if (DEBUGS.FCM)
				console.log("notificationActionPerformed: ", { event });
    });
		
		if (environment.platform === "web") {
			// https://developer.mozilla.org/en-US/docs/Web/API/Notification
      navigator.serviceWorker.addEventListener("message", (event: any) => {
				if (DEBUGS.FCM)
					console.log("serviceWorker: event: ", { event });
				let icon = "../assets/icon/gia-pha.png";
				let title = event.data.notification.title;
				alert('Title: '+ title);
				let body = event.data.notification.body;
				let message = '<img src="' + icon + '" width="20px" height="20px"/>&nbsp;&nbsp;' + body;
				body = new IonicSafeString(message);
				this.utilService.alertMsg(title, body, 'OK', { width: 350, height: 200 }).then(stat => {});
      });
    }
		if (DEBUGS.FCM)
			console.log("FcmService - initPush");
  }

	public requestPermissions(ancestor: string, recipient: any, recData: any) {
		return new Promise((resolve) => {
			FirebaseMessaging.requestPermissions().then(settings => {
				if (DEBUGS.FCM)
					console.log('FcmService - settings: ', settings);
				if (settings.receive == "granted") {
					this.getToken(ancestor).then((currentToken:any) => {
						if (currentToken) {
							let token = currentToken.token;
							if (!recData.token || recData.token != token) {
								let newData = {};
								newData[recipient] =  { name: recData.name, token: token, platform: environment.platform };
								this.fbService.updateNotification(ancestor, 'recipients', newData).then((status:any) => {
									resolve ('FCM_NA_TOKEN_IS_UPDATED');
								});
							} else {
								resolve ('FCM_NA_TOKEN_NOT_CHANGED');
							}
						} else {
							resolve ('FCM_NA_TOKEN_CAN_NOT_SET')
						}
					});
				} else {
					resolve('FCM_NA_PERMISSION_DENIED');
				}
			});
		});
  }

  public async getToken(ancestor: string) {
		const options: GetTokenOptions = {
			vapidKey: environment.firebase.vapidKey,
		};
		if (environment.platform === "web") {
			options.serviceWorkerRegistration =
				await navigator.serviceWorker.register("firebase-messaging-sw.js");
		}
		return await FirebaseMessaging.getToken(options);
  }

	getRecipientData(ancestor: string, recipient: any) {
		return new Promise((resolve) => {
			// user must be registered, then update token
			this.fbService.getNotification(ancestor, 'recipients').then((recipients:any) => {
				resolve(recipients[recipient]);
			})
		});
	}
}
