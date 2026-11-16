import { Marked, Renderer } from "marked";
import sanitizeHtml from 'sanitize-html';

// http(s) で始まる外部リンクだけ、新しいタブで開く（# や / で始まる内部リンクはそのまま）
const markdown = new Marked({
    breaks: true,
    renderer: {
        link(token) {
            const html = Renderer.prototype.link.call(this, token)
            if (!/^https?:\/\//i.test(token.href) || !html.startsWith('<a ')) return html
            return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
        },
    },
});

export const markedText = (text) => {
    const markedText = sanitizeHtml(text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
        allowedAttributes: {
            img: [ 'src', 'alt' ]
        }
    });
    const htmlText = markdown.parse(markedText);
    return { __html: htmlText }
}

// HTML からタグを取り除いて文字だけにする
export const plainText = (html) => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(String(html), 'text/html')
    // 文字のかたまり（span や p の中身）ごとに取り出し、境目の両側が英数字のときだけ空白を入れる
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
    let text = ''
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const piece = node.textContent
        if (text && /[A-Za-z0-9]$/.test(text) && /^[A-Za-z0-9]/.test(piece)) text += ' '
        text += piece
    }
    return text.replace(/\s+/g, ' ').trim()
}

// 作品画像の代替テキスト（例: 「魅儡祭実行委員長の画像1」）
export const workImageAlt = (work, number) => `${plainText(work?.each_name) || '作品'}の画像${number}`