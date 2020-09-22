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
//    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    /*
    $dbh->exec('

    create table if not exists User(
        user         char(255)
            constraint User_pk
                primary key,
        email,
        password     binary(64),
        is_confirmed integer,
        notify       integer
                         );

    create table if not exists EmailConfirmation(
        email
            constraint Email_gets_EmailConfirmation_fk
                foreign key references User (email),
        id
            constraint EmailConfirmation_pk
                primary key
                                  );

    create table if not exists Photo(
        photo_id integer primary key autoincrement,
        datetime timestamp DEAFULT CURRENT_TIMESTAMP,
        photo,
        user
            constraint User_posts_Photo_fk
                foreign key references User (user),
        is_deleted
                                    );

    create table if not exists Comment(
        text,
        user
            constraint User_posts_Comment_fk
                references User,
        datetime  datetime DEFAULT CURRENT_TIMESTAMP,
        photo_id
            constraint Photo_gets_Comment_fk
                foreign key references Photo(photo_id),
        constraint Comment_pk
            primary key (user, datetime)
                                      );

    create table if not exists Like(
        user
            constraint User_posts_Like_fk
                foreign key references User (user),
        datetime  datetime DEFAULT CURRENT_TIMESTAMP,
        constraint Like_pk
            primary key (user, datetime),
        photo_id
            constraint Photo_receives_Like_fk
                foreign key references Photo (photo_id)
                                   );

    create table if not exists Session(
        session_id VARCHAR(32),
        date,
        user
            constraint User_initiates_Session_fk
                foreign key references User(user),
        constraint Session_pk
            primary key (session_id, date)
                        );
                        ');
    */
    $dbh->exec('create table if not exists User(
        user char(255) primary key,
        email,
        password binary(64),
        is_confirmed integer,
        notify integer)');
    $dbh->exec('create table if not exists Photo(
        photo_id integer primary key autoincrement,
        date timestamp DEAFULT CURRENT_TIMESTAMP,
        photo,
        user,
        is_deleted,
        foreign key (user) REFERENCES User(user))');
    $dbh->exec('create table if not exists Comment(
        id integer primary key,
        datetime default CURRENT_TIMESTAMP, 
        text,
        user REFERENCES User(user),
        photo REFERENCES Photo(photo_id))');
    $dbh->exec('create table if not exists Like(
        id integer primary key,
        user REFERENCES User(user),
        photo REFERENCES Photo(photo_id),
        like)');
    $dbh->exec('create table if not exists Session(
        session_id VARCHAR(32),
        date,
        session_user REFERENCES User(user))');
    $dbh->exec('create table if not exists EmailConfirmation(
        email,
        id)');
} catch (PDOException $e) {
    echo 'Подключение не удалось: ' . $e->getMessage(); //TODO: REMOVE
}


