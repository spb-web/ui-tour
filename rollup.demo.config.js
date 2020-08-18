import typescript from '@rollup/plugin-typescript'
import resolve from 'rollup-plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: './demo/index.ts',
  plugins: [
    resolve(),
    typescript({
      lib: ["es5", "es6", "dom"],
      target: "es5",
      rootDir: '/'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  output: [
    {
      dir: '.',
      entryFileNames: 'demo/index.js',
      format: 'iife'
    },
  ]
}