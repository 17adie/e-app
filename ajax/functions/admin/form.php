<?php

function get_forms($offset, $search, $sort_by, $sort_direction){

  $query = "SELECT
              tbl_id,
              category,
              form_code,
              form
            FROM forms_tbl
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(category,form_code,form) LIKE CONCAT(:search)
              END
              AND form_status = 1

            ORDER BY
              CASE WHEN :sort_direction = 'asc'
                THEN
                  CASE :sort_by
                  WHEN 'tbl_id' THEN tbl_id
                  WHEN 'category' THEN category
                  WHEN 'form_code' THEN form_code
                  WHEN 'form' THEN form
                  END
              END ASC,
              CASE WHEN :sort_direction = 'desc'
                THEN
                  CASE :sort_by
                  WHEN 'tbl_id' THEN tbl_id
                  WHEN 'category' THEN category
                  WHEN 'form_code' THEN form_code
                  WHEN 'form' THEN form
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


function get_forms_count($search){

  $query = "SELECT count(*) FROM forms_tbl 
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(category,form_code,form) LIKE CONCAT(:search)
              END
              AND form_status = 1
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