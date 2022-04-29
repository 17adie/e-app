<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/user_access.php");


$params = $_POST['params'];

// $params = $_GET; // for api testing

$tbl_id = $params['tbl_id'];
$stat = $params['stat'];

$data = update_user_status($tbl_id, $stat);

$data = array(
  "message" => 'Status updated successfully',
  "status" => true
);


echo json_encode($data);


?>