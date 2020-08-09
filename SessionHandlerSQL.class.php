<?php


class SessionHandlerSQL extends SessionHandler
{
    private PDO $_dbh;

    public function __construct($dbh)
    {
        $this->_dbh = $dbh;
    }

    public function read($session_id)
    {
//        $query = 'INSERT INTO sessions VALUES (?, current_timestamp, null)';
//        $sth = $this->_dbh->prepare($query);
//        $sth->bindParam(1, $session_id);
//        $sth->execute([$session_id]);
        return(parent::read($session_id));
    }
}