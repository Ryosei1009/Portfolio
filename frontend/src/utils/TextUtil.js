import { marked } from "marked";
import sanitizeHtml from 'sanitize-html';

export function newLineUtil(inputString) {
    return inputString.split('\n').map((str, index) =>
        <p key={index}>
            {str}
        </p>
    );
}

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