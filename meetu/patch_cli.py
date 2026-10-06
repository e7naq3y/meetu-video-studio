"""把官方 npm 包里所有"引导去下载官方版"的地方，改成调用本机的 hyperframes 命令（Meet U 视频工作室）。

用法：python3 patch_cli.py <解包后的 package 目录 或 skills 目录>

为什么需要：员工电脑上 `hyperframes` 命令就是 Meet U 汉化版，但官方文案到处写着 `npx hyperframes ...`、
项目 package.json 里写着 `npx --yes hyperframes@0.8.137 preview`。AI 或员工照着运行，npx 会下载官方英文版，
打开的就是带 Framey 广告的官方编辑器。这里把这些入口统一改成 `hyperframes`。
"""
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])

MEETU_NOTE = """> **本项目使用 Meet U 视频工作室（安杰开发，HyperFrames 的中文版）。**
> 所有命令一律直接用 `hyperframes <命令>`（例如 `hyperframes preview --background`、`hyperframes render`）。
> **不要**用 `npx hyperframes` 或 `npx hyperframes@版本号`：那样会下载官方英文版，打开的不是 Meet U 视频工作室。
> 也不要运行 `hyperframes skills update` 或 `npx skills add`，skills 由安杰视频工具包统一管理。

"""

# 顺序重要：先替换带版本号、带 --yes 的长形式，再替换短形式
PATTERNS = [
    (re.compile(r"npx --yes hyperframes@[\w.\-]+"), "hyperframes"),
    (re.compile(r"npx -y hyperframes@[\w.\-]+"), "hyperframes"),
    (re.compile(r"npx hyperframes@[\w.\-]+"), "hyperframes"),
    (re.compile(r"npx --yes hyperframes\b"), "hyperframes"),
    (re.compile(r"npx -y hyperframes\b"), "hyperframes"),
    (re.compile(r"npx hyperframes\b"), "hyperframes"),
]

# init 生成 package.json 脚本的函数：原本写成 `npx --yes hyperframes@0.8.137 preview`
INIT_OLD = "return `npx --yes ${getHyperframesPackageSpecifier()} ${command}`;"
INIT_NEW = "return `hyperframes ${command}`;"

changed = 0
init_patched = False
for p in root.rglob("*"):
    if p.suffix not in {".js", ".mjs", ".md", ".mdx", ".json", ".txt", ".html"} or not p.is_file():
        continue
    s = p.read_text(encoding="utf-8", errors="surrogateescape")
    orig = s
    if INIT_OLD in s:
        s = s.replace(INIT_OLD, INIT_NEW)
        init_patched = True
    for pat, rep in PATTERNS:
        s = pat.sub(rep, s)
    # 项目模板里的 CLAUDE.md / AGENTS.md：开头加上 Meet U 说明
    if p.name in {"CLAUDE.md", "AGENTS.md"} and "templates" in p.parts and "Meet U 视频工作室" not in s:
        s = MEETU_NOTE + s
    if s != orig:
        p.write_text(s, encoding="utf-8", errors="surrogateescape")
        changed += 1

left = sum(len(re.findall(r"npx (--yes |-y )?hyperframes", p.read_text(encoding="utf-8", errors="ignore")))
           for p in root.rglob("*") if p.is_file() and p.suffix in {".js", ".md", ".mdx", ".mjs"})
print(f"修改 {changed} 个文件；init 脚本{'已' if init_patched else '未'}修改；剩余 npx hyperframes：{left}")
if (root / "dist").exists() and not init_patched:
    sys.exit("init 函数没找到，上游代码可能变了，需要人工检查 meetu/patch_cli.py")
