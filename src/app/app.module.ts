import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import {AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';

// import { BookComponent } from './components/book/book.component';
// import { MemoryPageModule } from './memory/memory.module';
// import { NodePageModule } from './node/node.module';
// import { FilePageModule } from './file/file.module';
// import { MemoryPage } from './memory/memory.page';
// import { NodePage } from './node/node.page';
// import { FilePage } from './file/file.page';

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
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        // RouterModule.forRoot([
        //     { path: 'memory', component: MemoryPage },
        //     { path: 'node', component: NodePage },
        //     { path: 'file', component: FilePage }
        // ]),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        provideStorage(() => getStorage()),
        BrowserAnimationsModule,
        // MemoryPageModule,
        // NodePageModule,
        // FilePageModule,
        
    ],
    providers: [{
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        }],
    bootstrap: [AppComponent]
})
export class AppModule {}
