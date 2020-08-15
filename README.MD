# Camagru

A web application allowing you to make basic photo and video editing using your webcam and some predefined images. You can review all images posted by all users, comment and like them, and receive e-mail notifications (you need to set up your own SMTP server) on updates to your photos.

Full project description: https://github.com/cyberforge12/camagru/blob/dev/info/camagru.en.pdf

##### Stack
- PHP
- Javascript
- SQLite

##### Prerequisites
- PHP 7.4
- SQLite 3.33
- Web server (tested on Apache2)
- Tested browser - Mozilla Firefox

Installation:
1. Copy project folder to web server's Document Root
2. Check access rights (create, modify) on project's folder
3. Local database is setup automatically on first load (folder 'db/')

##### Functionality

###### adding image
1. Open index.php
2. Allow web cam access (alternatively you will be able to load an image)
3. Press login icon and regester a new user
4. Mouse select an overlay image
5. If webcam is not available select your image for upload
6. Click Send button
7. You image with an overlay should appear in the gallery on the right side

###### Gallery: likes, comments, delete
1. press thumb up button to add a like, press once again to remove
2. press comments button to open image comments
3. press Add comment button to write a comment
4. A user may delete images, uploaded by him (an trash bin icon will apear under eligible images)

###### User management
1. User may create and account to allow posting comments and likes under images
2. User will get a confirmation email with a unique confirmation link (SMTP server is not set-up, only local mail was tested with php_mail())
3. User may subscribe to email notifications on new comments under his images
4. User sessions are stored in the database and checked on site load



##### Workflow
All data is stored in a local SQLite database.

Data flow between web server and a client is done via AJAX POST JSON requests/responses.

###### Image overlay
1. A client sends an overlay image and a webcam snapshor or an uploaded image
2. Web server blends two images and saves merged image in the database
3. The client reloads the gallery on send. The most recent processed images are shown on top.

###### Login/registration
1. The client sends an email and password
2. Web server checks login and password to the database record (password is hashed with 'whirlpool')
