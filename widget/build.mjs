import esbuild from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const outFile = join(root, 'dist', 'pandlens-widget.min.js');
const maxGzipBytes = 30 * 1024;

const sizeOnly = process.argv.includes('--size-only');

if (!sizeOnly) {
  await esbuild.build({
    entryPoints: [join(root, 'src', 'index.js')],
    outfile: outFile,
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'PandlensWidget',
    target: ['es2018'],
    legalComments: 'none',
  });

  const fixture = JSON.parse(
    readFileSync(join(root, '..', 'fixtures', 'address-enrichment.json'), 'utf8'),
  );
  const mockFile = join(root, 'demo', 'mock-data.js');
  writeFileSync(mockFile, `window.__PANDLENS_WIDGET_MOCK__=${JSON.stringify(fixture)};`);
}

if (!existsSync(outFile)) {
  console.error('Missing build output:', outFile);
  process.exit(1);
}

const raw = readFileSync(outFile);
const gz = gzipSync(raw);
console.log(`pandlens-widget.min.js: ${raw.length} bytes raw, ${gz.length} bytes gzip`);

if (gz.length > maxGzipBytes) {
  console.error(`Gzip size ${gz.length} exceeds budget ${maxGzipBytes}`);
  process.exit(1);
}
