// 把 map.json（英文原文 → 中文译文）写回 Studio 源码。
// 先重新运行 extract.mjs 取得当前源码中的最新位置，再从后往前替换，避免位置偏移。
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const here = new URL(".", import.meta.url).pathname;
const ROOT = new URL("../packages/studio/src/", import.meta.url).pathname;
execFileSync("node", [here + "extract.mjs"], { stdio: "inherit" });
const strings = JSON.parse(readFileSync(here + "strings.json", "utf8"));
const map = JSON.parse(readFileSync(here + "map.json", "utf8"));

const byFile = new Map();
for (const s of strings) {
  if (!(s.text in map)) continue;
  if (!byFile.has(s.file)) byFile.set(s.file, []);
  byFile.get(s.file).push(s);
}

const escapeFor = (q, v) => v.replace(/\\/g, "\\\\").replace(new RegExp(q, "g"), "\\" + q).replace(/\n/g, "\\n");
let replaced = 0;
const broken = [];
for (const [file, list] of byFile) {
  let src = readFileSync(ROOT + file, "utf8");
  list.sort((a, b) => b.start - a.start);
  let lastStart = Infinity;
  for (const s of list) {
    if (s.end > lastStart) continue; // 嵌套或重叠的节点只替换外层
    const raw = src.slice(s.start, s.end);
    const zh = map[s.text];
    let next;
    if (s.kind === "jsxtext") {
      const i = raw.indexOf(s.text);
      if (i < 0) continue;
      next = raw.slice(0, i) + zh + raw.slice(i + s.text.length);
    } else if (raw.startsWith("`")) {
      next = "`" + zh + "`"; // 译文里的反引号都属于 ${} 内嵌模板，是代码本身，不能转义
    } else {
      const q = raw[0];
      next = q + escapeFor(q, zh) + q;
    }
    src = src.slice(0, s.start) + next + src.slice(s.end);
    lastStart = s.start;
    replaced++;
  }
  // 每个文件替换完立即做语法检查，出错的单独记录，方便定位
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  if (sf.parseDiagnostics.length) broken.push([file, sf.parseDiagnostics[0].messageText]);
  else writeFileSync(ROOT + file, src);
}
console.log(`替换 ${replaced} 处，涉及 ${byFile.size} 个文件`);
if (broken.length) console.log("语法错误（未写入）：", broken);
