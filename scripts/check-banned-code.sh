#!/bin/bash
# Build-time check: Prevent banned 'claim' mechanism from being deployed
# This enforces system requirement: ONLY admin can assign materials, no self-claim

set -e

BANNED_PATTERNS=("claim" "reclaim" "reclamar" "Reclamar")
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
