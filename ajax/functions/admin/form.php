<?php

function add_new_category($category){

  $query = "INSERT INTO form_category_tbl (`category`, `date_added`, `form_status`) 
            VALUES (:category, NOW(), 1)
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":category" => $category
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }


}

function check_category_name_duplicate($category){

  $query = "SELECT category
            FROM form_category_tbl 
            WHERE UPPER(TRIM(category)) = UPPER(TRIM(:category))
            LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':category', $category);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function get_category(){

  $query = "SELECT DISTINCT
              tbl_id,
              category,
              form_status
            FROM form_category_tbl WHERE form_status = 1
            ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function get_form_details($tbl_id){

  $query = "SELECT
              tbl_id,
              category,
              form_code,
              form,
              `url`,
              form_status
            FROM forms_tbl WHERE tbl_id = :tbl_id LIMIT 1
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':tbl_id', $tbl_id);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function update_filename($filename, $tbl_id){

  $query = "UPDATE forms_tbl 
            SET 
              `url` = :filename
            WHERE tbl_id = :tbl_id LIMIT 1
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":filename" => $filename,
        ":tbl_id" => $tbl_id
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function update_form($category, $form_code, $form, $tbl_id){

  $query = "UPDATE forms_tbl 
            SET 
              `category` = :category, 
              `form_code` = :form_code,
              `form` = :form
            WHERE tbl_id = :tbl_id LIMIT 1
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":category" => $category,
        ":form_code" => $form_code,
        ":form" => $form,
        ":tbl_id" => $tbl_id
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function add_new_form($category, $form_code, $form){

  $query = "INSERT INTO forms_tbl (category, form_code, form, `form_status`) 
            VALUES (:category, :form_code, :form, 1)
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":category" => $category,
        ":form_code" => $form_code,
        ":form" => $form
        )
    );

    // get last inserted ID
    $lastId = $db->lastInsertId();

    return $lastId;

  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }


}

function check_form_name_duplicate($form, $tbl_id){

  $query = "SELECT tbl_id, form
            FROM forms_tbl 
            WHERE UPPER(TRIM(form)) = UPPER(TRIM(:form))
            AND tbl_id != :tbl_id
            LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':form', $form);
    $statement->bindParam(':tbl_id', $tbl_id);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function check_form_code_duplicate($form_code, $tbl_id){

  $query = "SELECT tbl_id, form
            FROM forms_tbl 
            WHERE UPPER(TRIM(form_code)) = UPPER(TRIM(:form_code))
            AND tbl_id != :tbl_id
            LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':form_code', $form_code);
    $statement->bindParam(':tbl_id', $tbl_id);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

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