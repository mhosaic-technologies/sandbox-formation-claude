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
  bug1)
     info "Verification: Bug #1 — Off-by-one (pagination)"
     RESULT=$(npx vitest run tests/pagination.test.ts 2>&1 || true)
     FAILED=$(echo "$RESULT" | grep -c "FAIL" || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "Bug #1 corrige! Tous les tests de pagination passent."
     else
       fail "Bug #1 non corrige. Indice: regardez le calcul de startIndex dans pagination.ts"
     fi ;;
  bug2)
     info "Verification: Bug #2 — Null pointer (user profile)"
     RESULT=$(npx vitest run tests/user-service.test.ts 2>&1 || true)
     FAILED=$(echo "$RESULT" | grep -c "FAIL" || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "Bug #2 corrige! getUserProfile gere les IDs inconnus."
     else
       fail "Bug #2 non corrige. Indice: que se passe-t-il quand users.get() retourne undefined?"
     fi ;;
  bug3)
     info "Verification: Bug #3 — Race condition (orders)"
     RESULT=$(npx vitest run tests/order-service.test.ts 2>&1 || true)
     FAILED=$(echo "$RESULT" | grep -c "FAIL" || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "Bug #3 corrige! Les commandes concurrentes ont des IDs uniques."
     else
       fail "Bug #3 non corrige. Indice: le compteur est lu puis ecrit apres un await..."
     fi ;;
  bug4)
     info "Verification: Bug #4 — Memory leak (analytics)"
     RESULT=$(npx vitest run tests/analytics-service.test.ts -- -t "leak" 2>&1 || true)
     FAILED=$(echo "$RESULT" | grep -c "FAIL" || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "Bug #4 corrige! Les listeners ne fuient plus."
     else
       fail "Bug #4 non corrige. Indice: emitter.on() ajoute un listener a chaque appel..."
     fi ;;
  bug5)
     info "Verification: Bug #5 — Silent regression (discount)"
     RESULT=$(npx vitest run tests/analytics-service.test.ts -- -t "cart >= 100" 2>&1 || true)
     FAILED=$(echo "$RESULT" | grep -c "FAIL" || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "Bug #5 corrige! Le seuil de 100 inclut bien la valeur 100."
     else
       fail "Bug #5 non corrige. Indice: > vs >= sur le seuil de 100..."
     fi ;;
  all)
     info "Verification: Tous les bugs"
     RESULT=$(npx vitest run 2>&1 || true)
     PASSED=$(echo "$RESULT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     FAILED=$(echo "$RESULT" | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$FAILED" -eq 0 ]]; then
       pass "TOUS les bugs corriges! $PASSED tests passent. Bravo!"
     else
       info "$PASSED tests passent, $FAILED echouent encore."
       fail "Il reste $FAILED test(s) en echec."
     fi ;;
  *) fail "Etape inconnue: $STEP (etapes: bug1, bug2, bug3, bug4, bug5, all)" ;;
esac
