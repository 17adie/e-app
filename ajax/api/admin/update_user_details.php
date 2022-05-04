<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/user_access.php");


$params = $_POST['params'];

// $params = $_GET; // for api testing

$first_name = $params['first_name'];
$last_name = $params['last_name'];
$email = $params['email'];
$type = $params['type'];
$tbl_id = $params['tbl_id'];

$data = [];

$check_name = check_user_duplicate_name($first_name, $last_name, $tbl_id);
$check_email = check_user_duplicate_email($email, $tbl_id);

if(!empty($check_name) || !empty($check_email)) {
  $data = array(
    "name" => $check_name,
    "email" => $check_email,
    "status" => false
  );

   echo json_encode($data);

} else {


  update_user($first_name, $last_name, $email, $type, $tbl_id);

  $response = array(
    "message" => "User has been updated successfully.",
    "status" => true
  );
  
  echo json_encode($response);
}
  


?>