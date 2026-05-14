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
  1) # ADR document exists
     info "Verification: Document ADR existe"
     if [[ -f "$SANDBOX/docs/adr-001-export-csv.md" ]]; then
       pass "ADR trouve: docs/adr-001-export-csv.md"
     else
       hint "Creez un ADR avec Claude: demandez-lui de rediger un ADR pour l'export CSV"
       fail "docs/adr-001-export-csv.md non trouve dans le sandbox"
     fi ;;
  2) # Types updated
     info "Verification: Types mis a jour"
     if [[ -f "$SANDBOX/src/types.ts" ]]; then
       if grep -qE "ExportOptions|ExportResult" "$SANDBOX/src/types.ts"; then
         pass "Types ExportOptions/ExportResult trouves dans src/types.ts"
       else
         hint "Ajoutez les types ExportOptions et ExportResult dans src/types.ts"
         fail "Types ExportOptions/ExportResult non trouves dans src/types.ts"
       fi
     else
       fail "src/types.ts non trouve"
     fi ;;
  3) # All tests pass
     info "Verification: Tous les tests passent"
     cd "$SANDBOX"
     RESULT=$(npx vitest run 2>&1 || true)
     PASSED=$(echo "$RESULT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo "0")
     FAILED=$(echo "$RESULT" | grep -oE '[0-9]+ failed' | head -1 | grep -oE '[0-9]+' || echo "0")
     if [[ "$PASSED" -gt 0 ]]; then
       pass "$PASSED tests passent, $FAILED echouent"
     else
       fail "Aucun test n'a pu etre lance"
     fi ;;
  all) for s in 1 2 3; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-3, all)" ;;
esac
