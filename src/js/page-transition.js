/* Rekonet — smooth page transitions & loading feedback for SPA navigation.
 *
 * The app is a client-side React SPA with a pre-built bundle, so we improve
 * the navigation *feel* from the outside: we hook the History API to detect
 * route changes, show a top progress bar, reset scroll to the top, and paint
 * the incoming page in with a short fade — instead of letting content swap
 * abruptly (the "jumpy" behaviour). No build step or source edits required.
 */
(function () {
  "use strict";
  if (window.__rekonetNav) return;
  window.__rekonetNav = true;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getRoot() {
    return document.getElementById("root");
  }

  /* ----------------------------- progress bar ----------------------------- */
  var bar = document.createElement("div");
  bar.className = "pt-progress";
  bar.setAttribute("aria-hidden", "true");
  (document.head || document.documentElement).appendChild(bar);

  var barTimer = null;
  function showBar() {
    if (reduceMotion) return;
    clearTimeout(barTimer);
    bar.classList.remove("is-done");
    bar.classList.add("is-active");
    bar.classList.remove("is-running");
    void bar.offsetWidth; // force reflow so the grow restarts
    bar.classList.add("is-running");
  }
  function hideBar() {
    if (reduceMotion) {
      bar.classList.remove("is-active", "is-running", "is-done");
      return;
    }
    bar.classList.add("is-done");
    clearTimeout(barTimer);
    barTimer = setTimeout(function () {
      bar.classList.remove("is-active", "is-running", "is-done");
    }, 320);
  }

  /* --------------------------- scroll reset ------------------------------ */
  function scrollTop() {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reduceMotion ? "auto" : "instant",
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  /* ----------------------- image paint improvements ---------------------- */
  // Add decoding="async" everywhere and lazy-load only images that start
  // below the fold, so navigation stays light and paints without jank.
  function enhanceImages() {
    var root = getRoot();
    if (!root) return;
    var imgs = root.querySelectorAll("img");
    var vh = window.innerHeight || 800;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
      if (!img.getAttribute("loading")) {
        try {
          var r = img.getBoundingClientRect();
          if (r.top > vh) img.setAttribute("loading", "lazy");
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  /* --------------------------- page enter -------------------------------- */
  function animateEnter() {
    var root = getRoot();
    if (!root || reduceMotion) return;
    root.classList.remove("pt-pre");
    root.classList.remove("pt-enter");
    void root.offsetWidth; // restart the animation
    root.classList.add("pt-enter");
    var done = function () {
      root.classList.remove("pt-enter");
      root.removeEventListener("animationend", done);
    };
    root.addEventListener("animationend", done, { once: true });
  }

  /* ----------------------- route-change detection ------------------------- */
  function currentKey() {
    return location.pathname + location.search + location.hash;
  }
  var lastKey = currentKey();
  var pending = false;

  function onRoute() {
    var key = currentKey();
    if (key === lastKey) return;
    lastKey = key;
    pending = true;
    scrollTop();
    showBar();
    var root = getRoot();
    if (root) root.classList.add("pt-pre");
    // Wait for React to commit the new DOM, then paint it in.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!pending) return;
        pending = false;
        enhanceImages();
        animateEnter();
        setTimeout(hideBar, 220);
      });
    });
  }

  // Hook the History API so any navigation (link click, button, programmatic)
  // is picked up regardless of how the app triggers it.
  var _push = history.pushState;
  var _replace = history.replaceState;
  history.pushState = function () {
    var r = _push.apply(history, arguments);
    onRoute();
    return r;
  };
  history.replaceState = function () {
    var r = _replace.apply(history, arguments);
    onRoute();
    return r;
  };
  window.addEventListener("popstate", onRoute);
  window.addEventListener("hashchange", onRoute);

  /* ------------------- instant feedback on link clicks -------------------- */
  document.addEventListener(
    "click",
    function (e) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      var a = e.target;
      while (a && a !== document && a.tagName !== "A") a = a.parentNode;
      if (!a || a.tagName !== "A") return;
      if (a.target && a.target !== "_self") return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      var url;
      try {
        url = new URL(href, location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search)
        return; // same page — don't flash the bar
      showBar();
    },
    true
  );

  /* ----------------------------- bootstrap ------------------------------- */
  window.addEventListener("load", function () {
    enhanceImages();
    hideBar();
  });
  // Safety net: ensure the bar is hidden shortly after load.
  setTimeout(hideBar, 1500);
})();
