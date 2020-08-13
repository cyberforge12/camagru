<?php
session_start();
require_once('constants.php');
require_once ('config/database.php');
require_once ('Paginator.class.php');

function create_img($img, $overlay) {
    $base_img = imagecreatefromstring($img);
    $overlay_img = imagecreatefrompng($overlay);
    imagealphablending($overlay_img, true);
    imagesavealpha($overlay_img, true);
    imagecopymerge($base_img, $overlay_img, 0,0,
        0,0,imagesx($base_img), imagesy($base_img),100);
    imagedestroy($overlay_img);
    return ($base_img);
}

function get_session_user (PDO $dbh) {
    $request = 'SELECT session_user FROM
        (SELECT *, max(date) FROM sessions GROUP BY session_id)
        WHERE session_id = ?';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, session_id(), PDO::PARAM_STR);
    $sth->execute();
    $ret = $sth->fetchAll();
    return $ret;
}

function process_image($arr, PDO $dbh) {
    $overlay = ROOT_PATH . 'img/' . $arr->img_name . '.png';
    $merged = create_img(base64_decode($arr->data), $overlay);
    ob_start();
    imagepng($merged);
    $image_data = ob_get_contents();
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'OK']);
    $query = 'INSERT INTO photos VALUES (current_timestamp, ?, ?)';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, base64_encode($image_data), PDO::PARAM_STR);
    $user = get_session_user($dbh)[0][0];
    $sth->bindValue(2, (empty($user) ? session_id() : $user),
        PDO::PARAM_STR);
    if ($sth->execute())
        return ['status' => 'OK', 'message' => 'Message processed'];
    imagedestroy($merged);
}

function update_session ($login, PDO $dbh) {
    $request = 'INSERT INTO sessions VALUES (?, current_timestamp, ?)';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, session_id(), PDO::PARAM_STR);
    $sth->bindValue(2, $login, PDO::PARAM_STR);
    if ($sth->execute())
        return 0;
    else
        return 1;
}

function check_login ($login, $passw, PDO $dbh) {
    $request = 'SELECT login FROM users
        WHERE (login = ? AND password = ?)';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $login, PDO::PARAM_STR);
    $sth->bindValue(2, $passw, PDO::PARAM_STR);
    if ($sth->execute())
    {
        if ($sth->fetch() === false)
            return 1;
        else
            return 0;
    }
    else
        return 2;
}

function login ($arr, $dbh) {
    $login = $arr->login;
    $passw = hash('whirlpool', $arr->passw);
    $token = check_login($login, $passw, $dbh);
    if ($token == 1)
        return ['status' => 'ERROR_LOGIN', 'message' => 'Incorrect username or password'];
    elseif (!$token) {
        if (!update_session($login, $dbh))
            return ['status' => 'OK', 'message' => 'Logged in'];
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
    else
        return ['status' => 'ERROR', 'message' => 'Database error'];
}

function logout ($dbh) {
    update_session(null, $dbh);
    return ['status' => 'OK', 'message' => 'Logged out'];
}

function check_user(string $login, PDO $dbh) {
    $query = 'SELECT login FROM users WHERE login = ?';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, $login, PDO::PARAM_STR);
    if ($sth->execute()) {
        if (empty($sth->fetchAll()))
            return 0;
        else
            return 1;
    }
    else
        return -1;
}

function send_confirmation(string $email, PDO $dbh) {
    $link = time();
    $request = 'INSERT INTO email_conf VALUES (?, ?)';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $email, PDO::PARAM_STR);
    $sth->bindValue(2, $link, PDO::PARAM_STR);
    if ($sth->execute())
        return mail($email, 'Camagru e-mail confirmation',
        'Please follow the link below to confirm your e-mail:' . PHP_EOL
    . $_SERVER['HTTP_HOST'] . '/confirmation.php?link=' . $link);
    else
        return 0;
}

