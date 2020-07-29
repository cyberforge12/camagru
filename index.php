<?php
define('ROOT_PATH', __DIR__ . '/');
include_once (ROOT_PATH . 'config/setup.php');
include_once (ROOT_PATH . 'login.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="css/style.css">
	<title>Camagru</title>
</head>
<body>
<div class="test" id="test" onmouseover="test_over(this)"
	 onmouseleave="test_leave(this)
">TEST
	CLASS
	- ONCLICK</div>
<header class="header">
	<div id="header_text">CAMAGRU</div>
	<div class="logged user" onclick="open_profile()"></div>
	<div class="login user" onclick="login(this)"></div>
	<div class="logout user" onclick="logout()"></div>
</header>
<form id="login_form" method="post">
	Log in
	<hr>
	<input type="email" required autofocus name="email" placeholder="e-mail">
	<input type="password" required name="passw"
		   placeholder="password">
	<div id="login_buttons">
		<button type="submit" name="action" value="reg">Register</button>
		<button type="submit" name="action" value="login">Login</button>
	</div>
</form>
<section class="content">
<main class="main" id="main">
	<div id="pics">
		<img src="img/discount.png" onclick="add_img()" alt="discount">
		<img src="img/stars.png" onclick="add_img()" alt="stars">
		<img src="img/think.png" onclick="add_img()" alt="stars">
		<img src="img/frame.png" onclick="add_img()" alt="frame">
		<img src="img/none.png" onclick="clear_img()" alt="clear img">
	</div>
	<div id="videoContainer">
		<video id="cam" src="" autoplay></video>
	</div>
</main>
<section class="side">
	<canvas id="canvas"></canvas>
</section>

</section>
<footer class="footer">&copy;mmanhack @ school 21</footer>
</body>
<script type="text/javascript" src="js/script.js"></script>
</html>
