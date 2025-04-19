import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  // CommonJS
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
      terser(),
      copy({
        targets: [
          { src: './volume-meter-worklet.js', dest: 'dist/' }
        ]
      })
    ]
  },
  // ESM
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
      terser(),
      copy({
        targets: [
          { src: './volume-meter-worklet.js', dest: 'dist/' }
        ]
      })
    ]
  },
  // UMD
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gemini-live-web-sdk.umd.js',
      format: 'umd',
      name: 'GeminiLiveWebSDK',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      terser(),
      copy({
        targets: [
          { src: './volume-meter-worklet.js', dest: 'dist/' }
        ]
      })
    ]
  }
];