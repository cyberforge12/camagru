<?php
// protection against session fixation
$cookie_name = "user";
if(!isset($_COOKIE[$cookie_name]))
	setcookie($cookie_name, null, time() + (86400 * 30), "/");
session_start();
define('DB_NAME', 'camagru.sqlite');
$recreate = false;
//print_r($_SERVER);
//print_r($_SESSION);
//if (isset($_GET['LOGOUT']) ||
//    $_SERVER['REMOTE_ADDR'] !== $_SESSION['PREV_REMOTEADDR'] ||
//    $_SERVER['HTTP_USER_AGENT'] !== $_SESSION['PREV_USERAGENT'])
//    session_destroy();
//session_regenerate_id(); // Generate a new session identifier
//$_SESSION['PREV_USERAGENT'] = $_SERVER['HTTP_USER_AGENT'];
//$_SESSION['PREV_REMOTEADDR'] = $_SERVER['REMOTE_ADDR'];
// end of protection


if (file_exists(ROOT_PATH . 'db/' . DB_NAME))
{
    if ($recreate == true)
    {
        unlink(ROOT_PATH . 'db/' . DB_NAME);
        include (ROOT_PATH . 'config/database.php');
    }
}
else
    include_once (ROOT_PATH . 'config/database.php');

