(function () {
  if (!navigator.clipboard) return;

  var pres = document.querySelectorAll(".post-content pre");
  var seen = [];

  pres.forEach(function (pre) {
    var container = pre.closest(".highlighter-rouge") || pre;
    if (seen.indexOf(container) !== -1) return;
    seen.push(container);

    var btn = document.createElement("button");
    btn.className = "copy-code-btn";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");

    btn.addEventListener("click", function () {
      var text = pre.innerText.replace(/\n+$/, "");
      navigator.clipboard.writeText(text).then(
        function () {
          btn.textContent = "Copied";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = "Copy";
            btn.classList.remove("is-copied");
          }, 1500);
        },
        function () {
          btn.textContent = "Failed";
          setTimeout(function () {
            btn.textContent = "Copy";
          }, 1500);
        }
      );
    });

    container.appendChild(btn);
  });
})();
