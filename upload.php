<?php
session_start();
require_once('constants.php');
require_once ('config/database.php');
require_once ('Paginator.class.php');

function resize_image($image, $w, $h, $crop=FALSE) {
    $width = imagesx($image);
    $height = imagesy($image);
    $r = $width / $height;
    if ($crop) {
        if ($width > $height) {
            $width = ceil($width-($width*abs($r-$w/$h)));
        } else {
            $height = ceil($height-($height*abs($r-$w/$h)));
        }
        $newwidth = $w;
        $newheight = $h;
    } else {
        if ($w/$h > $r) {
            $newwidth = $h*$r;
            $newheight = $h;
        } else {
            $newheight = $w/$r;
            $newwidth = $w;
        }
    }
    $dst = imagecreatetruecolor($newwidth, $newheight);
    imagealphablending( $dst, false );
    imagesavealpha( $dst, true );
    imagecopyresampled($dst, $image,
        0, 0,
        0, 0,
        $newwidth, $newheight,
        $width, $height);
    return $dst;
}

function create_img($arr) {
    $overlay = ROOT_PATH . 'img/' . $arr->img_name . '.png';
    $dst_cam = imagecreatefromstring(base64_decode($arr->data));
    $src_ovl = imagecreatefrompng($overlay);
    $dst_sx = imagesx($dst_cam);
    $dst_sy = imagesy($dst_cam);
    if (in_array($arr->img_name, ['frame', 'stars']))
        imagecopyresized($dst_cam, $src_ovl, 0, 0, 0, 0,
        $dst_sx, $dst_sy, imagesx($src_ovl), imagesy($src_ovl));
    elseif ($arr->img_name === 'think')
        imagecopyresized($dst_cam, $src_ovl, $dst_sx * 0.75, 50,
            0, 0, 150, 150, imagesx($src_ovl), imagesy($src_ovl));
    elseif ($arr->img_name === 'discount')
        imagecopyresized($dst_cam, $src_ovl, 0, $dst_sy - 150,
            0, 0, 150, 150, imagesx($src_ovl), imagesy($src_ovl));
    elseif ($arr->img_name === 'none')
        imagecopyresized($dst_cam, $src_ovl, $dst_sx / 2 - 150, $dst_sy / 2 -
            150, 0, 0, 300, 300,
            imagesx($src_ovl), imagesy($src_ovl));
    imagedestroy($src_ovl);
    return ($dst_cam);
}

function get_session_user (PDO $dbh) {
    $request = 'SELECT session_user FROM
        (SELECT *, max(date) FROM Session GROUP BY session_id)
        WHERE session_id = ?';
    $sth = $dbh->prepare($request);
    $sth->bindValue(1, session_id(), PDO::PARAM_STR);
    $sth->execute();
    if (($ret = $sth->fetch()))
        return $ret[0];
    return null;
}

function process_image($arr, PDO $dbh) {
    $merged = create_img($arr);
    ob_start();
    imagepng($merged);
    $image_data = ob_get_contents();
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['status' => 'OK']);
    $query = 'INSERT INTO Photo (date, photo, user, is_deleted)
        VALUES (current_timestamp, ?, ?, 0)';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, base64_encode($image_data), PDO::PARAM_STR);
    $user = get_session_user($dbh);
    $sth->bindValue(2, (empty($user) ? session_id() : $user),
        PDO::PARAM_STR);
    if ($sth->execute())
        return ['status' => 'OK', 'message' => 'Image added to gallery'];
    imagedestroy($merged);
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
    $login = $arr->login;
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

function send_confirmation(string $email, PDO $dbh) {
    $link = time();
    $request = 'INSERT INTO EmailConfirmation VALUES (?, ?)';
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
        $query = 'INSERT INTO User VALUES (?, ?, ?, false, false)';
        $sth = $dbh->prepare($query);
        $sth->bindValue(1, $arr->login, PDO::PARAM_STR);
        $sth->bindValue(2, $arr->email, PDO::PARAM_STR);
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
    $user = get_session_user($dbh);
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT email FROM User WHERE user = ?');
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
    $user = get_session_user($dbh);
    if (!empty($user))
    {
        $sth = $dbh->prepare('SELECT user, email,
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

function load_gallery(PDO $dbh) {
    $request = 'SELECT date, photo, user FROM Photo';
    $sth = $dbh->prepare($request);
    $sth->execute();
    return $sth;
}

function get_gallery($arr, PDO $dbh) {
//    load_gallery($dbh);
//    $result = $sth->fetch();
//
    $user = get_session_user($dbh);
    $limit = 10;
    $page = ( isset ( $arr->page ) ) ? $arr->page : 1;
    $query = "SELECT photo_id, date, photo, user FROM Photo
            WHERE is_deleted = 0
            ORDER BY date DESC";
    $Paginator = new Paginator( $dbh, $query, $user );
    $results = $Paginator->getData( $limit, $page );
    return $results;
}

function check_session(PDO $dbh) {
    $user = get_session_user($dbh);
    if (!empty($user))
        return ['status' => 'OK', 'message' => 'Session login OK'];
    else
        return ['status' => 'ERROR', 'message' => 'No session login'];
}

function get_comments ($arr, PDO $dbh) {
    $query = 'SELECT text FROM Comment WHERE photo = ?';
    $sth = $dbh->prepare($query);
    $sth->bindValue(1, $arr['id']);
    $sth->execute();
    $ret = $sth->fetchAll();
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
        $request = 'INSERT INTO Like (user, photo, like)
            VALUES (?, ?, 0)';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $user);
        $id = explode('_', $arr->id);
        if ($id[1])
        {
            $sth->bindValue(2, $id[1]);
            if ($sth->execute())
                return ['status' => 'OK', 'message' => 'Like deleted'];
        }
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
        $id = explode('_', $arr->id);
        if ($id[1])
        {
            $sth->bindValue(2, $id[1]);
            if ($sth->execute())
                return ['status' => 'OK', 'message' => 'Like recorded'];
        }
    }
    return ['status' => 'ERROR', 'message' => 'User not logged in'];
}

function add_comment ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'INSERT INTO Comment (text, user, photo)
            VALUES (?, ?, ?)';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $arr->data);
        $sth->bindValue(2, $user);
        $sth->bindValue(3, $arr->id);
        if ($sth->execute())
            return ['status' => 'OK', 'message' => 'Comment recorded',
                'id' => $arr->id];
    }
    return ['status' => 'ERROR', 'message' => 'Comment not recorded. Please log in.', 'id' => $arr->id];
}

function notify ($arr, PDO $dbh) {
    $user = get_session_user($dbh);
    if ($user)
    {
        $request = 'UPDATE User SET notify = ? WHERE user = ?';
        $sth = $dbh->prepare($request);
        $sth->bindValue(1, $arr->value);
        $sth->bindValue(2, $user);
        if ($sth->execute())
            return ['status' => 'OK', 'message' => 'Notification settings changed',
                'id' => $arr->id];
    }
    return ['status' => 'ERROR', 'message' => 'Comment not recorded. Please log in.', 'id' => $arr->id];

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
    elseif ($arr->action === 'comment')
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
        $ret = notify($arr, $dbh);
    else
        $ret = ['status' => 'ERROR', 'message' => 'Illegal action'];
}
else
    $ret = ['status' => 'ERROR', 'message' => 'Database error'];
echo json_encode($ret);

