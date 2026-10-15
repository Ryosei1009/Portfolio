import React, { useId, useState } from 'react'
import { Dialog } from '@headlessui/react'
import axios from 'axios'
import { TextField } from '../../../_utils/EditControls'
import { buildCardTitle } from '../Works/WorkSettingsDialog'

// 作品を新しく作る。最初はタイトルとカテゴリだけを入れ、残りは作成後の編集画面で書く
const CreateWorkModal = ({ isOpen, onClose, categories, onCreated }) => {
    const [heading, setHeading] = useState('')
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState(categories[0] ?? '')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState('')
    const categoryId = useId()

    const close = () => {
        if (isSending) return
        setError('')
        onClose()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!title.trim() || !category) {
            setError('作品名とカテゴリを入力してください')
            return
        }
        setIsSending(true)
        setError('')
        try {
            const lines = heading.trim() ? [heading, title] : [title]
            const response = await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/create`, {
                name: buildCardTitle(lines),
                each_name: buildCardTitle([title]),
                category,
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            })
            setHeading('')
            setTitle('')
            onCreated(response.data)
        } catch (error) {
            console.error('作品の作成に失敗しました:', error)
            setError('作成できませんでした。時間をおいてもう一度お試しください')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onClose={close} className="relative z-40">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 overflow-y-auto p-4 flex items-start justify-center">
                <Dialog.Panel className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 max-sm:p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-lg font-bold">作品を追加</Dialog.Title>
                            <p className="text-sm text-gray-500">非公開で作成します。作成後に開く画面で、リンク・目的・展望・工夫を書いてください。</p>
                        </div>
                        <button type="button" onClick={close} className="rounded-full px-3 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100">
                            閉じる
                        </button>
                    </div>
                    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                        <TextField label="カードの1行目（カテゴリの見出し・任意）" value={heading} onChange={setHeading} hint="例: ウェブアプリ" />
                        <TextField label="作品名" value={title} onChange={setTitle} hint="「／」で区切ると、画面が狭いときにその位置で折り返します。詳細のタイトルにも使います。" />
                        <div className="flex flex-col">
                            <label htmlFor={categoryId} className="text-sm font-bold text-gray-700">カテゴリ</label>
                            <select
                                id={categoryId}
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                            >
                                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <p role="alert" className="min-h-[1.25rem] text-sm text-red-600">{error}</p>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="rounded-full bg-gray-900 px-6 py-3 font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            {isSending ? '作成中…' : '作成して編集する'}
                        </button>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default CreateWorkModal
