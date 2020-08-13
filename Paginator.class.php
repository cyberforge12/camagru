<?php


class Paginator
{
    private PDO $_dbh;
    private $_query;
    private $_limit;
    private $_page;

    public function __construct($dbh, $query)
    {
        $this->_dbh = $dbh;
        $this->_query = $query;

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

        while ( $row = $sth->fetch(PDO::FETCH_ASSOC) )
            $results[] = $row;

        $result = new stdClass();
        $result->limit = $this->_limit;
        $result->page = $this->_page;
        $result->rows = count($results);
        $result->data = $results;
        return $result;
    }

}