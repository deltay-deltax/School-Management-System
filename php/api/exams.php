<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once "../config/db_connect.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT e.*, s.Name AS student_name, c.Course_Name 
                                  FROM Exam e 
                                  JOIN Student s ON e.Student_ID = s.Student_ID
                                  JOIN Course c ON e.Course_ID = c.Course_ID
                                  WHERE e.Exam_ID = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($exam ? ['status' => 'success', 'data' => $exam] : ['status' => 'error', 'message' => 'Record not found']);
        } else {
            $stmt = $conn->prepare("SELECT e.*, s.Name AS student_name, c.Course_Name 
                                  FROM Exam e 
                                  JOIN Student s ON e.Student_ID = s.Student_ID
                                  JOIN Course c ON e.Course_ID = c.Course_ID");
            $stmt->execute();
            echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        break;

    case 'POST':
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $required = ['Student_ID', 'Course_ID', 'Marks_Obtained', 'Exam_Date'];
        
        foreach($required as $field) {
            if(!isset($data->$field)) {
                echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
                exit;
            }
        }

        try {
            if($method === 'POST') {
                $stmt = $conn->prepare("INSERT INTO Exam (Student_ID, Course_ID, Marks_Obtained, Exam_Date) 
                                      VALUES (:sid, :cid, :marks, :date)");
            } else {
                $stmt = $conn->prepare("UPDATE Exam SET 
                                      Student_ID = :sid, 
                                      Course_ID = :cid, 
                                      Marks_Obtained = :marks, 
                                      Exam_Date = :date 
                                      WHERE Exam_ID = :id");
                $stmt->bindParam(':id', $data->Exam_ID);
            }
            
            $stmt->bindParam(':sid', $data->Student_ID);
            $stmt->bindParam(':cid', $data->Course_ID);
            $stmt->bindParam(':marks', $data->Marks_Obtained);
            $stmt->bindParam(':date', $data->Exam_Date);
            
            if($stmt->execute()) {
                $message = $method === 'POST' ? 'Exam recorded' : 'Exam updated';
                echo json_encode(['status' => 'success', 'message' => $message]);
            } else {
                throw new Exception('Database operation failed');
            }
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if(!isset($_GET['id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Exam ID required']);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("DELETE FROM Exam WHERE Exam_ID = :id");
            $stmt->bindParam(':id', $_GET['id']);
            echo $stmt->execute() ? 
                json_encode(['status' => 'success', 'message' => 'Record deleted']) :
                json_encode(['status' => 'error', 'message' => 'Delete failed']);
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
        break;
}
?>
