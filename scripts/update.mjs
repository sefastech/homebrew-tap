import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function stableVersion(tag) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error('Expected a stable release tag');
  return tag.slice(1);
}

export function checksum(text, asset) {
  const matches = text.split(/\r?\n/).filter(line => line.trim().split(/\s+/)[1] === asset);
  if (matches.length !== 1 || !/^[a-f0-9]{64}\s+/.test(matches[0])) throw new Error(`Invalid checksum entry for ${asset}`);
  return matches[0].split(/\s+/)[0];
}

export function render(version, hashes) {
  stableVersion(`v${version}`);
  for (const arch of ['arm64', 'amd64']) {
    if (!/^[a-f0-9]{64}$/.test(hashes[arch])) throw new Error('Invalid artifact hash');
  }
  return `class Clutta < Formula
  desc "Monitor whether business workflows reach their expected completion"
  homepage "https://clutta.io"
  version "${version}"

  depends_on :macos

  on_arm do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v${version}/clutta-darwin-arm64"
    sha256 "${hashes.arm64}"
  end

  on_intel do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v${version}/clutta-darwin-amd64"
    sha256 "${hashes.amd64}"
  end

  def install
    binary = Hardware::CPU.arm? ? "clutta-darwin-arm64" : "clutta-darwin-amd64"
    bin.install binary => "clutta"
  end

  test do
    assert_match "clutta", shell_output("#{bin}/clutta --help").downcase
  end
end
`;
}

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  return response;
}

export async function update() {
  const release = await (await get('https://api.github.com/repos/sefastech/clutta-cli-releases/releases/latest')).json();
  if (release.draft || release.prerelease) throw new Error('Refusing a draft or prerelease');
  const version = stableVersion(release.tag_name);
  const target = new URL('../Formula/clutta.rb', import.meta.url);
  const current = readFileSync(target, 'utf8');
  const previous = current.match(/^  version "(\d+\.\d+\.\d+)"$/m)?.[1];
  if (!previous) throw new Error('Cannot determine installed formula version');
  const a = version.split('.').map(Number), b = previous.split('.').map(Number);
  const different = a.findIndex((part, index) => part !== b[index]);
  if (different >= 0 && a[different] < b[different]) throw new Error('Refusing a downgrade');
  const base = `https://github.com/sefastech/clutta-cli-releases/releases/download/v${version}`;
  const sums = await (await get(`${base}/sha256sums.txt`)).text();
  const hashes = {};
  for (const arch of ['arm64', 'amd64']) {
    const asset = `clutta-darwin-${arch}`;
    const expected = checksum(sums, asset);
    const bytes = await (await get(`${base}/${asset}`)).arrayBuffer();
    const actual = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
    if (actual !== expected) throw new Error(`Checksum mismatch for ${asset}`);
    hashes[arch] = actual;
  }
  const next = render(version, hashes);
  if (previous === version && current !== next) throw new Error('Same-version formula drift; manual review required');
  if (current !== next) writeFileSync(target, next);
  console.log(`Verified both macOS artifacts for v${version}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  update().catch(error => { console.error(error.message); process.exitCode = 1; });
}
