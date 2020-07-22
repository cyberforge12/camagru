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

<main class="main">
Main
	<div>
		Video
		<video id="cam" src="" autoplay></video>
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
