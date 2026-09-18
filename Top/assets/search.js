(function () {
  "use strict";

  var index = window.TOP_SEARCH_INDEX || [];
  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var status = document.getElementById("search-status");
  var category = document.getElementById("search-category");
  var scope = document.getElementById("search-scope");
  if (!form || !input || !results || !status) return;
  var english = window.TOP_LANGUAGE === "en";
  var categoryLabels = {
    "Hub / 资源": "Hub / Resources",
    "People / 人物故事": "People / Stories",
    "Project / 事情与项目": "Project / Projects",
    "Post / 年度帖子": "Post / Posts",
    "News / 年度事件与新闻": "News / Events and news",
    "Culture / 年度文化": "Culture / Culture"
  };

  function render() {
    var query = input.value.trim().toLowerCase();
    var selectedCategory = category.value;
    var selectedScope = scope.value;
    results.innerHTML = "";
    if (!query) {
      status.textContent = english ? "Enter a keyword to search." : "输入关键词开始检索。";
      return;
    }

    var matches = index.filter(function (item) {
      if (selectedCategory && item.category.indexOf(selectedCategory) === -1) return false;
      var titleValue = english ? (item.titleEn || item.title) : item.title;
      var descriptionValue = english ? (item.descriptionEn || item.description) : item.description;
      var textValue = english ? (item.textEn || item.text) : item.text;
      var haystack = selectedScope === "title" ? titleValue : selectedScope === "body" ? textValue : [titleValue, descriptionValue, item.category, textValue].join(" ");
      return haystack.toLowerCase().indexOf(query) !== -1;
    });
    status.textContent = matches.length ? (english ? matches.length + " matching entries" : "找到 " + matches.length + " 篇文章") : (english ? "No matching entries." : "没有找到匹配文章。");

    matches.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "entry-row";
      var target = item;
      if (item.kind === "article") {
        target = index.find(function (candidate) {
          return candidate.kind === "section" && candidate.article === item.article &&
            ((english ? (candidate.titleEn || candidate.title) : candidate.title) + " " + (english ? (candidate.textEn || candidate.text) : candidate.text)).toLowerCase().indexOf(query) !== -1;
        }) || item;
      }
      var targetHref = target.href;
      var hashIndex = targetHref.indexOf("#");
      var hash = hashIndex === -1 ? "" : targetHref.slice(hashIndex);
      var baseHref = hashIndex === -1 ? targetHref : targetHref.slice(0, hashIndex);
      baseHref += (baseHref.indexOf("?") === -1 ? "?" : "&") + "highlight=" + encodeURIComponent(query) + (english ? "&lang=en" : "");
      var targetHref = baseHref + hash;
      link.href = targetHref;
      var body = document.createElement("span");
      body.className = "entry-body";
      var meta = document.createElement("span");
      meta.className = "entry-meta";
      meta.textContent = english ? (categoryLabels[item.category] || item.category.split(" / ")[0]) : item.category;
      var title = document.createElement("strong");
      title.textContent = english ? (item.titleEn || item.title) : item.title;
      var description = document.createElement("span");
      description.className = "entry-description";
      var text = english ? (item.textEn || item.descriptionEn || item.text) : (item.text || item.description);
      var position = text.toLowerCase().indexOf(query);
      if (position >= 0) {
        var start = Math.max(0, position - 42);
        var end = Math.min(text.length, position + query.length + 90);
        setHighlighted(description, (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : ""), query);
      } else {
        description.textContent = english ? (item.descriptionEn || item.description) : item.description;
      }
      body.append(meta, title, description);
      var arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "→";
      link.append(body, arrow);
      results.appendChild(link);
    });
  }

  function setHighlighted(node, value, query) {
    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var parts = value.split(new RegExp("(" + escaped + ")", "ig"));
    parts.forEach(function (part) {
      if (part.toLowerCase() === query.toLowerCase()) {
        var mark = document.createElement("mark");
        mark.textContent = part;
        node.appendChild(mark);
      } else {
        node.appendChild(document.createTextNode(part));
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
    var query = input.value.trim();
    history.replaceState(null, "", query ? "?q=" + encodeURIComponent(query) : "./search.html");
  });

  input.addEventListener("input", render);
  category.addEventListener("change", render);
  scope.addEventListener("change", render);

  var params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";
  render();
  document.addEventListener("top:languagechange", function (event) {
    english = event.detail.language === "en";
    render();
  });
})();
