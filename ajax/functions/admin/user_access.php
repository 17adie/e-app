<?php

function get_users($offset, $search, $sort_by, $sort_direction){

  $query = "SELECT
              tbl_id,
              first_name,
              last_name,
              username,
              email
            FROM user_tbl
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(username,email,CONCAT(first_name, ' ', last_name)) LIKE CONCAT(:search)
              END
              AND `type` != 'admin'

            ORDER BY
              CASE WHEN :sort_direction = 'asc'
                THEN
                  CASE :sort_by
                  WHEN 'tbl_id' THEN tbl_id
                  WHEN 'first_name' THEN first_name
                  WHEN 'last_name' THEN last_name
                  WHEN 'username' THEN username
                  WHEN 'email' THEN email
                  END
              END ASC,
              CASE WHEN :sort_direction = 'desc'
                THEN
                  CASE :sort_by
                  WHEN 'tbl_id' THEN tbl_id
                  WHEN 'first_name' THEN first_name
                  WHEN 'last_name' THEN last_name
                  WHEN 'username' THEN username
                  WHEN 'email' THEN email
                  END
              END DESC
            LIMIT 10 OFFSET :offset
            ";



  try{
    $db = getConnection();
    $search = "%".$search."%";
    $statement = $db->prepare($query);
    $statement->bindParam(':offset', $offset, PDO::PARAM_INT);
    $statement->bindParam(':search', $search);
    $statement->bindParam(':sort_direction', $sort_direction);
    $statement->bindParam(':sort_by', $sort_by);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}


function get_users_count($search){

  $query = "SELECT count(*) FROM user_tbl 
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(username,email,CONCAT(first_name, ' ', last_name)) LIKE CONCAT(:search)
              END
              AND `type` != 'admin'
          ";
  try{
    $db = getConnection();
    $search = "%".$search."%";
    $statement = $db->prepare($query);
    $statement->bindParam(':search', $search);
    $statement->execute();
    $response = $statement->fetchColumn(); // to return exact number
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}



?>