<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Hide PHP warnings/notices from output (prevents breaking JSON)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

try {
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
                $stmt = $conn->prepare("SELECT a.*, s.Name AS student_name, c.Course_Name 
                                        FROM attendance a 
                                        JOIN student s ON a.Student_ID = s.Student_ID
                                        JOIN course c ON a.Course_ID = c.Course_ID
                                        WHERE a.Attendance_ID = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($attendance ? ['status' => 'success', 'data' => $attendance] : ['status' => 'error', 'message' => 'Record not found']);
            } else {
                $stmt = $conn->prepare("SELECT a.*, s.Name AS student_name, c.Course_Name 
                                        FROM attendance a 
                                        JOIN student s ON a.Student_ID = s.Student_ID
                                        JOIN course c ON a.Course_ID = c.Course_ID");
                $stmt->execute();
                echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;

        case 'POST':
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            $required = ['Student_ID', 'Course_ID', 'Date', 'Status'];
            foreach($required as $field) {
                if(!isset($data->$field)) {
                    echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
                    exit;
                }
            }
            if($method === 'POST') {
                $stmt = $conn->prepare("INSERT INTO attendance (Student_ID, Course_ID, Date, Status) 
                                        VALUES (:sid, :cid, :date, :status)");
            } else {
                $stmt = $conn->prepare("UPDATE attendance SET 
                                        Student_ID = :sid, 
                                        Course_ID = :cid, 
                                        Date = :date, 
                                        Status = :status 
                                        WHERE Attendance_ID = :id");
                $stmt->bindParam(':id', $data->Attendance_ID);
            }
            $stmt->bindParam(':sid', $data->Student_ID);
            $stmt->bindParam(':cid', $data->Course_ID);
            $stmt->bindParam(':date', $data->Date);
            $stmt->bindParam(':status', $data->Status);
            if($stmt->execute()) {
                $message = $method === 'POST' ? 'Attendance recorded' : 'Attendance updated';
                echo json_encode(['status' => 'success', 'message' => $message]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Database operation failed']);
            }
            break;

        case 'DELETE':
            if(!isset($_GET['id'])) {
                echo json_encode(['status' => 'error', 'message' => 'Attendance ID required']);
                exit;
            }
            $stmt = $conn->prepare("DELETE FROM attendance WHERE Attendance_ID = :id");
            $stmt->bindParam(':id', $_GET['id']);
            if($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Record deleted']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Delete failed']);
            }
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}
?>
