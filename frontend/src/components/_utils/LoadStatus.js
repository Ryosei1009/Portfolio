import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

// API から読み込んでいる間と、読み込みに失敗したときの表示（'done' のときは何も出さない）
// status: 'loading' | 'error' | 'done'
const LoadStatus = ({ status, onRetry, className = '' }) => {
    if (status === 'loading') {
        return (
            <p role="status" className={`py-12 text-center text-gray-500 ${className}`}>
                読み込み中…
            </p>
        )
    }
    if (status === 'error') {
        return (
            <div role="alert" className={`rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center ${className}`}>
                <p className="font-bold text-red-700">読み込みに失敗しました。</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-gray-900 bg-white px-6 font-bold hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                    <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                    再読み込み
                </button>
            </div>
        )
    }
    return null
}

export default LoadStatus
