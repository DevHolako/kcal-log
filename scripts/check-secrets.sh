#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# kcal-log Pre-Commit Secret Scanner
# Guards the public repository against accidental secret and credential leakage.
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo "🔍 Running pre-commit secret check..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM || true)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

FAILED=0

# 1. Check prohibited filenames
FORBIDDEN_FILE_PATTERNS=(
    '^\.env(\..+)?$'
    '\.(jks|keystore|p12|pk8|key|pem)$'
    '^local\.properties$'
    'credentials\.json'
    'id_rsa'
    'id_ed25519'
)

ALLOWED_FILES=(
    ".env.example"
    ".env.testing.example"
    ".env.docker.example"
)

for file in $STAGED_FILES; do
    # Check if allowed explicitly
    is_allowed=0
    for allowed in "${ALLOWED_FILES[@]}"; do
        if [ "$file" = "$allowed" ] || [ "$(basename "$file")" = "$allowed" ]; then
            is_allowed=1
            break
        fi
    done

    if [ "$is_allowed" -eq 1 ]; then
        continue
    fi

    for pattern in "${FORBIDDEN_FILE_PATTERNS[@]}"; do
        if echo "$file" | grep -Eq "$pattern"; then
            echo -e "${RED}${BOLD}[BLOCKED] Forbidden file staged: ${file}${NC}"
            echo -e "Reason: Matches forbidden pattern '${pattern}'. Secrets and keystores must never be committed."
            FAILED=1
        fi
    done
done

# 2. Check staged content for suspicious patterns
SUSPICIOUS_CONTENT_PATTERNS=(
    'APP_KEY=base64:[A-Za-z0-9+/=]{44}'
    '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'
    'ghp_[A-Za-z0-9]{36}'
    'github_pat_[A-Za-z0-9_]{82}'
    'AKIA[0-9A-Z]{16}'
    'REVERB_APP_SECRET=[A-Za-z0-9_-]{10,}'
    'REDIS_PASSWORD=[^"'\'' \t\n]+'
    'DB_PASSWORD=[^"'\'' \t\n]+'
)

for file in $STAGED_FILES; do
    # Skip binary files, deleted files, or directories
    if [ ! -f "$file" ]; then
        continue
    fi

    # Ignore checking check-secrets.sh itself
    if [[ "$file" == *"check-secrets.sh" ]]; then
        continue
    fi

    for pattern in "${SUSPICIOUS_CONTENT_PATTERNS[@]}"; do
        # Search only the staged diff (+ additions)
        if git diff --cached -S"$pattern" --pickaxe-regex "$file" | grep -E "^\+.*${pattern}" > /dev/null 2>&1; then
            echo -e "${RED}${BOLD}[BLOCKED] Potential secret pattern found in: ${file}${NC}"
            echo -e "Pattern: '${pattern}'"
            FAILED=1
        fi
    done
done

if [ "$FAILED" -ne 0 ]; then
    echo ""
    echo -e "${RED}${BOLD}========================================================================${NC}"
    echo -e "${RED}${BOLD} COMMIT REJECTED: Sensitive credentials or files detected!           ${NC}"
    echo -e "${RED} This repository is PUBLIC (DevHolako/kcal-log).                       ${NC}"
    echo -e "${RED} If a secret was committed or staged, rotate it immediately on services. ${NC}"
    echo -e "${RED}${BOLD}========================================================================${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Secret scan passed.${NC}"
exit 0
