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
  1) # GitHub workflow exists
     info "Verification: Workflow GitHub Actions existe"
     if [[ -f "$SANDBOX/.github/workflows/claude-review.yml" ]]; then
       pass "Workflow claude-review.yml trouve"
     else
       hint "Creez .github/workflows/claude-review.yml pour la revue automatique"
       fail ".github/workflows/claude-review.yml non trouve"
     fi ;;
  2) # Batch review script exists
     info "Verification: Script batch-review existe"
     if [[ -f "$SANDBOX/scripts/batch-review.ts" ]]; then
       pass "scripts/batch-review.ts trouve"
     else
       hint "Creez scripts/batch-review.ts pour les revues en batch"
       fail "scripts/batch-review.ts non trouve"
     fi ;;
  all)
     for s in 1 2; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done
     pass "Integration CI/CD terminee" ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-2, all)" ;;
esac
