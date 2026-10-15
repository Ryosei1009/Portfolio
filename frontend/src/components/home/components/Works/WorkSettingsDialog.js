import React, { useEffect, useId, useState } from 'react'
import { Dialog } from '@headlessui/react'
import axios from 'axios'
import { plainText } from '../../../../utils/TextUtil'
import { useAutoSave } from '../../../../utils/useAutoSave'
import SaveStatus from '../../../_utils/SaveStatus'
import { TextArea, TextField } from '../../../_utils/EditControls'

const SEPARATOR = '／'

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// カード用タイトル（<p><span>…</span></p> が並ぶ HTML）を、行ごとの文字列に分ける
// span の区切りは「／」で表す。この形でなければ null を返す
export const parseCardTitle = (html) => {
    const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html')
    const blocks = [...doc.body.childNodes].filter((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim())
    const isCardTitle = blocks.length > 0 && blocks.every((block) => (
        block.nodeName === 'P' && [...block.childNodes].every((child) => child.nodeName === 'SPAN')
    ))
    if (!isCardTitle) return null
    return blocks.map((p) => [...p.childNodes].map((span) => span.textContent).join(SEPARATOR))
}

export const buildCardTitle = (lines) => lines.map((line) => {
    const chunks = line.split(SEPARATOR).filter((chunk) => chunk !== '')
    return `<p class="text-center">${chunks.map((chunk) => `<span>${escapeHtml(chunk)}</span>`).join('')}</p>`
}).join('')

const pickSettings = (work) => ({
    id: work.id,
    name: work.name ?? '',
    category: work.category ?? '',
    highlight: work.highlight ?? '',
    is_featured: Number(work.is_featured) === 1 ? 1 : 0,
    is_published: Number(work.is_published) === 0 ? 0 : 1,
})

const saveSettings = (data) => (
    axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update/settings`, {
        ...data,
        highlight: data.highlight.trim() === '' ? null : data.highlight,
    }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
)

const Checkbox = ({ label, description, checked, onChange }) => {
    const id = useId()
    return (
        <label htmlFor={id} className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
            <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-gray-900" />
            <span>
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-xs text-gray-500">{description}</span>
            </span>
        </label>
    )
}

// 作品カードの設定（カード用タイトル・カテゴリ・成果・代表作・公開）を編集する
const WorkSettingsDialog = ({ work, categories, setWorks, onClose }) => {
    const [settings, setSettings] = useState(() => pickSettings(work))
    const [isHtmlMode, setIsHtmlMode] = useState(() => parseCardTitle(work.name) === null)
    const { status, flush } = useAutoSave(settings, saveSettings)
    const categoryId = useId()

    const update = (key) => (value) => setSettings((prev) => ({ ...prev, [key]: value }))

    // 一覧の表示にも編集中の内容を反映する
    useEffect(() => {
        setWorks((prev) => prev?.map((item) => (item.id === settings.id ? { ...item, ...settings } : item)))
    }, [settings, setWorks])

    const titleLines = parseCardTitle(settings.name)
    const setTitleLine = (index) => (value) => {
        const lines = [...(titleLines ?? ['', ''])]
        lines[index] = value
        update('name')(buildCardTitle(lines))
    }

    return (
        <Dialog open onClose={onClose} className="relative z-40">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 overflow-y-auto p-4 flex items-start justify-center">
                <Dialog.Panel className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 max-sm:p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-lg font-bold">作品の設定</Dialog.Title>
                            <p className="text-sm text-gray-500">{plainText(work.each_name) || plainText(work.name)}</p>
                        </div>
                        <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100">
                            閉じる
                        </button>
                    </div>
                    <SaveStatus status={status} onRetry={flush} className="mt-1 min-h-[1rem]" />

                    <div className="mt-4 flex flex-col gap-5">
                        <fieldset className="flex flex-col gap-3">
                            <legend className="text-sm font-bold text-gray-700">カードのタイトル</legend>
                            {!isHtmlMode && titleLines ? (
                                <>
                                    <TextField label="1行目（カテゴリの見出し）" value={titleLines[0] ?? ''} onChange={setTitleLine(0)} />
                                    <TextField label="2行目（作品名）" value={titleLines[1] ?? ''} onChange={setTitleLine(1)} hint={`「${SEPARATOR}」で区切ると、画面が狭いときにその位置で折り返します。`} />
                                </>
                            ) : (
                                <TextArea label="HTML" value={settings.name} onChange={update('name')} rows={3} hint="<p class=&quot;text-center&quot;><span>…</span></p> の形で書くと、行ごとの入力欄で編集できます。" />
                            )}
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 font-bold">
                                <div className="mb-1 text-xs font-bold text-gray-500">表示の確認</div>
                                <div dangerouslySetInnerHTML={{ __html: settings.name }} className="[&>p:first-child]:text-[0.75em] [&>p:first-child]:font-medium [&>p:first-child]:text-gray-500" />
                            </div>
                            {titleLines && (
                                <button type="button" onClick={() => setIsHtmlMode(!isHtmlMode)} className="self-start text-xs text-gray-500 underline hover:no-underline">
                                    {isHtmlMode ? '行ごとの入力欄で編集する' : 'HTML を直接編集する'}
                                </button>
                            )}
                        </fieldset>

                        <div className="flex flex-col">
                            <label htmlFor={categoryId} className="text-sm font-bold text-gray-700">カテゴリ</label>
                            <select
                                id={categoryId}
                                value={settings.category}
                                onChange={(event) => update('category')(event.target.value)}
                                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            >
                                {!categories.includes(settings.category) && <option value={settings.category}>{settings.category || '（未設定）'}</option>}
                                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                            </select>
                        </div>

                        <TextField label="成果（カードに1行で表示）" value={settings.highlight} onChange={update('highlight')} maxLength={100} hint="空欄にすると表示されません（100文字まで）。" />

                        <div className="flex flex-col gap-2">
                            <Checkbox
                                label="代表作にする"
                                description="一覧の先頭に、大きめのカードで表示します。"
                                checked={settings.is_featured === 1}
                                onChange={(checked) => update('is_featured')(checked ? 1 : 0)}
                            />
                            <Checkbox
                                label="公開する"
                                description="外すと、管理者以外には表示されません（記事が未完成のときなど）。"
                                checked={settings.is_published === 1}
                                onChange={(checked) => update('is_published')(checked ? 1 : 0)}
                            />
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default WorkSettingsDialog
