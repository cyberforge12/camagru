<?php
session_start();
require_once('constants.php');
require_once ('config/setup.php');
require_once ('Paginator.class.php');

function create_img($dst_gd, $overlay) {
    $overlay_gd = imagecreatefrompng(ROOT_PATH . 'img/' . $overlay . '.png');
    $dst_sx = imagesx($dst_gd);
    $dst_sy = imagesy($dst_gd);
    if (in_array($overlay, ['frame', 'stars']))
        imagecopyresized($dst_gd, $overlay_gd, 0, 0, 0, 0,
        $dst_sx, $dst_sy, imagesx($overlay_gd), imagesy($overlay_gd));
    elseif ($overlay === 'think')
        imagecopyresized($dst_gd, $overlay_gd, $dst_sx * 0.75, 50,
            0, 0, $dst_sx * 0.25, $dst_sy * 0.25, imagesx($overlay_gd), imagesy
    ($overlay_gd));
    elseif ($overlay === 'discount')
        imagecopyresized($dst_gd, $overlay_gd, 0, $dst_sy - 150,
            0, 0, 150, 150, imagesx($overlay_gd), imagesy($overlay_gd));
    elseif ($overlay === 'none')
        imagecopyresized($dst_gd, $overlay_gd, $dst_sx / 2 - 150, $dst_sy / 2 -
            150, 0, 0, 300, 300,
            imagesx($overlay_gd), imagesy($overlay_gd));
    imagedestroy($overlay_gd);
    return ($dst_gd);
}

function get_session_user ($dbh) {
    $request = 'SELECT session_user FROM
        (SELECT *, max(datetime) FROM Session GROUP BY session_id)
        WHERE session_id = ?';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, session_id(), PDO::PARAM_STR);
    $sth->execute();
    if (($ret = $sth->fetch()))
        return $ret[0];
    return null;
}

function process_image($arr, $dbh) {
    if (!($merged = imagecreatefromstring(base64_decode($arr->data))))
        return false;
    foreach ($arr->images as $image) {
        $merged = create_img($merged, $image);
        if ($merged == false)
            return ['status' => 'Error', 'message' => 'Incorrect image format'];
    }
    ob_start();
    imagepng($merged);
    $image_data = ob_get_contents();
    ob_end_clean();
    header('Content-Type: application/json');
    $query = 'INSERT INTO Photo (datetime, photo, user, is_deleted)
        VALUES (current_timestamp, ?, ?, 0)';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, base64_encode($image_data), PDO::PARAM_STR);
    $user = get_session_user($dbh);
    $sth->bindValue(2, (empty($user) ? session_id() : $user),
        PDO::PARAM_STR);
    imagedestroy($merged);
    if ($sth->execute())
        return ['status' => 'OK', 'message' => 'Image added to gallery'];
    else
        return ['status' => 'Error', 'message' => 'Image cannot be processed'];
}

function update_session ($login, PDO $dbh) {
    $request = 'INSERT INTO Session VALUES (?, current_timestamp, ?)';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, session_id(), PDO::PARAM_STR);
    $sth->bindValue(2, $login, PDO::PARAM_STR);
    if ($sth->execute())
        return 0;
    else
        return 1;
}

function check_login ($login, $passw, PDO $dbh) {
    $request = 'SELECT user FROM User
        WHERE (user = ? AND password = ?)';
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
    $login = strip_tags($arr->login);
    $passw = hash('whirlpool', $arr->passw);
    $token = check_login($login, $passw, $dbh);
    if ($token == 1)
        return ['status' => 'ERROR_LOGIN', 'message' => 'Incorrect username or password'];
    elseif (!$token) {
        if (!update_session($login, $dbh))
            return ['status' => 'OK', 'message' => 'Logged in', 'login' => $login];
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
    $query = 'SELECT user FROM User WHERE user = ?';
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

function check_email(string $login, string $email, PDO $dbh) {
    $query = 'SELECT email FROM User WHERE user = ?';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, $login, PDO::PARAM_STR);
    if ($sth->execute()) {
        $data = $sth->fetch();
        if ($data and $data[0] === $email)
            return 1;
        else
            return 0;
    }
    else
        return -1;
}

function send_confirmation(string $login, string $email, PDO $dbh) {
    $link = time();
    $request = "INSERT INTO EmailConfirmation VALUES (?, ?, ?, 'conf')";
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $login, PDO::PARAM_STR);
    $sth->bindValue(2, $email, PDO::PARAM_STR);
    $sth->bindValue(3, $link, PDO::PARAM_STR);
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
        $query = 'INSERT INTO User VALUES (?, ?, ?, false, true)';
        $sth = $dbh->prepare($query);
        $sth->bindValue(1, strip_tags($arr->login), PDO::PARAM_STR);
        $sth->bindValue(2, strip_tags($arr->email), PDO::PARAM_STR);
        $sth->bindValue(3, hash('whirlpool', $arr->passw), PDO::PARAM_STR);
        if ($sth->execute())
        {
            if (send_confirmation($arr->login, $arr->email, $dbh))
                return ['status' => 'OK', 'message' => 'message sent'];
            else
                return ['status' => 'ERROR', 'message' => 'Mail error'];
        }
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
}

