// `next build` (output: 'export') emits ./out. Move it to ../dist, which is where the
// Laravel package looks for the HTML shell and where `vendor:publish` reads _next/ from.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out', import.meta.url));
const dist = fileURLToPath(new URL('../../dist', import.meta.url));

if (!existsSync(out)) {
  console.error('Expected ./out from `next build` (output: "export"). Is NODE_ENV=production?');
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
cpSync(out, dist, { recursive: true });
rmSync(out, { recursive: true, force: true });
console.log(`LaganiVitz frontend exported to ${dist}`);
