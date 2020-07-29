<?php
require_once (ROOT_PATH . 'config/database.php');

if (isset($_POST['email']) && !empty($_POST['email']
        && isset($_POST['passw']) && !empty($_POST['passw']))
    && !empty(['action']))
{
    if ($_POST['action'] === 'reg')
        register($_POST['email'], $_POST['passw'], $dbh);
    elseif ($_POST['action'] === 'login')
        login($_POST['email'], $_POST['passw']);
}

function email_confirmation($login) {
    print ('Sending email to ' . $login);
}

function register($login, $passw, $dbh)
{
    $hash_pw = hash('whirlpool', $passw);
    if (!check_login($login, $dbh))
    {
        $query = 'INSERT INTO users VALUES (?, ?, ?, 0, 0)';
        $sth = $dbh->prepare($query);
        if ($sth->execute([$login, $login, $hash_pw]))
            email_confirmation($login);
        header('A');
    }
    else
        return false;
}


function login($login, $passw)
{


}

function check_login ($login, $dbh) {
    $statement = $dbh->exec ('select email from users where email=$login');
    return ($statement);
}

