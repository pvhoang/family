importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
	projectId: 'family-c5b45',
	appId: '1:123668295235:web:669b452792b87cff2caef6',
	storageBucket: 'family-c5b45.appspot.com',
	locationId: 'us-central',
	apiKey: 'AIzaSyD2P1usKTKWDTnT6qAn9aOuIsTqxDIhQvU',
	authDomain: 'family-c5b45.firebaseapp.com',
	messagingSenderId: '123668295235',
	vapidKey: "BJ1f8BpQHuErNMLDiD0XRek_WDCTjPuWkftiuWu8twOMCOHwvyZt1L0eaWbrocYGnTh5r7-bkP2BFHs2k06mLNE"
});

const messaging = firebase.messaging();

