#!/bin/sh
# Builds dist/chandrayaan.html and publishes it to the gh-pages branch, which GitHub Pages serves:
# the page as index.html (and chandrayaan.html), with .nojekyll. gh-pages holds only the built site.
set -e
cd "$(dirname "$0")/.."
repo=$(pwd)
node scripts/build.mjs
site=$(mktemp -d)
if git fetch -q origin +gh-pages:refs/remotes/origin/gh-pages 2>/dev/null; then
  git worktree add -q --detach "$site" origin/gh-pages
else
  git worktree add -q --detach "$site" HEAD && (cd "$site" && git checkout -q --orphan gh-pages && git rm -rqf .)
fi
cd "$site"
git rm -rq --ignore-unmatch . >/dev/null 2>&1 || true
cp "$repo/dist/chandrayaan.html" index.html
cp "$repo/dist/chandrayaan.html" chandrayaan.html
touch .nojekyll
git add -A
if git commit -q -m "Deploy $(git -C "$repo" rev-parse --short HEAD)"; then git push -q origin HEAD:gh-pages && echo "deployed"; else echo "site already up to date"; fi
cd "$repo"
git worktree remove --force "$site"
