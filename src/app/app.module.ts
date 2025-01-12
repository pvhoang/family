import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { PopoverComponent } from './components/popover/popover.component';
import { SelectComponent } from './components/select/select.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VgCoreModule, } from '@videogular/ngx-videogular/core';

import { MarkdownModule } from 'ngx-markdown';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent, 
        SplashScreenComponent,
				PopoverComponent,
    SelectComponent
    ],
		schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
			BrowserModule,
			IonicModule.forRoot({
					sanitizerEnabled: true
			}),
			AppRoutingModule,
			HttpClientModule,
			TranslateModule.forRoot({
					loader: {
							provide: TranslateLoader,
							useFactory: (createTranslateLoader),
							deps: [HttpClient]
					}
			}),
			provideFirebaseApp(() => initializeApp(environment.firebase)),
			provideAuth(() => {
				const auth = getAuth();
				if (environment.useEmulators)
					connectAuthEmulator(auth, 'http://localhost:9099', {
						disableWarnings: true,
					});
				return auth;
			}),
			provideFirestore(() => {
				const firestore = getFirestore()
				if (environment.useEmulators) {
					connectFirestoreEmulator(firestore, 'localhost', 8080);
				}
				return firestore;
			}),
			provideStorage(() => {
				const storage = getStorage();
				if (environment.useEmulators)
					connectStorageEmulator(storage, 'localhost', 9199);
				return storage;
			}),
			BrowserAnimationsModule,
			VgCoreModule,
			MarkdownModule.forRoot(),
    ],
    providers: [{
			provide: RouteReuseStrategy,
			useClass: IonicRouteStrategy,
		}],
    bootstrap: [AppComponent]
})
export class AppModule {}
