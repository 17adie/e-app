<?php
// EMAIL NOTIFICATION FROM APPROVER TO REQUESTOR

header('Access-Control-Allow-Origin: *');

include 'get_credential_phpmailer.php';

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require('PHPMailer/Exception.php');
require('PHPMailer/SMTP.php');
require('PHPMailer/PHPMailer.php');

//Load Composer's autoloader
// require 'vendor/autoload.php';


if( isset($_POST['data']) ) {

  //Create an instance; passing `true` enables exceptions
  $mail = new PHPMailer(true);

  date_default_timezone_set('Asia/Manila');

  $data = $_POST['data'];
  $subject = $data['doc_title'];
  $message = $data['req_message'];
  $tos = $data['email_to'];
  $trans_no = $data['trans_no'];
  $requestor = $data['requestor'];
  $eapp_page = '<a href="'. E_WEB .'" target="_blank">E-Approvals</a>';
  $date_request = $data['date_request'];
  $form = $data['form_name'];
  $approver_remarks = $data['approver_remarks'];

  $mes = "Greetings! <br><br>" .
         "Please be informed that one of the documents that you've requested has beed approved. <br><br>" . 
         "Requestor: <strong>" . $requestor . "</strong><br>" . 
         "Trans No.: <strong>" . $trans_no . "</strong><br>" . 
         "Form: <strong>" . $form . "</strong><br>" . 
         "Document Title: <strong>" . $subject . "</strong><br>" . 
         "Requestor's Message: <strong>" . $message . "</strong><br>" . 
         "Remarks: <strong>" . $approver_remarks . "</strong><br>" . 
         "Date Requested: <strong>" . $date_request . "</strong><br><br><br>" . 
         "To proceed with the transaction, please go to: " . $eapp_page . " page. <br><br><br>" .
         "This is a system-generated email, please do not reply."
         ;

  try {
    //Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = E_HOST;                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = EMAIL;                     //SMTP username
    $mail->Password   = PASS;                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = E_PORT;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->setFrom(EMAIL, 'E-APP NOTIFICATION');
    $mail->Subject = "E-Approval Document Status Update : Document Approved";
    $mail->Body    = $mes;

    
    foreach($tos as $to){
      $mail->addAddress($to);              // Add a recipient
    }

    $mail->send();
   
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
  

}else{

  die('Missing parameters');

}




