document.addEventListener("DOMContentLoaded", () => {
  loadAttendance();
  loadStudentCourseDropdowns();

  const form = document.getElementById("attendance-form");
  if (form) form.addEventListener("submit", handleSubmit);
});

async function loadAttendance() {
  try {
    const response = await fetch("php/api/attendance.php");
    const data = await response.json();

    if (data.status === "success") {
      const tbody = document.getElementById("attendance-list");
      tbody.innerHTML = data.data
        .map(
          (record) => `
          <tr>
            <td>${record.Attendance_ID}</td>
            <td>${record.student_name}</td>
            <td>${record.Course_Name}</td>
            <td>${new Date(record.Date).toLocaleDateString()}</td>
            <td>${record.Status}</td>
            <td>
              <button class="btn-edit" onclick="editRecord(${
                record.Attendance_ID
              })">Edit</button>
              <button class="btn-delete" onclick="deleteRecord(${
                record.Attendance_ID
              })">Delete</button>
            </td>
          </tr>
        `
        )
        .join("");
    }
  } catch (error) {
    console.error("Attendance load error:", error);
  }
}

async function loadStudentCourseDropdowns() {
  try {
    const [studentsRes, coursesRes] = await Promise.all([
      fetch("php/api/students.php"),
      fetch("php/api/courses.php"),
    ]);

    const students = await studentsRes.json();
    const courses = await coursesRes.json();

    populateDropdown("student-id", students.data);
    populateDropdown("course-id", courses.data);
  } catch (error) {
    console.error("Dropdown load error:", error);
  }
}

function populateDropdown(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = items
    .map(
      (item) =>
        `<option value="${item.Student_ID || item.Course_ID}">${
          item.Name || item.Course_Name
        }</option>`
    )
    .join("");
}

async function handleSubmit(e) {
  e.preventDefault();
  const formData = {
    Student_ID: document.getElementById("student-id").value,
    Course_ID: document.getElementById("course-id").value,
    Date: document.getElementById("date").value,
    Status: document.getElementById("status").value,
  };

  try {
    const method =
      document.getElementById("edit-mode").value === "true" ? "PUT" : "POST";
    const response = await fetch("php/api/attendance.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (result.status === "success") {
      alert(result.message);
      loadAttendance();
      resetForm();
    }
  } catch (error) {
    console.error("Submission error:", error);
  }
}

function editRecord(id) {
  fetch(`php/api/attendance.php?id=${id}`)
    .then((res) => res.json())
    .then(({ data }) => {
      document.getElementById("student-id").value = data.Student_ID;
      document.getElementById("course-id").value = data.Course_ID;
      document.getElementById("date").value = data.Date;
      document.getElementById("status").value = data.Status;
      document.getElementById("edit-mode").value = "true";
    });
}

async function deleteRecord(id) {
  if (confirm("Delete this attendance record?")) {
    await fetch(`php/api/attendance.php?id=${id}`, { method: "DELETE" });
    loadAttendance();
  }
}

function resetForm() {
  document.getElementById("attendance-form").reset();
  document.getElementById("edit-mode").value = "false";
}
