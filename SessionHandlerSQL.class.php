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
        return(parent::read($session_id));
    }
}