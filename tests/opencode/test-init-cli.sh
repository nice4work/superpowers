#!/usr/bin/env bash
# Test: CLI Init
# Verifies the `superpowers init` command works correctly
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PASS=0
FAIL=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fails() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

echo "=== Test: CLI Init ==="

TESTDIR=$(mktemp -d)
cleanup() { rm -rf "$TESTDIR"; }
trap cleanup EXIT

run_init() {
  node -e "import('$REPO_ROOT/lib/init.js').then(m => m.init('$1'))" 2>&1 || true
}

# ——— Test 1: Init on empty directory, creates opencode.json ———
echo "Test 1: Empty directory → creates opencode.json"
run_init "$TESTDIR"
if [ -f "$TESTDIR/opencode.json" ]; then
  pass "opencode.json created"
else
  fails "opencode.json not created"
fi
if grep -q 'superpowers@git' "$TESTDIR/opencode.json"; then
  pass "plugin entry present"
else
  fails "plugin entry missing"
fi

# ——— Test 2: Skills are copied ———
echo "Test 2: Skills copied to .opencode/skills/"
skill_count=$(find "$TESTDIR/.opencode/skills" -name "SKILL.md" 2>/dev/null | wc -l)
if [ "$skill_count" -ge 10 ]; then
  pass "skills copied ($skill_count SKILL.md files)"
else
  fails "skills missing or incomplete (found $skill_count)"
fi

# ——— Test 3: Idempotency ———
echo "Test 3: Idempotency"
output=$(run_init "$TESTDIR")
if echo "$output" | grep -q '已安装'; then
  pass "second run reports already installed"
else
  fails "second run did not detect existing install"
fi

# ——— Test 4: Inject into existing config without plugin field ———
echo "Test 4: Existing config without plugin field"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
echo '{"model": "test"}' > "$TESTDIR/opencode.json"
run_init "$TESTDIR"
if grep -q 'superpowers@git' "$TESTDIR/opencode.json" && grep -q '"model"' "$TESTDIR/opencode.json"; then
  pass "plugin injected, original fields preserved"
else
  fails "injection failed or original fields lost"
fi

# ——— Test 5: Inject into existing config with plugin array ———
echo "Test 5: Existing config with plugin array"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
echo '{"plugin": ["existing-plugin"]}' > "$TESTDIR/opencode.json"
run_init "$TESTDIR"
if grep -q '"existing-plugin"' "$TESTDIR/opencode.json" && grep -q 'superpowers@git' "$TESTDIR/opencode.json"; then
  pass "existing entry preserved, superpowers appended"
else
  fails "existing entry lost or superpowers not added"
fi

# ——— Test 6: Multi-line formatted plugin ———
echo "Test 6: Multi-line formatted plugin"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
cat > "$TESTDIR/opencode.json" << 'EOF'
{
  "plugin": [
    "foo",
    "bar"
  ],
  "model": "test"
}
EOF
run_init "$TESTDIR"
if grep -q 'superpowers@git' "$TESTDIR/opencode.json" && grep -q '"foo"' "$TESTDIR/opencode.json"; then
  pass "multi-line injection correct"
else
  fails "multi-line injection broken"
fi

# ——— Test 7: Empty plugin array ———
echo "Test 7: Empty plugin array"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
echo '{"plugin": []}' > "$TESTDIR/opencode.json"
run_init "$TESTDIR"
if grep -q 'superpowers@git' "$TESTDIR/opencode.json"; then
  pass "empty array filled"
else
  fails "empty array not filled"
fi

# ——— Test 8: JSONC comments preserved ———
echo "Test 8: JSONC comments preserved"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
echo '{"plugin": ["foo"], // comment'$'\n''"model": "test"}' > "$TESTDIR/opencode.json"
run_init "$TESTDIR"
if grep -q '// comment' "$TESTDIR/opencode.json"; then
  pass "line comment preserved"
else
  fails "line comment lost"
fi

# ——— Test 9: Error on non-array plugin ———
echo "Test 9: Error on non-array plugin field"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR"
echo '{"plugin": "string-value"}' > "$TESTDIR/opencode.json"
output=$(run_init "$TESTDIR")
if echo "$output" | grep -q '不是数组'; then
  pass "rejects non-array plugin field"
else
  fails "did not reject non-array plugin field"
fi

# ——— Test 10: Walk-up finds config in parent directory ———
echo "Test 10: Walk-up finds parent opencode.json"
rm -rf "$TESTDIR"; mkdir -p "$TESTDIR/child"
echo '{"plugin": ["parent-plugin"]}' > "$TESTDIR/opencode.json"
run_init "$TESTDIR/child"
if grep -q 'superpowers@git' "$TESTDIR/opencode.json"; then
  pass "parent config found and injected"
else
  fails "parent config not found or not injected"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
