// ビルドのときに API から内容を取得し、index.html の #root の中に静的な HTML を入れる（案B のプリレンダー）
// - クローラーや、JavaScript が動く前・動かない環境でも、名前・概要・作品名が読めるようにする
// - React が起動すると、#root の中身は React の画面に置き換わる
// - API が取れないときは決まった文言で作り、ビルドは失敗させない
// - サイト上で文章を編集したあと、この HTML を新しくするには再デプロイが必要
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// API が取れないときに使う文言（TopBanner の初期値と同じ）
const FALLBACK = {
  label: 'Portfolio',
  name: '篠原 諒成',
  subName: 'Shinohara Ryosei',
  catchphrase: '情報技術を活用した／社会課題の解決を目指す、／大学2年生',
  categories: ['学外活動', '大学', '高校'],
}
const TIMEOUT_MS = 10000

const escapeHtml = (text) => String(text ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// タグを取り除いた文字（エスケープ済みのまま返す）
const plainHtml = (html) => sanitizeHtml(String(html ?? ''), { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()

// TextUtil.markedText と同じ変換（sanitize → marked）
const markdown = (text) => marked.parse(sanitizeHtml(text ?? '', {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: { img: ['src', 'alt'] },
}), { breaks: true })

// AboutMe.js と同じく、「### はじめに」の手前までを概要にする
const introductionSummary = (introduction) => {
  const text = introduction ?? ''
  const match = text.match(/^###\s*はじめに/m)
  return match ? text.slice(0, match.index).replace(/(\s|&emsp;)+$/, '') : text
}

const getJson = async (apiDomain, path) => {
  const response = await fetch(`${apiDomain}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return response.json()
}

// 取得できたものだけを使う（1つ失敗しても、ほかは使う）
const fetchContent = async (apiDomain) => {
  const [aboutMe, settings, works, categories] = await Promise.allSettled([
    getJson(apiDomain, '/aboutme/get'),
    getJson(apiDomain, '/settings/get'),
    getJson(apiDomain, '/works/get'),
    getJson(apiDomain, '/categories/get'),
  ])
  for (const [label, result] of Object.entries({ aboutMe, settings, works, categories })) {
    if (result.status === 'rejected') console.warn(`[prerender] ${label} を取得できませんでした（決まった文言で作ります）: ${result.reason?.message ?? result.reason}`)
  }
  const value = (result) => (result.status === 'fulfilled' ? result.value : null)
  return {
    profile: value(aboutMe)?.[0] ?? null,
    settings: value(settings) ?? {},
    works: Array.isArray(value(works)) ? value(works) : [],
    categories: Array.isArray(value(categories)) && value(categories).length > 0 ? value(categories) : FALLBACK.categories,
  }
}

// Works.js と同じ並び（公開中だけ・代表作 → カテゴリの順 → sort_order）
const arrangeWorks = (works, categories) => {
  const sorted = works
    .filter((item) => Number(item.is_published) !== 0)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
  const featured = sorted.filter((item) => Number(item.is_featured) === 1)
  const others = categories.flatMap((category) => sorted.filter((item) => Number(item.is_featured) !== 1 && item.category === category))
  return { featured, others }
}

const workItem = (item, withCategory) => {
  const name = plainHtml(item.each_name) || plainHtml(item.name)
  const category = withCategory && item.category ? `（${escapeHtml(item.category)}）` : ''
  const highlight = item.highlight ? ` … ${escapeHtml(item.highlight)}` : ''
  return `<li>${name}${category}${highlight}</li>`
}

const renderContent = ({ profile, settings, works, categories }, description) => {
  const name = escapeHtml(profile?.name || FALLBACK.name)
  const subName = escapeHtml(profile?.sub_name || FALLBACK.subName)
  const label = escapeHtml(settings.hero_label || FALLBACK.label)
  const catchphrase = escapeHtml((settings.hero_catchphrase || FALLBACK.catchphrase).replaceAll('／', ''))
  // 概要が空のとき（「### はじめに」から始まるときなど）は、meta の description を使う
  const summaryText = introductionSummary(profile?.introduction)
  const summary = summaryText.trim() ? markdown(summaryText) : `<p>${escapeHtml(description)}</p>`
  const github = profile?.github_url || settings.hero_github_url
  const { featured, others } = arrangeWorks(works, categories)

  const workList = (title, items, withCategory) => items.length === 0 ? '' : `
      <h3 class="mt-6 text-xl font-bold">${title}</h3>
      <ul class="mt-2 ml-2 leading-relaxed">${items.map((item) => workItem(item, withCategory)).join('')}</ul>`

  return `
    <main data-prerendered class="mx-auto max-w-5xl px-4 py-24">
      <p class="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">${label}</p>
      <h1 class="mt-2 text-6xl max-xl:text-5xl max-sm:text-4xl font-bold">${name}</h1>
      <p class="mt-1 text-2xl max-xl:text-xl max-sm:text-lg font-bold text-gray-600">${subName}</p>
      <p class="mt-6 text-xl max-xl:text-lg max-sm:text-base font-medium leading-relaxed">${catchphrase}</p>
      ${github ? `<p class="mt-6"><a href="${escapeHtml(github)}">GitHub</a></p>` : ''}
      <section class="mt-16">
        <h2 class="text-5xl max-sm:text-4xl font-bold">About Me</h2>
        <div class="mt-6 leading-relaxed">${summary}</div>
      </section>
      ${featured.length + others.length === 0 ? '' : `
      <section class="mt-16">
        <h2 class="text-5xl max-sm:text-4xl font-bold">Works</h2>${workList('代表作', featured, false)}${workList('その他の活動', others, true)}
      </section>`}
    </main>
  `
}

export const prerender = ({ apiDomain }) => ({
  name: 'prerender-root',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    async handler(html) {
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
      let content
      try {
        content = renderContent(apiDomain ? await fetchContent(apiDomain) : { profile: null, settings: {}, works: [], categories: FALLBACK.categories }, description)
      } catch (error) {
        // 想定外の失敗でもビルドは止めず、決まった文言で作る
        console.warn(`[prerender] 内容を作れませんでした（決まった文言で作ります）: ${error.message}`)
        content = renderContent({ profile: null, settings: {}, works: [], categories: FALLBACK.categories }, description)
      }
      if (!html.includes('<div id="root"></div>')) {
        console.warn('[prerender] index.html に <div id="root"></div> が見つからないため、プリレンダーしませんでした')
        return html
      }
      return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    },
  },
})
