import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { DEBUG } from '../../environments/environment';
import { LanguageService } from '../services/language.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
		private http: HttpClient,
    private languageService: LanguageService,
    private alertController: AlertController,
    public toastController: ToastController,
	) { }

	getLocalJsonFile(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.get(url).toPromise().then((data:any) => {
				resolve(data);
			}).catch(err => {
				console.log('err: ', err);
				reject(err.error);
			});
		});
	}

	getLocalTextFile(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.get(url, {responseType: 'text'}).toPromise().then((data:any) => {
				resolve(data);
			}).catch(err => {
				reject(err.error);
			});
		}).catch(err => {
			console.log('err = ', err);
		});
	}

	getLocalImageFile(url: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.get(url, { responseType: 'blob' }).toPromise().then((blob:any) => {
				resolve(blob);
			}).catch(err => {
				reject(err.error);
			});
		}).catch(err => {
			console.log('err = ', err);
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

	async alertMsg(srcHeader, srcMessage, css?) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;

		if (!css)
			css = 'alert-small';
		// let css = 'myClass';
		let alert = await this.alertController.create({
			header: header,
			message: message,
			cssClass: css,
			buttons: ['OK']
		});
		alert.present();
	}

	async alertConfirm(srcHeader, srcMessage, cancelText, okText, css?) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;

		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);

		if (!css)
			css = 'alert-small';
		let alert = await this.alertController.create({
      header: header,
			message: message,
			cssClass: css,
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
    return choice;
	}

	async alertRadio(srcHeader, srcMessage, inputs: any[], cancelText, okText, css?) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;

		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);

		if (!css)
			css = 'alert-small';
		let alert = await this.alertController.create({
      header: header,
			message: message,
			cssClass: css,
			inputs: inputs,
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
						alert.dismiss(data);
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
    return choice;
	}

	async alertSendTree(srcHeader, srcMessage, infoText, cancelText, okText, css?) {

		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		
		infoText = this.languageService.getTranslation(infoText);
		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);

		if (!css) 
			css = 'alert-small';
		let alert = await this.alertController.create({
      header: header,
			message: message,
			cssClass: css,
			inputs: [
        {
          name: 'info',
          placeholder: infoText,
        }
      ],
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
						let info = data.info;
						// validate data
						console.log('info: ', info);
						let msg = '';
						if (info.length < 5)
							msg += 'Thông tin liên hệ không được để trống<br>';
						if (msg != '') {
							this.presentToast(msg);
							return false;
						}
						alert.dismiss(true);
						return data;
          }
        }
      ]
    });
    await alert.present();
		let result:any;
    await alert.onDidDismiss().then((data) => {
			result = data;
    })
    return result;
	}

	async alertAdmin(srcHeader, srcMessage:any, inputs: any[], cancelText, okText, css?) {

		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);

		if (!css) 
			css = 'alert-big';
		let alert = await this.alertController.create({
      header: header,
			message: message,
			cssClass: css,
			inputs: inputs,
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
						return data;
          }
        }
      ]
    });
    await alert.present();
		let result:any;
    await alert.onDidDismiss().then((data) => {
			result = data;
    })
    return result;
	}

	async presentToastWait(srcHeader, srcMessage, okText) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		okText = this.languageService.getTranslation(okText);
    const toast = await this.toastController.create({
      header: header,
      message: message,
      icon: 'information-circle',
      position: 'middle',
      color: 'medium',
      buttons: [
				{
          text: okText,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
		let result:any;
    await toast.onDidDismiss().then((data) => {
			result = data;
    })
    return result;
  }

	async presentToast(srcMessage) {
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
    const toast = await this.toastController.create({
      message: message,
      color: 'medium',
      position: 'middle',
      duration: 3000
    });
    toast.present();
  }

	public getYears() {
		let years = [];
		for (let i = 1900; i < 2023; i++)
			years.push({name: ''+i});
		return years;
	}

	public getDays() {
		let days = [];
		for (let i = 1; i <= 30; i++) {
			let day = (i < 10) ? '0' + i : '' + i;
			days.push({name: day});
		}
		return days;
	}

	public getMonths() {
		let months = [];
		for (let i = 1; i <= 12; i++) {
			let month = (i < 10) ? '0' + i : '' + i;
			months.push({name: month});
		}
		return months;
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

	getDateID(full?) {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
		let id = ''+day+'-'+month+'-'+year;
		if (full) {
			let hour = ''+d.getHours();		if (hour.length < 2) hour = '0' + hour;
			let min = ''+d.getMinutes();		if (min.length < 2) min = '0' + min;
			id = ''+day+'-'+month+'-'+year+'-'+hour+'-'+min;
		}
		return id;
  }

	getDateTime(dateID: any) {
		// 03-08-2022-16-27
		let values = dateID.split('-');
		let d = new Date(values[2], values[1], values[0]);
		if (values.length > 3)
			d = new Date(values[2], values[1], values[0], values[3], values[4]);
		return d.getTime();
  }
}
