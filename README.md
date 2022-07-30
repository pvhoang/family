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
// https://stackoverflow.com/questions/46658522/how-to-smooth-scroll-to-page-anchor-in-angular-4-without-plugins-properly/51400379#51400379
element.scrollIntoView
// https://github.com/Seemspyo/ngx-smooth-scroll
// @eunsatio/ngx-smooth-scroll

=======================
# Family Tree
=======================
// https://github.com/fmq/ng-family-tree
// https://jwcooney.com/2016/08/21/example-pure-css-family-tree-markup/
// https://www.angularfix.com/2022/04/how-to-extend-css-family-tree.html

=======================
# Dividing, hovering, resizing, sliding images
=======================
https://www.geeksforgeeks.org/how-to-divide-an-image-into-different-clickable-link-area-using-html/
https://www.w3schools.com/tags/tag_area.asp
https://www.angularfix.com/2022/02/is-it-possible-to-style-mouseover-on.html
https://ionicframework.com/docs/api/slides
https://www.iloveimg.com/resize-image
Standard: 1200x(800-900)px

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
	. select: project 'family', Firestore, Storage, Hosting
	. select emulators: Firestore, Storage

. cd /dev/family/functions
	. npm run build

. cd/dev/family
  . firebase emulators:start --only firestore,storage --import test-data
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
