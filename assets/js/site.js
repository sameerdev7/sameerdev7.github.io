(function () {
  var doc = document;
  var root = doc.documentElement;

  /* ---- Theme toggle ------------------------------------------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function giscusTheme(theme) {
    return theme === 'dark' ? 'transparent_dark' : 'transparent_light';
  }

  function syncGiscus(theme) {
    var frame = doc.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: giscusTheme(theme) } } },
      'https://giscus.app'
    );
  }

  var toggle = doc.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      var meta = doc.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#121418' : '#fbfaf7');
      syncGiscus(next);
    });
  }

  // Giscus renders dark by default; once its widget reports in, switch it if
  // the page is actually light. (A message sent earlier would be dropped.)
  if (doc.querySelector('.comments')) {
    var synced = false;
    window.addEventListener('message', function (e) {
      if (synced || e.origin !== 'https://giscus.app' || !e.data || !e.data.giscus) return;
      synced = true;
      if (currentTheme() === 'light') syncGiscus('light');
    });
  }

  /* ---- Header border once the page scrolls -------------------------- */

  var header = doc.querySelector('[data-site-header]');
  if (header) {
    var ticking = false;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---- Article enhancements ----------------------------------------- */

  var content = doc.querySelector('.post-content');
  if (!content) return;

  function buildToc() {
    var heads = [].slice.call(content.querySelectorAll('h2[id], h3[id]'));
    var lists = [].slice.call(doc.querySelectorAll('[data-toc-list]'));
    if (heads.length < 2 || !lists.length) return;

    var links = [];
    lists.forEach(function (list) {
      var parent = null;
      heads.forEach(function (h) {
        var li = doc.createElement('li');
        var a = doc.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.setAttribute('data-target', h.id);
        li.appendChild(a);
        links.push(a);

        if (h.tagName === 'H2' || !parent) {
          list.appendChild(li);
          if (h.tagName === 'H2') parent = li;
        } else {
          var sub = parent.querySelector('ul');
          if (!sub) { sub = doc.createElement('ul'); parent.appendChild(sub); }
          sub.appendChild(li);
        }
      });
    });

    [].forEach.call(doc.querySelectorAll('[data-toc]'), function (el) { el.hidden = false; });

    var inline = doc.querySelector('.toc-inline');
    if (inline && window.innerWidth >= 720) inline.open = true;

    // Scroll-spy: the active heading is the last one above a line just under
    // the sticky header.
    var LINE = 110;
    var busy = false;

    function reveal(link) {
      var box = link.closest('.toc');
      if (!box) return;
      var l = link.getBoundingClientRect();
      var b = box.getBoundingClientRect();
      if (l.top < b.top + 8) box.scrollTop -= b.top + 8 - l.top;
      else if (l.bottom > b.bottom - 8) box.scrollTop += l.bottom - b.bottom + 8;
    }

    function spy() {
      var active = heads[0].id;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top <= LINE) active = heads[i].id;
        else break;
      }
      links.forEach(function (a) {
        var on = a.getAttribute('data-target') === active;
        if (on !== a.classList.contains('is-active')) {
          a.classList.toggle('is-active', on);
          if (on) reveal(a);
        }
      });
      busy = false;
    }

    window.addEventListener('scroll', function () {
      if (!busy) { busy = true; requestAnimationFrame(spy); }
    }, { passive: true });
    spy();
  }

  function addAnchors() {
    [].forEach.call(content.querySelectorAll('h2[id], h3[id], h4[id]'), function (h) {
      var a = doc.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Link to this section');
      a.textContent = '#';
      h.appendChild(a);
    });
  }

  function wrapTables() {
    [].forEach.call(content.querySelectorAll('table'), function (t) {
      var wrap = doc.createElement('div');
      wrap.className = 'table-wrap';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
  }

  var LANG_NAMES = {
    py: 'Python', python: 'Python', bash: 'Bash', sh: 'Shell', shell: 'Shell',
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
    json: 'JSON', yaml: 'YAML', yml: 'YAML', sql: 'SQL', html: 'HTML', css: 'CSS',
    cpp: 'C++', c: 'C', console: 'Console', markdown: 'Markdown', toml: 'TOML', diff: 'Diff'
  };

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) {}
      doc.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function addCodeChrome() {
    var seen = [];
    [].forEach.call(content.querySelectorAll('pre'), function (pre) {
      var box = pre.closest('.highlighter-rouge');
      if (!box) {
        if (pre.parentNode !== content) return;
        box = doc.createElement('div');
        box.className = 'highlighter-rouge';
        pre.parentNode.insertBefore(box, pre);
        box.appendChild(pre);
      }
      if (seen.indexOf(box) !== -1) return;
      seen.push(box);

      var m = /language-([\w+-]+)/.exec(box.className);
      var lang = m && m[1] !== 'plaintext' && m[1] !== 'text' ? m[1] : '';

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.addEventListener('click', function () {
        var text = (pre.querySelector('code') || pre).textContent.replace(/\n$/, '');
        copyText(text).then(function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
        }, function () {
          btn.textContent = 'Failed';
        }).then(function () {
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-copied');
          }, 1500);
        });
      });

      if (lang) {
        var bar = doc.createElement('div');
        bar.className = 'code-header';
        var label = doc.createElement('span');
        label.textContent = LANG_NAMES[lang] || lang;
        bar.appendChild(label);
        bar.appendChild(btn);
        box.insertBefore(bar, box.firstChild);
      } else {
        btn.classList.add('is-floating');
        box.appendChild(btn);
      }
    });
  }

  // Build the TOC first so the heading anchors added below aren't in its text.
  buildToc();
  addAnchors();
  wrapTables();
  addCodeChrome();
})();
