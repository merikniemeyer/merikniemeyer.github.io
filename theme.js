(function () {
  var navContainer = document.getElementById("site-nav");
  if (navContainer) {
    var path = window.location.pathname || "";
    var fileName = path.split("/").pop();
    var isHome = fileName === "" || fileName === "index.html";
    var homeHref = isHome ? "#home" : "index.html";
    var currentPage = isHome ? "home" : fileName;

    function navLink(href, label, pageKey) {
      var isCurrent = currentPage === pageKey;
      return (
        '<a href="' +
        href +
        '" class="my-bar-item my-button my-pad my-pad--sm"' +
        (isCurrent ? ' aria-current="page"' : "") +
        ">" +
        label +
        "</a>"
      );
    }

    navContainer.className = "my-top";
    navContainer.innerHTML =
      '<div class="my-bar my-white my-card">' +
      '<a href="' +
      homeHref +
      '" class="nav-title">Merik Niemeyer</a>' +
      '<div class="my-bar-nav">' +
      navLink(homeHref, "Home", "home") +
      navLink("research.html", "Research", "research.html") +
      navLink("activities.html", "Activities", "activities.html") +
      '<label class="theme-switch" title="Toggle light/dark mode">' +
      '<input id="theme-toggle" type="checkbox" aria-label="Toggle light/dark mode">' +
      '<span class="slider"></span>' +
      "</label>" +
      "</div>" +
      "</div>";
  }

  document.body.classList.add("page-animate");

  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  var storageKey = "theme";
  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (e) {}
  }

  function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    toggle.checked = isDark;
    setStoredTheme(isDark ? "dark" : "light");
  }

  var prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  var savedTheme = getStoredTheme();
  applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

  toggle.addEventListener("change", function () {
    applyTheme(toggle.checked);
  });
})();
