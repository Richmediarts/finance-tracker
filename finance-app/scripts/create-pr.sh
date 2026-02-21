#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-main}"
HEAD="${HEAD:-feature/budget-ui}"
TITLE="${TITLE:-Budget UI redesign}"
BODY_FILE="${BODY_FILE:-pr-body.txt}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install gh and run this script again." >&2
  exit 1
fi

gh pr create --title "$TITLE" --body "$(cat "$BODY_FILE")" --base "$BASE" --head "$HEAD"
