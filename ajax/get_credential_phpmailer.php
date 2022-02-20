<?php

header('Access-Control-Allow-Origin: *');
include 'db.php';

function get_credentials(){
  $query = "SELECT c_username, c_password FROM credentials_tbl WHERE tbl_id = 1";
                     
    try{
        $db = getConnection();
        $statement = $db->prepare($query);
        $statement->execute();
        $response = $statement->fetchAll(PDO::FETCH_OBJ);
        return $response;
    } catch(PDOException $e){
        echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
    }
}

$data = get_credentials();

foreach($data as $row) {
  $username = $row->c_username;
  $password = $row->c_password;
}

define('EMAIL', $username);
define('PASS', $password);
