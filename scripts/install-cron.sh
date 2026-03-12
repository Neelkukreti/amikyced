#!/bin/bash
# Install KYCScan address discovery as a daily launchd job
# Usage: bash scripts/install-cron.sh

set -e

PLIST_NAME="com.kycscan.discover.plist"
PLIST_SRC="$(cd "$(dirname "$0")" && pwd)/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

# Fix node path for this machine
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "ERROR: node not found in PATH"
    exit 1
fi

echo "Using node at: $NODE_PATH"

# Create data dir
mkdir -p "$(dirname "$0")/../data"

# Update plist with correct node path
sed "s|/usr/local/bin/node|$NODE_PATH|g" "$PLIST_SRC" > "$PLIST_DEST"

# Unload if already loaded
launchctl unload "$PLIST_DEST" 2>/dev/null || true

# Load the job
launchctl load "$PLIST_DEST"

echo "Installed! Discovery runs daily at 4 AM."
echo "  Plist: $PLIST_DEST"
echo "  Logs:  data/discovery-stdout.log"
echo ""
echo "Commands:"
echo "  Run now:    node scripts/discover-addresses.mjs"
echo "  Dry run:    node scripts/discover-addresses.mjs --dry-run"
echo "  Auto-merge: node scripts/discover-addresses.mjs --merge"
echo "  Uninstall:  launchctl unload $PLIST_DEST && rm $PLIST_DEST"
echo "  Check:      launchctl list | grep kycscan"
