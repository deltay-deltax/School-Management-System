// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard initialized");

  // Set current date
  setCurrentDate();

  // Load all dashboard data
  loadDashboardData();
});

// Set current date in dashboard
function setCurrentDate() {
  const currentDateElement = document.getElementById("current-date");
  if (currentDateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent = new Date().toLocaleDateString(
      "en-US",
      options
    );
  }
}

// Main dashboard loading function
async function loadDashboardData() {
  try {
    // Load all data in parallel
    const [students, teachers, courses, exams] = await Promise.all([
      fetchData("students.php"),
      fetchData("teachers.php"),
      fetchData("courses.php"),
      fetchData("exams.php"),
    ]);

    updateCounter("student-count", students);
    updateCounter("teacher-count", teachers);
    updateCounter("course-count", courses);

    displayRecentStudents(students);
    displayRecentExams(exams);
  } catch (error) {
    console.error("Dashboard loading error:", error);
    showDashboardError();
  }
}

// Generic fetch function with error handling
async function fetchData(endpoint) {
  try {
    const response = await fetch(`php/api/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Unknown API error");
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error; // Re-throw for upstream handling
  }
}

// Update counter elements
function updateCounter(elementId, data) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (Array.isArray(data)) {
    element.textContent = data.length;
  } else {
    element.textContent = "0";
    console.warn("Counter data not array:", elementId, data);
  }
}

// Display recent students
function displayRecentStudents(students) {
  const container = document.getElementById("recent-students");
  if (!container) return;

  if (!students || students.length === 0) {
    container.innerHTML = "<p>No recent students found</p>";
    return;
  }

  // Sort by Student_ID descending (assuming newer students have higher IDs)
  const recentStudents = [...students]
    .sort((a, b) => b.Student_ID - a.Student_ID)
    .slice(0, 5);

  container.innerHTML = `
    <ul class="recent-list">
      ${recentStudents
        .map(
          (student) => `
        <li>
          <span class="student-id">#${student.Student_ID}</span>
          <span class="student-name">${student.Name}</span>
          <span class="student-class">${student.Class}</span>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

// Display recent exams
function displayRecentExams(exams) {
  const container = document.getElementById("recent-exams");
  if (!container) return;

  if (!exams || exams.length === 0) {
    container.innerHTML = "<p>No recent exams found</p>";
    return;
  }

  // Sort by exam date descending
  const recentExams = [...exams]
    .sort((a, b) => new Date(b.Exam_Date) - new Date(a.Exam_Date))
    .slice(0, 5);

  container.innerHTML = `
    <ul class="recent-list">
      ${recentExams
        .map(
          (exam) => `
        <li>
          <span class="exam-course">${exam.Course_Name}</span>
          <span class="exam-marks">${exam.Marks_Obtained}/100</span>
          <span class="exam-date">${formatDate(exam.Exam_Date)}</span>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

// Date formatting helper
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Show dashboard error state
function showDashboardError() {
  const containers = ["recent-students", "recent-exams"];
  containers.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML =
        '<p class="error">Error loading data. Please refresh.</p>';
    }
  });
}
