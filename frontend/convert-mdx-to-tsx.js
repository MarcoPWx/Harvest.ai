const fs = require("fs");
const path = require("path");

const mdxFiles = [
  "src/app/docs/testing/page.mdx",
  "src/app/docs/interview/page.mdx",
  "src/app/docs/ops/page.mdx",
  "src/app/docs/overview/page.mdx",
  "src/app/docs/api-usage/page.mdx",
];

function convertMdxToTsx(mdxPath) {
  const content = fs.readFileSync(mdxPath, "utf8");
  const tsxPath = mdxPath.replace(".mdx", ".tsx");

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Documentation";

  // Convert markdown to JSX
  let jsxContent = content
    // Headers
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escaped = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
      return `<pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto"><code>{\`${escaped}\`}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Lists - this is simplified, would need more complex parsing for nested lists
    .replace(/^-\s+(.+)$/gm, "<li>$1</li>")
    // Paragraphs
    .replace(/^([^<\n].+)$/gm, "<p>$1</p>")
    // Clean up consecutive li tags
    .replace(/(<li>.*<\/li>\n)+/g, (match) => `<ul>\n${match}</ul>\n`);

  const componentName =
    path
      .basename(path.dirname(mdxPath))
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") + "Page";

  const tsxContent = `export default function ${componentName}() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      ${jsxContent
        .split("\n")
        .map((line) => "      " + line)
        .join("\n")
        .trim()}
    </div>
  );
}`;

  fs.writeFileSync(tsxPath, tsxContent);
  fs.unlinkSync(mdxPath);
  console.log(`✅ Converted ${mdxPath} to ${tsxPath}`);
}

mdxFiles.forEach(convertMdxToTsx);
console.log("✅ All MDX files converted to TSX");
