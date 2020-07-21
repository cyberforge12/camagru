<?php
$DB_FILE = ROOT_PATH.'db/camagru.sqlite';
$DB_DSN = 'sqlite:' . $DB_FILE;
$DB_USER = 'dbuser';
$DB_PASSWORD = 'dbpass';
$sql_create = '';
$sql_create_db = "create database `camagru`;";

try {
    $dbh = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD);
    $dbh->exec($sql_create_db);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->exec('create table if not exists users(
        login char(255) primary key,
        email,
        password binary(64),
        is_confirmed integer,
        notify integer)');
    $dbh->exec('create table if not exists photos(
        id integer primary key,
        photo_owner, foreign key (photo_owner) REFERENCES users(login))');
    $dbh->exec('create table if not exists comments(
        id integer primary key,
        text,
        comment_user REFERENCES users(login),
        comment_photo REFERENCES photos(id))');
    $dbh->exec('create table if not exists likes(
        id integer primary key,
        like_user REFERENCES users(login),
        like_photo REFERENCES photos(id))');
} catch (PDOException $e) {
    echo 'Подключение не удалось: ' . $e->getMessage(); //TODO: REMOVE
}


