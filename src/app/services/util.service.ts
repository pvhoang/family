import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { DEBUG } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
		private http: HttpClient,
    private alertController: AlertController,
	) { }

	getLocalJsonFile(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.get(url).toPromise().then((data:any) => {
				resolve(data);
			}).catch(err => {
				reject(err.error);
			});
		});
	}

	console_log(msg: string, obj?: any) {
		if (!DEBUG)
			return;
		if (obj)
			console.log(msg, obj);
		else
			console.log(msg);
			// msg += ' ' + JSON.stringify(obj, null, 4);
	}

	async alertMsg(title, message) {
		let alert = await this.alertController.create({
			header: title,
			message: message,
			buttons: ['OK']
		});
		alert.present();
	}

	async alertConfirm(header, message, cancelText, okText) {
		let alert = await this.alertController.create({
      header: header,
			message: message,
      buttons: [
        {
          text: cancelText,
          handler: (data: any) => {
						alert.dismiss(false);
						return false;
          }
        },
        {
          text: okText,
          handler: (data: any) => {
						alert.dismiss(true);
						return false;
          }
        }
      ]
    });
    await alert.present();
		let choice:any;
    await alert.onDidDismiss().then((data) => {
			choice = data;
    })
    return choice
	}

	public stripVN(str) {
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, 'a');
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, 'e');
		str = str.replace(/ì|í|ị|ỉ|ĩ/gi, 'i');
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, 'o');
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, 'u');
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, 'y');
		str = str.replace(/đ/gi, 'd');
		str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/gi, 'A');
		str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/gi, 'E');
		str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/gi, 'I');
		str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/gi, 'O');
		str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/gi, 'U');
		str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/gi, 'Y');
		str = str.replace(/Đ/gi, 'D');
    return str.toLowerCase();
	}

}
