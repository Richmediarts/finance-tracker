#!/usr/bin/env bash
set -euo pipefail

# Setup Git hooks path to use repository-stored hooks
HOOKS_PATH=".githooks"
git config core.hooksPath "$HOOKS_PATH"
echo "Git hooks path set to $HOOKS_PATH. Run this script once per fresh clone."
