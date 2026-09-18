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

  function render() {
    var query = input.value.trim().toLowerCase();
    var selectedCategory = category.value;
    var selectedScope = scope.value;
    results.innerHTML = "";
    if (!query) {
      status.textContent = "输入关键词开始检索。";
      return;
    }

    var matches = index.filter(function (item) {
      if (selectedCategory && item.category.indexOf(selectedCategory) === -1) return false;
      var haystack = selectedScope === "title" ? item.title : selectedScope === "body" ? item.text : [item.title, item.description, item.category, item.text].join(" ");
      return haystack.toLowerCase().indexOf(query) !== -1;
    });
    status.textContent = matches.length ? "找到 " + matches.length + " 篇文章" : "没有找到匹配文章。";

    matches.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "entry-row";
      var target = item;
      if (item.kind === "article") {
        target = index.find(function (candidate) {
          return candidate.kind === "section" && candidate.article === item.article &&
            (candidate.title + " " + candidate.text).toLowerCase().indexOf(query) !== -1;
        }) || item;
      }
      var targetHref = target.href;
      targetHref += (targetHref.indexOf("?") === -1 ? "?" : "&") + "highlight=" + encodeURIComponent(query);
      link.href = targetHref;
      var body = document.createElement("span");
      body.className = "entry-body";
      var meta = document.createElement("span");
      meta.className = "entry-meta";
      meta.textContent = item.category;
      var title = document.createElement("strong");
      title.textContent = item.title;
      var description = document.createElement("span");
      description.className = "entry-description";
      var text = item.text || item.description;
      var position = text.toLowerCase().indexOf(query);
      if (position >= 0) {
        var start = Math.max(0, position - 42);
        var end = Math.min(text.length, position + query.length + 90);
        setHighlighted(description, (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : ""), query);
      } else {
        description.textContent = item.description;
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
})();
