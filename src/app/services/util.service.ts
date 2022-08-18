import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { DEBUG } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
		private http: HttpClient,
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
	
	console_log(msg: string, obj?: any) {
		if (!DEBUG)
			return;
		if (obj)
			console.log(msg, obj);
		else
			console.log(msg);
			// msg += ' ' + JSON.stringify(obj, null, 4);
	}

	async alertMsg(title, message, css?) {
		if (!css)
			css = 'alert-small';
		// let css = 'myClass';
		let alert = await this.alertController.create({
			header: title,
			message: message,
			cssClass: css,
			buttons: ['OK']
		});
		alert.present();
	}

	async alertConfirm(header, message, cancelText, okText, css?) {
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

	async alertAddNode(header, message, texts, css?) {
		if (!css) 
			css = 'alert-small';
		let alert = await this.alertController.create({
      header: header,
			message: message,
			cssClass: css,
			inputs: [
        {
          name: 'name',
          placeholder: texts[0],
        },
				{
          name: 'relation',
          placeholder: texts[1],
        },
				{
          name: 'gender',
          placeholder: texts[2],
        },
      ],
      buttons: [
        {
          text: texts[3],
          handler: (data: any) => {
						alert.dismiss(false);
						return false;
          }
        },
        {
          text: texts[4],
          handler: (data: any) => {
						let name = data.name;
						let relation: string = data.relation.toLowerCase();
						let gender: string = data.gender.toLowerCase();

						// validate data
						console.log('data: ', data);

						let msg = '';
						if (name.length < 5)
							msg += 'Tên không hợp lệ. <br>';
						let type = 0;
						if (relation.indexOf('ch') == 0)
							type = 2;
						else if (relation.indexOf('v') == 0)
							type = 3;
						else if (relation.indexOf('c') == 0)
							type = 1;
						if (type == 0)
							msg += 'Liên hệ không hợp lệ. <br>';
						
						let gen = 0;
						if (gender.indexOf('nu') == 0)
							gen = 2;
						else if (gender.indexOf('n') == 0)
							gen = 1;
						if (gen == 0)
							msg += 'Giới tính không hợp lệ. <br>';

						if (msg != '') {
							this.presentToast(msg);
							return false;
						}
						data.relation = ''+type;
						data.gender = ''+gen;

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

	async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'primary',
      position: 'middle',
      duration: 2000
    });
    toast.present();
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
