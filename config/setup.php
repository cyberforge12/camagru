<?php
require_once('SessionHandlerSQL.class.php');
require_once('config/database.php');

if (!is_dir(ROOT_PATH . 'db'))
    @mkdir(ROOT_PATH . 'db');

$recreate = false;
if (file_exists(ROOT_PATH . 'db/' . DB_NAME) && $recreate == true)
    unlink(ROOT_PATH . 'db/' . DB_NAME);

try {
    global $dbh;
    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->exec('create table if not exists User(
        user char(255) primary key,
        email,
        password binary(64),
        is_confirmed integer,
        notify integer)');
    $dbh->exec('create table if not exists Photo(
        photo_id integer primary key autoincrement,
        datetime timestamp DEAFULT CURRENT_TIMESTAMP,
        photo,
        user,
        is_deleted,
        foreign key (user) REFERENCES User(user))');
    $dbh->exec('create table if not exists Comment(
        id integer primary key,
        datetime default CURRENT_TIMESTAMP, 
        text,
        user REFERENCES User(user) ON UPDATE CASCADE ON DELETE CASCADE,
        photo REFERENCES Photo(photo_id) ON UPDATE CASCADE ON DELETE CASCADE)');
    $dbh->exec('create table if not exists Like(
        id integer primary key,
        user REFERENCES User(user) ON UPDATE CASCADE ON DELETE CASCADE,
        photo REFERENCES Photo(photo_id) ON UPDATE CASCADE ON DELETE CASCADE,
        like)');
    $dbh->exec('create table if not exists Session(
        session_id VARCHAR(32),
        datetime,
        session_user REFERENCES User(user) ON UPDATE CASCADE ON DELETE CASCADE)');
    $dbh->exec('create table if not exists EmailConfirmation(
        user REFERENCES  User(user) ON UPDATE CASCADE ON DELETE CASCADE,
        email,
        id,
        type)');
} catch (PDOException $e) {
    echo 'Подключение не удалось: ' . $e->getMessage();
}
