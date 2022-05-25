<?php
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



  //Create an instance; passing `true` enables exceptions
  $mail = new PHPMailer(true);

  date_default_timezone_set('Asia/Manila');

  $subject = 'SUBJECT';
  $message = 'MESSAGE';
  $tos = array('adief17@gmail.com');
  $trans_no = 'TRANS NUMBER';
  $date_needed = 'DATE';
  $requestor = 'REQUESTOR';
  $eapp_page = '<a href="'. E_WEB .'" target="_blank">E-Approvals</a>';
  $date_request = date("Y-m-d h:i:sa");
  $form = 'FORM NAME';

  $mes = "Greetings! <br><br>" .
         "Please be informed that an E-Approval document awaits your approval. <br><br>" . 
         "Trans No.: <strong>" . $trans_no . "</strong><br>" . 
         "Requestor: <strong>" . $requestor . "</strong><br>" . 
         "Form: <strong>" . $form . "</strong><br>" . 
         "Document Title: <strong>" . $subject . "</strong><br>" . 
         "Message: <strong>" . $message . "</strong><br>" . 
         "Date Needed: <strong>" . $date_needed . "</strong><br>" . 
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
    $mail->Subject = "E-Approval Pending Document: " . $subject;
    $mail->Body    = $mes;

    
    foreach($tos as $to){
      $mail->addAddress($to);              // Add a recipient
    }

    $mail->send();
   
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
  






