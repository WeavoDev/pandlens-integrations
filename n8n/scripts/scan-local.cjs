#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');

async function main() {
  const pkgRoot = path.join(__dirname, '..');
  execSync('npm run build', { cwd: pkgRoot, stdio: 'inherit' });
  execSync('npm pack --silent', { cwd: pkgRoot, stdio: 'inherit' });
  const pkg = require(path.join(pkgRoot, 'package.json'));
  const tgz = path.join(pkgRoot, `${pkg.name}-${pkg.version}.tgz`);
  if (!fs.existsSync(tgz)) {
    console.error('Expected tarball', tgz);
    process.exit(1);
  }

  const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pandlens-n8n-scan-'));
  execSync(`tar -xzf "${tgz}" -C "${extractDir}"`, { stdio: 'inherit' });
  const packageDir = path.join(extractDir, 'package');

  const { analyzePackage } = await import('@n8n/scan-community-package/scanner/scanner.mjs');
  const result = await analyzePackage(packageDir, ['**/*.js', 'package.json']);
  if (!result.passed) {
    console.error('Community package scan failed:', result.message);
    if (result.details) console.error(result.details);
    process.exit(1);
  }
  console.log(`Community package scan passed (${pkg.name}@${pkg.version})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
