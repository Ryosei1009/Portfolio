import React from 'react'
import { flushAll, useSaveSummary } from '../../utils/useAutoSave'

const LABELS = {
    idle: 'ボタンや画像から編集できます',
    pending: '未保存の変更があります',
    saving: '保存中…',
    saved: 'すべて保存しました',
    error: '保存に失敗した項目があります',
}

const DOTS = {
    idle: 'bg-gray-400',
    pending: 'bg-amber-400',
    saving: 'bg-gray-300 animate-pulse',
    saved: 'bg-emerald-400',
    error: 'bg-red-500',
}

// 管理者でログインしているときだけ画面下に出すバー
const EditModeBar = ({ isPreview, setIsPreview, onLogout }) => {
    const summary = useSaveSummary()

    return (
        // 作品詳細などのダイアログ（z-10 以上）の後ろに回り、ダイアログの下端を隠さないようにする
        <div className="fixed bottom-4 inset-x-0 z-[5] flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl bg-gray-900/95 px-4 py-2 text-sm max-sm:text-xs text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <span className="shrink-0 rounded-full bg-main px-3 py-0.5 text-xs font-bold text-gray-900">
                        {isPreview ? '公開画面を確認中' : '編集モード'}
                    </span>
                    {!isPreview && (
                        <span role="status" aria-live="polite" className="flex items-center">
                            <span className={`mr-2 h-2 w-2 shrink-0 rounded-full ${DOTS[summary]}`} aria-hidden="true" />
                            {LABELS[summary]}
                            {summary === 'error' && (
                                <button type="button" onClick={flushAll} className="ml-2 underline hover:no-underline">
                                    もう一度保存する
                                </button>
                            )}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="rounded-full border border-white/40 px-3 py-1 hover:bg-white/10"
                    >
                        {isPreview ? '編集に戻る' : '公開画面で確認'}
                    </button>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="rounded-full border border-white/40 px-3 py-1 hover:bg-white/10"
                    >
                        ログアウト
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditModeBar
