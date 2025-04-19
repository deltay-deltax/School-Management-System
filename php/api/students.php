<?php
// Enable error reporting
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
        // Get all students or a specific student
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM Student WHERE Student_ID = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($student) {
                echo json_encode(['status' => 'success', 'data' => $student]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Student not found']);
            }
        } else {
            $stmt = $conn->prepare("SELECT * FROM Student");
            $stmt->execute();
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $students]);
        }
        break;
        
    case 'POST':
        // Create a new student
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->Student_ID) || !isset($data->Name)) {
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            break;
        }
        
        try {
            $stmt = $conn->prepare("INSERT INTO Student (Student_ID, Name, Age, Class, Contact_Number, Address) 
                                    VALUES (:id, :name, :age, :class, :contact, :address)");
            
            $stmt->bindParam(':id', $data->Student_ID);
            $stmt->bindParam(':name', $data->Name);
            $stmt->bindParam(':age', $data->Age);
            $stmt->bindParam(':class', $data->Class);
            $stmt->bindParam(':contact', $data->Contact_Number);
            $stmt->bindParam(':address', $data->Address);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Student created successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to create student']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Update a student
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->Student_ID)) {
            echo json_encode(['status' => 'error', 'message' => 'Student ID is required']);
            break;
        }
        
        try {
            $stmt = $conn->prepare("UPDATE Student SET Name = :name, Age = :age, Class = :class, 
                                    Contact_Number = :contact, Address = :address 
                                    WHERE Student_ID = :id");
            
            $stmt->bindParam(':id', $data->Student_ID);
            $stmt->bindParam(':name', $data->Name);
            $stmt->bindParam(':age', $data->Age);
            $stmt->bindParam(':class', $data->Class);
            $stmt->bindParam(':contact', $data->Contact_Number);
            $stmt->bindParam(':address', $data->Address);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Student updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update student']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Delete a student
        if(!isset($_GET['id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Student ID is required']);
            break;
        }
        
        $id = $_GET['id'];
        
        try {
            $stmt = $conn->prepare("DELETE FROM Student WHERE Student_ID = :id");
            $stmt->bindParam(':id', $id);
            
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Student deleted successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete student']);
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
