<?php
require_once('SessionHandlerSQL.class.php');
require_once('config/database.php');
$session_handler = new SessionHandlerSQL($dbh);
session_set_save_handler($session_handler);
session_start();
