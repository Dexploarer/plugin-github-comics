import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  outDir: 'dist',
  tsconfig: './tsconfig.build.json',
  sourcemap: true,
  clean: true,
  format: ['esm'],
  dts: false, // Disabled due to experimental AI SDK types
  external: [
    'dotenv',
    'fs',
    'path',
    'https',
    'http',
    'node-fetch',
    'zod',
    '@ai-sdk/google',
    'ai',
    'commander',
  ],
});
