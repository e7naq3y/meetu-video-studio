#!/bin/zsh
# 用法：meetu/package.sh <版本后缀，如 meetu.1>
# 取官方 npm 包，把其中的 dist/studio 换成汉化版，打成 tgz。
set -e
HERE=${0:A:h}; ROOT=$HERE/..
UP=$(jq -r .version $ROOT/packages/studio/package.json)
VER="$UP-${1:-meetu.1}"
W=$(mktemp -d); cd $W
npm pack hyperframes@$UP >/dev/null 2>&1
tar xzf hyperframes-$UP.tgz
rm -rf package/dist/studio && mkdir -p package/dist/studio
cp -R $ROOT/packages/studio/dist/. package/dist/studio/
# 版本号带上 meetu 后缀，便于区分官方版
jq --arg v "$VER" '.version=$v | .description="Meet U 视频工作室（安杰开发）· 基于 HyperFrames 的中文版"' package/package.json > p.json && mv p.json package/package.json
cp $HERE/NOTICE.md package/NOTICE-MEETU.md && cp $ROOT/LICENSE package/LICENSE
mkdir -p $HERE/dist && tar czf $HERE/dist/meetu-hyperframes-$VER.tgz package
echo $HERE/dist/meetu-hyperframes-$VER.tgz
