import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptsDirectory, "..");
const generatedSite = path.join(repositoryRoot, ".site");
const templatePath = path.join(repositoryRoot, "Top", "article-template.html");
const outputDirectory = path.join(generatedSite, "public", "top", "articles");
const requireFromSite = createRequire(path.join(generatedSite, "package.json"));
const MarkdownIt = requireFromSite("markdown-it");

const articles = [
	{
		source: "TOP Hub 01 方法论.md",
		output: "hub-method.html",
		categoryId: "01",
		categoryName: "Hub / 资源",
		description: "学习、科研、写作与知识管理。",
	},
	{
		source: "TOP Hub 02 工具论.md",
		output: "hub-tools.html",
		categoryId: "01",
		categoryName: "Hub / 资源",
		description: "科研、写作、绘图与编程工具。",
	},
	{
		source: "TOP Hub 03 机遇与发展.md",
		output: "hub-opportunities.html",
		categoryId: "01",
		categoryName: "Hub / 资源",
		description: "招生、实习、联培与职业发展。",
	},
	{
		source: "TOP Hub 04 科普知识与技术文档.md",
		output: "hub-science.html",
		categoryId: "01",
		categoryName: "Hub / 资源",
		description: "生物信息学、机器学习与技术资料。",
	},
	{
		source: "TOP Hub 05 社区与思考.md",
		output: "hub-community.html",
		categoryId: "01",
		categoryName: "Hub / 资源",
		description: "社区、课程与科研行业观察。",
	},
	{
		source: "TOP2025 年度收录 01 人物.md",
		output: "people-2025.html",
		categoryId: "02",
		categoryName: "People / 人物故事",
		description: "2025 年人物故事收录。",
	},
	{
		source: "TOP2025 事情与项目.md",
		output: "project-2025.html",
		categoryId: "03",
		categoryName: "Project / 事情与项目",
		description: "2025 年事情与项目收录。",
	},
	{
		source: "TOP2025 年度帖子.md",
		output: "top2025-posts.html",
		categoryId: "04",
		categoryName: "Post / 年度帖子",
		description: "博士成长与科研训练：申请、能力形成和毕业回看。",
	},
	{
		source: "TOP2025 Nerd Fun.md",
		output: "top2025-nerd-fun.html",
		categoryId: "04",
		categoryName: "Post / 年度帖子",
		description: "科研、工程、读博和互联网语境中的幽默。",
	},
	{
		source: "TOP2025 年度事件与新闻.md",
		output: "news-2025.html",
		categoryId: "05",
		categoryName: "News / 年度事件与新闻",
		description: "值得回看的事件、争议与公共讨论。",
	},
	{
		source: "TOP2025 年度文化.md",
		output: "culture-2025.html",
		categoryId: "06",
		categoryName: "Culture / 年度文化",
		description: "音乐、图书与影视剧的年度收录。",
	},
];

