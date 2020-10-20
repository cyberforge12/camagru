<?php
require_once('constants.php');
require_once('config/setup.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="css/style.css">
	<title>Camagru</title>
</head>
<body>
<header class="header">
	<div id="header_text">CAMAGRU</div>
	<button class="user" id="login_button" onclick="login_form_toggle(this)"
			alt="Login"></button>
	<button class="user" id="profile_button" onclick="profile.open_profile()"
			alt="Open profile"></button>
	<button class="user" id="logout_button" onclick="logout()"
			alt="Logout"></button>
</header>
<form id="login_form" action="">
	Log in
	<hr>
	<input id="login_username" type="text" required autofocus name="username"
		   placeholder="username">
	<input id="login_passw" type="password" required name="passw" minlength="3"
		   placeholder="Password (min 3 characters)">
	<input id="login_email" type="email" required autofocus name="email"
		   placeholder="e-mail">
	<div id="login_buttons">
		<button type="button" onclick="profile.register()" name="action"
				value="reg">Register
		<button type="button" onclick="profile.login()" name="action"
				value="login">Login
		</button>
		<button type="button" id="reset_button" onclick="profile
		.reset_password()"
				name="reset_password"
			value="">Reset password</button>
		</button>
	</div>
	<div id="login_message"></div>
</form>
<section class="profile" id="profile" hidden>
	Profile
	<hr id="hr">
	<div>
		<label for="profile_username">Login:</label>
		<span id="profile_username"></span>
		<button id="edit_login_button" onclick="profile.show_new_login()">Edit</button>
	</div>
	<div id="new_login_form">
		<input id="new_login_input" placeholder="Enter new login">
		<button id="send_new_login" onclick="profile.change_login()
">Send</button>
	</div>
	<div>
		<label for="profile_email">E-mail:</label>
		<span id="profile_email"></span>
		<button id="edit_email_button" onclick="profile.show_new_email()
">Edit</button>
	</div>
	<div id="new_email_form">
		<input id="new_email_input" type="email" placeholder="Enter new email">
		<button id="send_new_email" onclick="profile.change_email()
">Send</button>
	</div>
	<div>
		<label for="profile_email_conf">E-mail confirmed?</label>
		<span id="profile_email_conf"></span>
	</div>
	<div>
		<label for="profile_notify">Notify on updates to your photos?</label>
		<input id="profile_notify" type="checkbox"
			   onchange="profile.toggle_notify()">
	</div>
	<div id="new_passw_form">
		<input id="new_passw_input" type="password" placeholder="Enter new
		password">
		<button id="send_new_passw" onclick="profile.change_passw()
">Send</button>
	</div>
	<button id="change_passw" onclick="profile.show_new_passw()">Change password</button>
	<button id="button_confirmation" onclick="resend_confirmation()
">Resend
		confirmation e-mail
	</button>
	<div id="profile_message"></div>
</section>
<section class="content">
		<section id="main_not_logged">
			<div>Please, log in</div>
		</section>
	<main class="main" id="main">
			<div id="pics_header">Select an overlay image:</div>
			<div id="pics">
				<img id="discount" src="img/discount.png"
					 onclick="select_img(this)"
					 alt="discount">
				<img id="stars" src="img/stars.png" onclick="select_img(this)"
					 alt="stars">
				<img id="think" src="img/think.png" onclick="select_img(this)"
					 alt="stars">
				<img id="frame" src="img/frame.png" onclick="select_img(this)"
					 alt="frame">
				<img id="none" src="img/none.png" onclick="select_img(this)"
					 alt="clear
		 img">
			</div>
		<div id="videoContainer" hidden>
			<video id="cam" src="" autoplay poster="img/none.png"></video>
		</div>
		<form id="upload" enctype="multipart/form-data" action="">
			<input type="hidden" name="cam" value="">
			<input type="hidden" id="img_name" name="img_name" value="">
			<input type="hidden" name="MAX_FILE_SIZE" value="3000000"/>
			<label for="form_file">Cam is not available. Upload a
				photo: </label>
			<input id="form_file" name="form_file" placeholder="Choose
			photo to upload..." type="file" accept="image/*"/>
		</form>
		<button class="text_button" id="snapshot" onclick="snapshot()"
				disabled title="Select as overlay image above">SEND
		</button>
	</main>
	<section class="side" id="side">
	</section>

</section>
<footer class="footer">&copy;Чистяков П. В., &copy;mmanhack, 2020</footer>
<script type="text/javascript" src="js/script.js"></script>
</body>
</html>
