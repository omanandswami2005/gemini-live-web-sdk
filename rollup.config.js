import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser()
    ],
    external: []
  },
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser()
    ],
    external: []
  }
];