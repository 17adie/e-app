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


if( isset($_POST['data']) ) {

  //Create an instance; passing `true` enables exceptions
  $mail = new PHPMailer(true);

  date_default_timezone_set('Asia/Manila');

  $data = $_POST['data'];

  $subject = $data['doc_title'];
  $issued_by = $data['issued_by'];
  $tos = $data['email_to'];
  $trans_no = $data['trans_no'];
  $form = $data['form_name'];
  $process_remarks = $data['process_remarks'];

  $eapp_page = '<a href="'. E_WEB .'" target="_blank">E-Approvals</a>';
  $date_today = date("Y-m-d h:i:sa");
  
  $mes = "Greetings! <br><br>" .
         "There has been an update with regards to the proccessing of your document request. <br><br>" . 
         "Issued by: <strong>" . $issued_by . "</strong><br>" . 
         "Document Transaction ID: <strong>" . $trans_no . "</strong><br>" . 
         "Document: <strong>" . $form . "</strong><br>" . 
         "Remarks: <strong>" . $process_remarks . "</strong><br>" . 
         "Date: <strong>" . $date_today . "</strong><br><br><br>" . 
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
    $mail->Subject = "E-Approval Document Processing Update: Document Rejected";
    $mail->Body    = $mes;

    
    foreach($tos as $to){
      $mail->addAddress($to);              // Add a recipient
    }

    $mail->send();
   
    // echo 'Message has been sent';
    echo $mail;
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
  

}else{

  die('Missing parameters');

}