const englishMeta = {
	"hub-method.html": {
		title: "TOP Hub 01: Methodology",
		description: "Learning, research, writing and knowledge management.",
		summary: "A working index of methods for learning, research, writing and personal knowledge management. The original links remain available for direct reading."
	},
	"hub-tools.html": {
		title: "TOP Hub 02: Tools",
		description: "Tools for research, writing, visualization and programming.",
		summary: "A practical collection of tools for research, writing, visual work and programming, organised by the task they help solve."
	},
	"hub-opportunities.html": {
		title: "TOP Hub 03: Opportunities",
		description: "Admissions, internships, joint training and careers.",
		summary: "A collection of opportunities and pathways: admissions, internships, joint training, research positions and professional development."
	},
	"hub-science.html": {
		title: "TOP Hub 04: Science and technical notes",
		description: "Bioinformatics, machine learning and technical references.",
		summary: "Reference material for bioinformatics, machine learning and technical practice, kept as an entry point for further study."
	},
	"hub-community.html": {
		title: "TOP Hub 05: Communities and ideas",
		description: "Communities, courses and observations on research culture.",
		summary: "Communities, courses and observations on research culture, with source links preserved for context."
	},
	"people-2025.html": {
		title: "People",
		description: "Athletes, actors, researchers, engineers, writers and knowledge creators.",
		summary: "People noticed during the 2025 edition: their work, choices and the concrete influence they leave behind."
	},
	"project-2025.html": {
		title: "TOP2025 Projects",
		description: "Public programmes, education reform, personal engineering and long-term practice.",
		summary: "Projects and public efforts that connect education, research, engineering and long-term practice."
	},
	"top2025-posts.html": {
		title: "TOP2025 Posts",
		description: "Doctoral growth and research training: applications, skills and graduation reflections.",
		summary: "Long-form posts on doctoral applications, research ability, training, setbacks and the decisions behind a research life."
	},
	"top2025-nerd-fun.html": {
		title: "TOP2025 Nerd Fun",
		description: "Humour across research, engineering, doctoral life and the internet.",
		summary: "A lighter collection of research, engineering, doctoral-life and internet culture moments."
	},
	"news-2025.html": {
		title: "TOP2025 Events and news",
		description: "Events, debates and public discussions worth revisiting.",
		summary: "Events and debates that changed the frame of a question, invited public discussion or remained worth revisiting."
	},
	"culture-2025.html": {
		title: "TOP2025 Culture",
		description: "The year’s selection of music, books and screen works.",
		summary: "Music, books, films and series gathered as a personal cultural index. The original work titles and source links are retained."
	}
};

function englishArticleBody(meta, originalHtml) {
	return `<div class="english-summary"><p>${escapeHtml(meta.summary)}</p><p class="english-note">This English edition is an editorial translation of the index. Original titles, sources and links are preserved below.</p></div><details class="source-original"><summary>Show the original Chinese entry</summary><div class="source-original-body">${originalHtml}</div></details>`;
}

