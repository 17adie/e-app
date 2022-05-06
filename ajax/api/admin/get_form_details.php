<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/form.php");

$params = $_POST['params'];

$tbl_id = $params['tbl_id'];

$data = get_form_details($tbl_id);

echo json_encode($data);

?>