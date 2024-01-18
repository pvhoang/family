import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AlertController, PopoverController, ToastController, LoadingController, IonicSafeString } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { DEBUGS } from '../../environments/environment';
import { SelectComponent } from '../components/select/select.component';
import { LanguageService } from '../services/language.service';
import { ThemeService } from '../services/theme.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

	private isLoading = false;

  constructor(
		private http: HttpClient,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private alertController: AlertController,
    public toastController: ToastController,
    public loadingController: LoadingController,
    public popoverController: PopoverController,
    public modalCtrl: ModalController,
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
		console.log('getLocalImageFile - url = ', url);

		return new Promise((resolve, reject) => {
			this.http.get(url, { responseType: 'blob' }).toPromise().then((blob:any) => {
				console.log('OK');
				resolve(blob);
			}).catch(err => {
				console.log('ERROR: ', err.error );
				reject(err.error);
			});
		}).catch(err => {
			console.log('err = ', err);
		});
	}

	console_log(msg: string, obj?: any) {
		if (!DEBUGS.UTIL_SERVICE)
			return;
		if (obj)
			console.log(msg, obj);
		else
			console.log(msg);
			// msg += ' ' + JSON.stringify(obj, null, 4);
	}

	// ALERT

	getAlertMessage(items: any) {
		// let message = '<br/>';
		let message = '';
		items.forEach((item:any) => {
			if (item.name == 'msg') {
				let msg = this.languageService.getTranslation(item.label);
				message += (msg) ? msg : item.label
			} else if (item.name == 'data')
				message += '<b>' + item.label + '</b>'
				// message += '[ ' + item.label + ' ]'
		})
		// message += '<br/>';
		return message;
	}

	getAlertTableMessage(data: any) {
		let message = '';
		if (data.image) {
			message += '<img class="alert-image" src="' + data.image + '">';
			message += '<br/>';
		};
		// let message = '<img src="../assets/icon/bia-mo.jpg">';
		if (data.items) {
			let items = data.items;
			message += '<table>';
			items.forEach((item:any) => {
				message += '<tr><td><b>' + item.name + '</b>&nbsp;&nbsp;</td><td>:&nbsp;&nbsp;&nbsp;' + item.value + '</td></tr>';
			})
			message += '</table>';
		}
		// let message = '<table>';
		return message;
	}

	async alertMsg(srcHeader: any, srcMessage: any, okText: any, dialogDim: any) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		okText = this.languageService.getTranslation(okText);
		let css = 'alert-dialog';
		this.themeService.setAlertSize(dialogDim);

		let alert = await this.alertController.create({
			header: header,
			message: message,
			cssClass: css,
			buttons: [
        {
          text: okText,
					// text-capitalize: false,
          handler: (data: any) => {
						alert.dismiss(true);
						return false;
          }
        }
      ],
			backdropDismiss: false,
			mode: "md"
		});
		await alert.present();
		return await alert.onDidDismiss();
	}

	async alertConfirm(srcHeader, srcMessage, cancelText, okText) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;

		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);

		let css = 'alert-dialog';
		this.themeService.setAlertSize({ width: 350, height: 400 });
		
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
      ],
			backdropDismiss: false,
			mode: "md"
    });
    await alert.present();
		return await alert.onDidDismiss();
	}

	async alertRadio(srcHeader, srcMessage, inputs: any[], cancelText, okText, dialogDim?: any) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);
		let css = 'alert-dialog';
		if (!dialogDim)
			dialogDim = { width: 350, height: 400 };
		this.themeService.setAlertSize(dialogDim);

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
      ],
			backdropDismiss: false,
			mode: "md"
    });
    await alert.present();
		return await alert.onDidDismiss();
	}

	async alertText(srcHeader, inputs: any[], cancelText, okText, css?: any) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);
		if (!css)
			css = 'alert-dialog';
		this.themeService.setAlertSize({ width: 350, height: 400 });

		let alert = await this.alertController.create({
      header: header,
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
      ],
			backdropDismiss: false,
			mode: "md"
    });
    await alert.present();
		return await alert.onDidDismiss();
	}

	async alertSelect(srcHeader: any, selects: any[], cancelText: any, okText: any) {
		let header = this.languageService.getTranslation(srcHeader);
		if (!header)
			header = srcHeader;
		cancelText = this.languageService.getTranslation(cancelText);
		okText = this.languageService.getTranslation(okText);
		this.themeService.setRootProperties([['--app-modal-height', '300px']]);
    const modal = await this.modalCtrl.create({
      component: SelectComponent,
      componentProps: {
				'header': header,
        'selects': selects,
				'cancelText': cancelText,
				'okText': okText,
      },
			cssClass: 'modal-dialog',
			// cssClass: 'my-modal-class',
			backdropDismiss:false,
			mode: "md",
    });
    await modal.present();
		return await modal.onDidDismiss();
  }

	// LOADING

	async presentLoading() {
		this.isLoading = true;
		return await this.loadingController.create({
			duration: 10000,
			mode: "md"
		}).then(loading => {
			loading.present().then(() => {
				if (!this.isLoading) {
					loading.dismiss();
				}
			});
		});
	}

	async dismissLoading() {
		this.isLoading = false;
		return await this.loadingController.dismiss();
	}

	getIsLoading() {
		return this.isLoading;
	}

	// TOAST

	async presentToastWait(srcHeader: any, srcMessage: any, okText, waitTime?: number) {
		
		let header = null;
		if (!srcHeader) {
			let header = this.languageService.getTranslation(srcHeader);
			if (!header)
				header = srcHeader;
		}
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		let time = (waitTime) ? waitTime : 3000;
		this.themeService.setToastSize(message);
		okText = this.languageService.getTranslation(okText);
		let css = 'toast-dialog';
    const toast = await this.toastController.create({
      header: header,
      message: message,
      // icon: 'information-circle',
      position: 'middle',
      // position: 'bottom',
      color: 'medium',
			cssClass: css,
      duration: time,
			mode: "md",
      buttons: [
				{
          text: okText,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ],
    });
    await toast.present();
		return await toast.onDidDismiss();
  }

	async presentToast(srcMessage: string, waitTime?: number) {
		let message = this.languageService.getTranslation(srcMessage);
		if (!message)
			message = srcMessage;
		let time = (waitTime) ? waitTime : 3000;
		this.themeService.setToastSize(message);
		let css = 'toast-dialog';
    const toast = await this.toastController.create({
      message: message,
			cssClass: css,
      position: 'middle',
      duration: time,
			mode: "md"
    });
    await toast.present();
		return await toast.onDidDismiss();
  }

	public getYears() {
		let years = [];
		for (let i = 1800; i < 2050; i++)
			years.push(i);
		return years;
	}

	public getDays() {
		let days = [];
		for (let i = 1; i <= 30; i++)
			days.push((i < 10) ? '0' + i : '' + i);
		return days;
	}

	public getLunarYear(year: number) {
		let canArray = ["Quý","Giáp","Ất","Bính","Đinh","Mậu","Kỉ","Canh","Tân","Nhâm"]
		let chiArray = ["Hợi","Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất"];
		year = year - 3;
		let can = year % 10;
		let chi = year % 12;
		let lYear = canArray[can] + ' ' + chiArray[chi];
		return lYear;
	}

	public getMonths() {
		let months = [];
		for (let i = 1; i <= 12; i++)
			months.push((i < 10) ? '0' + i : '' + i);
		return months;
	}

	public getJobs() {
		let jobs = [
			'Chuyên gia',
			'Công chức',
			'Công nhân',
			'Học sinh',
			'Giáo chức',
			'Nội trợ',
			'Nông dân',
			'Quan triều',
			'Quân nhân',
			'Sinh viên',
			'Thương gia',
			'Tư chức'
		];
		return jobs;
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

	getShortDateID() {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
		let id = ''+day+''+month+(''+year).substring(2);
		return id;
	}

	getDateID() {
		const d = new Date();
		let day = ''+d.getDate();		if (day.length < 2) day = '0' + day;
		let month = ''+(d.getMonth()+1);		if (month.length < 2) month = '0' + month;
		let year = d.getFullYear();
		let hour = ''+d.getHours();		if (hour.length < 2) hour = '0' + hour;
		let min = ''+d.getMinutes();		if (min.length < 2) min = '0' + min;
		return ''+day+'-'+month+'-'+year+'-'+hour+'-'+min;
  }

	getDateTime(dateID: any) {
		// 03-08-2022-16-27
		let values = dateID.split('-');
		let month = +values[1] - 1;
		let d = new Date(values[2], month, values[0]);
		if (values.length > 3)
			d = new Date(values[2], month, values[0], values[3], values[4]);
		return d.getTime();
  }
	
	getCurrentTime() {
		return new Date().getTime();
	}

}
