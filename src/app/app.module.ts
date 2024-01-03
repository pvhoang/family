import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { CropperModalPageModule } from './editor/file/cropper-modal/cropper-modal.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent, 
        SplashScreenComponent
    ],
    imports: [
			BrowserModule,
			IonicModule.forRoot({
					sanitizerEnabled: true
			}),
			AppRoutingModule,
			HttpClientModule,
			CropperModalPageModule,

			TranslateModule.forRoot({
					loader: {
							provide: TranslateLoader,
							useFactory: (createTranslateLoader),
							deps: [HttpClient]
					}
			}),
			provideFirebaseApp(() => initializeApp(environment.firebase)),
			provideFirestore(() => getFirestore()),
			provideAuth(() => getAuth()),
			provideStorage(() => getStorage()),
			BrowserAnimationsModule,
    ],
    providers: [{
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        }],
    bootstrap: [AppComponent]
})
export class AppModule {}
