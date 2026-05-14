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
  1) # .mcp.json exists
     info "Verification: .mcp.json existe"
     if [[ -f "$SANDBOX/.mcp.json" ]]; then
       pass ".mcp.json trouve"
     else
       hint "Creez .mcp.json a la racine du sandbox"
       fail ".mcp.json non trouve dans le sandbox"
     fi ;;
  2) # .mcp.json contains filesystem
     info "Verification: Serveur MCP filesystem configure"
     if [[ -f "$SANDBOX/.mcp.json" ]]; then
       if grep -q '"filesystem"' "$SANDBOX/.mcp.json"; then
         pass "Serveur MCP filesystem configure"
       else
         hint "Ajoutez un serveur 'filesystem' dans .mcp.json"
         fail "Serveur filesystem non trouve dans .mcp.json"
       fi
     else
       fail ".mcp.json non trouve"
     fi ;;
  all)
     for s in 1 2; do echo "--- Etape $s ---"; "$0" "$s" || true; echo; done
     pass "Configuration MCP terminee" ;;
  *) fail "Etape inconnue: $STEP (etapes: 1-2, all)" ;;
esac
