<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/form.php");


$params = $_POST['params'];

// $params = $_GET; // for api testing

$category = $params['category'];
$form_code = $params['form_code'];
$form_name = $params['form_name'];
// $url = $params['url'];
$tbl_id = $params['tbl_id'];

$data = [];

$check_form_name = check_form_name_duplicate($form_name, $tbl_id);
$check_form_code = check_form_code_duplicate($form_code, $tbl_id);

if(!empty($check_form_code) || !empty($check_form_name) ) {
  $data = array(
    "form_name" => $check_form_name,
    "form_code" => $check_form_code,
    "status" => false
  );

   echo json_encode($data);

} else {

  update_form($category, $form_code, $form_name, $tbl_id);

  $response = array(
    "message" => "Form has been updated successfully.",
    "status" => true
  );
  
  echo json_encode($response);
}
  
?>