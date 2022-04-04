<?php
header('Access-Control-Allow-Origin: *');
include '../get_credential_phpmailer.php';

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require('../PHPMailer/Exception.php');
require('../PHPMailer/SMTP.php');
require('../PHPMailer/PHPMailer.php');


function getData(){
  $query = "SELECT
              da.tbl_id as id,
              a.trans_no,
              concat(uu.last_name, ', ', uu.first_name) as requestor,
              f.form,
              a.document_title,
              a.requestor_message,
              a.date_needed,
              a.date_request,
              concat(u.last_name, ', ' , u.first_name) as approver,
              u.email,
              date_sub(a.date_needed, interval 2 day) as day
            FROM approval_tbl a
            LEFT JOIN document_approver_tbl da ON a.tbl_id = da.approval_id 
            LEFT JOIN user_tbl u ON da.approver_id = u.tbl_id
            LEFT JOIN user_tbl uu ON a.requestor_id = uu.tbl_id
            LEFT JOIN forms_tbl f ON a.form_code = f.form_code

            WHERE da.status = 0 AND a.status = 0
            AND date_sub(a.date_needed, interval 2 day) = curdate()
            AND da.email_reminder_tag IS NULL
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

function UpdateTagging($id){
 
  $query = "UPDATE document_approver_tbl
            SET 
              email_reminder_tag = 1,
              email_reminder_date = NOW()
            WHERE tbl_id = :id";

  try {
      $db         = getConnection();
      $statement  = $db->prepare($query);     
      $statement->execute(
          array(
              ":id" => $id
              )
      );
  } catch (PDOException $e) {
      echo '{"error":{"text" ' . __FUNCTION__ . ':' . $e->getMessage() . '}}';
  }
}

$data = getData();

if($data) {

  date_default_timezone_set('Asia/Manila');

  foreach($data as $row) {

    //Create an instance; passing `true` enables exceptions
    $mail = new PHPMailer(true);
    
    $eapp_page = '<a href="'. E_WEB .'" target="_blank">E-Approvals</a>';
  
    $mes = "Greetings! <br><br>" .
         "You may have overlooked an E-Approval document that awaits your approval. <br><br>" . 
         "Trans No.: <strong>" . $row->trans_no . "</strong><br>" . 
         "Requestor: <strong>" . $row->requestor . "</strong><br>" . 
         "Form: <strong>" . $row->form . "</strong><br>" . 
         "Document Title: <strong>" . $row->document_title . "</strong><br>" . 
         "Message: <strong>" . $row->requestor_message . "</strong><br>" . 
         "Date Needed: <strong>" . $row->date_needed . "</strong><br>" . 
         "Date Requested: <strong>" . $row->date_request . "</strong><br><br><br>" . 
         "To proceed with the transaction, please go to: " . $eapp_page . " page. <br><br><br>" .
         "This is a system-generated email, please do not reply."
         ;
  
    try {
      //Server settings
      $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
      $mail->isSMTP();                                            //Send using SMTP
      $mail->Host       = E_HOST;                                 //Set the SMTP server to send through
      $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
      $mail->Username   = EMAIL;                                  //SMTP username
      $mail->Password   = PASS;                                   //SMTP password
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
      $mail->Port       = E_PORT;                                 //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
  
      $mail->isHTML(true);                                       //Set email format to HTML
      $mail->setFrom(EMAIL, 'E-APP NOTIFICATION');
      $mail->Subject = "E-Approval Follow-Up: " . $row->document_title;
      $mail->Body    = $mes;
      
      $mail->addAddress($row->email);                             // Add a recipient
  
      $mail->send();

      UpdateTagging($row->id);
      
      echo 'Message has been sent' . ' ' . $row->trans_no . ' ' . $row->email;
  } catch (Exception $e) {
      echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
  }

  }

  // echo json_encode($data);

} else {

  die('no data');

}


?>