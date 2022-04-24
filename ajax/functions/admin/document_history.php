<?php

function get_document_history($offset, $search, $sort_by, $sort_direction){

  $query = "SELECT
              dn.tbl_id as notification_id,
              dn.read_status,
              a.tbl_id,
              f.category,
              concat(u.first_name, ' ', u.last_name) AS requestor,
              date(a.date_request) AS date_request,
                  a.trans_no,
                  u.email,
                  f.form,
                  a.document_title,
                  a.issued_tag,
                  a.rejected_tag,
                  IF(a.status = 3, 3 , ( SELECT 
                  IF( find_in_set(2, group_concat(da.status)) > 0 , 2 , IF(sum(da.status) = count(da.tbl_id) , 1, 0))
                        -- 3 = cancelled 2 = Disapproved, 1 = Approved, 0 = Ongoing
                  FROM document_approver_tbl da
                  WHERE da.approval_id = a.tbl_id
                  )) as docs_status # get document status from document_approver_tbl
                  
            FROM document_notification_tbl dn
              LEFT JOIN approval_tbl a ON dn.approval_id = a.tbl_id
              LEFT JOIN user_tbl u ON a.requestor_id = u.tbl_id
              LEFT JOIN forms_tbl f ON a.form_code = f.form_code
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(category,trans_no,CONCAT(u.first_name, ' ', u.last_name)) LIKE CONCAT(:search)
              END

            ORDER BY
              CASE WHEN :sort_direction = 'asc'
                THEN
                  CASE :sort_by
                -- WHEN 'read_status' THEN dn.read_status
                WHEN 'trans_no' THEN a.trans_no
                WHEN 'category' THEN category
                WHEN 'docs_status' THEN FIELD(docs_status, 1, 0 , 2, 3)
                WHEN 'requestor' THEN requestor
                WHEN 'date_request' THEN date_request
                #WHEN 'date_approved' THEN date_approved
              
                  END
              END ASC,
              CASE WHEN :sort_direction = 'desc'
                THEN
                  CASE :sort_by
                -- WHEN 'read_status' THEN dn.read_status
                WHEN 'trans_no' THEN a.trans_no
                WHEN 'category' THEN category
                WHEN 'docs_status' THEN FIELD(docs_status, 1, 0 , 2, 3)
                WHEN 'requestor' THEN requestor
                WHEN 'date_request' THEN date_request
                #WHEN 'date_approved' THEN date_approved

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


function get_document_history_count($search){

  $query = "SELECT count(*) FROM document_notification_tbl dn
              LEFT JOIN approval_tbl a ON dn.approval_id = a.tbl_id
              LEFT JOIN user_tbl u ON a.requestor_id = u.tbl_id
              LEFT JOIN forms_tbl f ON a.form_code = f.form_code
            WHERE
              CASE WHEN :search IS NULL OR :search = '' THEN
                1 = 1
              ELSE
                CONCAT(category,trans_no,CONCAT(u.first_name, ' ', u.last_name)) LIKE CONCAT(:search)
              END
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