function assertInsideRepository(candidate) {
	const relative = path.relative(repositoryRoot, candidate);
	if (relative.startsWith("..") || path.isAbsolute(relative)) {
		throw new Error(`Path escaped the repository: ${candidate}`);
	}
}

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function parseArticle(markdown, sourceName) {
	const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
	if (!frontmatterMatch) {
		throw new Error(`Missing frontmatter in ${sourceName}`);
	}

	const frontmatter = frontmatterMatch[1];
	let body = markdown.slice(frontmatterMatch[0].length).trim();
	const headingMatch = body.match(/^#\s+(.+)\r?\n/);
	const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
	const title = titleMatch?.[1].trim() || headingMatch?.[1].trim();

	if (!title) {
		throw new Error(`Missing article title in ${sourceName}`);
	}
	if (headingMatch) {
		body = body.slice(headingMatch[0].length).trim();
	}

	return { title, body };
}

async function main() {
	for (const candidate of [generatedSite, templatePath, outputDirectory]) {
		assertInsideRepository(candidate);
	}

	const template = await readFile(templatePath, "utf8");
	const markdown = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: false,
	});
	let headingIndex = 0;
	markdown.renderer.rules.heading_open = (tokens, index) => {
		const level = tokens[index].tag.slice(1);
		return `<h${level} id="section-${headingIndex++}">`;
	};

	await mkdir(outputDirectory, { recursive: true });
	const searchEntries = [];
	let totalCharacters = 0;
	let totalLinks = 0;
	const domains = new Set();

	for (const article of articles) {
		const sourcePath = path.join(repositoryRoot, "content", "posts", article.source);
		const outputPath = path.join(outputDirectory, article.output);
		assertInsideRepository(sourcePath);
		assertInsideRepository(outputPath);

		const source = await readFile(sourcePath, "utf8");
		const parsed = parseArticle(source, article.source);
		const meta = englishMeta[article.output] || {
			title: article.output.replace(/\.html$/, ""),
			description: article.description,
			summary: "This entry is part of the TOP annual index."
		};
		const renderedBody = markdown.render(parsed.body).trim();
		totalCharacters += parsed.body.replace(/\s/g, "").length;
		const links = parsed.body.match(/https?:\/\/[^\s)]+/g) || [];
		totalLinks += links.length;
		links.forEach((link) => {
			try { domains.add(new URL(link).hostname.replace(/^www\./, "")); } catch {}
		});
		searchEntries.push({
			kind: "article",
			article: article.output,
			title: parsed.title,
			description: article.description,
			category: article.categoryName,
			titleEn: meta.title,
			descriptionEn: meta.description,
			textEn: meta.summary,
			href: `./articles/${article.output}`,
			text: parsed.body.replace(/[#>*_`\[\]()]/g, " ").replace(/\s+/g, " ").trim(),
		});
		const sections = [...parsed.body.matchAll(/^(#{2,4})\s+(.+)$/gm)];
		sections.forEach((match, sectionIndex) => {
			const start = match.index + match[0].length;
			const end = sectionIndex + 1 < sections.length ? sections[sectionIndex + 1].index : parsed.body.length;
			searchEntries.push({
				kind: "section",
				article: article.output,
				title: match[2].trim(),
				description: article.description,
				category: article.categoryName,
				titleEn: `Section ${sectionIndex + 1}`,
				descriptionEn: meta.description,
				textEn: meta.summary,
				href: `./articles/${article.output}#section-${sectionIndex}`,
				text: parsed.body.slice(start, end).replace(/[#>*_`\[\]()]/g, " ").replace(/\s+/g, " ").trim(),
			});
		});
		headingIndex = 0;
		const replacements = {
			"{{DESCRIPTION}}": escapeHtml(article.description),
			"{{DESCRIPTION_EN}}": escapeHtml(meta.description),
			"{{ARTICLE_TITLE}}": escapeHtml(parsed.title),
			"{{ARTICLE_TITLE_EN}}": escapeHtml(meta.title),
			"{{HUB_CLASS}}": article.categoryId === "01" ? "is-current" : "",
			"{{PEOPLE_CLASS}}": article.categoryId === "02" ? "is-current" : "",
			"{{PROJECT_CLASS}}": article.categoryId === "03" ? "is-current" : "",
			"{{POST_CLASS}}": article.categoryId === "04" ? "is-current" : "",
			"{{NEWS_CLASS}}": article.categoryId === "05" ? "is-current" : "",
			"{{CULTURE_CLASS}}": article.categoryId === "06" ? "is-current" : "",
			"{{CATEGORY_ID}}": article.categoryId,
			"{{CATEGORY_NAME}}": escapeHtml(article.categoryName),
			"{{CATEGORY_NAME_EN}}": escapeHtml((article.categoryName || "").split(" /")[0]),
			"{{ARTICLE_BODY}}": renderedBody,
			"{{ARTICLE_BODY_EN}}": englishArticleBody(meta, renderedBody),
		};

		let page = template;
		for (const [placeholder, value] of Object.entries(replacements)) {
			page = page.replaceAll(placeholder, value);
		}

		if (/{{[A-Z_]+}}/.test(page)) {
			throw new Error(`Unresolved template placeholder in ${article.output}`);
		}

		await writeFile(outputPath, page, "utf8");
		console.log(`Rendered TOP article: ${article.output}`);
	}

	const searchIndexPath = path.join(repositoryRoot, "Top", "assets", "search-index.js");
	assertInsideRepository(searchIndexPath);
	await writeFile(searchIndexPath, `window.TOP_SEARCH_INDEX = ${JSON.stringify(searchEntries)};\n`, "utf8");
	const statsPath = path.join(repositoryRoot, "Top", "assets", "stats.js");
	assertInsideRepository(statsPath);
	await writeFile(statsPath, `window.TOP_STATS = ${JSON.stringify({
		articles: articles.length,
		sections: searchEntries.filter((entry) => entry.kind === "section").length,
		characters: totalCharacters,
		links: totalLinks,
		domains: domains.size,
	})};
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
`, "utf8");
}

await main();
