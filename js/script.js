// Portfolio and Navigation Script

document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Dropdown menu functionality
  const gameButton = document.getElementById("gameButton");
  const experimentMenu = document.getElementById("experimentMenu");

  if (gameButton && experimentMenu) {
    gameButton.addEventListener("click", (e) => {
      e.stopPropagation();
      experimentMenu.classList.toggle("hidden");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!gameButton.contains(e.target) && !experimentMenu.contains(e.target)) {
        experimentMenu.classList.add("hidden");
      }
    });
  }
});
