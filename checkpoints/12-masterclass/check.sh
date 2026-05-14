#!/usr/bin/env bash
set -euo pipefail

STEP="${1:-all}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SANDBOX="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ PASS${NC} $1"; }
fail() { echo -e "${RED}✗ FAIL${NC} $1"; exit 1; }
info() { echo -e "${CYAN}ℹ INFO${NC} $1"; }
hint() { echo -e "${YELLOW}⚠ HINT${NC} $1"; }

case "$STEP" in
  1) # Run all vitest tests
     info "Verification: Tous les tests vitest"
     cd "$SANDBOX"
     RESULT=$(npx vitest run 2>&1 || true)
     PASSED=$(echo "$RESULT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     FAILED=$(echo "$RESULT" | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$PASSED" -gt 0 ]]; then
       pass "$PASSED tests passent, $FAILED echouent"
     else
       fail "Aucun test n'a pu etre lance"
     fi ;;
  2) # Count skills
     info "Verification: Skills dans .claude/commands/"
     if [[ -d "$SANDBOX/.claude/commands" ]]; then
       SKILL_COUNT=$(find "$SANDBOX/.claude/commands" -name "*.md" | wc -l | tr -d ' ')
       pass "$SKILL_COUNT skill(s) configure(s)"
     else
       info "Aucun dossier .claude/commands/ trouve"
     fi ;;
  3) # Count hooks
     info "Verification: Hooks dans .claude/settings.json"
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       HOOK_COUNT=$(grep -c '"PreToolUse"\|"PostToolUse"\|"Stop"\|"PreCommit"\|"PostCommit"' "$SANDBOX/.claude/settings.json" || echo "0")
       pass "$HOOK_COUNT type(s) de hooks configures"
     else
       info "Aucun .claude/settings.json trouve"
     fi ;;
  all)
     echo "=== CHECKLIST FINALE ==="
     echo ""
     echo "--- Tests ---"
     "$0" 1 || true
     echo ""
     echo "--- Skills ---"
     "$0" 2 || true
     echo ""
     echo "--- Hooks ---"
     "$0" 3 || true
     echo ""
     echo "=== FIN DE LA FORMATION ===" ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-3, all)" ;;
esac
