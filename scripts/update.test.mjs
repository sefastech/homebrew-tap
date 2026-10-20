import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stableVersion, checksum, render } from './update.mjs';

test('only stable semantic versions are accepted', () => {
  assert.equal(stableVersion('v0.2.24'), '0.2.24');
  for (const bad of ['v0.2.25-rc1', 'latest', 'v1.2.3\ninjected', '1.2.3']) {
    assert.throws(() => stableVersion(bad));
  }
});
test('checksum entries must be unique, exact and valid', () => {
  const hash = 'a'.repeat(64), asset = 'clutta-darwin-arm64';
  assert.equal(checksum(`${hash}  ${asset}\n`, asset), hash);
  for (const bad of ['', `bad  ${asset}`, `${hash}  ${asset}\n${hash}  ${asset}`]) {
    assert.throws(() => checksum(bad, asset));
  }
});
test('checked-in formula matches the generator and its pinned hashes', () => {
  const formula = readFileSync(new URL('../Formula/clutta.rb', import.meta.url), 'utf8');
  const version = formula.match(/^  version "([^"]+)"$/m)[1];
  const hashes = [...formula.matchAll(/sha256 "([a-f0-9]+)"/g)].map(match => match[1]);
  assert.equal(render(version, { arm64: hashes[0], amd64: hashes[1] }), formula);
  assert.throws(() => render(version, { arm64: 'bad', amd64: hashes[1] }));
});
