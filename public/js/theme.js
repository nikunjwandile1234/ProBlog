(function () {
  const btn = document.getElementById("themeToggle");

  const savedTheme = localStorage.getItem("theme") || "dark";

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

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
