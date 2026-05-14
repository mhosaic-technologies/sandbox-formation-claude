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

cd "$SANDBOX"

case "$STEP" in
  1) # Capture tests before refactoring
     info "Verification: Tests de capture avant refactoring"
     RESULT=$(npx vitest run tests/export-service.test.ts 2>&1 || true)
     PASSED=$(echo "$RESULT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$PASSED" -ge 20 ]]; then
       pass "$PASSED tests de capture passent. Etat de reference documente."
     else
       fail "Seulement $PASSED tests passent. Lancez les tests avant de refactorer!"
     fi ;;
  2) # Monster function has been split
     info "Verification: La fonction monstre a ete decoupee"
     MONSTER_LINES=$(wc -l < "$SANDBOX/src/services/export-service.ts" | tr -d ' ')
     FUNC_COUNT=$(grep -c "^export function\|^function\|^async function" "$SANDBOX/src/services/export-service.ts" || echo "1")
     if [[ "$FUNC_COUNT" -ge 3 ]]; then
       pass "export-service.ts contient $FUNC_COUNT fonctions (avant: 1 monstre)"
       if [[ "$MONSTER_LINES" -le 200 ]]; then
         pass "Fichier reduit a $MONSTER_LINES lignes"
       else
         info "Fichier encore a $MONSTER_LINES lignes — continuez le decoupage"
       fi
     else
       hint "Extrayez les responsabilites: validation, filtrage, formatage CSV, formatage JSON..."
       fail "Seulement $FUNC_COUNT fonction(s). Objectif: au moins 3 fonctions separees."
     fi ;;
  3) # Tests still green after refactoring
     info "Verification: Tests toujours verts apres refactoring"
     RESULT=$(npx vitest run tests/export-service.test.ts 2>&1 || true)
     PASSED=$(echo "$RESULT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     FAILED=$(echo "$RESULT" | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$FAILED" -eq 0 && "$PASSED" -ge 20 ]]; then
       pass "Refactoring reussi! $PASSED tests passent, 0 regression."
     else
       fail "$FAILED test(s) casse(s) par le refactoring. Revenez en arriere et procedez par etapes plus petites."
     fi ;;
  all) for s in 1 2 3; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-3, all)" ;;
esac
