import React from 'react'
import { workImageAlt } from '../../../../utils/TextUtil'
import { showFallbackImage, workImageUrl } from './workImage'

const DEVICE_NUMBERS = ['①', '②', '③', '④', '⑤']

// 作品詳細の中身（公開画面と管理者画面で同じレイアウトを使う）
// editButton(key) / editPanel(key) を渡すと、各ブロックに編集ボタンと編集欄を出す
// imageSlot を渡すと、サムネイルの下に出す（管理者の画像の差し替えなど）
// key: 'title' | 'link' | 'purpose' | 'outlook' | 'device'
const WorkDetailBody = ({ work, selectedImage, setSelectedImage, onZoom, imageVersion, imageSlot = null, editButton = () => null, editPanel = () => null }) => {
    const image = selectedImage || 1
    const device = work[`device_${image}`] || work.device_1

    return (
        <>
            <div className="text-5xl max-2xl:text-4xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl font-bold mb-2">
                <div dangerouslySetInnerHTML={{ __html: work.each_name }} />
            </div>
            {editButton('title')}
            {editPanel('title')}
            <div className="flex flex-wrap items-center justify-center gap-2">
                {work.url === "none" ? (
                    <div className="outline-none">
                        {work.url_name}
                    </div>
                ) : (
                    <a href={work.url} target="_blank" rel="noopener noreferrer" className={`${work.url && "text-blue-500 hover:underline"} outline-none`}>
                        {work.url_name}
                    </a>
                )}
                {editButton('link')}
            </div>
            {editPanel('link')}
            <div className="flex max-lg:flex-col mt-8 max-lg:mt-4 items-center w-full">
                <div className="flex flex-col items-center w-11/24 max-lg:w-full mr-4 max-xl:mr-4 max-lg:mr-0">
                    <img onClick={onZoom} className="w-45/48 cursor-pointer hover:opacity-80"
                        src={workImageUrl(work.id, `${image}.jpg`, imageVersion)}
                        alt={workImageAlt(work, image)} loading="lazy" onError={showFallbackImage} />
                    <div className="mt-6 max-md:mt-4 px-2 flex justify-between">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <img key={item} onClick={() => setSelectedImage(item)} className="w-1/6 h-161 cursor-pointer hover:opacity-80 hover:scale-110" src={workImageUrl(work.id, `${item}_small.jpg`, imageVersion)} alt={workImageAlt(work, item)} loading="lazy" onError={showFallbackImage} />
                        ))}
                    </div>
                    {imageSlot}
                </div>
                <div className="h-full w-13/24 max-lg:w-full text-start max-lg:border-t-2 mt-4">
                    <div className="flex flex-col text-sm max-xl:text-xs max-lg:h-full overflow-y-scroll overscroll-contain h-96 scroll-hidden">
                        {[
                            { key: 'purpose', title: '目的', border: 'border-orange-500', html: work.purpose },
                            { key: 'outlook', title: '展望', border: 'border-blue-200', html: work.outlook },
                            { key: 'device', title: '工夫', border: 'border-yellow-300', html: device, number: DEVICE_NUMBERS[image - 1] },
                        ].map((section) => (
                            <div key={section.key} className={`px-4 max-lg:px-3 py-2 max-lg:py-2 ${section.border} border-4 mb-3 last:mb-0`}>
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-xl max-lg:text-lg font-bold">
                                        {section.title} {section.number && <span className="font-normal">{section.number}</span>}
                                    </h3>
                                    {editButton(section.key)}
                                </div>
                                <div className="ml-2" dangerouslySetInnerHTML={{ __html: section.html }} />
                                {editPanel(section.key)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default WorkDetailBody
