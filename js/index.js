// Portfolio page: Theme toggle and dropdown menu
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const gameButton = document.getElementById("gameButton");
  const experimentMenu = document.getElementById("experimentMenu");

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (themeToggle) themeToggle.textContent = "☀️ Light";
  } else {
    if (themeToggle) themeToggle.textContent = "🌙 Dark";
  }

  // Theme toggle functionality
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const isDark = body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
    });
  }

  // Dropdown menu toggle
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
