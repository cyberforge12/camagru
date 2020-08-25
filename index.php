<?php
require_once('constants.php');
include_once (ROOT_PATH . 'config/setup.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="css/style.css">
	<title>Camagru</title>
</head>
<body>
<!--<div class="test" id="test" onmouseover="test_over(this)"-->
<!--	 onmouseleave="test_leave(this)-->
<!--">TEST-->
<!--	CLASS-->
<!--	- ONCLICK --><?//=print_r($_COOKIE)?><!--</div>-->
<header class="header">
	<div id="header_text">CAMAGRU</div>
	<button class="user" id="login_button" onclick="login_form_toggle(this)"
			alt="Login"></button>
	<button class="user" id="profile_button" onclick="open_profile()"
			alt="Open profile"></button>
	<button class="user" id="logout_button" onclick="logout()" alt="Logout"></button>
</header>
<form id="login_form" action="">
	Log in
	<hr>
	<input id="login_username" type="text" required autofocus name="username"
		   placeholder="username">
	<input id="login_passw" type="password" required name="passw"
		   placeholder="password">
	<input id="login_email" type="email" required autofocus name="email"
		   placeholder="e-mail">
	<div id="login_buttons">
		<button type="button" onclick="register()" name="action"
				value="reg">Register</button>
		<button type="button" onclick="login()" name="action"
				value="login">Login</button>
	</div>
	<div id="login_message"></div>
</form>
<section class="profile" id="profile" hidden>
	Profile
	<hr id="hr">
	<div>
		<label for="profile_username">Login:</label>
		<section id="profile_username"></section>
	</div>
	<div>
		<label for="profile_email">E-mail:</label>
		<section id="profile_email"></section>
	</div>
	<div>
		<label for="profile_email_conf">E-mail confirmed?</label>
		<section id="profile_email_conf"></section>
	</div>
	<div>
		<label for="profile_notify">Notify on updates to your photos?</label>
		<input id="profile_notify" type="checkbox">
	</div>
	<button id="button_confirmation" onclick="resend_confirmation()">Resend
		confirmation e-mail</button>
</section>
<section class="content">
<main class="main" id="main">
	<div id="pics_header">Select an overlay image:</div>
	<div id="pics">
		<img id="discount"  src="img/discount.png" onclick="select_img(this)"
			 alt="discount">
		<img id="stars"  src="img/stars.png" onclick="select_img(this)"
			 alt="stars">
		<img id="think"  src="img/think.png" onclick="select_img(this)"
			 alt="stars">
		<img id="frame"  src="img/frame.png" onclick="select_img(this)"
			 alt="frame">
		<img id="none"  src="img/none.png" onclick="select_img(this)" alt="clear
		 img">
	</div>
	<div id="videoContainer" hidden>
		<video id="cam" src="" autoplay poster="img/none.png"></video>
	</div>
	<form id="upload" enctype="multipart/form-data" action="">
		<input type="hidden" name="cam" value="">
		<input type="hidden" id="img_name" name="img_name" value="">
		<input type="hidden" name="MAX_FILE_SIZE" value="3000000" />
		<label for="form_file">Cam is not available. Upload a photo: </label>
		<input id="form_file" name="form_file" placeholder="Choose
			photo to upload..." type="file">
	</form>
	<button id="snapshot" onclick="snapshot()"
			disabled title="Select as overlay image above">SEND</button>
</main>
<section class="side" id="side">
	<section id="gallery"></section>
</section>

</section>
<footer class="footer">&copy;Чистяков П. В., 2020</footer>
<script type="text/javascript" src="js/script.js"></script>
</body>
</html>
