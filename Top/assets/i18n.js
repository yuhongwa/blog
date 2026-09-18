(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var requested = params.get("lang");
  var saved = localStorage.getItem("top-language");
  var language = requested === "en" || requested === "zh" ? requested : (saved === "en" ? "en" : "zh");
  var initialized = false;
  window.TOP_LANGUAGE = language;
  window.TOP_EN_CATALOG = {
    "01": { title: "Resources", intro: "Websites, databases, tools, courses and reusable references, with their purpose and context.", entries: {
      "TOP Hub 01：方法论": ["TOP Hub 01: Methodology", "Learning, research, writing and knowledge management."],
      "TOP Hub 02：工具论": ["TOP Hub 02: Tools", "Tools for research, writing, visualization and programming."],
      "TOP Hub 03：机遇与发展": ["TOP Hub 03: Opportunities", "Admissions, internships, joint training and careers."],
      "TOP Hub 04：科普知识与技术文档": ["TOP Hub 04: Science and technical notes", "Bioinformatics, machine learning and technical references."],
      "TOP Hub 05：社区与思考": ["TOP Hub 05: Communities and ideas", "Communities, courses and observations on research culture."]
    }},
    "02": { title: "People and stories", intro: "People encountered or reconsidered during the year, through their work and concrete influence.", entries: { "这些人": ["People", "Athletes, actors, researchers, engineers, writers and knowledge creators."] } },
    "03": { title: "Projects and events", intro: "Reform, papers, research work, education experiments, personal engineering and long-running efforts.", entries: { "TOP2025 事情与项目": ["TOP2025 Projects", "Public programmes, education reform, personal engineering and long-term practice."] } },
    "04": { title: "Posts of the year", intro: "Long-form writing, answers, blogs and discussions worth returning to.", entries: { "TOP2025 年度帖子": ["TOP2025 Posts", "Doctoral growth and research training: applications, skills and graduation reflections."], "TOP2025 Nerd Fun": ["TOP2025 Nerd Fun", "Humour across research, engineering, doctoral life and the internet."] } },
    "05": { title: "Events and news", intro: "Public events that changed a judgment, started a discussion or remained worth revisiting.", entries: { "TOP2025 年度事件与新闻": ["TOP2025 Events and news", "Events, debates and public discussions worth revisiting."] } },
    "06": { title: "Culture", intro: "Films, series, documentaries, books, albums, songs and live performances.", entries: { "TOP2025 年度文化": ["TOP2025 Culture", "The year’s selection of music, books and screen works."] } }
  };

  function setValue(node, value, attribute) {
    if (!node || value == null) return;
    if (attribute) node.setAttribute(attribute, value);
    else node.textContent = value;
  }

  function apply() {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.body.classList.toggle("lang-en", language === "en");
    if (language === "en") {
      if (document.body.dataset.page === "search") document.title = "Search | TOP 2025";
      else if (document.body.dataset.page === "category") document.title = document.title.replace("栏目", "Section");
      else if (document.body.dataset.page !== "category" && document.querySelector(".intro")) document.title = "TOP 2025 | Annual index";
      else if (document.querySelector(".about-head")) document.title = "About and updates | TOP 2025";
      else if (document.querySelector(".article-head .article-en")) document.title = document.querySelector(".article-head .article-en").textContent + " | TOP 2025";
    }
    document.querySelectorAll("[data-zh][data-en]").forEach(function (node) {
      setValue(node, node.getAttribute(language === "en" ? "data-en" : "data-zh"));
    });
    document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach(function (node) {
      node.setAttribute("placeholder", node.getAttribute(language === "en" ? "data-placeholder-en" : "data-placeholder-zh"));
    });
    document.querySelectorAll("[data-aria-zh][data-aria-en]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute(language === "en" ? "data-aria-en" : "data-aria-zh"));
    });
    var labels = {
      "Main 主站 ↗": "Main site ↗",
      "介绍与更新 →": "About and updates →",
      "← TOP 首页": "← TOP Home",
      "TOP 首页 →": "TOP Home →",
      "持续更新": "Continuously updated"
    };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var text = walker.currentNode.nodeValue;
      var trimmed = text.trim();
      if (language === "en" && labels[trimmed]) walker.currentNode.nodeValue = text.replace(trimmed, labels[trimmed]);
      if (language === "zh" && trimmed === "Main site ↗") walker.currentNode.nodeValue = text.replace(trimmed, "Main 主站 ↗");
      if (language === "zh" && trimmed === "About and updates →") walker.currentNode.nodeValue = text.replace(trimmed, "介绍与更新 →");
      if (language === "zh" && trimmed === "← TOP Home") walker.currentNode.nodeValue = text.replace(trimmed, "← TOP 首页");
      if (language === "zh" && trimmed === "TOP Home →") walker.currentNode.nodeValue = text.replace(trimmed, "TOP 首页 →");
      if (language === "zh" && trimmed === "Continuously updated") walker.currentNode.nodeValue = text.replace(trimmed, "持续更新");
    }
    document.querySelectorAll(".article-body-zh").forEach(function (node) { node.hidden = language === "en"; });
    document.querySelectorAll(".article-body-en").forEach(function (node) { node.hidden = language !== "en"; });
    var toggle = document.getElementById("language-toggle");
    if (toggle) {
      toggle.textContent = language === "en" ? "中文" : "English";
      toggle.setAttribute("aria-label", language === "en" ? "切换到中文" : "Switch to English");
    }
    localStorage.setItem("top-language", language);
    window.TOP_LANGUAGE = language;
    if (initialized) document.dispatchEvent(new CustomEvent("top:languagechange", { detail: { language: language } }));
  }

  window.TOP_SET_LANGUAGE = function (next) {
    language = next === "en" ? "en" : "zh";
    var url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", url.toString());
    apply();
    initialized = true;
  };

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("language-toggle");
    if (toggle) toggle.addEventListener("click", function () { window.TOP_SET_LANGUAGE(language === "en" ? "zh" : "en"); });
    apply();
  });
})();
