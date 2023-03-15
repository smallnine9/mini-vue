import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'umd',
      file: 'dist/mini-vue.umd.js',
      name: 'MiniVue'
    },
    {
      format: 'es',
      name: 'MiniVue',
      file: 'dist/mini-vue.esm.js'
    }
  ],
  plugins: [typescript()]
}