<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

include '../db.php';

$params = $_POST['params'];
$procedure_name = $_POST['procedure_name'];


#$data = "'".implode("','",$params)."'";

$offset = $params['_limit_offset'];
$date_from = $params['_date_from'];
$date_to = $params['_date_to'];
$date_year = $params['_date_year'];
// $sort_direction = $params['_sort_direction'];


$query = "CALL `$procedure_name`(:offset,:date_from,:date_to,:date_year,@_total_count)";

try{
    $db = getConnection();

    $statement = $db->prepare($query);
    $statement->bindParam(':offset', $offset);
    $statement->bindParam(':date_from', $date_from);
    $statement->bindParam(':date_to', $date_to);
    $statement->bindParam(':date_year', $date_year);
    // $statement->bindParam(':sort_by', $sort_by);

// call the stored procedure
    $statement->execute();
    $resp = $statement->fetchAll(PDO::FETCH_ASSOC);
// fetch the output
    $statement->closeCursor();

    $response = $db->query('SELECT @_total_count AS _total_count')->fetch(PDO::FETCH_ASSOC);

    $row = array(
        "_total_count" => $response['_total_count'],
        "data" => $resp
    );

    #var_dump($response['_total_count']);

//    return $response;
    echo json_encode($row);
} catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
}