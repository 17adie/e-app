<?php

if(isset($_POST['str'])){

    $str = $_POST['str'];

    $options = [
        'cost' => 11
    ];

    die(password_hash($str, PASSWORD_BCRYPT, $options));

}else{

    die('Missing parameters');

}



    // $str = '123qwe';

    // $options = [
    //     'cost' => 11
    // ];

    // echo die(password_hash($str, PASSWORD_BCRYPT, $options));
