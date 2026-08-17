#!/usr/bin/env bash
# Vercel ignoreCommand: exit 0 = skip build, exit 1 = proceed.
# Skip preview deploys on feature branches. Always build production.
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "Production deploy — building"
  exit 1
fi

if [ "${VERCEL_GIT_COMMIT_REF:-}" != "main" ]; then
  echo "Preview skipped (non-main branch: ${VERCEL_GIT_COMMIT_REF:-unknown})"
  exit 0
fi

echo "main preview — building"
exit 1
