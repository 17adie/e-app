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

if( isset($_POST['data']) ){

  //Create an instance; passing `true` enables exceptions
  $mail = new PHPMailer(true);


  $data = $_POST['data'];
  $subject = $data['doc_title'];
  $requestor = $data['requestor'];
  $tos = $data['email_to'];
  $eapp_page = '<a href="'. E_WEB .'" target="_blank">E-Approvals</a>';

  $mes = "Greetings! <br><br>" .
         "<strong>" . $requestor . "</strong> has notified you that <strong>" . $subject . "</strong> is now submitted for approval. <br><br>" . 
         "Further updates will be sent once there are changes on it's status. <br><br>" . 
         "You may view the details by logging in to your E-Approval account by clicking: " . $eapp_page . "<br><br><br>" .
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
    $mail->Subject = "E-Approval Notification " . $subject;
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




