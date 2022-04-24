<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

require("../../db.php");
require("../../functions/admin/document_history.php");


$params = $_POST['params'];

$offset = $params['_limit_offset'];
$search = $params['_search_string'];
$sort_by = $params['_sort_by'];
$sort_direction = $params['_sort_direction'];

$data = get_document_history($offset, $search, $sort_by, $sort_direction);
$count = get_document_history_count($search);

$data = array(
  "data" => $data,
  "_total_count" => $count
);


echo json_encode($data);


?>