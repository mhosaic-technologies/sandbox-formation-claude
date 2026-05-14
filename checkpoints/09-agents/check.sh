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
  all)
     info "Module agents — verification manuelle. Avez-vous teste les 3 patterns ?"
     info "  1. Agent autonome (claude -p '...')"
     info "  2. Multi-agents (orchestrateur + sous-agents)"
     info "  3. Pipeline (enchainement de commandes)"
     ;;
  *) fail "Etape inconnue: $STEP (etape: all)" ;;
esac
