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
  1) # Commands directory exists with >= 1 .md file
     info "Verification: Dossier de Skills existe"
     if [[ -d "$SANDBOX/.claude/commands" ]]; then
       SKILL_COUNT=$(find "$SANDBOX/.claude/commands" -name "*.md" | wc -l | tr -d ' ')
       if [[ "$SKILL_COUNT" -ge 1 ]]; then
         pass "$SKILL_COUNT skill(s) trouve(s) dans .claude/commands/"
       else
         fail "Le dossier .claude/commands/ existe mais est vide. Creez votre premier Skill!"
       fi
     else
       fail "Dossier .claude/commands/ non trouve. Creez-le: mkdir -p .claude/commands"
     fi ;;
  2) # Skill structure ($ARGUMENTS, >= 5 lines)
     info "Verification: Skill bien structure"
     if [[ -d "$SANDBOX/.claude/commands" ]]; then
       for skill in "$SANDBOX/.claude/commands"/*.md; do
         [[ -f "$skill" ]] || continue
         NAME=$(basename "$skill" .md)
         CONTENT=$(cat "$skill")
         CHECKS=0
         if echo "$CONTENT" | grep -q '\$ARGUMENTS'; then
           CHECKS=$((CHECKS + 1))
         fi
         LINES=$(wc -l < "$skill" | tr -d ' ')
         if [[ "$LINES" -ge 5 ]]; then
           CHECKS=$((CHECKS + 1))
         fi
         if [[ "$CHECKS" -ge 1 ]]; then
           pass "Skill /$NAME est bien structure ($CHECKS/2 criteres)"
         else
           hint "Un bon Skill contient: description, etapes, \$ARGUMENTS, criteres de succes"
           fail "Skill /$NAME est trop basique"
         fi
       done
     else
       fail "Pas de Skills trouves"
     fi ;;
  3) # >= 3 skills created
     info "Verification: Au moins 3 Skills crees"
     if [[ -d "$SANDBOX/.claude/commands" ]]; then
       SKILL_COUNT=$(find "$SANDBOX/.claude/commands" -name "*.md" | wc -l | tr -d ' ')
       if [[ "$SKILL_COUNT" -ge 3 ]]; then
         pass "$SKILL_COUNT Skills crees! Objectif atteint."
         for skill in "$SANDBOX/.claude/commands"/*.md; do
           [[ -f "$skill" ]] || continue
           info "  /${skill##*/}" | sed 's/.md$//'
         done
       else
         fail "Seulement $SKILL_COUNT Skill(s). Objectif: 3 minimum."
       fi
     else
       fail "Pas de dossier .claude/commands/"
     fi ;;
  all) for s in 1 2 3; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-3, all)" ;;
esac
