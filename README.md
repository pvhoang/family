=====================================================================
# TOOLS, PLUGINS
=====================================================================

=======================
# Angular
=======================
ngStyle()
https://ultimatecourses.com/blog/using-ngstyle-in-angular-for-dynamic-styling

=======================
# Zooming in and out
=======================
https://github.com/aaronczichon/aaronczichon.de/tree/master/CSS_Zooming
https://aaronczichon.de/blog/zoom-dom-elements-with-css/

=======================
# ModalController, AlertController, ToastController
=======================
// https://remotestack.io/ionic-modal-popup-tutorial/
// https://ionicframework.com/docs/api/alert
// https://www.freakyjolly.com/ionic-alert-this-alertcontroller-create/
// https://ionicframework.com/docs/api/toast

=======================
# ng-select with typeahead
=======================
@ng-select/ng-select
// https://www.freakyjolly.com/ng-select-typeahead-with-debouncetime-fetch-server-response
// https://www.omdbapi.com

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
# Download a text file
=======================
https://gist.github.com/danallison/3ec9d5314788b337b682

=======================
# Upload a text file
=======================
https://stackoverflow.com/questions/40843218/upload-a-file-and-read-data-with-filereader-in-angular-2


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
. firebase hosting:sites:delete gia-pha-ho-phan
. firebase hosting:sites:create gia-pha-ho-phan
. firebase target:apply hosting gia-pha-ho-phan gia-pha-ho-phan
. firebase deploy --only hosting:gia-pha-ho-phan
. firebase deploy --only functions

=======================
# Extensions: Trigger Email - firestore-send-email
=======================

SMTP connection URI: smtps://test@ezactive.com@mail.ezactive.com:465
SMTP password: ,wHD[XW;+Oml
Collection: content
FROM address: pvhoang940@gmail.com

https://betterprogramming.pub/how-to-send-emails-from-firebase-with-the-trigger-email-extension-27c593ca1157


=====================================================================
# GITHUB
=====================================================================

. open GitHub.com
. create an empty res: 'pvhoang/family'
. rename /family to /family-1
. create an empty res: 'pvhoang/family'
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
