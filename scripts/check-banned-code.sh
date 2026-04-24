#!/bin/bash
# Build-time check: Prevent banned 'claim' mechanism from being deployed
# This enforces system requirement: ONLY admin can assign materials, no self-claim

set -e

# "claim" without "clients." prefix — blocks the UI material-claim feature.
# "clients.claim()" is a standard Web Push API service worker method and is allowed.
BANNED_PATTERNS=("reclaim" "reclamar" "Reclamar")
# Also block bare "claim" when not preceded by "clients." (service worker context)
CLAIM_MATCHES=$(grep -r "\bclaim\b" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build \
  . 2>/dev/null | grep -v "clients\.claim" | grep -v "check-banned-code" || true)
if [ ! -z "$CLAIM_MATCHES" ]; then
  echo "❌ FORBIDDEN: Found 'claim' (non-SW context) in source code:"
  echo "$CLAIM_MATCHES"
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
fi
FOUND_ISSUES=0

echo "🔍 Checking for banned claim mechanism..."

for pattern in "${BANNED_PATTERNS[@]}"; do
  MATCHES=$(grep -r "$pattern" \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=dist \
    --exclude-dir=build \
    . 2>/dev/null || true)

  if [ ! -z "$MATCHES" ]; then
    echo "❌ FORBIDDEN: Found '$pattern' in source code:"
    echo "$MATCHES"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
  fi
done

if [ $FOUND_ISSUES -gt 0 ]; then
  echo ""
  echo "❌ BUILD FAILED: Banned code patterns detected"
  echo "The 'claim' mechanism is hard-prohibited by system requirements."
  echo "Only admin/coordinador roles can assign materials."
  exit 1
fi

echo "✅ No banned code patterns found - build can proceed"
exit 0
