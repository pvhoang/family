=====================================================================
# USAGE
=====================================================================

https://giapha.web.app

// superadmin
const URL_DELETE_OPEN = '/sopen';   // delete current ancestor and open an existing one
const URL_DELETE_NEW = '/snew';     // delete current ancestor and create a new one

// admin
const URL_UPDATE_VERSION = '/aupd'; // update current version
const URL_EDIT = 'aedit';           // edit ancestor content

// user
const URL_ANCESTOR = '/phan'        // sign up ancestor after superadmin's approval
const URL_USAGE = '/'               // use the system after ancestor is signed up
const URL_THEME = '/utheme'         // change interface theme
const URL_LANGUAGE = '/ulang'       // change interface language
const URL_DELETE = '/udel';         // delete local memory


=====================================================================
# TOOLS, PLUGINS
=====================================================================

=======================
# Angular - Dynamic styling
=======================
ngStyle()
https://ultimatecourses.com/blog/using-ngstyle-in-angular-for-dynamic-styling

=======================
# Zooming in and out
=======================
https://github.com/aaronczichon/aaronczichon.de/tree/master/CSS_Zooming
https://aaronczichon.de/blog/zoom-dom-elements-with-css/
https://github.com/GoogleChromeLabs/pinch-zoom#readme

=======================
# Tooltip for button
=======================
https://stackoverflow.com/questions/66484943/how-to-change-title-of-an-ion-icon
https://blog.logrocket.com/creating-beautiful-tooltips-with-only-css/

=======================
# ModalController, AlertController, ToastController
=======================
// https://remotestack.io/ionic-modal-popup-tutorial/
// https://ionicframework.com/docs/api/alert
// https://www.freakyjolly.com/ionic-alert-this-alertcontroller-create/
// https://ionicframework.com/docs/api/toast

=======================
# popover with PopoverComponent
=======================

// https://edupala.com/ionic-popover-example/
// https://ionicframework.com/docs/api/popover

=======================
# ng-select with typeahead
=======================
@ng-select/ng-select
// https://www.freakyjolly.com/ng-select-typeahead-with-debouncetime-fetch-server-response
// https://www.omdbapi.com
// https://github.com/ng-select/ng-select

https://github.com/ng-select/ng-select#change-detection

=======================
# Scrolling into view
=======================
https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
// https://stackoverflow.com/questions/46658522/how-to-smooth-scroll-to-page-anchor-in-angular-4-without-plugins-properly/51400379#51400379
element.scrollIntoView

=======================
# Family Tree
=======================
// https://github.com/fmq/ng-family-tree
// https://jwcooney.com/2016/08/21/example-pure-css-family-tree-markup/
// https://www.angularfix.com/2022/04/how-to-extend-css-family-tree.html

=======================
# Gia Pha reference
=======================
https://giaphadongtoc.com/noi-dung-trong-cuon-gia-pha-mau/
https://giaphadaiviet.com/chi-nhanh-phai-canh-trong-gia-pha/
http://www.giaphavietnam.vn/default.aspx?lang=vi-VN&cp=news-detail&cid=38
http://www.giaphavietnam.vn/default.aspx?cp=phado&id=307
https://holaivietnam.com/index.php/tai-lieu-dong-ho/gia-pha-la-gi-noi-dung-cau-truc-va-cach-trinh-bay-gia-pha-29.html

=======================
# Resizing, set coordinates on images
=======================
https://www.iloveimg.com/resize-image
Standard: 1200x(800-900)px
Paint App

=======================
# Display branch on images
=======================
https://www.npmjs.com/package/html-to-image

=======================
# Shade image as background
=======================
https://coder-coder.com/background-image-opacity/
https://onlinepngtools.com/change-png-opacity
20%

=======================
# Download a text file
=======================
https://gist.github.com/danallison/3ec9d5314788b337b682

=======================
# Upload a text file
=======================
https://stackoverflow.com/questions/40843218/upload-a-file-and-read-data-with-filereader-in-angular-2

=======================
# Convert to Lunar date
=======================
https://www.npmjs.com/package/date-chinese

=======================
# Build an Ionic table
=======================
https://edupala.com/ionic-table/

