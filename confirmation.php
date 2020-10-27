<?php
require_once('constants.php');
require_once ('config/setup.php');

function check_confirmation ($link, PDO $dbh) {
    $request = 'SELECT email from EmailConfirmation WHERE id = ?';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $link);
    if ($sth->execute() && $ret = $sth->fetch())
        return $ret[0];
    else
        return null;
}

header('refresh:5;url=index.php');
if (isset($_GET['link']))
{
    if ($email = check_confirmation($_GET['link'], $dbh))
    {
        $request = 'UPDATE User SET is_confirmed = true  WHERE email = ?';
        $sth = $dbh->prepare($request);
        if ($sth->execute([$email]))
            echo "E-mail confirmed";
        else
            echo "Error";
    }
    else
        echo "Invalid confirmation code";
}
echo PHP_EOL . "Redirecting to index.php...";
