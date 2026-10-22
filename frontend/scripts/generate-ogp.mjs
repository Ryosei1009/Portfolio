// OGP 画像（SNS でシェアしたときに出る画像）を作る
// 使い方: frontend で `npm run ogp` → public/ogp.png（1200×630）を書き出す
// 文字はシステムにインストールされた Noto Sans JP で描く（フォントファイルはリポジトリに入れない）
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const WIDTH = 1200
const HEIGHT = 630
const FONT = 'Noto Sans JP'
const OUTPUT = fileURLToPath(new URL('../public/ogp.png', import.meta.url))

const svg = (fontFamily) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />
  <rect width="24" height="${HEIGHT}" fill="#7dfab1" />
  <g font-family="${fontFamily}">
    <text x="96" y="150" font-size="28" font-weight="700" letter-spacing="8" fill="#6b7280">PORTFOLIO</text>
    <text x="96" y="290" font-size="112" font-weight="700" fill="#111827">篠原 諒成</text>
    <text x="96" y="360" font-size="44" font-weight="700" fill="#4b5563">Shinohara Ryosei</text>
    <text x="96" y="470" font-size="38" font-weight="500" fill="#111827">情報技術を活用した社会課題の解決を目指す、大学2年生</text>
    <text x="${WIDTH - 96}" y="566" text-anchor="end" font-size="30" font-weight="500" fill="#6b7280">shinoryo.com</text>
  </g>
</svg>`

const render = (fontFamily) => sharp(Buffer.from(svg(fontFamily))).raw().toBuffer()

// Noto Sans JP が無いと、別のフォントで黙って描かれてしまう。
// 存在しないフォント名で描いた結果と同じなら、Noto Sans JP が使われていないので止める
const [withFont, withFallback] = await Promise.all([render(FONT), render('No Such Font For OGP Check')])
if (withFont.equals(withFallback)) {
  console.error(`「${FONT}」が見つかりません。システムにインストールしてから、もう一度実行してください。`)
  process.exit(1)
}

await sharp(Buffer.from(svg(FONT)))
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT)

console.log(`OGP 画像を書き出しました: ${OUTPUT}`)