function resend_confirmation(PDO $dbh) {
    $user = get_session_user($dbh);
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT email FROM User WHERE user = ?');
        $sth->bindValue(1, $user, PDO::PARAM_STR);
        if ($sth->execute())
        {
            if (!empty(($email = $sth->fetch())))
            {
                if (!send_confirmation($user, $email[0], $dbh))
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
    $user = get_session_user($dbh);
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT user as login, email,
            is_confirmed, notify FROM User WHERE user = ?');
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

function get_gallery($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    $limit = 10;
    $page = ( isset ( $arr->page ) ) ? $arr->page : 1;
    $query = "SELECT photo_id, datetime, photo, user FROM Photo
            WHERE is_deleted = 0
            ORDER BY datetime DESC";
    $Paginator = new Paginator( $dbh, $query, $user );
    return $Paginator->getData( $limit, $page );
}

function check_session(PDO $dbh) {
    $user = get_session_user($dbh);
    if (!empty($user))
        return ['status' => 'OK', 'message' => 'Session login OK', 'login' =>
            $user];
    else
        return ['status' => 'ERROR', 'message' => 'No session login'];
}

function get_comments ($arr, PDO $dbh) {
    $query = 'SELECT text, datetime, user FROM Comment WHERE photo = ?';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, $arr->id);
    $sth->execute();
    $ret = [];
    if ($ret['comments'] = $sth->fetchAll(PDO::FETCH_ASSOC)) {
        $ret['count'] = count($ret['comments']);
        $ret['status'] = "OK";
    }
    else {
        $ret['status'] = "Error";
        $ret['message'] = "No comments";
    }
    return $ret;
}

function delete_photo ($arr, PDO $dbh) {
    $query = 'UPDATE Photo SET is_deleted = 1 WHERE photo_id = ?';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, $arr->id);
    $sth->execute();
    if ($sth->rowCount() > 0)
        return ['status' => 'OK', 'message' => 'Photo deleted', 'id' =>
            $arr->id];
    return ['status' => 'ERROR', 'message' => 'Photo not deleted'];
}

function delete_like ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'UPDATE Like SET like = 0 WHERE (user = ? and photo = ?)';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $user);
        $sth->bindValue(2, $arr->id);
        if ($sth->execute())
            return ['status' => 'OK', 'message' => 'Like deleted'];
    }
    return ['status' => 'ERROR', 'message' => 'User not logged in'];
}

function add_like ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'INSERT INTO Like (user, photo, like)
            VALUES (?, ?, 1)';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $user);
        if ((int)$arr->id)
        {
            $sth->bindValue(2, (int)$arr->id);
            if ($sth->execute())
                return ['status' => 'OK', 'message' => 'Like recorded'];
        }
    }
    return ['status' => 'ERROR', 'message' => 'Please, log in'];
}

function add_comment ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'INSERT INTO Comment (text, user, photo)
            VALUES (?, ?, ?)';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, strip_tags($arr->data));
        $sth->bindValue(2, $user);
        $sth->bindValue(3, $arr->id);
        if ($sth->execute()) {
            send_notification($user, $arr->id, $dbh);
            return ['status' => 'OK', 'message' => 'Comment recorded',
                'id' => $arr->id];
        }
    }
    return ['status' => 'ERROR', 'message' => 'Comment not recorded. Please log in.', 'id' => $arr->id];
}

