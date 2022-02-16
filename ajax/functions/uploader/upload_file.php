<?php
if ( 0 < $_FILES['file']['error'] ) {
    echo 'Error: ' . $_FILES['file']['error'] . '<br>';
}
else {


    $upload_path = "../../../uploads/";

    if (!file_exists($upload_path)) {
        mkdir($upload_path, 0777, true);
    }

    $filename = uniqid() . '^' . $_FILES['file']['name'];

    $destination = $upload_path . $filename;

    move_uploaded_file($_FILES['file']['tmp_name'], $destination);

    echo $filename;

}

?>