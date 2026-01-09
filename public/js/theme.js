// ==========================
// Theme Toggle System
// ==========================

(function () {
  const btn = document.getElementById("themeToggle");

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "dark";

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  // Toggle theme
  if (btn) {
    btn.addEventListener("click", function () {
      document.body.classList.toggle("light-mode");

      const newTheme = document.body.classList.contains("light-mode")
        ? "light"
        : "dark";

      localStorage.setItem("theme", newTheme);
    });
  }
})();
