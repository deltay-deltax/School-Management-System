document.addEventListener("DOMContentLoaded", function () {
  loadCourses();
  loadTeachersDropdown();

  const courseForm = document.getElementById("course-form");
  if (courseForm) {
    courseForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitCourseForm();
    });
  }

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  const searchInput = document.getElementById("search-course");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterCourses(this.value.toLowerCase());
    });
  }
});

function loadCourses() {
  const coursesList = document.getElementById("courses-list");
  if (coursesList) {
    coursesList.innerHTML =
      '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
  }

  fetch("php/api/courses.php")
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || "Failed to load courses");
        });
      }
      return response.text().then((text) => {
        if (!text) throw new Error("Empty response from server");
        return JSON.parse(text);
      });
    })
    .then((data) => {
      if (data.status === "success") {
        displayCourses(data.data);
      } else {
        throw new Error(data.message || "Failed to load courses");
      }
    })
    .catch((error) => {
      console.error("Error loading courses:", error);
      if (coursesList) {
        coursesList.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
      }
    });
}

function displayCourses(courses) {
  const coursesList = document.getElementById("courses-list");
  if (!coursesList) return;

  if (!courses || courses.length === 0) {
    coursesList.innerHTML =
      '<tr><td colspan="6" class="text-center">No courses found</td></tr>';
    return;
  }

  let html = "";
  courses.forEach((course) => {
    html += `
      <tr>
        <td>${course.Course_ID}</td>
        <td>${course.Course_Name}</td>
        <td>${course.Teacher_Name || "N/A"}</td>
        <td>${course.Credits}</td>
        <td>${course.Duration}</td>
        <td>
          <button class="btn btn-edit" onclick="editCourse('${
            course.Course_ID
          }')">Edit</button>
          <button class="btn btn-delete" onclick="deleteCourse('${
            course.Course_ID
          }')">Delete</button>
        </td>
      </tr>
    `;
  });

  coursesList.innerHTML = html;
}

function filterCourses(searchTerm) {
  const rows = document.querySelectorAll("#courses-list tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

function submitCourseForm() {
  const courseId = document.getElementById("course-id").value;
  const courseName = document.getElementById("course-name").value;
  const teacherId = document.getElementById("teacher-id").value;
  const credits = document.getElementById("credits").value;
  const duration = document.getElementById("duration").value;
  const editMode = document.getElementById("edit-mode").value === "true";

  if (!courseId || !courseName) {
    alert("Course ID and Course Name are required!");
    return;
  }

  const courseData = {
    Course_ID: courseId,
    Course_Name: courseName,
    Teacher_ID: teacherId || null,
    Credits: credits,
    Duration: duration,
  };

  const method = editMode ? "PUT" : "POST";
  const successMessage = editMode
    ? "Course updated successfully!"
    : "Course added successfully!";

  fetch("php/api/courses.php", {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(courseData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert(successMessage);
        resetForm();
        loadCourses();
      } else {
        alert("Error: " + (data.message || "Unknown error occurred"));
      }
    })
    .catch((error) => {
      console.error("Error submitting course form:", error);
      alert("Error: " + error.message);
    });
}

function editCourse(courseId) {
  fetch(`php/api/courses.php?id=${courseId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const course = data.data;
        document.getElementById("course-id").value = course.Course_ID;
        document.getElementById("course-name").value = course.Course_Name;
        document.getElementById("teacher-id").value = course.Teacher_ID || "";
        document.getElementById("credits").value = course.Credits;
        document.getElementById("duration").value = course.Duration;

        document.getElementById("edit-mode").value = "true";
        document.getElementById("course-id").disabled = true;
        document.getElementById("form-title").textContent = "Edit Course";
        document.getElementById("submit-btn").textContent = "Update Course";
        document.getElementById("cancel-btn").style.display = "inline-block";

        document
          .querySelector(".form-container")
          .scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Error: " + (data.message || "Failed to load course data"));
      }
    })
    .catch((error) => {
      console.error("Error fetching course data:", error);
      alert("Error: " + error.message);
    });
}

function deleteCourse(courseId) {
  if (confirm("Are you sure you want to delete this course?")) {
    fetch(`php/api/courses.php?id=${courseId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Course deleted successfully!");
          loadCourses();
        } else {
          alert("Error: " + (data.message || "Failed to delete course"));
        }
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
        alert("Error: " + error.message);
      });
  }
}

function resetForm() {
  document.getElementById("course-form").reset();
  document.getElementById("edit-mode").value = "false";
  document.getElementById("course-id").disabled = false;
  document.getElementById("form-title").textContent = "Add New Course";
  document.getElementById("submit-btn").textContent = "Add Course";
  document.getElementById("cancel-btn").style.display = "none";
}

function loadTeachersDropdown() {
  const teacherSelect = document.getElementById("teacher-id");
  if (!teacherSelect) return;

  fetch("php/api/teachers.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
        data.data.forEach((teacher) => {
          teacherSelect.innerHTML += `<option value="${teacher.Teacher_ID}">${teacher.Name}</option>`;
        });
      }
    })
    .catch((error) => {
      console.error("Error loading teachers for dropdown:", error);
    });
}
