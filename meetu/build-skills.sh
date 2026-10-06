#!/bin/zsh
# 打包 HyperFrames 官方发布的 21 个 skill（版本与 Studio 一致），并改成调用本机 hyperframes 命令。
set -e
HERE=${0:A:h}; ROOT=$HERE/..
UP=$(jq -r .version $ROOT/packages/studio/package.json)
W=$(mktemp -d)
jq -r '.skills | if type=="array" then .[].name else keys[] end' $ROOT/skills-manifest.json > $W/list.txt
mkdir -p $W/skills && for s in $(cat $W/list.txt); do cp -R $ROOT/skills/$s $W/skills/; done
python3 $HERE/patch_cli.py $W/skills
cp $ROOT/LICENSE $W/skills/
mkdir -p $HERE/dist && rm -f $HERE/dist/hyperframes-skills-$UP.zip
(cd $W/skills && zip -qr $HERE/dist/hyperframes-skills-$UP.zip . -x '*/node_modules/*' '*.test.*' '*/.DS_Store')
echo $HERE/dist/hyperframes-skills-$UP.zip
