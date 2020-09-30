<?php

require_once("constants.php");
require_once("config/database.php");

function check_reset($link, PDO $dbh)
{
    $request = 'SELECT email from EmailConfirmation WHERE id = ?';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $link);
    if ($sth->execute() && $ret = $sth->fetch())
        return $ret[0];
    else
        return null;
}

function update_passw($hash, $passw, PDO $dbh)
{
    $request = 'UPDATE User SET password = ? WHERE user = (SELECT user FROM EmailConfirmation WHERE id = ?)';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, hash('whirlpool', $passw));
    $sth->bindValue(2, $hash);
    if ($sth->execute())
        return 1;
    else
        return null;
}

//header('refresh:5;url=index.php');
if (isset($_GET['link'])) {
    $hash = $_GET['link'];
    if ($email = check_reset($hash, $dbh)) {
        $request = 'SELECT id FROM EmailConfirmation WHERE id = ?';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $hash);
        if ($sth->execute()) {
            include("passw_reset_form.php");
        } else
            echo "Invalid reset link" . PHP_EOL;
    }
}
elseif (isset($_POST['passw']) and $_POST['hash']) {
    if (update_passw($_POST['hash'], $_POST['passw'], $dbh)) {

        echo "Password updated. Redirecting to Camagru...";
        header('refresh:5;url=index.php');
    }
}
else
    echo "Invalid reset link" . PHP_EOL;
