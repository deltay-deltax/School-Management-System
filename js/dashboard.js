document.addEventListener("DOMContentLoaded", function () {
  setCurrentDate();
  loadDashboardStats();
  loadRecentStudents();
  loadRecentExams();
  loadAllStudents();

  document
    .getElementById("student-search-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      filterStudents();
    });

  document
    .getElementById("reset-filters")
    .addEventListener("click", function () {
      document.getElementById("search-name").value = "";
      document.getElementById("search-class").value = "";
      document.getElementById("search-age").value = "";
      filterStudents();
    });
});

let allStudents = [];

function setCurrentDate() {
  const now = new Date();
  document.getElementById("current-date").textContent =
    now.toLocaleDateString();
  document.getElementById("attendance-date").textContent =
    now.toLocaleDateString();
}

function loadDashboardStats() {
  fetch("php/api/students.php")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("student-count").textContent =
        data.status === "success" ? data.data.length : "Error";
    });

  fetch("php/api/teachers.php")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("teacher-count").textContent =
        data.status === "success" ? data.data.length : "Error";
    });

  fetch("php/api/courses.php")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("course-count").textContent =
        data.status === "success" ? data.data.length : "Error";
    });
}

function loadRecentStudents() {
  fetch("php/api/students.php")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("recent-students");
      if (data.status === "success") {
        list.innerHTML = data.data
          .slice(-5)
          .reverse()
          .map((stu) => `<li>${stu.Name} (${stu.Class})</li>`)
          .join("");
      } else {
        list.innerHTML = "<li>Error loading students</li>";
      }
    });
}

function loadRecentExams() {
  fetch("php/api/exams.php")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("recent-exams");
      if (data.status === "success") {
        list.innerHTML = data.data
          .slice(-5)
          .reverse()
          .map(
            (exam) =>
              `<li>${exam.student_name || exam.Student_Name} - ${
                exam.Course_Name
              } (${exam.Marks_Obtained})</li>`
          )
          .join("");
      } else {
        list.innerHTML = "<li>Error loading exams</li>";
      }
    });
}

function loadAllStudents() {
  fetch("php/api/students.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        allStudents = data.data;
        filterStudents(); // Initial display
      }
    });
}

function filterStudents() {
  const name = document
    .getElementById("search-name")
    .value.trim()
    .toLowerCase();
  const studentClass = document
    .getElementById("search-class")
    .value.trim()
    .toLowerCase();
  const age = document.getElementById("search-age").value.trim();

  const filtered = allStudents.filter((stu) => {
    const matchName = !name || stu.Name.toLowerCase().includes(name);
    const matchClass =
      !studentClass ||
      (stu.Class && stu.Class.toLowerCase().includes(studentClass));
    const matchAge = !age || String(stu.Age) === age;
    return matchName && matchClass && matchAge;
  });

  const tbody = document.getElementById("dashboard-student-list");
  tbody.innerHTML =
    filtered.length === 0
      ? '<tr><td colspan="6" class="text-center">No students found</td></tr>'
      : filtered
          .map(
            (stu) =>
              `<tr>
                <td>${stu.Student_ID}</td>
                <td>${stu.Name}</td>
                <td>${stu.Age}</td>
                <td>${stu.Class}</td>
                <td>${stu.Contact_Number}</td>
                <td>${stu.Address}</td>
              </tr>`
          )
          .join("");
}
