import React from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid'
import { EditPanel, TextField } from '../../../_utils/EditControls'

export const MAX_CATEGORIES = 10

// 入力中のカテゴリ一覧に問題があれば、その説明を返す（無ければ null）
export const categoryProblem = (items) => {
    const names = items.map((item) => item.name.trim())
    if (names.some((name) => name === '')) return '名前が空のカテゴリがあります。'
    if (new Set(names).size !== names.length) return '同じ名前のカテゴリがあります。'
    return null
}

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

// カテゴリの名前・並び順・追加・削除を編集する
// workCounts: カテゴリの key → 入っている作品の数（作品があるカテゴリは削除できない）
const CategoryEditor = ({ items, setItems, workCounts, onClose, newKey }) => {
    const problem = categoryProblem(items)

    const rename = (index) => (name) => setItems((prev) => prev.map((item, i) => (i === index ? { ...item, name } : item)))
    const move = (index, delta) => setItems((prev) => {
        const next = [...prev]
        ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
        return next
    })
    const remove = (index) => setItems((prev) => prev.filter((_, i) => i !== index))
    const add = () => setItems((prev) => [...prev, { key: newKey(), name: '' }])

    return (
        <EditPanel title="カテゴリを編集" onClose={onClose} className="mt-4">
            <p className="text-xs text-gray-500">上から順に表示されます。名前を変えると、そのカテゴリの作品もまとめて変わります。作品が入っているカテゴリは削除できません。</p>
            <ol className="flex flex-col gap-2">
                {items.map((item, index) => {
                    const count = workCounts[item.key] ?? 0
                    return (
                        <li key={item.key} className="flex items-end gap-2 rounded-lg border border-gray-200 p-3">
                            <div className="flex-1">
                                <TextField label={`${index + 1}番目（作品 ${count}件）`} value={item.name} onChange={rename(index)} maxLength={50} />
                            </div>
                            <div className="flex items-center gap-1 pb-1">
                                <IconButton label="上に移動" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                <IconButton label="下に移動" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDownIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                <IconButton label={count > 0 ? `作品が${count}件あるので削除できません` : '削除'} disabled={count > 0 || items.length <= 1} onClick={() => remove(index)}><TrashIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                            </div>
                        </li>
                    )
                })}
            </ol>
            {problem && <p role="alert" className="text-sm text-red-600">{problem}直すまで保存されません。</p>}
            <button
                type="button"
                onClick={add}
                disabled={items.length >= MAX_CATEGORIES}
                className="self-start inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-40"
            >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                カテゴリを追加
            </button>
        </EditPanel>
    )
}

export default CategoryEditor
