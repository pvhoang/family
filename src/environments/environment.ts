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
		vapidKey: "BJ1f8BpQHuErNMLDiD0XRek_WDCTjPuWkftiuWu8twOMCOHwvyZt1L0eaWbrocYGnTh5r7-bkP2BFHs2k06mLNE"
  },
<<<<<<< Updated upstream
=======
	useEmulators: true,
	// useEmulators: false,
>>>>>>> Stashed changes
  production: false,
  phabletDevice: true,
};

<<<<<<< Updated upstream
export const VERSION = '0.0.6';
export const FONTS_FOLDER = '../../assets/fonts/';

export const DEBUG = false;
export const DEBUG_TABS = false;
export const DEBUG_SPLASH = false;
export const DEBUG_HOME = false;
export const DEBUG_HILITE = false;
export const DEBUG_TREE = true;
export const DEBUG_NODE = false;
export const DEBUG_ARCHIVE = false;
export const DEBUG_CONTACT = false;
export const DEBUG_EDITOR = false;
export const DEBUG_FILE = false;
export const DEBUG_FAMILY_SERVICE = true;
=======
export const ROOT_COLLECTION = 'giapha';
export const FONTS_FOLDER = '../../assets/fonts/';

export const DEBUGS = {
  'APP': true,
  'SPLASH': false,
  'THEME': false,
  'TABS': false,
  'MEMORY': false,
  'PERSON': true,
  'HOME': false,
  'EDITOR': true,
  'VNODE': false,
  'NODE': true,
  'BRANCH': false,
  'DOCS': false,
  'TREE': false,
  'EDIT': true,
  'SEARCH': true,
  'CROPPER': false,
  'FIREBASE': false,
  'FILE': true,
  'FAMILY_SERVICE': false,
  'SVG_TREE_SERVICE': false,
  'UTIL_SERVICE': false,
  'DATA_SERVICE': false,
  'FCM_SERVICE': true,

};

export const DRAGON = 'dragon';
export const VILLAGE = 'village';
export const TREE = 'tree';
export const COUNTRY = 'country';
export const SMALL_SIZE = 'small';
export const MEDIUM_SIZE = 'medium';
export const LARGE_SIZE = 'large';

// https://usefulwebtool.com/characters-vietnamese
export const VietnameseEntities = {
	'&Agrave;': 'À',
	'&Aacute;': 'Á',
	'&Acirc;': 'Â',
	'&Atilde;': 'Ã',
	'&Egrave;': 'È',
	'&Eacute;': 'É',
	'&Ecirc;': 'Ê',
	'&Igrave;': 'Ì',
	'&Iacute;': 'Í',
	'&Ograve;': 'Ò',
	'&Oacute;': 'Ó',
	'&Ocirc;': 'Ô',
	'&Otilde;': 'Õ',
	'&Ugrave;': 'Ù',
	'&Uacute;': 'Ú',
	'&Yacute;': 'Ý',
	'&agrave;': 'à',
	'&aacute;': 'á',
	'&acirc;': 'â',
	'&atilde;': 'ã',
	'&egrave;': 'è',
	'&eacute;': 'é',
	'&ecirc;': 'ê',
	'&igrave;': 'ì',
	'&iacute;': 'í',
	'&ograve;': 'ò',
	'&oacute;': 'ó',
	'&ocirc;': 'ô',
	'&otilde;': 'õ',
	'&ugrave;': 'ù',
	'&uacute;': 'ú'
};





>>>>>>> Stashed changes

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
