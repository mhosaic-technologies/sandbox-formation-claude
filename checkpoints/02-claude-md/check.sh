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
  1) # CLAUDE.md global exists
     info "Verification: CLAUDE.md global existe"
     if [[ -f "$HOME/.claude/CLAUDE.md" ]]; then
       LINES=$(wc -l < "$HOME/.claude/CLAUDE.md" | tr -d ' ')
       pass "CLAUDE.md global trouve ($LINES lignes)"
     else
       hint "Creez ~/.claude/CLAUDE.md avec vos preferences globales"
       fail "Pas de CLAUDE.md global trouve dans ~/.claude/"
     fi ;;
  2) # CLAUDE.md project exists with >= 5 lines
     info "Verification: CLAUDE.md projet sandbox"
     if [[ -f "$SANDBOX/CLAUDE.md" ]]; then
       LINES=$(wc -l < "$SANDBOX/CLAUDE.md" | tr -d ' ')
       if [[ "$LINES" -ge 5 ]]; then
         pass "CLAUDE.md projet trouve ($LINES lignes)"
       else
         hint "Ajoutez au moins les conventions de code, la stack et les commandes de build"
         fail "CLAUDE.md trop court ($LINES lignes). Minimum recommande: 5 lignes."
       fi
     else
       fail "Pas de CLAUDE.md dans le sandbox. Lancez /init dans Claude Code ou creez-le manuellement."
     fi ;;
  3) # CLAUDE.md content mentions key topics
     info "Verification: Contenu du CLAUDE.md"
     if [[ -f "$SANDBOX/CLAUDE.md" ]]; then
       CONTENT=$(cat "$SANDBOX/CLAUDE.md")
       CHECKS=0
       if echo "$CONTENT" | grep -qi "typescript\|ts\|node"; then
         pass "Mentionne la stack (TypeScript/Node)"
         CHECKS=$((CHECKS + 1))
       fi
       if echo "$CONTENT" | grep -qi "test\|vitest\|jest"; then
         pass "Mentionne les tests"
         CHECKS=$((CHECKS + 1))
       fi
       if echo "$CONTENT" | grep -qi "convention\|style\|format\|lint"; then
         pass "Mentionne les conventions"
         CHECKS=$((CHECKS + 1))
       fi
       if [[ "$CHECKS" -lt 2 ]]; then
         hint "Un bon CLAUDE.md mentionne: stack, tests, conventions, architecture"
         fail "CLAUDE.md incomplet ($CHECKS/3 criteres)"
       fi
       pass "CLAUDE.md bien structure ($CHECKS/3 criteres)"
     else
       fail "Pas de CLAUDE.md trouve"
     fi ;;
  all) for s in 1 2 3; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-3, all)" ;;
esac
