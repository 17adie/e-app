<?php

function getConnection() {
  $host = "localhost";
  $user = "root";
  $password = "";
  $database = "eapp";
  $dsn = "mysql:host=$host;dbname=$database";
  $connection = new PDO($dsn, $user, $password);
//    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  return $connection;
}

?>