=======================
# Double click an element
=======================
https://stackoverflow.com/questions/48295288/how-to-handle-single-click-and-double-click-on-the-same-html-dom-element-usi

=======================
# HTML to PDF and Image
=======================
https://dev.to/_mnavarros/how-to-convert-html-to-pdf-using-angular-3jj8
https://stackoverflow.com/questions/59885556/how-to-add-and-set-a-font-in-jspdf

http://raw.githack.com/MrRio/jsPDF/master/docs/index.html
https://raw.githack.com/MrRio/jsPDF/master/index.html

https://www.npmjs.com/package/html-to-image

https://github.com/tsayen/dom-to-image

https://stackoverflow.com/questions/64268184/convert-image-url-to-base-64-string
https://stackoverflow.com/questions/29578721/image-in-pdf-cut-off-how-to-make-a-canvas-fit-entirely-in-a-pdf-page

=======================
# FONT for jsPdf and font-face
=======================

https://fonts.google.com/?subset=vietnamese&noto.script=Latn
. select Pacifico
. download to Pacifico.zip -> c:/dev/family/src/assets/ttf/Pacifico-Regular.ttf
. run https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
. convert 'Pacifico-Regular.ttf' to c:/dev/family/src/assets/js/Pacifico-Regular-normal.js

import '../../../assets/js/Pacifico-Regular-normal.js';
...
doc.setFont('Pacifico-Regular'); // set custom font

@font-face {
  font-family: 'Pacifico';
  font-style: italic;
  font-weight: bold;
  src: url('./assets/ttf/Pacifico-Regular.ttf');
}
--ion-font-family: 'Pacifico'



=======================
# DOC to HTM
=======================
. open '.doc' in MS WORD
. 'Save As' -> 'Web Page (*.htm, *.html)

https://wordtohtml.net/
. open '.doc' in MS WORD
. Ctrl-A for all text
. Ctrl-V (left) -> Copy to clipboard (right)
. open an empty HTML (test.html) -> Ctrl-V

=======================
# Create archive.json
=======================

. cd/dev/face-api.js/examples/examples-browser
. npm start
. Listening on port 3000!
. http://localhost:3000/face_detection
. [Choose file]
. Ctrl-Shift-J
. select: json in [Console]
. add name to areas->text->header (get person from areas->score on image)

. edit script from /dev/face-api.js/examples/examples-browser/views/faceDetection.html

=======================
# DIFF 2 family files
=======================
https://github.com/kpdecker/jsdiff/tree/master/src/diff

=======================
# Popular Vietnames Ho Ten 
=======================
https://hoten.org/100-ho-pho-bien-nhat/

=======================
# Material Designs Font
=======================
. https://materialdesignicons.com/
. search 'tree'
. click on 'family-tree'
. click on 'Icon Package' -> 'SVG .optimized'
. copy family-tree.svg ('Downloads' folder) -> src/assets/fonts

. https://github.com/ionic-team/ionicons

<ion-icon src="../../assets/fonts/family-tree.svg" size="small" ></ion-icon>
ion-icon {
  font-size: 64px;
  color: blue;
}

=======================
# Routing to tabs
=======================

https://stackoverflow.com/questions/57921846/how-to-implement-routed-tabs-with-angular-material-within-a-child-route

=======================
# Spash screen - svg color screen - get current url in app.component.ts
=======================
https://itnext.io/simple-splash-screen-for-your-angular-web-apps-and-pwas-f4fbf897540b
https://stackoverflow.com/questions/22252472/how-to-change-the-color-of-an-svg-element
https://stackoverflow.com/questions/44621887/angular-how-to-get-current-url-in-app-component

=======================
# Firestore
=======================

https://stackoverflow.com/questions/69286935/how-to-get-a-subcollection-inside-a-collection-in-firestore-web-version-9-modul

=======================
# CORS
=======================

https://www.techiediaries.com/enable-cors-angular-14/
https://www.stackhawk.com/blog/angular-cors-guide-examples-and-how-to-enable-it/


=======================
# FIRESTORAGE CORS
=======================
https://firebase.google.com/docs/storage/web/download-files
https://cloud.google.com/storage/docs/gsutil_install
https://cloud.google.com/sdk/auth_success

