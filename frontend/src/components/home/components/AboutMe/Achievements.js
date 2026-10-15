import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useAutoSave } from '../../../../utils/useAutoSave'
import SaveStatus from '../../../_utils/SaveStatus'
import { EditButton, EditPanel, TextField } from '../../../_utils/EditControls'

const MAX_ITEMS = 6

// 実績カードがまだ読み込めていないとき（または読み込めなかったとき）に出すカード
const DEFAULT_ITEMS = [
    { value: '6,000人', label: 'ゲームサーバーのコミュニティ規模（Discordメンバー）' },
    { value: '約1,000万円', label: '寄付による累計売上（約63,000$）' },
    { value: '40人→80人', label: '文化祭の運営メンバーを拡大（実行委員長）' },
]

// 画面の中で並べ替えや削除をしても入力欄が入れ替わらないよう、カードごとに key を付ける
let nextKey = 1
const withKeys = (items) => items.map((item) => ({ ...item, key: nextKey++ }))
const toSaved = (items) => items.map(({ value, label }) => ({ value, label }))

const saveItems = (items) => (
    axios.post(`${process.env.REACT_APP_API_DOMAIN}/achievements/save`, { items }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
)

const IconButton = ({ label, onClick, disabled, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
    >
        {children}
    </button>
)

const Achievements = ({ isAuth }) => {
    const [items, setItems] = useState(() => withKeys(DEFAULT_ITEMS))
    const [isEditing, setIsEditing] = useState(false)
    const saved = useMemo(() => toSaved(items), [items])
    const { status, flush, reset } = useAutoSave(saved, saveItems)
    const panelRef = useRef(null)

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/achievements/get`)
                if (!response.ok) return
                const data = await response.json()
                if (!Array.isArray(data) || data.length === 0) return
                // 読み込んだ値は保存済みとして扱う
                reset(toSaved(data))
                setItems(withKeys(data))
            } catch (error) {
                console.error('Error fetching achievements:', error)
            }
        }
        fetchItems()
    }, [])

    useEffect(() => {
        if (isEditing) panelRef.current?.scrollIntoView({ block: 'nearest' })
    }, [isEditing])

    const updateItem = (index, key) => (value) => setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    const moveItem = (index, delta) => setItems((prev) => {
        const next = [...prev]
        ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
        return next
    })
    const removeItem = (index) => {
        if (!window.confirm('このカードを削除しますか？')) return
        setItems((prev) => prev.filter((_, i) => i !== index))
    }
    const addItem = () => setItems((prev) => [...prev, ...withKeys([{ value: '', label: '' }])])

    // 数字が空のカードは、公開画面には出さない
    const visibleItems = isAuth ? items : items.filter((item) => item.value.trim())
    const columns = visibleItems.length >= 3 ? 'grid-cols-3' : visibleItems.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

    return (
        <>
            {isAuth && (
                <div className="mt-6 -mb-2 flex items-center justify-end gap-3">
                    <SaveStatus status={status} onRetry={flush} />
                    <EditButton label="実績カードを編集" isOpen={isEditing} onClick={() => setIsEditing(!isEditing)} />
                </div>
            )}
            <div className={`mt-6 grid ${columns} max-md:grid-cols-1 gap-4`}>
                {visibleItems.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-gray-200 border-t-4 border-t-main bg-white p-6 max-md:p-5 shadow-sm text-center">
                        <div className="text-4xl max-lg:text-3xl font-bold">{item.value || <span className="text-gray-300">（数字が未入力）</span>}</div>
                        <div className="mt-2 text-sm text-gray-600">{item.label}</div>
                    </div>
                ))}
            </div>
            {isAuth && isEditing && (
                <div ref={panelRef} className="scroll-mb-28">
                    <EditPanel title="実績カードを編集" onClose={() => setIsEditing(false)} className="mt-4">
                        <p className="text-xs text-gray-500">上から順に表示されます。数字が空のカードは、公開画面には出ません（{MAX_ITEMS}枚まで）。</p>
                        <ol className="flex flex-col gap-3">
                            {items.map((item, index) => (
                                <li key={item.key} className="rounded-lg border border-gray-200 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-gray-700">{index + 1}枚目</span>
                                        <div className="flex items-center gap-1">
                                            <IconButton label="上に移動" disabled={index === 0} onClick={() => moveItem(index, -1)}><ArrowUpIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                            <IconButton label="下に移動" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}><ArrowDownIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                            <IconButton label="削除" disabled={items.length <= 1} onClick={() => removeItem(index)}><TrashIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_2fr] max-sm:grid-cols-1 gap-3">
                                        <TextField label="数字" value={item.value} onChange={updateItem(index, 'value')} maxLength={50} hint="例: 6,000人" />
                                        <TextField label="説明" value={item.label} onChange={updateItem(index, 'label')} maxLength={200} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <button
                            type="button"
                            onClick={addItem}
                            disabled={items.length >= MAX_ITEMS}
                            className="self-start inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-40"
                        >
                            <PlusIcon className="h-4 w-4" aria-hidden="true" />
                            カードを追加
                        </button>
                    </EditPanel>
                </div>
            )}
        </>
    )
}

export default Achievements
