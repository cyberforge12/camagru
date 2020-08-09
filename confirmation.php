<?php
require_once('constants.php');
require_once ('config/database.php');

function check_confirmation ($link, PDO $dbh) {
    $request = 'SELECT email from email_conf WHERE id = ?';
    $sth = $dbh->prepare($request);
    if ($sth->execute([$link]))
        return $sth->fetch()[0];
    else
        return null;
}

header('refresh:5;url=index.php');
if (isset($_GET['link']))
{
    if ($email = check_confirmation($_GET['link'], $dbh))
    {
        $request = 'UPDATE users SET is_confirmed = true  WHERE email = ?';
        $sth = $dbh->prepare($request);
        if ($sth->execute([$email]))
            echo json_encode(['status' => 'OK', 'message' => 'E-mail confirmed']);
        else
            echo json_encode(['status' => 'ERROR', 'message' => 'Database error']);
    }
    else
        echo json_encode(['status' => 'ERROR', 'message' => 'Incorrect confirmation code']);
}
echo PHP_EOL . "Redirecting to index.php...";
