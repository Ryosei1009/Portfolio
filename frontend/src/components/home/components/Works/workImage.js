import React, { useState } from 'react'

// 作品画像の URL。画像を差し替えた直後は version を付けて、ブラウザに古い画像を使わせない
export const workImageUrl = (workId, file, version) => (
    `${process.env.REACT_APP_API_DOMAIN}/images/works/${workId}/${file}${version ? `?v=${version}` : ''}`
)

// 読み込めなかった画像の代わり
const FALLBACK_IMAGE = '/images/works/error.jpg'

// 作品画像。WebP → JPEG → error.jpg の順に切り替える
// file には JPEG の名前（例: '1_mid.jpg'）を渡す。同じ名前の .webp があればそれを使う（サーバーでアップロード時・一括変換で作る）
// <picture> では img の src を変えても <source> が優先されるので、WebP が読めなければ <source> を外して JPEG にする
// ほかの props（className・onClick・loading など）は img に付ける
export const WorkPicture = ({ workId, file, version, alt, ...imgProps }) => {
    const jpeg = workImageUrl(workId, file, version)
    const webp = workImageUrl(workId, file.replace(/\.jpe?g$/i, '.webp'), version)
    // どこまで失敗したか（0: WebP を試す、1: JPEG だけ、2: error.jpg）。画像が変わったら 0 から試す
    const [failure, setFailure] = useState({ src: jpeg, stage: 0 })
    const stage = failure.src === jpeg ? failure.stage : 0

    const handleError = (event) => {
        // WebP に対応していないブラウザでは最初から JPEG を読むので、失敗した画像で次の段階を決める
        const failedWebp = /\.webp(\?|$)/.test(event.currentTarget.currentSrc)
        setFailure({ src: jpeg, stage: failedWebp ? 1 : 2 })
    }

    if (stage === 2) return <img {...imgProps} src={FALLBACK_IMAGE} alt={alt} />
    return (
        <picture className="contents">
            {stage === 0 && <source srcSet={webp} type="image/webp" />}
            {/* 段階が変わったら img を作り直して、読み込みをやり直させる */}
            <img key={stage} {...imgProps} src={jpeg} alt={alt} onError={handleError} />
        </picture>
    )
}
