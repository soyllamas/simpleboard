#!/usr/bin/env bash
set -euo pipefail

input="${1:-.env}"
output="${2:-.env.secrets}"

while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    line="${line#export }"
    [[ "$line" != *=* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"

    printf "gh secret set %s --body %q\n" "$key" "$value"
done < "$input" > "$output"

echo "Wrote $output"
