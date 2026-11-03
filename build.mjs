import { marked } from "marked";
import fs from "node:fs";
import path from "node:path";

const read = (f) => fs.readFileSync(f, "utf8");
const fill = (t, v) => t.replace(/{{(\w+)}}/g, (_, k) => v[k] ?? "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function parse(file) {
  const m = read(file).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(m[1].split("\n").map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
  for (const k of ["title", "date"]) if (!meta[k]) throw new Error(`${file}: missing ${k}`);
  return { meta, body: m[2] };
}

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist/essays", { recursive: true });
for (const f of ["style.css", "theme.js"]) fs.copyFileSync(f, path.join("dist", f));

const template = read("src/essay.html");
const posts = fs.readdirSync("content/essays").filter((f) => f.endsWith(".md")).map((f) => {
  const { meta, body } = parse(path.join("content/essays", f));
  const slug = f.replace(/\.md$/, "");
  const minutes = Math.max(1, Math.round(body.split(/\s+/).length / 230));
  fs.writeFileSync(`dist/essays/${slug}.html`, fill(template, {
    title: esc(meta.title), summary: esc(meta.summary || ""), date: fmt(meta.date), minutes, content: marked.parse(body),
  }));
  return { slug, ...meta };
}).sort((a, b) => b.date.localeCompare(a.date));

const items = posts.map((p) =>
  `<li><a href="essays/${p.slug}.html">${esc(p.title)}</a><small>${fmt(p.date)}${p.summary ? " · " + esc(p.summary) : ""}</small></li>`).join("\n");
fs.writeFileSync("dist/index.html", fill(read("src/index.html"), { essays: items }));
console.log(`Built ${posts.length} essay(s) into dist/`);
