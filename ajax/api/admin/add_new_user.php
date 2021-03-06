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
$username = $params['username'];
$email = $params['email'];
$password = $params['password'];
$type = $params['type'];
$tbl_id = ''; // for add and update checking of duplicates

$data = [];

$check_name = check_user_duplicate_name($first_name, $last_name, $tbl_id);
$check_username = check_user_duplicate_username($username);
$check_email = check_user_duplicate_email($email, $tbl_id);

if(!empty($check_name) || !empty($check_username) || !empty($check_email)) {
  $data = array(
    "name" => $check_name,
    "username" => $check_username,
    "email" => $check_email,
    "status" => false
  );

   echo json_encode($data);

} else {

  $options = [
    'cost' => 11
  ];

  $enc_password = password_hash($password, PASSWORD_BCRYPT, $options);

  add_user($first_name, $last_name, $username, $enc_password, $email, $type);

  $response = array(
    "message" => "New user has been added successfully.",
    "status" => true
  );
  
  echo json_encode($response);
}
  
?>