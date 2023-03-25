import typescript from '@rollup/plugin-typescript'

export default {
  input: 'packages/index.ts',
  output: [
    {
      format: 'umd',
      file: 'dist/mini-vue.umd.js',
      name: 'MiniVue',
      sourcemap: true
    },
    {
      format: 'es',
      name: 'MiniVue',
      file: 'dist/mini-vue.esm.js',
      sourcemap:true
    }
  ],
  plugins: [typescript()]
}