<?php


class Paginator
{
    private $_dbh;
    private $_query;
    private $_user;

    public function __construct($dbh, $query, $user)
    {
        $this->_dbh = $dbh;
        $this->_query = $query;
        $this->_user = $user;
    }

    private function countComments($rowid) {
        $query = 'SELECT count(user) FROM Comment WHERE photo = ?';
        $sth = $this->_dbh->prepare($query);
        $sth->bindValue(1, $rowid, PDO::PARAM_STR);
        if ($sth->execute())
        {
            $ret = $sth->fetch();
            if ($ret)
                return $ret[0];
        }
        return 0;
    }

    private function countLikes($id) {
        $query = 'SELECT sum(like) FROM Like WHERE photo = ?';
        $sth = $this->_dbh->prepare($query);
        $sth->bindValue(1, $id, PDO::PARAM_STR);
        if ($sth->execute())
        {
            $ret = $sth->fetch();
            if (!empty($ret[0]))
                return $ret[0];
        }
        return 0;
    }

    private function userLikes($rowid) {
        $query = 'SELECT user FROM Like WHERE (user = ? and photo = ? and like = 1)';
        $sth = $this->_dbh->prepare($query);
        $sth->bindValue(1, $this->_user, PDO::PARAM_STR);
        $sth->bindValue(2, $rowid, PDO::PARAM_STR);
        if ($sth->execute()) {
            $ret = $sth->fetch();
            if ($ret && count($ret))
                return 1;
        }
        return 0;
    }

    public function getData($limit = 10, $page = 1)
    {
        if ($limit === 'all')
            $query = $this->_query;
        else
            $query = $this->_query . " LIMIT " . ($page - 1) *
                $limit . ", $limit";
        $sth = $this->_dbh->prepare($query);
        $sth->execute();

        $results = [];
        while ( $row = $sth->fetch(PDO::FETCH_ASSOC) )
        {
            $row += ['likes' => $this->countLikes($row['photo_id'])];
            $row += ['user_like' => $this->userLikes($row['photo_id'])];
            $row += ['comments' => $this->countComments($row['photo_id'])];
            $row += ['delete' => $row['user'] === $this->_user];
            $results[] = $row;
        }

        $result = new stdClass();
        $result->limit = $limit;
        $result->page = $page;
        $result->rows = count($results);
        $result->data = $results;

        return $result;
    }

}