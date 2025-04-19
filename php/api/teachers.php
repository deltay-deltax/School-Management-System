<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include_once "../config/db_connect.php";

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM Teacher WHERE Teacher_ID = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($teacher) {
                echo json_encode(['status' => 'success', 'data' => $teacher]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Teacher not found']);
            }
        } else {
            $stmt = $conn->prepare("SELECT * FROM Teacher");
            $stmt->execute();
            $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $teachers]);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->Teacher_ID) || !isset($data->Name)) {
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            break;
        }
        
        try {
            $stmt = $conn->prepare("INSERT INTO Teacher 
                (Teacher_ID, Name, Subject, Contact_Number, Email, Salary) 
                VALUES (:id, :name, :subject, :contact, :email, :salary)");
            
            $stmt->bindParam(':id', $data->Teacher_ID);
            $stmt->bindParam(':name', $data->Name);
            $stmt->bindParam(':subject', $data->Subject);
            $stmt->bindParam(':contact', $data->Contact_Number);
            $stmt->bindParam(':email', $data->Email);
            $stmt->bindParam(':salary', $data->Salary);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Teacher created successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to create teacher']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->Teacher_ID)) {
            echo json_encode(['status' => 'error', 'message' => 'Teacher ID is required']);
            break;
        }
        
        try {
            $stmt = $conn->prepare("UPDATE Teacher SET 
                Name = :name, 
                Subject = :subject, 
                Contact_Number = :contact, 
                Email = :email, 
                Salary = :salary 
                WHERE Teacher_ID = :id");
            
            $stmt->bindParam(':id', $data->Teacher_ID);
            $stmt->bindParam(':name', $data->Name);
            $stmt->bindParam(':subject', $data->Subject);
            $stmt->bindParam(':contact', $data->Contact_Number);
            $stmt->bindParam(':email', $data->Email);
            $stmt->bindParam(':salary', $data->Salary);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Teacher updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update teacher']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        if(!isset($_GET['id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Teacher ID is required']);
            break;
        }
        
        $id = $_GET['id'];
        
        try {
            $stmt = $conn->prepare("DELETE FROM Teacher WHERE Teacher_ID = :id");
            $stmt->bindParam(':id', $id);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Teacher deleted successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete teacher']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
        break;
}
?>
