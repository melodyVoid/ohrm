import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  outDir: 'lib',
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
    }
  }
})