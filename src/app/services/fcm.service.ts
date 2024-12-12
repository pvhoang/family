import { Injectable } from '@angular/core';
import {
  FirebaseMessaging,
  GetTokenOptions,
} from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { Platform } from '@ionic/angular';
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
    public platform: Platform,
    private firestore: Firestore,
    private fbService: FirebaseService,
    private utilService: UtilService
	) {
	}

	public initPush() {
		FirebaseMessaging.requestPermissions().then(settings => {
			console.log('settings.receive: ' + settings.receive)
		});

		FirebaseMessaging.addListener('tokenReceived', (event) => {
			// console.info('Registration token: ', token.value);
      console.log("tokenReceived: ", { event });
		});
    FirebaseMessaging.addListener("notificationReceived", (event) => {
      console.log("notificationReceived: ", { event });
    });
    FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
      console.log("notificationActionPerformed: ", { event });
    });

		console.log('platform: ', Capacitor.getPlatform());

		if (Capacitor.getPlatform() === "web") {
      navigator.serviceWorker.addEventListener("message", (event: any) => {
        console.log("serviceWorker: event: ", { event });
				// alert('serviceWorker');
				// let type = event.data.data.type;
				let icon = "../assets/icon/gia-pha.png";

				// https://developer.mozilla.org/en-US/docs/Web/API/Notification

				let title = event.data.notification.title;
				let body = event.data.notification.body;
				body = new IonicSafeString('<img src="../assets/icon/gia-pha.png" width="20px" height="20px"/><br/>' + body);

				// alert(title);
				// alert(body);
				this.utilService.alertMsg(title, body, 'OK', { width: 350, height: 200 }).then(stat => {});
      });
    }
		console.log("initPush");
  }

	public requestPermissions(ancestor: string, recipient: any, recData: any) {
		return new Promise((resolve) => {
			FirebaseMessaging.requestPermissions().then(settings => {
				console.log('settings: ', settings);
				if (settings.receive == "granted") {
					this.getToken(ancestor).then((currentToken:any) => {
						if (currentToken) {
							let token = currentToken.token;
							if (!recData.token || recData.token != token) {
								let str = this.platform.platforms().toString();
								let newData = {};
								newData[recipient] =  { name: recData.name, token: token, platform: str };
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
		if (Capacitor.getPlatform() === "web") {
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
