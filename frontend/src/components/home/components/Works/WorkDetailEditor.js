import React, { useEffect, useId, useState } from 'react'
import axios from 'axios'
import { useAutoSave } from '../../../../utils/useAutoSave'
import SaveStatus from '../../../_utils/SaveStatus'
import ImageUploadButton from '../../../_utils/ImageUploadButton'
import { EditButton, EditPanel, TextArea, TextField } from '../../../_utils/EditControls'
import WorkDetailBody, { splitTech } from './WorkDetailBody'
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
    period: work.period ?? '',
    team: work.team ?? '',
    role: work.role ?? '',
    tech: work.tech ?? '',
})

const saveDetail = (data) => (
    axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update`, data, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
)

// 目的・成果と学び・工夫は「文章 + <br />」だけでできているので、改行で編集できるようにする
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
const WorkDetailEditor = ({ work, selectedImage, setSelectedImage, onZoom, setWorks, imageVersion, onImageUploaded }) => {
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
        tags: (
            <EditPanel title="期間・人数・担当・技術を編集" onClose={() => setEditing(null)}>
                <p className="text-xs text-gray-500">タイトルの下にタグで表示します。空の項目は出しません。</p>
                <div className="grid grid-cols-3 max-md:grid-cols-1 gap-3">
                    <TextField label="期間" value={form.period} onChange={update('period')} maxLength={50} hint="例: 2024年2月〜2026年7月" />
                    <TextField label="人数" value={form.team} onChange={update('team')} maxLength={50} hint="例: 2〜3人" />
                    <TextField label="担当" value={form.role} onChange={update('role')} maxLength={100} hint="例: オーナー" />
                </div>
                <TextField label="技術" value={form.tech} onChange={update('tech')} maxLength={255} hint={`「, 」か「、」で区切ります。${splitTech(form.tech).length > 0 ? `（${splitTech(form.tech).length}個）` : ''}`} />
            </EditPanel>
        ),
        purpose: (
            <EditPanel title="目的を編集" onClose={() => setEditing(null)} className="mt-2">
                <HtmlTextField label="目的" value={form.purpose} onChange={update('purpose')} />
            </EditPanel>
        ),
        outlook: (
            <EditPanel title="成果と学びを編集" onClose={() => setEditing(null)} className="mt-2">
                <HtmlTextField label="成果と学び" value={form.outlook} onChange={update('outlook')} />
            </EditPanel>
        ),
        // 工夫①〜⑤（画像1〜5の説明）
        ...Object.fromEntries([1, 2, 3, 4, 5].map((slot) => [`device_${slot}`, (
            <EditPanel title={`工夫 ${DEVICE_NUMBERS[slot - 1]} を編集`} onClose={() => setEditing(null)} className="mt-2">
                <p className="text-xs text-gray-500">1行目を【見出し】にすると、太字の見出しになります。空欄にすると、公開画面ではこの工夫と画像{slot}を出しません（3〜4個に絞るとき）。</p>
                <HtmlTextField label={`工夫 ${DEVICE_NUMBERS[slot - 1]}（画像${slot}の説明）`} value={form[`device_${slot}`]} onChange={update(`device_${slot}`)} />
            </EditPanel>
        )])),
    }

    return (
        <>
            <SaveStatus status={status} onRetry={flush} className="self-end -mt-8 max-lg:-mt-2 mr-10 mb-2 min-h-[1rem]" />
            <WorkDetailBody
                work={form}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onZoom={onZoom}
                imageVersion={imageVersion}
                showAllSlots
                imageSlot={(
                    <ImageUploadButton
                        key={image}
                        label={`画像${DEVICE_NUMBERS[image - 1]}を変更`}
                        endpoint="/works/update_image"
                        fields={{ id: work.id, image_id: image }}
                        hint="横長（16:9）の画像がおすすめです。JPEG・PNG・WebP、10MBまで。"
                        doneMessage={`画像${DEVICE_NUMBERS[image - 1]}を変更しました`}
                        onUploaded={onImageUploaded}
                    />
                )}
                editButton={(key) => (
                    <EditButton label={key === 'tags' ? '期間・技術などを編集' : '編集'} isOpen={editing === key} onClick={() => setEditing((prev) => (prev === key ? null : key))} className={key === 'title' ? 'mb-2' : key === 'tags' ? 'mt-2' : 'shrink-0'} />
                )}
                editPanel={(key) => editing === key && <div className={`w-full ${key === 'title' || key === 'link' || key === 'tags' ? 'my-3' : ''}`}>{panels[key]}</div>}
            />
        </>
    )
}

export default WorkDetailEditor
