<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

include '../db.php';

ob_start();

$procedure_name = $_POST['procedure_name'];

$query = "CALL `$procedure_name`()";

try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);


    ob_end_flush();


} catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
}