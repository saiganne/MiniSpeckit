import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, '../bin/minispec.js');

test('CLI --help displays usage information', () => {
  const output = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf8' });
  assert.match(output, /MiniSpeckit/);
  assert.match(output, /COMMANDS:/);
  assert.match(output, /init/);
  assert.match(output, /new/);
  assert.match(output, /status/);
});

test('CLI --version displays correct version format', () => {
  const output = execSync(`node "${CLI_PATH}" --version`, { encoding: 'utf8' });
  assert.match(output, /minispeckit v\d+\.\d+\.\d+/);
});

test('Full lifecycle: init, new, status, and check', (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'minispec-test-'));

  try {
    // 1. Test init
    const initOutput = execSync(`node "${CLI_PATH}" init`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(initOutput, /Initializing MiniSpeckit/);
    assert.ok(fs.existsSync(path.join(tmpDir, 'specs')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'AGENTS.md')));

    // 2. Test new feature spec
    const newOutput = execSync(`node "${CLI_PATH}" new "User Authentication"`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(newOutput, /Created new spec:/);
    const specFile = path.join(tmpDir, 'specs', '001-user-authentication.md');
    assert.ok(fs.existsSync(specFile));

    const content = fs.readFileSync(specFile, 'utf8');
    assert.match(content, /# Spec 001: User Authentication/);
    assert.match(content, /Acceptance Criteria/);
    assert.match(content, /Technical Plan/);

    // 3. Test new API spec with template flag
    const apiOutput = execSync(`node "${CLI_PATH}" new "Payment Webhook" --template api`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(apiOutput, /Created new spec:/);
    const apiFile = path.join(tmpDir, 'specs', '002-payment-webhook.md');
    assert.ok(fs.existsSync(apiFile));

    // 4. Test status output
    const statusOutput = execSync(`node "${CLI_PATH}" status`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(statusOutput, /MiniSpeckit Feature Status/);
    assert.match(statusOutput, /001-user-authentication/);
    assert.match(statusOutput, /002-payment-webhook/);

    // 5. Test check output
    const checkOutput = execSync(`node "${CLI_PATH}" check`, { cwd: tmpDir, encoding: 'utf8' });
    assert.match(checkOutput, /Spec Health Check/);
  } finally {
    // Clean up temporary directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
