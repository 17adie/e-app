<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/form.php");


$params = $_POST['params'];

// $params = $_GET; // for api testing

$category = $params['category'];

$data = [];

$check_category_name = check_category_name_duplicate($category);

if(!empty($check_category_name)) {
  $data = array(
    "category_name" => $check_category_name,
    "status" => false
  );

   echo json_encode($data);

} else {

  add_new_category($category);

  $response = array(
    "message" => "New form category has been added successfully.",
    "status" => true,
  );
  
  echo json_encode($response);
}
  
?>