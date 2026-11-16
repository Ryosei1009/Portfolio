import { Dialog } from '@headlessui/react'
import { MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid'
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

// 工夫の先頭の【見出し】と本文に分ける（見出しが無ければ本文だけ）
export const splitDeviceHeading = (html) => {
    const match = (html ?? '').match(/^\s*【([^】]+)】\s*(<br\s*\/?>\s*)?/i)
    return match ? { heading: match[1], body: html.slice(match[0].length) } : { heading: '', body: html ?? '' }
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
                <dl className="phrase-wrap flex flex-wrap justify-center gap-2 text-sm max-md:text-xs">
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
// key: 'title' | 'link' | 'tags' | 'purpose' | 'outlook' | 'device_1'〜'device_5'
const WorkDetailBody = ({ work, selectedImage, setSelectedImage, onZoom, imageVersion, imageSlot = null, showAllSlots = false, editButton = () => null, editPanel = () => null }) => {
    const slots = showAllSlots ? SLOTS : visibleSlots(work)
    // 前の作品で選んでいた工夫が、この作品では出ていないときは、最初の工夫にする
    const image = slots.includes(selectedImage) ? selectedImage : slots[0]
    const zoomButtonRef = useRef(null)
    // 画像を押しても拡大ボタンを押しても、拡大を閉じた後は拡大ボタンにフォーカスを戻す
    const zoom = () => onZoom(zoomButtonRef.current)
    // 公開画面では、出ている工夫だけで ①②③ と数え直す（管理者は元の番号のまま）
    const numberOf = (slot, index) => DEVICE_NUMBERS[showAllSlots ? slot - 1 : index]

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
            <div className="flex max-lg:flex-col mt-8 max-lg:mt-4 items-start w-full gap-8 max-lg:gap-6">
                {/* 画像（PC では右の文章を読んでいる間も見えるよう、上に貼り付ける） */}
                <div className="flex flex-col items-center w-5/12 max-lg:w-full shrink-0 lg:sticky lg:top-4">
                    {/* 画像のクリックでも、右下のボタンでも拡大できる */}
                    <div className="relative w-full">
                        <WorkPicture onClick={zoom} className="w-full rounded-lg cursor-pointer hover:opacity-90"
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
                            <div className="mt-4 flex w-full justify-center gap-[3%]">
                                {/* 押せる範囲は before で 44px 四方以上に広げる（画像の大きさと並びは変えない） */}
                                {slots.map((item, index) => {
                                    const isEmpty = showAllSlots && !plainText(work[`device_${item}`])
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setSelectedImage(item)}
                                            aria-pressed={image === item}
                                            aria-label={`工夫${numberOf(item, index)}の画像を表示`}
                                            title={isEmpty ? '工夫が空欄のため、公開画面には出ません' : undefined}
                                            className={`group relative w-1/6 rounded-md ring-offset-2 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${image === item ? 'ring-2 ring-gray-900' : ''} ${isEmpty ? 'opacity-30' : ''}`}
                                        >
                                            <WorkPicture className="w-full rounded-md group-hover:opacity-80" workId={work.id} file={`${item}_small.jpg`} version={imageVersion} alt="" loading="lazy" />
                                            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white" aria-hidden="true">{numberOf(item, index)}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="mt-3 text-xs text-gray-500">画像の番号は、工夫の番号に対応しています</p>
                        </>
                    )}
                    {imageSlot}
                </div>

                {/* 文章（高さを固定せず、すべて見せる） */}
                <div className="min-w-0 flex-1 text-start text-base max-lg:text-[15px] leading-relaxed text-gray-800">
                    {[
                        { key: 'purpose', title: '目的', html: work.purpose },
                        { key: 'outlook', title: '成果と学び', html: work.outlook },
                    ].map((section) => (
                        <section key={section.key} className="mb-8 max-lg:mb-6">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="border-l-4 border-gray-900 pl-3 text-xl max-lg:text-lg font-bold text-black">{section.title}</h3>
                                {editButton(section.key)}
                            </div>
                            <div className="mt-3" dangerouslySetInnerHTML={{ __html: section.html }} />
                            {editPanel(section.key)}
                        </section>
                    ))}
                    <section>
                        <h3 className="border-l-4 border-gray-900 pl-3 text-xl max-lg:text-lg font-bold text-black">工夫</h3>
                        <ol className="mt-3 flex flex-col gap-3">
                            {slots.map((slot, index) => {
                                const { heading, body } = splitDeviceHeading(work[`device_${slot}`])
                                const isSelected = slots.length > 1 && image === slot
                                return (
                                    <li key={slot} className={`rounded-xl border p-4 max-lg:p-3 transition-colors ${isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedImage(slot)}
                                                aria-pressed={isSelected}
                                                aria-label={`工夫${numberOf(slot, index)}の画像を表示`}
                                                className="flex items-start gap-2 text-left font-bold text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                            >
                                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm text-white" aria-hidden="true">{numberOf(slot, index)}</span>
                                                <span className="block">{heading || `工夫${numberOf(slot, index)}`}</span>
                                            </button>
                                            {editButton(`device_${slot}`)}
                                        </div>
                                        {plainText(body)
                                            ? <div className="mt-2" dangerouslySetInnerHTML={{ __html: body }} />
                                            : showAllSlots && <p className="mt-2 text-gray-400">（空欄。公開画面には出ません）</p>}
                                        {editPanel(`device_${slot}`)}
                                    </li>
                                )
                            })}
                        </ol>
                    </section>
                </div>
            </div>
        </>
    )
}

export default WorkDetailBody
