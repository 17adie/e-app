<?php
header('Access-Control-Allow-Origin: *');

if(isset($_POST['str']) && isset($_POST['hash'])){

    $str = $_POST['str'];

    $hash = $_POST['hash'];

    if (password_verify($str, $hash)) {

        echo 1;

    } else {

        echo 0;

    }

}else{

    die('Missing parameters');

}

