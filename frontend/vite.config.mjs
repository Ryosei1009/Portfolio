import { defineConfig, loadEnv, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

// CRA からの移行用設定
// - src 配下の .js ファイルに書かれた JSX をそのまま扱う
// - process.env.REACT_APP_* を従来どおり参照できるようにする
const jsxInJs = () => ({
  name: 'treat-js-files-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) return null
    return transformWithOxc(code, id, {
      lang: 'jsx',
      jsx: { runtime: 'automatic' },
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_')
  const define = {}
  for (const [key, value] of Object.entries(env)) {
    define[`process.env.${key}`] = JSON.stringify(value)
  }

  return {
    plugins: [jsxInJs(), react()],
    define,
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
  }
})
