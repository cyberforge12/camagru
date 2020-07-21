<?php
define('DB_NAME', 'camagru.sqlite');
$recreate = true;

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
