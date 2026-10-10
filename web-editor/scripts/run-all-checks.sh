#!/bin/bash
# Runs every engine/content test and audit and prints one line each (and the failure's first assertion line). Exit 1 if any fail.
cd "$(dirname "$0")/.."
fail=0
for t in test:structure-no-false-positives test:structure-rules test:int-zero-division test:numeric-semantics test:class-rules test:lambda-runner test:collection-runner test:practice-bank test:error-span test:smart-cast test:compile-fixes test:highlighter-fidelity test:comment-folds test:editor-indent audit:world1-quality audit:world2-quality audit:world3-quality audit:world4-quality audit:world5-quality audit:world6-quality audit:world7-quality audit:world8-quality audit:world9-quality audit:world10-quality audit:world11-quality test:world12-runner test:world13-content test:world14-content test:world15-content test:world16-coroutines; do
  if npm run -s "$t" >/tmp/check.out 2>&1; then echo "pass  $t"; else echo "FAIL  $t"; grep -E "AssertionError|message:|✗|Error:" /tmp/check.out | head -2 | cut -c1-260; fail=1; fi
done
exit $fail
