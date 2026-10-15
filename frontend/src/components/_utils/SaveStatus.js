import React from 'react'

const LABELS = {
    pending: '未保存の変更があります',
    saving: '保存中…',
    saved: '保存しました',
    error: '保存に失敗しました',
}

const COLORS = {
    pending: 'text-amber-700',
    saving: 'text-gray-500',
    saved: 'text-emerald-700',
    error: 'text-red-600',
}

// useAutoSave の状態を表示する（idle のときは何も出さない）
const SaveStatus = ({ status, onRetry, className = '' }) => {
    return (
        <div role="status" aria-live="polite" className={`text-xs font-medium ${COLORS[status] ?? ''} ${className}`}>
            {LABELS[status] ?? ''}
            {status === 'error' && onRetry && (
                <button type="button" onClick={onRetry} className="ml-2 underline hover:no-underline">
                    もう一度保存する
                </button>
            )}
        </div>
    )
}

export default SaveStatus
