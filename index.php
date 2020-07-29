<?php
define('ROOT_PATH', __DIR__ . '/');
include_once (ROOT_PATH.'config/setup.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="css/style.css">
	<title>Title</title>
</head>
<body>
<header onclick="change_style()" class="header">
	<div>Login</div>
	<div>Log In...</div>
	<div>Log Out...</div>
</header>
<section class="content">
<main class="main" id="main">
	<div id="pics">
		<img src="img/discount.png" onclick="add_img()" alt="discount">
		<img src="img/stars.png" onclick="add_img()" alt="stars">
		<img src="img/think.png" onclick="add_img()" alt="stars">
		<img src="img/frame.png" onclick="add_img()" alt="frame">
		<img src="img/none.png" onclick="clear_img()" alt="clear img">
	</div>

</main>
<section class="side">
    Side
</section>

</section>
<footer class="footer">
	<div>&copy;mmanhack @ school 21</div>
</footer>
</body>
<script type="text/javascript" src="js/script.js"></script>
</html>
