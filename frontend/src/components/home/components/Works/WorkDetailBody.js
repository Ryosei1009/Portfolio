import { Dialog } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import React from 'react'
import { workImageAlt } from '../../../../utils/TextUtil'
import { showFallbackImage, workImageUrl } from './workImage'

const DEVICE_NUMBERS = ['①', '②', '③', '④', '⑤']

// 作品詳細の中身（公開画面と管理者画面で同じレイアウトを使う）。EachWork の Dialog の中でだけ使う
// editButton(key) / editPanel(key) を渡すと、各ブロックに編集ボタンと編集欄を出す
// imageSlot を渡すと、サムネイルの下に出す（管理者の画像の差し替えなど）
// key: 'title' | 'link' | 'purpose' | 'outlook' | 'device'
const WorkDetailBody = ({ work, selectedImage, setSelectedImage, onZoom, imageVersion, imageSlot = null, editButton = () => null, editPanel = () => null }) => {
    const image = selectedImage || 1
    const device = work[`device_${image}`] || work.device_1

    return (
        <>
            {/* ダイアログの名前（aria-labelledby）になる */}
            <Dialog.Title as="h2" className="text-5xl max-2xl:text-4xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl font-bold mb-2">
                <div dangerouslySetInnerHTML={{ __html: work.each_name }} />
            </Dialog.Title>
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
                        {/* 押せる範囲は before で 44px 四方以上に広げる（画像の大きさと並びは変えない） */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setSelectedImage(item)}
                                aria-pressed={image === item}
                                className="group relative w-1/6 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                            >
                                <img className="w-full group-hover:opacity-80 group-hover:scale-110" src={workImageUrl(work.id, `${item}_small.jpg`, imageVersion)} alt={workImageAlt(work, item)} loading="lazy" onError={showFallbackImage} />
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 max-md:mt-2 text-xs text-gray-500">画像を選ぶと、工夫点が切り替わります</p>
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
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl max-lg:text-lg font-bold">
                                            {section.title} {section.number && <span className="font-normal">{section.number}</span>}
                                        </h3>
                                        {section.key === 'device' && (
                                            <div className="flex items-center gap-4">
                                                <DevicePagerButton direction="prev" disabled={image <= 1} onClick={() => setSelectedImage(image - 1)} />
                                                <DevicePagerButton direction="next" disabled={image >= DEVICE_NUMBERS.length} onClick={() => setSelectedImage(image + 1)} />
                                            </div>
                                        )}
                                    </div>
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

// 工夫の前へ／次へ（画像も一緒に切り替わる）
// 端では押せなくするが、disabled にするとフォーカスが外れるので aria-disabled にする
// 見た目は 28px、押せる範囲は before で 44px 四方に広げる
const DevicePagerButton = ({ direction, disabled, onClick }) => {
    const Icon = direction === 'prev' ? ChevronLeftIcon : ChevronRightIcon
    return (
        <button
            type="button"
            onClick={() => !disabled && onClick()}
            aria-disabled={disabled}
            aria-label={direction === 'prev' ? '前の工夫' : '次の工夫'}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${disabled ? 'cursor-default opacity-30' : 'hover:bg-gray-100'}`}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    )
}
