import React, { useEffect, useId, useRef } from 'react'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { markedText } from '../../utils/TextUtil'

// 管理者画面で使う編集用の部品

// 各ブロックの「編集」ボタン
export const EditButton = ({ onClick, label = '編集', isOpen = false, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${className}`}
    >
        <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
        {isOpen ? '閉じる' : label}
    </button>
)

// 編集欄をまとめる枠
export const EditPanel = ({ title, onClose, children, className = '' }) => (
    <section className={`rounded-2xl border-2 border-main bg-white p-5 max-sm:p-4 shadow-sm ${className}`}>
        <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-base font-bold">{title}</h3>
            {onClose && (
                <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100">
                    閉じる
                </button>
            )}
        </div>
        <div className="flex flex-col gap-4">{children}</div>
    </section>
)

// 1行の入力欄
export const TextField = ({ label, value, onChange, type = 'text', hint, maxLength = 255 }) => {
    const id = useId()
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">{label}</label>
            <input
                id={id}
                type={type}
                value={value ?? ''}
                maxLength={maxLength}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    )
}

// 複数行の入力欄（入力に合わせて高さが伸び、画面の 60% を超える分はスクロール）
export const TextArea = ({ label, value, onChange, hint, rows = 4, id: givenId }) => {
    const autoId = useId()
    const id = givenId ?? autoId
    const ref = useRef(null)

    useEffect(() => {
        const textarea = ref.current
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight + 2}px`
    }, [value])

    return (
        <div className="flex flex-col">
            {label && <label htmlFor={id} className="text-sm font-bold text-gray-700">{label}</label>}
            <textarea
                id={id}
                ref={ref}
                rows={rows}
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full max-h-[60vh] resize-none overflow-y-auto rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    )
}

// Markdown の入力欄と見た目の確認（PC は左右、スマホは上下に並ぶ）
export const MarkdownField = ({ label, value, onChange, hint, preview }) => {
    const id = useId()
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">{label}</label>
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            <div className="mt-1 grid grid-cols-2 max-md:grid-cols-1 gap-4">
                <TextArea id={id} value={value} onChange={onChange} rows={8} />
                <div className="mt-1 max-h-[60vh] overflow-y-auto rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-relaxed">
                    <div className="mb-2 text-xs font-bold text-gray-500">表示の確認</div>
                    {preview ?? <div dangerouslySetInnerHTML={markedText(value)} />}
                </div>
            </div>
        </div>
    )
}