function register ($arr, $dbh) {
    $check = check_user($arr->login, $dbh);
    header('Content-Type: application/json');
    if ($check === 1)
        return ['status' => 'ERROR', 'message' => 'User already registered'];
    else if ($check === -1)
        return ['status' => 'ERROR', 'message' => 'Database error'];
    else {
        $query = 'INSERT INTO users VALUES (?, ?, ?, false, false)';
        $sth = $dbh->prepare($query);
        $sth->bindValue(1, $arr->login, PDO::PARAM_STR);
        $sth->bindValue(2, $arr->login, PDO::PARAM_STR);
        $sth->bindValue(3, hash('whirlpool', $arr->passw), PDO::PARAM_STR);
        if ($sth->execute())
        {
            if (send_confirmation($arr->login, $dbh))
                return ['status' => 'OK', 'message' => 'message sent'];
            else
                return ['status' => 'ERROR', 'message' => 'Mail error'];
        }
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
}

function resend_confirmation(PDO $dbh) {
    $user = get_session_user($dbh)[0][0];
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT email FROM users WHERE login = ?');
        $sth->bindValue(1, $user, PDO::PARAM_STR);
        if ($sth->execute())
        {
            if (!empty(($email = $sth->fetch())))
            {
                if (!send_confirmation($email[0], $dbh))
                    return ['status' => 'OK', 'message' => 'Confirmation letter sent'];
                else
                    return ['status' => 'ERROR', 'message' => 'Mail error'];
            }
            else
                return ['status' => 'ERROR', 'message' => 'Database error'];
        }
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
    else
        return ['status' => 'ERROR', 'message' => 'No session login'];
}

function get_profile(PDO $dbh) {
    $user = get_session_user($dbh)[0][0];
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT login, email,
            is_confirmed, notify FROM users WHERE login = ?');
        $sth->bindValue(1, $user, PDO::PARAM_STR);
        if ($sth->execute())
        {
            if (!empty(($data = $sth->fetch())))
                return $data;
            else
                return ['status' => 'ERROR', 'message' => 'Database error'];
        }
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
    else
        return ['status' => 'ERROR', 'message' => 'No session login'];
}

function load_gallery(PDO $dbh) {
    $request = 'SELECT rowid, date, photo, photo_owner FROM photos';
    $sth = $dbh->prepare($request);
    $sth->execute();
    return $sth;
}

function get_gallery($arr, PDO $dbh) {
//    load_gallery($dbh);
//    $result = $sth->fetch();
//
    $limit      = 10;
    $page       = ( isset ( $arr->page ) ) ? $arr->page : 1;
    $query      = "SELECT rowid, date, photo, photo_owner FROM photos ORDER BY date DESC";
    $Paginator  = new Paginator( $dbh, $query );
    $results    = $Paginator->getData( $limit, $page );
    return $results;
}

function check_session(PDO $dbh) {
    $user = get_session_user($dbh);
    if (!empty($user[0][0]))
        return ['status' => 'OK', 'message' => 'Session login OK'];
    else
        return ['status' => 'ERROR', 'message' => 'No session login'];
}

$json = file_get_contents("php://input");
$arr = json_decode($json);
$ret = '';

if (isset($dbh))
{
    header('Content-Type: application/json');
    if ($arr->action === 'check_session')
        $ret = check_session($dbh);
    elseif ($arr->action === 'image_upload')
        $ret = process_image($arr, $dbh);
    elseif ($arr->action === 'login')
        $ret = login($arr, $dbh);
    elseif ($arr->action === 'logout')
        $ret = logout($dbh);
    elseif ($arr->action === 'register')
        $ret = register($arr, $dbh);
    elseif ($arr->action === 'get_profile')
        $ret = get_profile($dbh);
    elseif ($arr->action === 'resend')
        $ret = resend_confirmation($dbh);
    elseif ($arr->action === 'get_gallery')
        $ret = get_gallery($arr, $dbh);
}
else
    $ret = ['status' => 'ERROR', 'message' => 'Database error'];
echo json_encode($ret);

