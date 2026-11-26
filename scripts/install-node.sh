#!/usr/bin/env bash
set -euo pipefail

# Install a verified Node 22 archive for this blog, without changing system Node.
task_node_root="$HOME/.local/share/shanhai-blog"
if [ -x "$task_node_root/node/bin/node" ]; then
  "$task_node_root/node/bin/node" --version
  exit 0
fi
case "$(uname -m)" in
  aarch64|arm64) task_node_arch=arm64 ;;
  x86_64) task_node_arch=x64 ;;
  *) echo "Unsupported architecture" >&2; exit 1 ;;
esac
mkdir -p "$task_node_root/downloads"
cd "$task_node_root/downloads"
curl --fail --location --retry 3 --connect-timeout 15 --max-time 180 -o SHASUMS256.txt https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt
task_node_archive=$(awk -v suffix="linux-$task_node_arch.tar.xz" '$2 ~ suffix "$" { print $2 }' SHASUMS256.txt)
if [ -z "$task_node_archive" ]; then echo "Node archive not found" >&2; exit 1; fi
curl --fail --location --retry 3 --connect-timeout 15 --max-time 300 -o "$task_node_archive" "https://nodejs.org/dist/latest-v22.x/$task_node_archive"
awk -v file="$task_node_archive" '$2 == file { print }' SHASUMS256.txt > selected.sha256
sha256sum --check selected.sha256
mkdir -p "$task_node_root/node"
tar -xJf "$task_node_archive" --strip-components=1 -C "$task_node_root/node"
"$task_node_root/node/bin/node" --version
echo 'Use: export PATH="$HOME/.local/share/shanhai-blog/node/bin:$PATH"'
