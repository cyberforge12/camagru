<?php
require_once('SessionHandlerSQL.class.php');
require_once('config/database.php');
$session_handler = new SessionHandlerSQL($dbh);
session_set_save_handler($session_handler);
session_start();
// protection against session fixation
//if (isset($_GET['LOGOUT']) ||
//    $_SERVER['REMOTE_ADDR'] !== $_SESSION['PREV_REMOTEADDR'] ||
//    $_SERVER['HTTP_USER_AGENT'] !== $_SESSION['PREV_USERAGENT'])
//    session_destroy();
//session_regenerate_id(); // Generate a new session identifier
//$_SESSION['PREV_USERAGENT'] = $_SERVER['HTTP_USER_AGENT'];
//$_SESSION['PREV_REMOTEADDR'] = $_SERVER['REMOTE_ADDR'];
// end of protection


