<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="css/style.css">
	<title>Camagru - password reset</title>
</head>
<body>
<form action="reset.php" method="post">
    Password reset
<hr>
	<div>Enter new password:</div>
	<input type="password" required name="passw"
	minlength="3" placeholder="Password (min 3 characters)">
	<input type="text" required hidden name="hash" value="<?=$hash?>">
	<input type="submit" name="reset_password" placeholder="Reset
	password">
</form>
<script type="text/javascript" src="js/script.js"></script>
</body>
</html>
