<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/form.php");


$params = $_POST['params'];

// $params = $_GET; // for api testing

$filename = $params['filename'];
$tbl_id = $params['tbl_id'];

update_filename($filename, $tbl_id);

$response = array(
  "message" => "Filename has been updated successfully.",
  "status" => true
);
  
echo json_encode($response);
  
?>