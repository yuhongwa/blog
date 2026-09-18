window.TOP_STATS = {"articles":11,"sections":200,"characters":56473,"links":657,"domains":80};
(function () {
  function renderStats() {
    var stats = window.TOP_STATS;
    if (!stats) return;
    var values = {
      "stat-articles": stats.articles,
      "stat-sections": stats.sections,
      "stat-characters": stats.characters.toLocaleString("zh-CN"),
      "stat-links": stats.links.toLocaleString("zh-CN"),
      "stat-domains": stats.domains
    };
    Object.keys(values).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.textContent = values[id];
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderStats);
  else renderStats();
})();
