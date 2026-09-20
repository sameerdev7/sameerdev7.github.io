(function () {
  var content = document.querySelector(".post-content");
  var toc = document.getElementById("post-toc");
  var list = document.getElementById("post-toc-list");
  if (!content || !toc || !list) return;

  var headings = Array.prototype.slice.call(content.querySelectorAll("h2, h3")).filter(function (h) {
    return !!h.id;
  });
  if (headings.length < 2) return;

  var links = [];
  var currentH2Item = null;

  headings.forEach(function (heading) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;
    a.dataset.target = heading.id;
    li.appendChild(a);
    links.push(a);

    if (heading.tagName === "H2") {
      list.appendChild(li);
      currentH2Item = li;
    } else if (currentH2Item) {
      var nested = currentH2Item.querySelector("ul");
      if (!nested) {
        nested = document.createElement("ul");
        currentH2Item.appendChild(nested);
      }
      nested.appendChild(li);
    } else {
      list.appendChild(li);
    }
  });

  toc.classList.add("is-active");

  // Scroll-spy: the active link is the last heading whose top has scrolled
  // past a fixed threshold near the top of the viewport. This stays correct
  // through very long sections, unlike an enter/exit observer.
  var THRESHOLD = 120;
  var ticking = false;

  function setActive() {
    var activeId = headings[0].id;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= THRESHOLD) {
        activeId = headings[i].id;
      } else {
        break;
      }
    }
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.dataset.target === activeId);
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(setActive);
        ticking = true;
      }
    },
    { passive: true }
  );

  setActive();
})();
