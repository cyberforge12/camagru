<?php
$DB_FILE = ROOT_PATH . 'db/' . DB_NAME;
$DB_DSN = 'sqlite:' . $DB_FILE;
$DB_USER = 'dbuser';
$DB_PASSWORD = 'dbpass';
$sql_create_db = "create database `camagru.sqlite`;";

@mkdir(ROOT_PATH . 'db');

$recreate = false;
if (file_exists(ROOT_PATH . 'db/' . DB_NAME) && $recreate == true)
    unlink(ROOT_PATH . 'db/' . DB_NAME);

try {
    global $dbh;
    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD);
    $dbh->exec($sql_create_db);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->exec('create table if not exists users(
        login char(255) primary key,
        email,
        password binary(64),
        is_confirmed integer,
        notify integer)');
    $dbh->exec('create table if not exists uploads(
        date timestamp DEAFULT CURRENT_TIMESTAMP,
        photo,
        photo_owner, foreign key (photo_owner) REFERENCES users(login))');
    $dbh->exec('create table if not exists photos(
        date timestamp DEAFULT CURRENT_TIMESTAMP,
        photo,
        photo_owner, foreign key (photo_owner) REFERENCES users(login))');
    $dbh->exec('create table if not exists comments(
        id integer primary key,
        text,
        comment_user REFERENCES users(login),
        comment_photo REFERENCES photos(date))');
    $dbh->exec('create table if not exists likes(
        id integer primary key,
        like_user REFERENCES users(login),
        like_photo REFERENCES photos(date))');
    $dbh->exec('create table if not exists sessions(
        session_id VARCHAR(32),
        date,
        session_user REFERENCES users(login))');
    $dbh->exec('create table if not exists email_conf(
        email REFERENCES users(email),
        id)');
} catch (PDOException $e) {
    echo 'Подключение не удалось: ' . $e->getMessage(); //TODO: REMOVE
}


