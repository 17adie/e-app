<?php

function update_user($first_name, $last_name, $email, $type, $tbl_id){

  $query = "UPDATE user_tbl 
            SET 
              `first_name` = :first_name, 
              `last_name` = :last_name,
              `email` = :email, 
              `type` = :type
            WHERE tbl_id = :tbl_id
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":first_name" => $first_name,
        ":last_name" => $last_name,
        ":email" => $email,
        ":type" => $type,
        ":tbl_id" => $tbl_id
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }


}

function add_user($first_name, $last_name, $username, $password, $email, $type){

  $query = "INSERT INTO user_tbl (`first_name`, `last_name`, `username`, `password`, `email`, `type`, `status`) 
            VALUES (:first_name, :last_name, :username, :password, :email, :type, 1)
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":first_name" => $first_name,
        ":last_name" => $last_name,
        ":username" => $username,
        ":password" => $password,
        ":email" => $email,
        ":type" => $type,
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }


}

function check_user_duplicate_name($first_name, $last_name, $tbl_id){

  $query = "SELECT tbl_id, first_name, last_name
            FROM user_tbl 
            WHERE UPPER( CONCAT( TRIM(first_name),TRIM(last_name) )) = UPPER( CONCAT( TRIM(:first_name),TRIM(:last_name) )) 
            AND tbl_id != :tbl_id
            LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':first_name', $first_name);
    $statement->bindParam(':last_name', $last_name);
    $statement->bindParam(':tbl_id', $tbl_id);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function check_user_duplicate_username($username){

  $query = "SELECT tbl_id, username
            FROM user_tbl 
            WHERE UPPER(TRIM(username)) = UPPER(TRIM(:username)) LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':username', $username);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}

function check_user_duplicate_email($email, $tbl_id){

  $query = "SELECT tbl_id, email
            FROM user_tbl 
            WHERE UPPER(TRIM(email)) = UPPER(TRIM(:email))
            AND tbl_id != :tbl_id
            LIMIT 1;
            ";

  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->bindParam(':email', $email);
    $statement->bindParam(':tbl_id', $tbl_id);
    $statement->execute();
    $response = $statement->fetchAll(PDO::FETCH_OBJ);
    return $response;
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }

}


function get_user_details($tbl_id){

  $query = "SELECT
              tbl_id,
              first_name,
              last_name,
              username,
              email,
              `status`,
              `type`
            FROM user_tbl WHERE tbl_id = :tbl_id LIMIT 1
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

function get_users($offset, $search, $sort_by, $sort_direction){

  $query = "SELECT
              tbl_id,
              first_name,
              last_name,
              username,
              email,
              `status`,
              `type`
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
                  WHEN 'status' THEN `status`
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
                  WHEN 'status' THEN `status`
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


function update_user_status($tbl_id, $stat){

  $query = "UPDATE user_tbl SET `status` = :stat WHERE tbl_id = :tbl_id
          ";
  try{
    $db = getConnection();
    $statement = $db->prepare($query);
    $statement->execute(
      array(
        ":tbl_id" => $tbl_id,
        ":stat" => $stat
        )
    );
  } catch(PDOException $e){
    echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }


}



?>