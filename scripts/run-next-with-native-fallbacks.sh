#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

link_binding() {
  local source_path="$1"
  local target_path="$2"

  if [[ ! -f "${source_path}" ]]; then
    return 0
  fi

  mkdir -p "$(dirname "${target_path}")"
  ln -sf "${source_path}" "${target_path}"
}

# Seed direct file fallbacks so package resolution bugs do not block native loading.
link_binding \
  "${REPO_ROOT}/node_modules/@tailwindcss/oxide-darwin-arm64/tailwindcss-oxide.darwin-arm64.node" \
  "${REPO_ROOT}/node_modules/@tailwindcss/oxide/tailwindcss-oxide.darwin-arm64.node"
link_binding \
  "${REPO_ROOT}/node_modules/@tailwindcss/oxide-darwin-x64/tailwindcss-oxide.darwin-x64.node" \
  "${REPO_ROOT}/node_modules/@tailwindcss/oxide/tailwindcss-oxide.darwin-x64.node"
link_binding \
  "${REPO_ROOT}/node_modules/lightningcss-darwin-arm64/lightningcss.darwin-arm64.node" \
  "${REPO_ROOT}/node_modules/lightningcss/lightningcss.darwin-arm64.node"
link_binding \
  "${REPO_ROOT}/node_modules/lightningcss-darwin-x64/lightningcss.darwin-x64.node" \
  "${REPO_ROOT}/node_modules/lightningcss/lightningcss.darwin-x64.node"

NODE_BIN="${COSMICPATH_NODE_BIN:-}"
if [[ -z "${NODE_BIN}" ]]; then
  if [[ -x "/usr/local/bin/node" ]]; then
    NODE_BIN="/usr/local/bin/node"
  else
    NODE_BIN="$(command -v node)"
  fi
fi

VERBOSE_DEV_LOGS="${COSMICPATH_VERBOSE_DEV_LOGS:-}"
VERBOSE_DEV_LOGS_NORMALIZED="$(printf '%s' "${VERBOSE_DEV_LOGS}" | tr '[:upper:]' '[:lower:]')"
if [[ "${1:-}" == "dev" ]] && [[ ! "${VERBOSE_DEV_LOGS_NORMALIZED}" =~ ^(1|true|yes|on)$ ]]; then
  exec "${NODE_BIN}" "${REPO_ROOT}/scripts/filter-next-dev-logs.mjs" \
    "${NODE_BIN}" \
    "${REPO_ROOT}/node_modules/next/dist/bin/next" \
    "$@"
fi

exec "${NODE_BIN}" "${REPO_ROOT}/node_modules/next/dist/bin/next" "$@"
