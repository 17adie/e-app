
<?php
header('Access-Control-Allow-Origin: *');


if(isset($_POST['subject']) && isset($_POST['message']) && isset($_POST['to'])){

  $subject = $_POST['subject'];
  $message = $_POST['message'];
  $to = $_POST['to'];
  $cc = $_POST['cc'];

  var_dump($subject . ' ' . $message . ' ' . $to . ' ' . $cc);

}else{

  die('Missing parameters');

}


?>