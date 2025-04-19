<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection parameters
$host = 'localhost';
$db_name = 'school_management';
$username = 'root'; 
$password = ''; 

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Uncomment for debugging
    // echo "Connected successfully";
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => "Connection failed: " . $e->getMessage()]);
    die();
}
?>
