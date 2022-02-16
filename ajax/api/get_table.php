<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Accept: application/json");

include '../db.php';

$params = $_POST['params'];
$procedure_name = $_POST['procedure_name'];


#$data = "'".implode("','",$params)."'";

$offset = $params['_limit_offset'];
$search = $params['_search_string'];
$sort_by = $params['_sort_by'];
$sort_direction = $params['_sort_direction'];


$query = "CALL `$procedure_name`(:offset,:search,:sort_direction,:sort_by, @_total_count)";

try{
    $db = getConnection();

    $statement = $db->prepare($query);
    $statement->bindParam(':offset', $offset);
    $statement->bindParam(':search', $search);
    $statement->bindParam(':sort_direction', $sort_direction);
    $statement->bindParam(':sort_by', $sort_by);

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