function set_notifications ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'UPDATE User SET notify = ? WHERE user = ?';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $arr->value);
        $sth->bindValue(2, $user);
        if ($sth->execute())
            return ['status' => 'OK', 'message' => 'Notification settings changed'];
        else
            return ['status' => 'ERROR', 'message' => 'Database error'];
    }
    return ['status' => 'ERROR', 'message' => 'Invalid user session.'];

}

function send_notification ($user, $photo_id, PDO $dbh) {
    $request = "SELECT email FROM User WHERE user = (SELECT user FROM Photo WHERE photo_id = ? AND notify = 1)";
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $photo_id);
    if ($sth->execute()) {
        if (($email = $sth->fetch()))
            return mail($email[0], 'Camagru - ' . $user . ' commented your photo',
                $user . ' posted a comment to your photo on Camagru website (http://' .
                $_SERVER['HTTP_HOST'] . ').');
    }
    return null;
}

function reset_password ($arr, PDO $dbh) {
    $link = hash('whirlpool', time());
    $email = $arr->email;
    $request = "INSERT INTO EmailConfirmation VALUES (?, ?, ?, 'reset')";
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, $arr->login, PDO::PARAM_STR);
    $sth->bindValue(2, $email, PDO::PARAM_STR);
    $sth->bindValue(3, $link, PDO::PARAM_STR);
    if ($sth->execute()) {
        if (check_email($arr->login, $email, $dbh)) {
            mail($email, 'Camagru password reset',
                'Please follow the link below to reset your password:' . PHP_EOL
                . $_SERVER['HTTP_HOST'] . '/reset.php?link=' . $link);
            return ['status' => 'OK', 'message' => 'E-mail with password reset instructions was sent to ' .
                $email];
        }
        else
            return ['status' => 'Error', 'message' => 'Incorrect login or e-mail'];
    }
    else
        return ['status' => 'Error', 'message' => 'Incorrect login or e-mail'];
}

function change_login ($arr, PDO $dbh) {
    if (!check_user($arr->login, $dbh))
    {
        $user = get_session_user($dbh);
        $request = "UPDATE User SET user = ? WHERE user = ?";
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, strip_tags($arr->login), PDO::PARAM_STR);
        $sth->bindValue(2, $user, PDO::PARAM_STR);
        if ($sth->execute()) {
            update_session($arr->login, $dbh);
            return ['status' => 'OK', 'message' => 'Login changed'];
        }
        else
            return ['status' => 'Error', 'message' => 'Database error'];
    }
    else
        return ['status' => 'Error', 'message' => 'User already exists'];
}

function change_email ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    $request = "UPDATE User SET email = ? WHERE user = ?";
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, strip_tags($arr->email), PDO::PARAM_STR);
    $sth->bindValue(2, $user, PDO::PARAM_STR);
    if ($sth->execute())
        return ['status' => 'OK', 'message' => 'E-mail changed'];
    else
        return ['status' => 'Error', 'message' => 'Database error'];
}

function change_passw ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    $request = "UPDATE User SET password = ? WHERE user = ?";
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, hash('whirlpool', $arr->passw), PDO::PARAM_STR);
    $sth->bindValue(2, $user, PDO::PARAM_STR);
    if ($sth->execute())
        return ['status' => 'OK', 'message' => 'Password changed'];
    else
        return ['status' => 'Error', 'message' => 'Database error'];
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
    elseif ($arr->action === 'get_comments')
        $ret = get_comments($arr, $dbh);
    elseif ($arr->action === 'delete')
        $ret = delete_photo($arr, $dbh);
    elseif ($arr->action === 'add_like')
        $ret = add_like($arr, $dbh);
    elseif ($arr->action === 'delete_like')
        $ret = delete_like($arr, $dbh);
    elseif ($arr->action === 'add_comment')
        $ret = add_comment($arr, $dbh);
    elseif ($arr->action === 'notify')
        $ret = set_notifications($arr, $dbh);
    elseif ($arr->action === 'reset')
        $ret = reset_password($arr, $dbh);
    elseif ($arr->action === 'change_login')
        $ret = change_login($arr, $dbh);
    elseif ($arr->action === 'change_email')
        $ret = change_email($arr, $dbh);
    elseif ($arr->action === 'change_passw')
        $ret = change_passw($arr, $dbh);
    else
        $ret = ['status' => 'ERROR', 'message' => 'Illegal action'];
}
else
    $ret = ['status' => 'ERROR', 'message' => 'Database error'];
echo json_encode($ret);

