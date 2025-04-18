import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gemini-live-web-sdk.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser()
    ]
  },
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gemini-live-web-sdk.mjs',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser()
    ]
  },
  // UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gemini-live-web-sdk.umd.js',
      format: 'umd',
      name: 'GeminiLiveWebSDK', // Global variable name
      exports: 'named',
      
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser()
    ]
  }
];