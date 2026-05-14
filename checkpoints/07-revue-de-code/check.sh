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
  1) # Review skill exists
     info "Verification: Skill de revue de code existe"
     if [[ -f "$SANDBOX/.claude/commands/review.md" ]]; then
       pass "Skill /review trouve dans .claude/commands/review.md"
     else
       hint "Creez un skill de revue: .claude/commands/review.md"
       fail ".claude/commands/review.md non trouve"
     fi ;;
  2) # List all review-related skills
     info "Verification: Skills lies a la revue de code"
     if [[ -d "$SANDBOX/.claude/commands" ]]; then
       REVIEW_SKILLS=$(find "$SANDBOX/.claude/commands" -name "*review*" -o -name "*revue*" -o -name "*audit*" | wc -l | tr -d ' ')
       if [[ "$REVIEW_SKILLS" -ge 1 ]]; then
         pass "$REVIEW_SKILLS skill(s) lie(s) a la revue trouve(s)"
         find "$SANDBOX/.claude/commands" -name "*review*" -o -name "*revue*" -o -name "*audit*" | while read -r f; do
           info "  $(basename "$f")"
         done
       else
         fail "Aucun skill de revue trouve"
       fi
     else
       fail "Dossier .claude/commands/ non trouve"
     fi ;;
  all)
     for s in 1 2; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done
     pass "Revue de code terminee" ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-2, all)" ;;
esac
