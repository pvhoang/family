import { Injectable } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilService } from '../../../services/util.service';
import { LanguageService } from '../../../services/language.service';

@Injectable({
	providedIn: 'root'
})
export class NotifyService {

  ancestor: any;
  memorialMsg: any;

	constructor(
		private fbService: FirebaseService,
		private utilService: UtilService,
    private languageService: LanguageService,

	) {}

	// --- notifyMode ---

	notifyStart(ancestor: any, memorialMsg: any) {
		this.ancestor = ancestor;
		this.memorialMsg = memorialMsg;
	}

  notifyReadList(): any {
		return new Promise((resolve) => {
			this.fbService.getNotification(this.ancestor, 'recipients').then((recipients:any) => {
				this.fbService.getNotification(this.ancestor, 'messages').then((messages:any) => {
					let rItems = [];
					if (!recipients) {
						rItems = [{ id: 'phan', name: 'Phan Viet Hoang', token: '', tokenShort: '', platform: '' }];
					} else {
						for (let key of Object.keys(recipients)) {
							let rec = recipients[key];
							let platform = (!rec.platform) ? '' : rec.platform;
							// let token = (!rec.token) ? '' : 'x';
							let tokenShort = (!rec.token) ? '' : rec.token.substring(0, 20) + ' ...';
							let token = (!rec.token) ? '' : rec.token;
							rItems.push({id: key, name: rec.name, token: token, tokenShort: tokenShort, platform: platform })
						};
					}
					let mItems = [];
					if (!messages) {
						mItems = [{id: '1234', status: 'new', content: 'some text'}];
					} else {
						// console.log('messageReadList - messages: ', messages);
						for (let key of Object.keys(messages)) {
							let msg = messages[key];
							mItems.push({id: key, status: msg.status, content: msg.content})
						};
					}

					let dateID = this.utilService.getDateID();
					let persons = this.memorialMsg.persons;
					let lunarDay = this.memorialMsg.today;
					let stat = this.languageService.getTranslation('FILE_MESSAGE_STATUS_NEW');
					for (let i = 0; i < persons.length; i++) {
						let item = persons[i];
						let id = dateID+'-'+(i+1);
						let content = 'Hôm nay (ÂL): ' + lunarDay + ' - Húy nhật: ' + item[1] + ' ( ' + item[0] + ' ) ' 
						// if this content already exists, ignore
						let iContents = mItems.filter((item: any) => {
							return item.content === content;
						})
						if (iContents.length == 0)
							mItems.push({id: id, status: stat, content: content })
					}
					if (mItems.length == 0) {
						mItems = [{ id: dateID, status: 1, content: 'Ngay giỗ của dòng họ ...' }];
					}
					resolve({ recipientList: rItems, messageList: mItems })
				});
			});
		});
  }

	notifySaveList(recipientList, messageList): void {

		let msg = this.utilService.getAlertMessage([
			{name: 'msg', label: 'FILER_NOTIFICATION_SAVE'},
		]);
    this.utilService.alertConfirm('FILER_NOTIFICATION_SAVE', msg, 'CANCEL', 'OK').then((res) => {
      if (res.data) {

				let recipients = {};
				recipientList.forEach(recipient => {
					recipients[recipient.id] = { name: recipient.name, token: recipient.token, platform: recipient.platform };
				})
				let messages = {};
				messageList.forEach(msg => {
					messages[msg.id] = { status: msg.status, content: msg.content };
				})

				this.fbService.deleteNotification(this.ancestor, 'messages').then((stat:any) => {
					this.fbService.setNotification(this.ancestor, 'messages', messages).then((status1:any) => {});
				});
				this.fbService.deleteNotification(this.ancestor, 'recipients').then((status1:any) => {
					this.fbService.setNotification(this.ancestor, 'recipients', recipients).then((status2:any) => {});
				});
				this.utilService.presentToastOK(['FILER_NOTIFICATION_SAVE_OK']);
      }
    });
  }
    
}
