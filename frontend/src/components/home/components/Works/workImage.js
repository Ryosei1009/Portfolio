// 作品画像の URL。画像を差し替えた直後は version を付けて、ブラウザに古い画像を使わせない
export const workImageUrl = (workId, file, version) => (
    `${process.env.REACT_APP_API_DOMAIN}/images/works/${workId}/${file}${version ? `?v=${version}` : ''}`
)

// 読み込めなかった画像の代わり
export const showFallbackImage = (event) => {
    event.target.onerror = null
    event.target.src = '/images/works/error.jpg'
}
