<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once "../config/db_connect.php";

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request for CORS
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT c.*, t.Name AS Teacher_Name 
                FROM Course c LEFT JOIN Teacher t ON c.Teacher_ID = t.Teacher_ID 
                WHERE c.Course_ID = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $course = $stmt->fetch(PDO::FETCH_ASSOC);
            if($course) {
                echo json_encode(['status' => 'success', 'data' => $course]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Course not found']);
            }
        } else {
            $stmt = $conn->prepare("SELECT c.*, t.Name AS Teacher_Name 
                FROM Course c LEFT JOIN Teacher t ON c.Teacher_ID = t.Teacher_ID");
            $stmt->execute();
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $courses]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!isset($data->Course_ID) || !isset($data->Course_Name)) {
            echo json_encode(['status' => 'error', 'message' => 'Course ID and Name are required']);
            break;
        }
        try {
            $check = $conn->prepare("SELECT Course_ID FROM Course WHERE Course_ID = :id");
            $check->bindParam(':id', $data->Course_ID);
            $check->execute();
            if($check->rowCount() > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Course ID already exists']);
                break;
            }
            $stmt = $conn->prepare("INSERT INTO Course (Course_ID, Course_Name, Teacher_ID, Credits, Duration) 
                VALUES (:id, :name, :teacher, :credits, :duration)");
            $stmt->bindParam(':id', $data->Course_ID);
            $stmt->bindParam(':name', $data->Course_Name);
            $stmt->bindParam(':teacher', $data->Teacher_ID);
            $stmt->bindParam(':credits', $data->Credits);
            $stmt->bindParam(':duration', $data->Duration);
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Course added successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to add course']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!isset($data->Course_ID) || !isset($data->Course_Name)) {
            echo json_encode(['status' => 'error', 'message' => 'Course ID and Name are required']);
            break;
        }
        try {
            $stmt = $conn->prepare("UPDATE Course SET 
                Course_Name = :name, 
                Teacher_ID = :teacher, 
                Credits = :credits, 
                Duration = :duration 
                WHERE Course_ID = :id");
            $stmt->bindParam(':id', $data->Course_ID);
            $stmt->bindParam(':name', $data->Course_Name);
            $stmt->bindParam(':teacher', $data->Teacher_ID);
            $stmt->bindParam(':credits', $data->Credits);
            $stmt->bindParam(':duration', $data->Duration);
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Course updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update course']);
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if(!isset($_GET['id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Course ID is required']);
            break;
        }
        $id = $_GET['id'];
        try {
            $stmt = $conn->prepare("DELETE FROM Course WHERE Course_ID = :id");
            $stmt->bindParam(':id', $id);
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Course deleted successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete course']);
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
