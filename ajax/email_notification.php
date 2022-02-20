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

  try {
    //Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.gmail.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = EMAIL;                     //SMTP username
    $mail->Password   = PASS;                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->setFrom('forprojects.2022@gmail.com', 'E-APP NOTIFICATION');
    $mail->Subject = $subject;
    $mail->Body    = $message;

    // $mail->addAttachment('uploads/'. $main_atch, 'Main Document');
    // if($sup_atch) {
    //   $mail->addAttachment('uploads/'. $sup_atch, 'Supporting Document');
    // }

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




