#!/bin/bash
# Pull submissions from Light's Mac and generate a patch for cex-addresses.ts
# Usage: ./scripts/merge-submissions.sh [--apply]
# Without --apply, just shows what would be added

set -euo pipefail

LIGHT_HOST="macbook@100.116.197.127"
LIGHT_FILE="~/.openclaw/workspace/amikyced-submissions/submissions.json"
CEX_FILE="src/lib/cex-addresses.ts"
LOCAL_TMP="/tmp/amikyced-merge-submissions.json"

echo ">> Fetching submissions from Light's Mac..."
ssh -o ConnectTimeout=10 -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 "$LIGHT_HOST" \
  "cat $LIGHT_FILE" > "$LOCAL_TMP"

COUNT=$(jq '.submissions | length' "$LOCAL_TMP")
echo ">> Found $COUNT community submissions"

if [ "$COUNT" -eq 0 ]; then
  echo ">> Nothing to merge"
  exit 0
fi

# Show submissions for review
echo ""
echo "== Community Submissions =="
jq -r '.submissions[] | "  \(.address) → \(.exchange) (\(.chain)) [submitted: \(.submittedAt)]"' "$LOCAL_TMP"
echo ""

# Check which addresses are already in cex-addresses.ts
echo ">> Checking for duplicates against $CEX_FILE..."
NEW_ENTRIES=""
DUPES=0

while IFS= read -r line; do
  addr=$(echo "$line" | jq -r '.address')
  exchange=$(echo "$line" | jq -r '.exchange')
  chain=$(echo "$line" | jq -r '.chain')

  # Check if already in the file (case-insensitive)
  if grep -qi "$addr" "$CEX_FILE" 2>/dev/null; then
    echo "  SKIP (exists): $addr → $exchange"
    DUPES=$((DUPES + 1))
  else
    echo "  NEW: $addr → $exchange ($chain)"
    NEW_ENTRIES="$NEW_ENTRIES\n  { address: \"$addr\", exchange: \"$exchange\", label: \"$exchange (Community)\", chain: \"$chain\" },"
  fi
done < <(jq -c '.submissions[]' "$LOCAL_TMP")

if [ -z "$NEW_ENTRIES" ]; then
  echo ""
  echo ">> All submissions already in $CEX_FILE. Nothing to merge."
  exit 0
fi

echo ""
echo ">> $DUPES duplicates skipped"
echo ">> New entries to add to SUSPECTED_CEX array:"
echo -e "$NEW_ENTRIES"

if [ "${1:-}" = "--apply" ]; then
  echo ""
  echo ">> Applying to $CEX_FILE..."
  # Insert before the closing ]; of SUSPECTED_CEX array
  # Find the marker and insert
  INSERT_MARKER="// == Community Submissions =="

  if ! grep -q "$INSERT_MARKER" "$CEX_FILE"; then
    # Add marker before end of SUSPECTED_CEX
    # We'll append to the suspected section
    echo ""
    echo ">> NOTE: Add these entries manually to the SUSPECTED_CEX array in $CEX_FILE"
    echo -e "$NEW_ENTRIES"
  else
    echo ">> Entries would be inserted at $INSERT_MARKER"
    echo -e "$NEW_ENTRIES"
  fi

  echo ""
  echo ">> Done. Review changes, then commit and push."
else
  echo ""
  echo ">> Run with --apply to add these to $CEX_FILE"
fi
