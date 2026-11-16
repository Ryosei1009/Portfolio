import { Dialog } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid'
import React, { useRef } from 'react'
import { plainText, workImageAlt } from '../../../../utils/TextUtil'
import { WorkPicture } from './workImage'

const DEVICE_NUMBERS = ['①', '②', '③', '④', '⑤']
const SLOTS = [1, 2, 3, 4, 5]

// 公開画面に出す工夫の番号（文章が空の工夫は、画像ごと出さない）。1つも無ければ1枚目だけ出す
export const visibleSlots = (work) => {
    const slots = SLOTS.filter((slot) => plainText(work[`device_${slot}`]))
    return slots.length > 0 ? slots : [1]
}

// 技術は「, 」か「、」で区切る
export const splitTech = (tech) => (tech ?? '').split(/\s*[,、]\s*/).map((item) => item.trim()).filter(Boolean)

// 期間・人数・担当・技術のタグ
const WorkTags = ({ work }) => {
    const facts = [
        { label: '期間', value: work.period },
        { label: '人数', value: work.team },
        { label: '担当', value: work.role },
    ].filter((fact) => fact.value?.trim())
    const tech = splitTech(work.tech)
    if (facts.length === 0 && tech.length === 0) return null
    return (
        <div className="mt-4 flex flex-col items-center gap-2">
            {facts.length > 0 && (
                <dl className="flex flex-wrap justify-center gap-2 text-sm max-md:text-xs">
                    {facts.map((fact) => (
                        <div key={fact.label} className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1">
                            <dt className="font-bold text-gray-500">{fact.label}</dt>
                            <dd>{fact.value}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {tech.length > 0 && (
                <ul aria-label="使った技術" className="flex flex-wrap justify-center gap-1.5 text-xs">
                    {tech.map((item) => (
                        <li key={item} className="rounded-full bg-gray-900 px-2.5 py-1 font-bold text-white">{item}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// 作品詳細の中身（公開画面と管理者画面で同じレイアウトを使う）。EachWork の Dialog の中でだけ使う
// editButton(key) / editPanel(key) を渡すと、各ブロックに編集ボタンと編集欄を出す
// imageSlot を渡すと、サムネイルの下に出す（管理者の画像の差し替えなど）
// showAllSlots: 管理者用。文章が空の工夫も含めて、5つすべてを出す
// key: 'title' | 'link' | 'tags' | 'purpose' | 'outlook' | 'device'
const WorkDetailBody = ({ work, selectedImage, setSelectedImage, onZoom, imageVersion, imageSlot = null, showAllSlots = false, editButton = () => null, editPanel = () => null }) => {
    const slots = showAllSlots ? SLOTS : visibleSlots(work)
    // 前の作品で選んでいた工夫が、この作品では出ていないときは、最初の工夫にする
    const image = slots.includes(selectedImage) ? selectedImage : slots[0]
    const position = slots.indexOf(image)
    const zoomButtonRef = useRef(null)
    // 画像を押しても拡大ボタンを押しても、拡大を閉じた後は拡大ボタンにフォーカスを戻す
    const zoom = () => onZoom(zoomButtonRef.current)
    const device = work[`device_${image}`]
    // 公開画面では、出ている工夫だけで ①②③ と数え直す
    const deviceNumber = DEVICE_NUMBERS[showAllSlots ? image - 1 : position]

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
            <WorkTags work={work} />
            {editButton('tags')}
            {editPanel('tags')}
            <div className="flex max-lg:flex-col mt-8 max-lg:mt-4 items-center w-full">
                <div className="flex flex-col items-center w-11/24 max-lg:w-full mr-4 max-xl:mr-4 max-lg:mr-0">
                    {/* 画像のクリックでも、右下のボタンでも拡大できる */}
                    <div className="relative w-45/48">
                        <WorkPicture onClick={zoom} className="w-full cursor-pointer hover:opacity-80"
                            workId={work.id} file={`${image}.jpg`} version={imageVersion}
                            alt={workImageAlt(work, image)} loading="lazy" />
                        <button
                            ref={zoomButtonRef}
                            type="button"
                            onClick={zoom}
                            aria-label="画像を拡大"
                            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                            <MagnifyingGlassPlusIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    {slots.length > 1 && (
                        <>
                            <div className="mt-6 max-md:mt-4 px-2 flex w-full justify-center gap-[4%]">
                                {/* 押せる範囲は before で 44px 四方以上に広げる（画像の大きさと並びは変えない） */}
                                {slots.map((item) => {
                                    const isEmpty = showAllSlots && !plainText(work[`device_${item}`])
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setSelectedImage(item)}
                                            aria-pressed={image === item}
                                            title={isEmpty ? '工夫が空欄のため、公開画面には出ません' : undefined}
                                            className={`group relative w-1/6 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${isEmpty ? 'opacity-30' : ''}`}
                                        >
                                            <WorkPicture className="w-full group-hover:opacity-80 group-hover:scale-110" workId={work.id} file={`${item}_small.jpg`} version={imageVersion} alt={workImageAlt(work, item)} loading="lazy" />
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="mt-3 max-md:mt-2 text-xs text-gray-500">画像を選ぶと、工夫点が切り替わります</p>
                        </>
                    )}
                    {imageSlot}
                </div>
                <div className="h-full w-13/24 max-lg:w-full text-start max-lg:border-t-2 mt-4">
                    <div className="flex flex-col text-sm max-xl:text-xs max-lg:h-full overflow-y-scroll overscroll-contain h-96 scroll-hidden">
                        {[
                            { key: 'purpose', title: '目的', border: 'border-orange-500', html: work.purpose },
                            { key: 'outlook', title: '成果と学び', border: 'border-blue-200', html: work.outlook },
                            { key: 'device', title: '工夫', border: 'border-yellow-300', html: device, number: slots.length > 1 ? deviceNumber : null },
                        ].map((section) => (
                            <div key={section.key} className={`px-4 max-lg:px-3 py-2 max-lg:py-2 ${section.border} border-4 mb-3 last:mb-0`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl max-lg:text-lg font-bold">
                                            {section.title} {section.number && <span className="font-normal">{section.number}</span>}
                                        </h3>
                                        {section.key === 'device' && slots.length > 1 && (
                                            <div className="flex items-center gap-4">
                                                <DevicePagerButton direction="prev" disabled={position <= 0} onClick={() => setSelectedImage(slots[position - 1])} />
                                                <DevicePagerButton direction="next" disabled={position >= slots.length - 1} onClick={() => setSelectedImage(slots[position + 1])} />
                                            </div>
                                        )}
                                    </div>
                                    {editButton(section.key)}
                                </div>
                                {section.html
                                    ? <div className="ml-2" dangerouslySetInnerHTML={{ __html: section.html }} />
                                    : showAllSlots && <p className="ml-2 text-gray-400">（空欄。公開画面には出ません）</p>}
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
