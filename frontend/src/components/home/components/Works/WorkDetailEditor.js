import React, { useEffect, useId, useState } from 'react'
import axios from 'axios'
import { useAutoSave } from '../../../../utils/useAutoSave'
import SaveStatus from '../../../_utils/SaveStatus'
import { EditButton, EditPanel, TextArea, TextField } from '../../../_utils/EditControls'
import WorkDetailBody from './WorkDetailBody'
import { buildCardTitle, parseCardTitle } from './WorkSettingsDialog'

const DEVICE_NUMBERS = ['①', '②', '③', '④', '⑤']

const pickDetail = (work) => ({
    id: work.id,
    each_name: work.each_name ?? '',
    url: work.url ?? '',
    url_name: work.url_name ?? '',
    purpose: work.purpose ?? '',
    outlook: work.outlook ?? '',
    device_1: work.device_1 ?? '',
    device_2: work.device_2 ?? '',
    device_3: work.device_3 ?? '',
    device_4: work.device_4 ?? '',
    device_5: work.device_5 ?? '',
})

const saveDetail = (data) => (
    axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update`, data, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
)

// 目的・展望・工夫は「文章 + <br />」だけでできているので、改行で編集できるようにする
const BREAK = /<br\s*\/?>/gi
const isTextWithBreaks = (html) => !html.includes('\n') && !/<(?!br\s*\/?>)[^>]*>/i.test(html)
const toText = (html) => html.split(BREAK).join('\n')
const fromText = (text) => text.split('\n').join('<br />')

const HtmlTextField = ({ label, value, onChange }) => {
    const [isHtmlMode, setIsHtmlMode] = useState(() => !isTextWithBreaks(value))
    const canUseText = isTextWithBreaks(value)

    return (
        <div className="flex flex-col gap-2">
            {isHtmlMode ? (
                <>
                    <TextArea label={`${label}（HTML）`} value={value} onChange={onChange} rows={4} />
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2">
                        <div className="mb-1 text-xs font-bold text-gray-500">表示の確認</div>
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                    </div>
                </>
            ) : (
                <TextArea label={label} value={toText(value)} onChange={(text) => onChange(fromText(text))} rows={4} hint="改行した位置で、表示も改行されます。" />
            )}
            {(canUseText || !isHtmlMode) && (
                <button type="button" onClick={() => setIsHtmlMode(!isHtmlMode)} className="self-start text-xs text-gray-500 underline hover:no-underline">
                    {isHtmlMode ? '文章として編集する' : 'HTML を直接編集する'}
                </button>
            )}
        </div>
    )
}

const LinkFields = ({ form, update }) => {
    const id = useId()
    const hasLink = form.url !== 'none'
    return (
        <>
            <label htmlFor={id} className="flex items-center gap-2 text-sm">
                <input id={id} type="checkbox" checked={!hasLink} onChange={(event) => update('url')(event.target.checked ? 'none' : '')} className="h-4 w-4 accent-gray-900" />
                リンクを付けない（文だけを表示する）
            </label>
            <TextField label={hasLink ? 'リンクの文字' : '表示する文'} value={form.url_name} onChange={update('url_name')} />
            {hasLink && <TextField label="リンク先の URL" type="url" value={form.url} onChange={update('url')} hint="https:// から入力してください。新しいタブで開きます。" />}
        </>
    )
}

// 管理者用の作品詳細。公開画面と同じレイアウトに、各ブロックの編集ボタンと編集欄を足す
const WorkDetailEditor = ({ work, selectedImage, setSelectedImage, onZoom, setWorks }) => {
    const [form, setForm] = useState(() => pickDetail(work))
    const [editing, setEditing] = useState(null)
    const [isTitleHtml, setIsTitleHtml] = useState(() => parseCardTitle(work.each_name) === null)
    const { status, flush } = useAutoSave(form, saveDetail)

    const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
    const image = selectedImage || 1

    // 一覧の表示にも編集中の内容を反映する
    useEffect(() => {
        setWorks((prev) => prev?.map((item) => (item.id === form.id ? { ...item, ...form } : item)))
    }, [form, setWorks])

    const titleLines = parseCardTitle(form.each_name)

    const panels = {
        title: (
            <EditPanel title="タイトルを編集" onClose={() => setEditing(null)}>
                {!isTitleHtml && titleLines ? (
                    titleLines.map((line, index) => (
                        <TextField
                            key={index}
                            label={titleLines.length > 1 ? `タイトル（${index + 1}行目）` : 'タイトル'}
                            value={line}
                            onChange={(value) => {
                                const lines = [...titleLines]
                                lines[index] = value
                                update('each_name')(buildCardTitle(lines))
                            }}
                            hint="「／」で区切ると、画面が狭いときにその位置で折り返します。"
                        />
                    ))
                ) : (
                    <TextArea label="タイトル（HTML）" value={form.each_name} onChange={update('each_name')} rows={2} hint="<p class=&quot;text-center&quot;><span>…</span></p> の形で書くと、文字の入力欄で編集できます。" />
                )}
                {titleLines && (
                    <button type="button" onClick={() => setIsTitleHtml(!isTitleHtml)} className="self-start text-xs text-gray-500 underline hover:no-underline">
                        {isTitleHtml ? '文字の入力欄で編集する' : 'HTML を直接編集する'}
                    </button>
                )}
            </EditPanel>
        ),
        link: (
            <EditPanel title="リンクを編集" onClose={() => setEditing(null)}>
                <LinkFields form={form} update={update} />
            </EditPanel>
        ),
        purpose: (
            <EditPanel title="目的を編集" onClose={() => setEditing(null)} className="mt-2">
                <HtmlTextField label="目的" value={form.purpose} onChange={update('purpose')} />
            </EditPanel>
        ),
        outlook: (
            <EditPanel title="展望を編集" onClose={() => setEditing(null)} className="mt-2">
                <HtmlTextField label="展望" value={form.outlook} onChange={update('outlook')} />
            </EditPanel>
        ),
        device: (
            <EditPanel title={`工夫 ${DEVICE_NUMBERS[image - 1]} を編集`} onClose={() => setEditing(null)} className="mt-2">
                <p className="text-xs text-gray-500">下の小さい画像を選ぶと、その画像の工夫に切り替わります。</p>
                <HtmlTextField key={image} label={`工夫 ${DEVICE_NUMBERS[image - 1]}（画像${image}の説明）`} value={form[`device_${image}`]} onChange={update(`device_${image}`)} />
            </EditPanel>
        ),
    }

    return (
        <>
            <SaveStatus status={status} onRetry={flush} className="self-end -mt-8 max-lg:-mt-2 mb-2 min-h-[1rem]" />
            <WorkDetailBody
                work={form}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onZoom={onZoom}
                editButton={(key) => (
                    <EditButton isOpen={editing === key} onClick={() => setEditing((prev) => (prev === key ? null : key))} className={key === 'title' ? 'mb-2' : 'shrink-0'} />
                )}
                editPanel={(key) => editing === key && <div className={`w-full ${key === 'title' || key === 'link' ? 'my-3' : ''}`}>{panels[key]}</div>}
            />
        </>
    )
}

export default WorkDetailEditor
