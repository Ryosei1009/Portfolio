import { marked } from "marked";
import sanitizeHtml from 'sanitize-html';

export const markedText = (text) => {
    const markedText = sanitizeHtml(text, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
        allowedAttributes: {
            img: [ 'src', 'alt' ]
        }
    });
    marked.setOptions({
        breaks: true,
    });
    const htmlText = marked(markedText);
    return { __html: htmlText }
}

// HTML からタグを取り除いて文字だけにする
export const plainText = (html) => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(String(html), 'text/html')
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

// 作品画像の代替テキスト（例: 「魅儡祭実行委員長の画像1」）
export const workImageAlt = (work, number) => `${plainText(work?.each_name) || '作品'}の画像${number}`