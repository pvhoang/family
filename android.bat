
echo off
echo ---
rem --- chrome://inspect/#devices
echo ---
rem --- https://www.geeksforgeeks.org/how-to-programmatically-hide-android-soft-keyboard/
rem --- android-src/MainActivity.java, activity_main.xml
rem --- https://stackoverflow.com/questions/1109022/how-do-you-close-hide-the-android-soft-keyboard-programmatically
rem --- android:windowSoftInputMode="stateAlwaysHidden"
rem --- https://developer.android.com/training/keyboard-input/visibility
rem --- 
rem ionic cordova run android --device --prod
ionic capacitor build android --prod
pause
rem --- ANDROID STUDIO - Build - Build bundle (APK) - Build APK
rem --- copy C:\edu\mobile\school\android\app\build\outputs\apk\debug\app-debug.apk "C:\Users\Hoang\Google Drive\school.apk"

----------------------------------------------------------
--- Build Android for FirebaseX - Course: Adv-2 school ---

@REM --- https://ionicframework.com/docs/native/firebase-x

npm install cordova-plugin-firebasex 
npm install @awesome-cordova-plugins/firebase-x

Change files:
			src/app/app.module.ts
			src/app/app.component.ts
			src/app/services/fcm.service.ts

ionic build --prod

ionic cap add android
// Sync the build folder to native project
npx cap sync

Change files:

node_modules/cordova-plugin-firebasex/src/android/build.gradle
				....
        // jcenter()
				....
        // classpath 'com.google.firebase:firebase-crashlytics-gradle:2.7.1'
				....
				// apply plugin: com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsPlugin
				// android {
				//     buildTypes {
				//         debug {
				//             firebaseCrashlytics {
				//                 mappingFileUploadEnabled false
				//             }
				//         }
				//         release {
				//             firebaseCrashlytics {
				//                 nativeSymbolUploadEnabled true
				//                 unstrippedNativeLibsDir "obj/local"
				//                 strippedNativeLibsDir "build/intermediates/jniLibs/release"
				//             }
				//         }
				//     }
				// }

android/app/src/main/AndroidManifest.xml
			....
			<manifest xmlns:android="http://schemas.android.com/apk/res/android"
					package="io.ionic.school">
			<application
			....

copy google-service.json android/app/google-service.json
android/app/google-service.json
			....
			"client_info": {
        "mobilesdk_app_id": "1:255677934443:android:989e04a89a97a74b693a2e",
        "android_client_info": {
          "package_name": "io.ionic.school"
        }
      },
			....

android/app/src/main/res/values/colors.xml
			<?xml version="1.0" encoding="utf-8"?>
			<resources>
					<color name="background_color">#009688</color>
					<color name="white">#FFFFFF</color>
					<color name="black">#000000</color>
					<color name="primary">#3880ff</color>
					<color name="white_greyish">#EEEEEE</color>
					<color name="button_selectorcolor">#9E9E9E</color>
					<color name="colorAccent">#9E9E9E</color>
			</resources>

android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
			....
			<manifest package="capacitor.android.plugins"
			xmlns:tools="http://schemas.android.com/tools"
			....
			<!-- <meta-data android:name="com.google.firebase.messaging.default_notification_color"
				android:resource="@color/accent"/> -->
			<meta-data
				android:name="com.google.firebase.messaging.default_notification_color"
				android:resource="@color/primary"
				tools:replace="android:resource"
			/>
			....

// Build app (.npk) in Android Studio
$ npx cap open android

copy C:\edu\mobile\school\android\app\build\outputs\apk\debug\app-debug.apk "C:\Users\Hoang\Google Drive\school.apk"
-----------------------------------
