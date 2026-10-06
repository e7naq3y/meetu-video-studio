// 扫描 Studio 源码中面向用户的英文文案，输出 strings.json（按出现位置记录）
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
const ROOT = new URL("../packages/studio/src/", import.meta.url).pathname;
// webmcp/ 是给 AI 调用的工具说明，员工看不到，翻译反而可能影响 AI 使用
const files = globSync("**/*.{ts,tsx}", { cwd: ROOT }).filter(f => !/\.(test|spec|stories)\.|__tests__|\/tests?\/|^webmcp\/|OpenInDesktopButton|agentPrompt/.test(f));
const ATTRS = new Set(["title","placeholder","aria-label","label","tooltip","description","alt","emptyText","emptyLabel","hint","helperText","subtitle","heading","confirmLabel","cancelLabel","shortcutLabel","ariaLabel","emptyMessage","message","text","caption","sublabel","detail","buttonLabel","actionLabel","name"]);
const PROPS = new Set(["label","title","description","tooltip","placeholder","hint","helperText","subtitle","heading","emptyText","emptyLabel","message","ariaLabel","detail","sublabel","confirmLabel","cancelLabel","actionLabel","buttonLabel","caption","shortLabel","groupLabel","sectionTitle","text"]);
const hasWord = s => /[A-Za-z]{2,}/.test(s) && !/^[a-z][a-zA-Z0-9]*$/.test(s.trim()) || /^[A-Z][a-z]+$/.test(s.trim());
const out = [];
for (const f of files) {
  const src = readFileSync(ROOT + f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const push = (node, kind, text) => { if (hasWord(text)) out.push({ file: f, kind, text, start: node.getStart(sf), end: node.getEnd(), tpl: ts.isTemplateExpression(node) }); };
  const tplText = (node) => node.getText(sf).slice(1, -1);
  // 只收"值位置"的字符串，避免误伤 cn("...")、键名等代码用途的字符串
  const valueStrings = (e, kind) => {
    if (!e) return;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) push(e, kind, e.text);
    else if (ts.isTemplateExpression(e)) push(e, kind, tplText(e));
    else if (ts.isParenthesizedExpression(e)) valueStrings(e.expression, kind);
    else if (ts.isConditionalExpression(e)) { valueStrings(e.whenTrue, kind); valueStrings(e.whenFalse, kind); }
    else if (ts.isBinaryExpression(e) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(e.operatorToken.kind)) valueStrings(e.right, kind);
  };
  const visit = (n) => {
    if (ts.isJsxText(n)) { const t = n.getText(sf).trim(); if (t) push(n, "jsxtext", t); }
    else if (ts.isJsxAttribute(n) && n.initializer) {
      const name = n.name.getText(sf);
      if (ATTRS.has(name)) {
        const init = n.initializer;
        if (ts.isStringLiteral(init)) push(init, "attr:" + name, init.text);
        else if (ts.isJsxExpression(init)) valueStrings(init.expression, "attr:" + name);
      }
    } else if (ts.isPropertyAssignment(n) && PROPS.has(n.name.getText(sf))) {
      valueStrings(n.initializer, "prop:" + n.name.getText(sf));
    } else if (ts.isJsxExpression(n) && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent))) {
      valueStrings(n.expression, "jsxexpr");
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
writeFileSync(new URL("strings.json", import.meta.url), JSON.stringify(out, null, 1));
const uniq = new Set(out.map(o => o.text));
const byKind = {}; out.forEach(o => byKind[o.kind.split(":")[0]] = (byKind[o.kind.split(":")[0]] || 0) + 1);
console.log("files", files.length, "occurrences", out.length, "unique", uniq.size, byKind);
