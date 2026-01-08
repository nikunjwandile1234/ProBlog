const btn = document.getElementById("themeToggle");

if (btn) {
  btn.onclick = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };
}

const saved = localStorage.getItem("theme");
if (saved) document.documentElement.setAttribute("data-theme", saved);
