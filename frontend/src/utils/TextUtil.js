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