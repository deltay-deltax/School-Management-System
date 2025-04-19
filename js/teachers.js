document.addEventListener("DOMContentLoaded", function () {
  console.log("Teachers page loaded");

  loadTeachers();

  const teacherForm = document.getElementById("teacher-form");
  if (teacherForm) {
    teacherForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitTeacherForm();
    });
  }

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  const searchInput = document.getElementById("search-teacher");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterTeachers(this.value.toLowerCase());
    });
  }
});

function loadTeachers() {
  const teachersList = document.getElementById("teachers-list");
  if (teachersList) {
    teachersList.innerHTML =
      '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
  }

  fetch("php/api/teachers.php")
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || "Failed to load teachers");
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "success") {
        displayTeachers(data.data);
      } else {
        throw new Error(data.message || "Failed to load teachers");
      }
    })
    .catch((error) => {
      console.error("Error loading teachers:", error);
      if (teachersList) {
        teachersList.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
      }
    });
}

function displayTeachers(teachers) {
  const teachersList = document.getElementById("teachers-list");
  if (!teachersList) return;

  if (teachers.length === 0) {
    teachersList.innerHTML =
      '<tr><td colspan="7" class="text-center">No teachers found</td></tr>';
    return;
  }

  let html = "";
  teachers.forEach((teacher) => {
    html += `
      <tr>
        <td>${teacher.Teacher_ID}</td>
        <td>${teacher.Name}</td>
        <td>${teacher.Subject}</td>
        <td>${teacher.Contact_Number}</td>
        <td>${teacher.Email}</td>
        <td>${teacher.Salary}</td>
        <td>
          <button class="btn btn-edit" onclick="editTeacher(${teacher.Teacher_ID})">Edit</button>
          <button class="btn btn-delete" onclick="deleteTeacher(${teacher.Teacher_ID})">Delete</button>
        </td>
      </tr>
    `;
  });

  teachersList.innerHTML = html;
}

function filterTeachers(searchTerm) {
  const rows = document.querySelectorAll("#teachers-list tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

function submitTeacherForm() {
  const teacherId = document.getElementById("teacher-id").value;
  const name = document.getElementById("name").value;
  const subject = document.getElementById("subject").value;
  const contact = document.getElementById("contact").value;
  const email = document.getElementById("email").value;
  const salary = document.getElementById("salary").value;
  const editMode = document.getElementById("edit-mode").value === "true";

  if (!teacherId || !name) {
    alert("Teacher ID and Name are required!");
    return;
  }

  const teacherData = {
    Teacher_ID: teacherId,
    Name: name,
    Subject: subject,
    Contact_Number: contact,
    Email: email,
    Salary: salary,
  };

  const method = editMode ? "PUT" : "POST";
  const successMessage = editMode
    ? "Teacher updated successfully!"
    : "Teacher added successfully!";

  fetch("php/api/teachers.php", {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teacherData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert(successMessage);
        resetForm();
        loadTeachers();
      } else {
        alert("Error: " + (data.message || "Unknown error occurred"));
      }
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      alert("Error: " + error.message);
    });
}

function editTeacher(teacherId) {
  fetch(`php/api/teachers.php?id=${teacherId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const teacher = data.data;
        document.getElementById("teacher-id").value = teacher.Teacher_ID;
        document.getElementById("name").value = teacher.Name;
        document.getElementById("subject").value = teacher.Subject;
        document.getElementById("contact").value = teacher.Contact_Number;
        document.getElementById("email").value = teacher.Email;
        document.getElementById("salary").value = teacher.Salary;

        document.getElementById("edit-mode").value = "true";
        document.getElementById("teacher-id").disabled = true;
        document.getElementById("form-title").textContent = "Edit Teacher";
        document.getElementById("submit-btn").textContent = "Update Teacher";
        document.getElementById("cancel-btn").style.display = "inline-block";

        document
          .querySelector(".form-container")
          .scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Error: " + (data.message || "Failed to load teacher data"));
      }
    })
    .catch((error) => {
      console.error("Error fetching teacher data:", error);
      alert("Error: " + error.message);
    });
}

function deleteTeacher(teacherId) {
  if (confirm("Are you sure you want to delete this teacher?")) {
    fetch(`php/api/teachers.php?id=${teacherId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Teacher deleted successfully!");
          loadTeachers();
        } else {
          alert("Error: " + (data.message || "Failed to delete teacher"));
        }
      })
      .catch((error) => {
        console.error("Error deleting teacher:", error);
        alert("Error: " + error.message);
      });
  }
}

function resetForm() {
  document.getElementById("teacher-form").reset();
  document.getElementById("edit-mode").value = "false";
  document.getElementById("teacher-id").disabled = false;
  document.getElementById("form-title").textContent = "Add New Teacher";
  document.getElementById("submit-btn").textContent = "Add Teacher";
  document.getElementById("cancel-btn").style.display = "none";
}
