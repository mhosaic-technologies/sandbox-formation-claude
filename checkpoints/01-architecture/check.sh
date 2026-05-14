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
  1) # Claude installed
     info "Verification: Claude Code est installe"
     if command -v claude &>/dev/null; then
       pass "Claude Code est installe ($(claude --version 2>/dev/null || echo 'version inconnue'))"
     else
       fail "Claude Code n'est pas installe. Lancez: npm install -g @anthropic-ai/claude-code"
     fi ;;
  2) # Sandbox accessible + deps installed
     info "Verification: Le projet sandbox est accessible"
     if [[ -f "$SANDBOX/package.json" ]]; then
       pass "Sandbox trouve dans $SANDBOX"
       if [[ -d "$SANDBOX/node_modules" ]]; then
         pass "Les dependances sont installees"
       else
         fail "Les dependances ne sont pas installees. Lancez: cd ../.. && npm install"
       fi
     else
       fail "Sandbox non trouve."
     fi ;;
  3) # Exploration - enough TS files
     info "Verification: Exploration du codebase"
     FILE_COUNT=$(find "$SANDBOX/src" -name "*.ts" | wc -l | tr -d ' ')
     if [[ "$FILE_COUNT" -ge 8 ]]; then
       pass "Le sandbox contient $FILE_COUNT fichiers TypeScript"
     else
       fail "Attendu au moins 8 fichiers .ts, trouve: $FILE_COUNT"
     fi
     ROUTE_COUNT=$(find "$SANDBOX/src/routes" -name "*.ts" | wc -l | tr -d ' ')
     if [[ "$ROUTE_COUNT" -ge 4 ]]; then
       pass "$ROUTE_COUNT routes API detectees"
     else
       fail "Attendu au moins 4 routes, trouve: $ROUTE_COUNT"
     fi ;;
  4) # Tests identified
     info "Verification: Tests du sandbox"
     cd "$SANDBOX"
     TEST_OUTPUT=$(npx vitest run 2>&1 || true)
     TOTAL=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     FAILED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$TOTAL" -gt 0 ]]; then
       pass "$TOTAL tests passent, $FAILED echouent (les echecs sont les bugs intentionnels!)"
       info "Vous avez identifie l'etat du projet. Bravo!"
     else
       fail "Aucun test n'a pu etre lance. Verifiez l'installation."
     fi ;;
  all) for s in 1 2 3 4; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-4, all)" ;;
esac
