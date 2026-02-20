#!/usr/bin/env bash
set -euo pipefail

# backup_changed.sh
# Back up changed files (from last commit) to an external location outside the repo.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# External backup location: can be overridden by BACKUP_EXT env var.
BACKUP_EXT="${BACKUP_EXT-}"

# Discover a reasonable default external backup location if none provided
if [ -z "$BACKUP_EXT" ]; then
  POSSIBLES=(
    "/mnt/d/Backups/finance-tracker"
    "/mnt/e/Backups/finance-tracker"
    "$HOME/backup_external"
  )
  for p in "${POSSIBLES[@]}"; do
    if [ -d "$p" ]; then
      BACKUP_EXT="$p"
      break
    fi
  done
fi
if [ -z "$BACKUP_EXT" ]; then
  # Fallback to a local backup dir outside the repo
  BACKUP_EXT="$HOME/backup_external"
fi

mkdir -p "$BACKUP_EXT"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_EXT/finance-tracker-backup-$TIMESTAMP"
mkdir -p "$DEST"

# Get changed files since last commit
CHANGED=$(git diff --name-only HEAD)
if [ -z "$CHANGED" ]; then
  echo "No changed files to backup." >&2
  exit 0
fi

for f in $CHANGED; do
  dest_dir="$DEST/$(dirname "$f")"
  mkdir -p "$dest_dir"
  cp -a "$REPO_ROOT/$f" "$dest_dir/"/ || true
done

echo "Backed up changed files to $DEST"
