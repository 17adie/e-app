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

if(isset($_POST['subject']) && isset($_POST['message']) && isset($_POST['to'])){

  //Create an instance; passing `true` enables exceptions
  $mail = new PHPMailer(true);

  $subject = $_POST['subject'];
  $message = $_POST['message'];
  $tos = $_POST['to'];
  $ccs = $_POST['cc'];
  $trans_no = $_POST['trans_no'];
  $date_needed = $_POST['date_needed'];
  $requestor = $_POST['requestor'];

  $mes = "Trans No.: " . $trans_no . "<br>" . "Requestor: " . $requestor . "<br>" . "Date Needed: " . $date_needed . "<br>" . "Message: " . $message;

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
    $mail->Subject = $subject;
    $mail->Body    = $mes;

    
    foreach($tos as $to){
      $mail->addAddress($to);              // Add a recipient
    }
    foreach($ccs as $cc){
      $mail->addCC($cc);              // Add a recipient
    }

    $mail->send();
   
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
  

}else{

  die('Missing parameters');

}




