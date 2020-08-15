<?php


class Paginator
{
    private PDO $_dbh;
    private $_query;
    private $_limit;
    private $_page;
    private $_user;

    public function __construct($dbh, $query, $user)
    {
        $this->_dbh = $dbh;
        $this->_query = $query;
        $this->_user = $user;
    }

    private function countComments($rowid) {
        $query = 'SELECT count(comment_user) FROM comments WHERE comment_photo = ?';
        $sth = $this->_dbh->query($query);
        $sth->bindValue(1, $rowid, PDO::PARAM_INT);
        if ($sth->execute())
        {
            $ret = $sth->fetch();
            if ($ret)
                return $ret[0];
        }
        return 0;
    }

    private function countLikes($rowid) {
        $query = 'SELECT count(like_user) FROM likes WHERE like_photo = ?';
        $sth = $this->_dbh->query($query);
        $sth->bindValue(1, $rowid, PDO::PARAM_INT);
        if ($sth->execute())
        {
            $ret = $sth->fetch();
            if ($ret)
                return $ret[0];
        }
        return 0;
    }

    private function userLikes($rowid) {
        $query = 'SELECT like_user FROM likes
            WHERE like_user = (
                SELECT ROWID FROM users
                WHERE login = ?)
              AND like_photo = ?';
        $sth = $this->_dbh->query($query);
        $sth->bindValue(1, $this->_user, PDO::PARAM_STR);
        $sth->bindValue(2, $rowid, PDO::PARAM_INT);
        if ($sth->execute()) {
            $ret = $sth->fetch();
            if ($ret && count($ret))
                return 1;
        }
        return 0;
    }

    public function getData($limit = 10, $page = 1)
    {
        $this->_limit = $limit;
        $this->_page = $page;

        if ($this->_limit === 'all')
            $query = $this->_query;
        else
            $query = $this->_query . " LIMIT " . ($this->_page - 1) *
                $this->_limit . ", $this->_limit";
        $sth = $this->_dbh->query($query);

        $results = [];
        while ( $row = $sth->fetch(PDO::FETCH_ASSOC) )
        {
            $row += ['likes' => $this->countLikes($row['id'])];
            $row += ['user_like' => $this->userLikes($row['id'])];
            $row += ['comments' => $this->countComments($row['id'])];
            $results[] = $row;
        }

        $result = new stdClass();
        $result->limit = $this->_limit;
        $result->page = $this->_page;
        $result->rows = count($results);
        $result->data = $results;

        return $result;
    }

}