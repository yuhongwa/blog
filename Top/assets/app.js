(function () {
  "use strict";

  var catalog = window.TOP_CATALOG;
  if (!catalog || document.body.dataset.page !== "category") return;

  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get("id") || "01";
  var category = catalog.categories.find(function (item) {
    return item.id === requestedId;
  }) || catalog.categories[0];
  var english = window.TOP_LANGUAGE === "en";
  var englishCatalog = (window.TOP_EN_CATALOG && window.TOP_EN_CATALOG[category.id]) || {};
  var englishEntries = englishCatalog.entries || {};

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  document.title = category.id + " " + (english ? (englishCatalog.title || category.title) : category.title) + "｜TOP " + catalog.year;
  setText("category-kicker", category.kicker);
  setText("category-title", english ? (englishCatalog.title || category.title) : category.title);
  setText("category-intro", english ? (englishCatalog.intro || category.intro) : category.intro);
  setText("entry-count", category.entries.length ? category.entries.length + (english ? " entries" : " 篇") : (english ? "No entries yet" : "尚未发布"));

  var activeNav = document.querySelector('[data-category-id="' + category.id + '"]');
  if (activeNav) {
    activeNav.classList.add("is-current");
    activeNav.setAttribute("aria-current", "page");
  }

  var entryList = document.getElementById("entry-list");
  if (entryList) {
    if (category.entries.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "暂未收录。没有合适内容时，这一页保持空白。";
      entryList.appendChild(empty);
    } else {
      category.entries.forEach(function (entry, index) {
        var link = document.createElement("a");
        link.className = "entry-row";
        link.href = entry.href;

        var body = document.createElement("span");
        body.className = "entry-body";

        var meta = document.createElement("span");
        meta.className = "entry-meta";
        meta.textContent = entry.year + " / " + entry.type;

        var title = document.createElement("strong");
        var translated = englishEntries[entry.title] || [entry.title, entry.description];
        title.textContent = english ? translated[0] : entry.title;

        var description = document.createElement("span");
        description.className = "entry-description";
        description.textContent = english ? translated[1] : entry.description;

        body.append(meta, title, description);

        var arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        link.append(body, arrow);
        entryList.appendChild(link);
      });
    }
  }

  var switcher = document.getElementById("category-switcher-list");
  if (switcher) {
    catalog.categories.forEach(function (item) {
      var link = document.createElement("a");
      link.href = "./category.html?id=" + item.id;
      var target = (window.TOP_EN_CATALOG && window.TOP_EN_CATALOG[item.id]) || {};
      link.textContent = item.kicker + " / " + (english ? (target.title || item.title) : item.title);
      if (item.id === category.id) {
        link.className = "is-current";
        link.setAttribute("aria-current", "page");
      }
      switcher.appendChild(link);
    });
  }
  document.addEventListener("top:languagechange", function () { window.location.reload(); });
})();
