// public/ の画像を軽くする
// 使い方: frontend で `npm run optimize-images`（何度実行しても同じ結果になる）
// - トップ画像 mv.png から mv.webp（品質 80、透過あり）を作る。mv.png は WebP が使えないブラウザ向けに残す
// - icon-512x512.png をロスレスで圧縮し直す（画素が元と同じで、小さくなったときだけ上書きする）
//   色数が多い（6万色以上）ため、パレット化（256色）すると画素が変わる。ロスレスのままにする
import sharp from 'sharp'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const publicPath = (path) => fileURLToPath(new URL(`../public/${path}`, import.meta.url))
const kb = (bytes) => `${Math.round(bytes / 1024)}KB`

// トップ画像の WebP
const mvPng = publicPath('images/home/mv.png')
const mvWebp = publicPath('images/home/mv.webp')
await sharp(mvPng).webp({ quality: 80, alphaQuality: 100, effort: 6 }).toFile(mvWebp)
console.log(`mv.webp を作りました: ${kb((await stat(mvPng)).size)} → ${kb((await stat(mvWebp)).size)}`)

// icon-512x512.png のロスレス圧縮
const iconPath = publicPath('favicon/icon-512x512.png')
const original = await readFile(iconPath)
const compressed = await sharp(original).png({ compressionLevel: 9, adaptiveFiltering: true, palette: false }).toBuffer()
const [before, after] = await Promise.all([
  sharp(original).ensureAlpha().raw().toBuffer(),
  sharp(compressed).ensureAlpha().raw().toBuffer(),
])
if (!before.equals(after)) {
  console.error('icon-512x512.png: 圧縮すると画素が変わるため、上書きしませんでした')
  process.exit(1)
}
if (compressed.length < original.length) {
  await writeFile(iconPath, compressed)
  console.log(`icon-512x512.png を圧縮しました（画素は同じ）: ${kb(original.length)} → ${kb(compressed.length)}`)
} else {
  console.log(`icon-512x512.png はこれ以上小さくならないため、そのままにしました（${kb(original.length)}）`)
}
