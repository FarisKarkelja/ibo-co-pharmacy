import { defineConfig } from 'tsup';

// Bundles the API (and the shared package) into dist/ for production.
export default defineConfig({
  entry: ['src/index.ts', 'src/db/scripts/setup.ts', 'src/db/scripts/migrate.ts', 'src/db/scripts/seed.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: ['@ibo/shared'],
});
