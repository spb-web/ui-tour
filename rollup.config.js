import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/index.ts',
  plugins: [
    typescript({
      lib: ["es5", "es6", "dom"],
      target: "es6",
      declaration: true,
      declarationDir: 'types/',
      
      rootDir: 'src/',
      exclude: ['./demo/**/*.ts']
    })
  ],
  output: [
    {
      dir: '.',
      entryFileNames: 'dist/index.js',
      format: 'esm'
    },
  ]
}