gcloud init --skip-diagnostics

You are logged in as: [pvhoang940@gmail.com].

Pick cloud project to use:
 [3] family-c5b45

C:\Users\Hoang\AppData\Local\Google\Cloud SDK>gsutil cors set c:/dev/family/cors.json gs://family-c5b45.appspot.com
Setting CORS on gs://family-c5b45.appspot.com/...

C:\Users\Hoang\AppData\Local\Google\Cloud SDK>


=====================================================================
# FIREBASE
=====================================================================
=======================
# Creating
=======================
# Create account
. start https://console.firebase.google.com

# Add new project 'family'
# Add new web app 'family'
	Create Firestore database in 'test mode'

=======================
# Processing
=======================
. cd/dev/family
. firebase login
. firebase use --add

. firebase init
	. select: project 'family', Firestore, Functions, Storage, Hosting, Emulators
	. select emulators: Firestore, Functions, Storage

  === Functions Setup
  ? What language would you like to use to write Cloud Functions? TypeScript
  ? Do you want to use ESLint to catch probable bugs and enforce style? No
  ? Do you want to install dependencies with npm now? No
  === Hosting Setup
  ? What do you want to use as your public directory? www
  ? Configure as a single-page app (rewrite all urls to /index.html)? Yes
  ? Set up automatic builds and deploys with GitHub? No
  ? File www/index.html already exists. Overwrite? Yes
  === Emulators Setup
  ? Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. Functions Emulator, Firestore Emulator, Hosting Emulator, Storage Emulator
  i  Port for functions already configured: 5001
  i  Port for firestore already configured: 8080
  i  Port for hosting already configured: 5000
  i  Port for storage already configured: 9199
  i  Emulator UI already enabled with port: (automatic)
  ? Would you like to download the emulators now? Yes

  Writing configuration info to firebase.json...
  Writing project information to .firebaserc...

. cd /dev/family/functions
	. npm install
	. npm run build

. cd/dev/family
  . firebase emulators:start
  . firebase emulators:start --only functions,firestore,hosting,storage
  . firebase emulators:start --only functions,firestore,hosting,storage --import test-data
  . firebase emulators:export test-data

=======================
# Integrating
=======================
. ng add @angular/fire

=======================
# Hosting
=======================
. firebase init
    Are you ready to proceed? Yes
    Which Firebase features do you want to set up for THIS DIRECTORY?
#   (*) Hosting: Configure and deploy Firebase Hosting sites
    ? What do you want to use as your public directory? www
    ? Configure as a single-page app (rewrite all urls to /index.html)? y
		? Set up automatic builds and deploys with GitHub? No

Project Console: https://console.firebase.google.com/project/family-e5c1c/overview
Hosting URL: https://family-e5c1c.web.app

. ionic build --prod

. firebase hosting:sites:delete gphphan
. firebase hosting:sites:create giapha
. firebase target:apply hosting giapha giapha
. firebase deploy --only hosting:giapha

=======================
# Extensions: Trigger Email - firestore-send-email
=======================

SMTP connection URI: smtps://test@ezactive.com@mail.ezactive.com:465
SMTP password: ,wHD[XW;+Oml
Collection: content
FROM address: pvhoang940@gmail.com

https://firebase.google.com/docs/extensions/official/firestore-send-email
https://nodemailer.com/message/attachments/
https://betterprogramming.pub/how-to-send-emails-from-firebase-with-the-trigger-email-extension-27c593ca1157


=====================================================================
# GITHUB
=====================================================================

. open GitHub.com
. create an empty res: 'pvhoang/family'
. rename c:\dev\family to c:\dev\family-1
. create a local folder: c:\dev\family
. cd /dev/family
. copy README.md from another project.
    echo "# family" >> README.md
    git init
    git add README.md
    git commit -m "first commit"
    git branch -M main
    git remote add origin https://github.com/pvhoang/family.git
    git push -u origin main

. open SourceTree
. copy files from /family-1 to /family

=====================================================================
# Visual Studio
=====================================================================

https://bobbyhadz.com/blog/vscode-change-indentation