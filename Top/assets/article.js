(function () {
  "use strict";
  var query = new URLSearchParams(window.location.search).get("highlight");
  var root = document.querySelector(window.TOP_LANGUAGE === "en" ? ".article-body-en" : ".article-body-zh") || document.querySelector(".article-body");
  if (!query || !root) return;

  var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var pattern = new RegExp(escaped, "ig");
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.parentElement && !["SCRIPT", "STYLE", "MARK"].includes(walker.currentNode.parentElement.tagName)) {
      nodes.push(walker.currentNode);
    }
  }

  var firstMark = null;
  nodes.forEach(function (node) {
    if (!pattern.test(node.nodeValue)) {
      pattern.lastIndex = 0;
      return;
    }
    pattern.lastIndex = 0;
    var fragment = document.createDocumentFragment();
    var last = 0;
    node.nodeValue.replace(pattern, function (match, offset) {
      fragment.appendChild(document.createTextNode(node.nodeValue.slice(last, offset)));
      var mark = document.createElement("mark");
      mark.className = "article-highlight";
      mark.textContent = match;
      fragment.appendChild(mark);
      if (!firstMark) firstMark = mark;
      last = offset + match.length;
    });
    fragment.appendChild(document.createTextNode(node.nodeValue.slice(last)));
    node.parentNode.replaceChild(fragment, node);
  });

  if (firstMark) {
    window.setTimeout(function () {
      firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }
})();
