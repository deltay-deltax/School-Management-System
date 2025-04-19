// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Students page loaded");

  // Load student data
  loadStudents();

  // Set up form submission
  const studentForm = document.getElementById("student-form");
  if (studentForm) {
    studentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Form submitted");
      submitStudentForm();
    });
  }

  // Set up cancel button
  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  // Set up search functionality
  const searchInput = document.getElementById("search-student");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      filterStudents(searchTerm);
    });
  }
});

// Function to load students from the API
function loadStudents() {
  console.log("Loading students data");

  // Show loading indicator
  const studentsList = document.getElementById("students-list");
  if (studentsList) {
    studentsList.innerHTML =
      '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
  }

  fetch("php/api/students.php")
    .then((response) => {
      console.log("Response status:", response.status);
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || "Failed to load students");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Students data received:", data);
      if (data.status === "success") {
        displayStudents(data.data);
      } else {
        throw new Error(data.message || "Failed to load students");
      }
    })
    .catch((error) => {
      console.error("Error loading students:", error);
      if (studentsList) {
        studentsList.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
      }
    });
}

// Function to display students in the table
function displayStudents(students) {
  const studentsList = document.getElementById("students-list");
  if (!studentsList) return;

  if (students.length === 0) {
    studentsList.innerHTML =
      '<tr><td colspan="7" class="text-center">No students found</td></tr>';
    return;
  }

  let html = "";
  students.forEach((student) => {
    html += `
            <tr>
                <td>${student.Student_ID}</td>
                <td>${student.Name}</td>
                <td>${student.Age}</td>
                <td>${student.Class}</td>
                <td>${student.Contact_Number}</td>
                <td>${student.Address}</td>
                <td>
                    <button class="btn btn-edit" onclick="editStudent(${student.Student_ID})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteStudent(${student.Student_ID})">Delete</button>
                </td>
            </tr>
        `;
  });

  studentsList.innerHTML = html;
}

// Function to filter students based on search term
function filterStudents(searchTerm) {
  console.log("Filtering students with term:", searchTerm);
  const rows = document.querySelectorAll("#students-list tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Function to submit the student form (add or update)
function submitStudentForm() {
  console.log("Processing student form submission");

  // Get form values
  const studentId = document.getElementById("student-id").value;
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const studentClass = document.getElementById("class").value;
  const contact = document.getElementById("contact").value;
  const address = document.getElementById("address").value;
  const editMode = document.getElementById("edit-mode").value === "true";

  // Validate form
  if (!studentId || !name) {
    alert("Student ID and Name are required!");
    return;
  }

  // Prepare data
  const studentData = {
    Student_ID: studentId,
    Name: name,
    Age: age,
    Class: studentClass,
    Contact_Number: contact,
    Address: address,
  };

  console.log("Student data to submit:", studentData);

  // Determine if this is an add or update operation
  const method = editMode ? "PUT" : "POST";
  const successMessage = editMode
    ? "Student updated successfully!"
    : "Student added successfully!";

  // Send data to the server
  fetch("php/api/students.php", {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  })
    .then((response) => {
      console.log("Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Server response:", data);
      if (data.status === "success") {
        alert(successMessage);
        resetForm();
        loadStudents(); // Reload the student list
      } else {
        alert("Error: " + (data.message || "Unknown error occurred"));
      }
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      alert("Error: " + error.message);
    });
}

// Function to edit a student
function editStudent(studentId) {
  console.log("Editing student with ID:", studentId);

  // Fetch the student data
  fetch(`php/api/students.php?id=${studentId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const student = data.data;

        // Populate the form
        document.getElementById("student-id").value = student.Student_ID;
        document.getElementById("name").value = student.Name;
        document.getElementById("age").value = student.Age;
        document.getElementById("class").value = student.Class;
        document.getElementById("contact").value = student.Contact_Number;
        document.getElementById("address").value = student.Address;

        // Set edit mode
        document.getElementById("edit-mode").value = "true";
        document.getElementById("student-id").disabled = true;
        document.getElementById("form-title").textContent = "Edit Student";
        document.getElementById("submit-btn").textContent = "Update Student";
        document.getElementById("cancel-btn").style.display = "inline-block";

        // Scroll to the form
        document
          .querySelector(".form-container")
          .scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Error: " + (data.message || "Failed to load student data"));
      }
    })
    .catch((error) => {
      console.error("Error fetching student data:", error);
      alert("Error: " + error.message);
    });
}

// Function to delete a student
function deleteStudent(studentId) {
  console.log("Deleting student with ID:", studentId);

  if (confirm("Are you sure you want to delete this student?")) {
    fetch(`php/api/students.php?id=${studentId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Student deleted successfully!");
          loadStudents(); // Reload the student list
        } else {
          alert("Error: " + (data.message || "Failed to delete student"));
        }
      })
      .catch((error) => {
        console.error("Error deleting student:", error);
        alert("Error: " + error.message);
      });
  }
}

// Function to reset the form
function resetForm() {
  console.log("Resetting form");

  document.getElementById("student-form").reset();
  document.getElementById("edit-mode").value = "false";
  document.getElementById("student-id").disabled = false;
  document.getElementById("form-title").textContent = "Add New Student";
  document.getElementById("submit-btn").textContent = "Add Student";
  document.getElementById("cancel-btn").style.display = "none";
}
