#!/bin/bash
# One command for a simulator-vs-real-Kotlin improvement round:
#   1. every test and audit (a new rule must not reject valid programs),
#   2. the comparison on mistake programs against the saved baseline (no mistake type may get worse, no hang, no new false rejection),
#   3. the biggest remaining gaps, each with its shortest reproducer.
# Add --update-baseline after a real improvement. Needs `npm run real-kotlin:serve` only for the kotlinc halves of some tests.
cd "$(dirname "$0")/.."
echo "== 1/3 tests and audits"
if ! bash scripts/run-all-checks.sh > /tmp/improve-checks.txt 2>&1; then grep -v "^pass" /tmp/improve-checks.txt; echo "STOP: fix the failing checks first."; exit 1; fi
echo "all $(grep -c '^pass' /tmp/improve-checks.txt) checks pass"
echo "== 2/3 comparison with real kotlinc"
npm run -s compare:errors -- --per-op=120 "$@" 2>&1 | grep -E "Overall|simulator-hang|false-accept|false-reject|missed-runtime|WORSE|Baseline"
echo "== 3/3 biggest remaining gaps"
node scripts/compare-errors/top-gaps.mjs 6
