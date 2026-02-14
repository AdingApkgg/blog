#!/bin/bash
# 自定义增量部署脚本
# 替代 hexo deploy，保留 .deploy_git 的 git 历史，只推送增量变更
set -e

DEPLOY_DIR=".deploy_git"
REPO="https://github.com/AdingApkgg/AdingApkgg.github.io.git"
BRANCH="main"

echo ">>> 开始增量部署..."

# 1. 初始化 .deploy_git（仅首次）
if [ ! -d "$DEPLOY_DIR/.git" ]; then
  echo ">>> 首次运行，克隆远端仓库..."
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$DEPLOY_DIR"
fi

# 2. 确保远程地址正确
cd "$DEPLOY_DIR"
git remote set-url origin "$REPO" 2>/dev/null || git remote add origin "$REPO"

# 3. 拉取远端最新（保持历史同步，避免全量推送）
echo ">>> 同步远端历史..."
git fetch origin "$BRANCH" --depth 1 2>/dev/null || true
git reset --hard "origin/$BRANCH" 2>/dev/null || true
cd ..

# 4. 同步 public/ 到 .deploy_git/（保留 .git 目录）
echo ">>> 同步构建产物..."
rsync -a --delete --exclude='.git' public/ "$DEPLOY_DIR/"

# 5. 提交变更
cd "$DEPLOY_DIR"
git add -A

if git diff --cached --quiet; then
  echo ">>> 没有变更需要部署。"
  exit 0
fi

CHANGED=$(git diff --cached --stat | tail -1)
echo ">>> 变更: $CHANGED"
git commit -m "Site updated: $(date '+%Y-%m-%d %H:%M:%S')"

# 6. 推送（增量，通常很小）
echo ">>> 推送到 GitHub..."
if git push origin "$BRANCH" 2>&1; then
  echo ">>> 部署成功！"
else
  echo ">>> 推送失败，尝试强制推送..."
  git push origin "$BRANCH" --force 2>&1 && echo ">>> 部署成功！" || {
    echo ">>> 部署失败。请检查网络连接。"
    exit 1
  }
fi
