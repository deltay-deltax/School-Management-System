document.addEventListener("DOMContentLoaded", function () {
  loadExams();
  loadStudentCourseDropdowns();

  const examForm = document.getElementById("exam-form");
  if (examForm) {
    examForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitExamForm();
    });
  }

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  const searchInput = document.getElementById("search-exam");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterExams(this.value.toLowerCase());
    });
  }
});

// Load all exams
function loadExams() {
  const examsList = document.getElementById("exams-list");
  if (examsList) {
    examsList.innerHTML =
      '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
  }

  fetch("php/api/exams.php")
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || "Failed to load exams");
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "success") {
        displayExams(data.data);
      } else {
        throw new Error(data.message || "Failed to load exams");
      }
    })
    .catch((error) => {
      console.error("Error loading exams:", error);
      if (examsList) {
        examsList.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
      }
    });
}

// Display exams in table
function displayExams(exams) {
  const examsList = document.getElementById("exams-list");
  if (!examsList) return;

  if (!exams || exams.length === 0) {
    examsList.innerHTML =
      '<tr><td colspan="6" class="text-center">No exams found</td></tr>';
    return;
  }

  let html = "";
  exams.forEach((exam) => {
    html += `
        <tr>
          <td>${exam.Exam_ID}</td>
          <td>${exam.student_name}</td>
          <td>${exam.Course_Name}</td>
          <td>${exam.Marks_Obtained}</td>
          <td>${new Date(exam.Exam_Date).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-edit" onclick="editExam(${
              exam.Exam_ID
            })">Edit</button>
            <button class="btn btn-delete" onclick="deleteExam(${
              exam.Exam_ID
            })">Delete</button>
          </td>
        </tr>
      `;
  });

  examsList.innerHTML = html;
}

// Filter exams
function filterExams(searchTerm) {
  const rows = document.querySelectorAll("#exams-list tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Submit exam form (add/update)
function submitExamForm() {
  const examId = document.getElementById("exam-id").value;
  const studentId = document.getElementById("student-id").value;
  const courseId = document.getElementById("course-id").value;
  const marks = document.getElementById("marks").value;
  const examDate = document.getElementById("exam-date").value;
  const editMode = document.getElementById("edit-mode").value === "true";

  if (!studentId || !courseId || !marks || !examDate) {
    alert("All fields are required!");
    return;
  }

  const examData = {
    Exam_ID: examId,
    Student_ID: studentId,
    Course_ID: courseId,
    Marks_Obtained: marks,
    Exam_Date: examDate,
  };

  const method = editMode ? "PUT" : "POST";
  const successMessage = editMode
    ? "Exam updated successfully!"
    : "Exam added successfully!";

  fetch("php/api/exams.php", {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(examData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert(successMessage);
        resetForm();
        loadExams();
      } else {
        alert("Error: " + (data.message || "Unknown error occurred"));
      }
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      alert("Error: " + error.message);
    });
}

// Edit exam
function editExam(examId) {
  fetch(`php/api/exams.php?id=${examId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const exam = data.data;
        document.getElementById("exam-id").value = exam.Exam_ID;
        document.getElementById("student-id").value = exam.Student_ID;
        document.getElementById("course-id").value = exam.Course_ID;
        document.getElementById("marks").value = exam.Marks_Obtained;
        document.getElementById("exam-date").value = exam.Exam_Date;

        document.getElementById("edit-mode").value = "true";
        document.getElementById("form-title").textContent = "Edit Exam";
        document.getElementById("submit-btn").textContent = "Update Exam";
        document.getElementById("cancel-btn").style.display = "inline-block";

        document
          .querySelector(".form-container")
          .scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Error: " + (data.message || "Failed to load exam data"));
      }
    })
    .catch((error) => {
      console.error("Error fetching exam data:", error);
      alert("Error: " + error.message);
    });
}

// Delete exam
function deleteExam(examId) {
  if (confirm("Are you sure you want to delete this exam record?")) {
    fetch(`php/api/exams.php?id=${examId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Exam deleted successfully!");
          loadExams();
        } else {
          alert("Error: " + (data.message || "Failed to delete exam"));
        }
      })
      .catch((error) => {
        console.error("Error deleting exam:", error);
        alert("Error: " + error.message);
      });
  }
}

// Reset form
function resetForm() {
  document.getElementById("exam-form").reset();
  document.getElementById("edit-mode").value = "false";
  document.getElementById("exam-id").value = "";
  document.getElementById("form-title").textContent = "Add Exam Record";
  document.getElementById("submit-btn").textContent = "Add Exam Record";
  document.getElementById("cancel-btn").style.display = "none";
}

// Populate student/course dropdowns
function loadStudentCourseDropdowns() {
  fetch("php/api/students.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const select = document.getElementById("student-id");
        select.innerHTML =
          '<option value="">Select Student</option>' +
          data.data
            .map(
              (student) =>
                `<option value="${student.Student_ID}">${student.Name}</option>`
            )
            .join("");
      }
    });
  fetch("php/api/courses.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const select = document.getElementById("course-id");
        select.innerHTML =
          '<option value="">Select Course</option>' +
          data.data
            .map(
              (course) =>
                `<option value="${course.Course_ID}">${course.Course_Name}</option>`
            )
            .join("");
      }
    });
}
