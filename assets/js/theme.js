(function () {
  var STORAGE_KEY = "theme";
  var btn = document.getElementById("theme-toggle");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  // Transparent variants drop giscus's own background so it inherits ours
  // instead of GitHub's slightly different gray — no visible seam.
  function giscusTheme(theme) {
    return theme === "dark" ? "transparent_dark" : "transparent_light";
  }

  function syncGiscusTheme(theme) {
    var iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe) return;
    iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme(theme) } } }, "https://giscus.app");
  }

  // The giscus <script> loads its iframe asynchronously and reads the
  // markup's static data-theme at that point — sync it to whatever theme is
  // actually active as soon as the iframe shows up, not just on toggle.
  var commentsSection = document.querySelector(".post-comments");
  if (commentsSection) {
    var observer = new MutationObserver(function () {
      var iframe = commentsSection.querySelector("iframe.giscus-frame");
      if (iframe) {
        syncGiscusTheme(currentTheme());
        observer.disconnect();
      }
    });
    observer.observe(commentsSection, { childList: true, subtree: true });
  }

  if (!btn) return;

  btn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    syncGiscusTheme(next);
  });
})();
