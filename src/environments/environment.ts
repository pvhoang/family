// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    projectId: 'family-c5b45',
    appId: '1:123668295235:web:669b452792b87cff2caef6',
    storageBucket: 'family-c5b45.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyD2P1usKTKWDTnT6qAn9aOuIsTqxDIhQvU',
    authDomain: 'family-c5b45.firebaseapp.com',
    messagingSenderId: '123668295235',
  },
  production: false,
  phabletDevice: true,
};

export const VERSION = '0.0.6';
export const FONTS_FOLDER = '../../assets/fonts/';

export const DEBUG = false;
export const DEBUG_TABS = false;
export const DEBUG_HOME = false;
export const DEBUG_HILITE = true;
export const DEBUG_TREE = false;
export const DEBUG_NODE = false;
export const DEBUG_ARCHIVE = false;
export const DEBUG_CONTACT = false;
export const DEBUG_EDITOR = false;
export const DEBUG_FILE = false;

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
