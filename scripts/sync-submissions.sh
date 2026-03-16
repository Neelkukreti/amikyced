#!/bin/bash
# Sync user-submitted exchange addresses from Vercel to Light's Mac
# Usage: ./scripts/sync-submissions.sh
# Requires: SYNC_SECRET env var (same as on Vercel)

set -euo pipefail

SITE_URL="${SITE_URL:-https://amikyced.vercel.app}"
SYNC_SECRET="${SYNC_SECRET:?Set SYNC_SECRET env var}"
LIGHT_HOST="macbook@100.116.197.127"
LIGHT_DIR="~/.openclaw/workspace/amikyced-submissions"
LIGHT_FILE="$LIGHT_DIR/submissions.json"
LOCAL_TMP="/tmp/amikyced-submissions-sync.json"

echo ">> Fetching submissions from $SITE_URL..."
curl -sf "$SITE_URL/api/submissions?secret=$SYNC_SECRET" -o "$LOCAL_TMP"

NEW_COUNT=$(jq '.submissions | length' "$LOCAL_TMP")
echo ">> Got $NEW_COUNT submissions from Vercel"

if [ "$NEW_COUNT" -eq 0 ]; then
  echo ">> No new submissions to sync"
  exit 0
fi

# Merge with existing on Light's Mac
echo ">> Merging with existing submissions on Light's Mac..."
EXISTING=$(ssh -o ConnectTimeout=10 -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 "$LIGHT_HOST" \
  "cat $LIGHT_FILE 2>/dev/null || echo '{\"submissions\":[]}'")

# Merge: deduplicate by address (lowercase)
MERGED=$(echo "$EXISTING" | jq --argjson new "$(cat $LOCAL_TMP)" '
  .submissions as $old |
  ($old | map(.address | ascii_downcase) | INDEX(.; .)) as $seen |
  $new.submissions | map(select((.address | ascii_downcase) as $a | $seen[$a] == null)) |
  { submissions: ($old + .) }
')

TOTAL=$(echo "$MERGED" | jq '.submissions | length')
echo ">> Total after merge: $TOTAL submissions"

# Upload merged file to Light's Mac
echo "$MERGED" | ssh -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 "$LIGHT_HOST" \
  "mkdir -p $LIGHT_DIR && cat > $LIGHT_FILE"

echo ">> Synced to Light's Mac at $LIGHT_FILE"
echo ">> Run './scripts/merge-submissions.sh' to update cex-addresses.ts"
