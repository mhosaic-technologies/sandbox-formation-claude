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
  1) # settings.json exists
     info "Verification: .claude/settings.json existe"
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       pass ".claude/settings.json trouve"
     else
       fail ".claude/settings.json non trouve. Creez-le pour configurer les hooks."
     fi ;;
  2) # Contains hooks and PreToolUse
     info "Verification: Hook PreToolUse configure"
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       if grep -q '"hooks"' "$SANDBOX/.claude/settings.json" && grep -q '"PreToolUse"' "$SANDBOX/.claude/settings.json"; then
         pass "Hook PreToolUse configure"
       else
         hint "Ajoutez un hook PreToolUse dans .claude/settings.json"
         fail "hooks ou PreToolUse non trouve dans settings.json"
       fi
     else
       fail ".claude/settings.json non trouve"
     fi ;;
  3) # Contains PostToolUse
     info "Verification: Hook PostToolUse configure"
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       if grep -q '"PostToolUse"' "$SANDBOX/.claude/settings.json"; then
         pass "Hook PostToolUse configure"
       else
         hint "Ajoutez un hook PostToolUse dans .claude/settings.json"
         fail "PostToolUse non trouve dans settings.json"
       fi
     else
       fail ".claude/settings.json non trouve"
     fi ;;
  4) # Contains Stop
     info "Verification: Hook Stop configure"
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       if grep -q '"Stop"' "$SANDBOX/.claude/settings.json"; then
         pass "Hook Stop configure"
       else
         hint "Ajoutez un hook Stop dans .claude/settings.json"
         fail "Stop non trouve dans settings.json"
       fi
     else
       fail ".claude/settings.json non trouve"
     fi ;;
  all)
     for s in 1 2 3 4; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done
     if [[ -f "$SANDBOX/.claude/settings.json" ]]; then
       HOOK_COUNT=$(grep -c '"PreToolUse"\|"PostToolUse"\|"Stop"\|"PreCommit"\|"PostCommit"' "$SANDBOX/.claude/settings.json" || echo "0")
       info "$HOOK_COUNT type(s) de hooks configures au total"
     fi ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-4, all)" ;;
esac
