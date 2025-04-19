-- Create the database
CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- Create Student table
CREATE TABLE Student (
    Student_ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Age INT,
    Class VARCHAR(50),
    Contact_Number VARCHAR(15),
    Address TEXT
);

-- Create Teacher table
CREATE TABLE Teacher (
    Teacher_ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Subject VARCHAR(100),
    Contact_Number VARCHAR(15),
    Email VARCHAR(100),
    Salary DECIMAL(10, 2)
);

-- Create Course table
CREATE TABLE Course (
    Course_ID INT PRIMARY KEY,
    Course_Name VARCHAR(100) NOT NULL,
    Teacher_ID INT,
    Credits INT,
    Duration VARCHAR(50),
    FOREIGN KEY (Teacher_ID) REFERENCES Teacher(Teacher_ID) ON DELETE SET NULL
);

-- Create Attendance table
CREATE TABLE Attendance (
    Attendance_ID INT PRIMARY KEY AUTO_INCREMENT,
    Student_ID INT,
    Course_ID INT,
    Date DATE,
    Status ENUM('Present', 'Absent') DEFAULT 'Absent',
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Create Exam table
CREATE TABLE Exam (
    Exam_ID INT PRIMARY KEY AUTO_INCREMENT,
    Student_ID INT,
    Course_ID INT,
    Marks_Obtained DECIMAL(5, 2),
    Exam_Date DATE,
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Insert sample data into Student table
INSERT INTO Student (Student_ID, Name, Age, Class, Contact_Number, Address) VALUES
(1001, 'John Smith', 18, '12th', '9876543210', '123 Main St, City'),
(1002, 'Emma Johnson', 17, '11th', '8765432109', '456 Oak Ave, Town'),
(1003, 'Michael Brown', 16, '10th', '7654321098', '789 Pine Rd, Village'),
(1004, 'Sophia Davis', 18, '12th', '6543210987', '321 Elm St, City'),
(1005, 'William Wilson', 17, '11th', '5432109876', '654 Maple Dr, Town');

-- Insert sample data into Teacher table
INSERT INTO Teacher (Teacher_ID, Name, Subject, Contact_Number, Email, Salary) VALUES
(101, 'Dr. Robert Anderson', 'Mathematics', '9988776655', 'robert.anderson@school.edu', 75000.00),
(102, 'Prof. Jennifer Lee', 'Science', '8877665544', 'jennifer.lee@school.edu', 78000.00),
(103, 'Mr. David Miller', 'History', '7766554433', 'david.miller@school.edu', 65000.00),
(104, 'Ms. Patricia Clark', 'English', '6655443322', 'patricia.clark@school.edu', 68000.00),
(105, 'Dr. Thomas Wright', 'Computer Science', '5544332211', 'thomas.wright@school.edu', 80000.00);

-- Insert sample data into Course table
INSERT INTO Course (Course_ID, Course_Name, Teacher_ID, Credits, Duration) VALUES
(2001, 'Advanced Mathematics', 101, 4, '6 months'),
(2002, 'Physics', 102, 4, '6 months'),
(2003, 'World History', 103, 3, '4 months'),
(2004, 'English Literature', 104, 3, '4 months'),
(2005, 'Programming Fundamentals', 105, 5, '8 months');

-- Insert sample data into Attendance table
INSERT INTO Attendance (Student_ID, Course_ID, Date, Status) VALUES
(1001, 2001, '2025-04-15', 'Present'),
(1001, 2002, '2025-04-15', 'Present'),
(1002, 2001, '2025-04-15', 'Absent'),
(1002, 2003, '2025-04-15', 'Present'),
(1003, 2002, '2025-04-15', 'Present'),
(1003, 2005, '2025-04-15', 'Present'),
(1004, 2004, '2025-04-15', 'Absent'),
(1004, 2005, '2025-04-15', 'Present'),
(1005, 2003, '2025-04-15', 'Present'),
(1005, 2004, '2025-04-15', 'Present');

-- Insert sample data into Exam table
INSERT INTO Exam (Student_ID, Course_ID, Marks_Obtained, Exam_Date) VALUES
(1001, 2001, 92.5, '2025-03-15'),
(1001, 2002, 88.0, '2025-03-18'),
(1002, 2001, 78.5, '2025-03-15'),
(1002, 2003, 85.0, '2025-03-20'),
(1003, 2002, 90.0, '2025-03-18'),
(1003, 2005, 95.5, '2025-03-22'),
(1004, 2004, 82.0, '2025-03-19'),
(1004, 2005, 88.5, '2025-03-22'),
(1005, 2003, 79.0, '2025-03-20'),
(1005, 2004, 91.5, '2025-03-19');
