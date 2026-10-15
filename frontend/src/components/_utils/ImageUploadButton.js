import React, { useRef, useState } from 'react'
import axios from 'axios'
import { PhotoIcon } from '@heroicons/react/24/solid'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// 画像を選んでアップロードするボタン（作品画像・プロフィール写真で共通）
// fields はフォームに一緒に送る値、onUploaded にはサーバーの返事（response.data）を渡す
const ImageUploadButton = ({ label, endpoint, fields = {}, hint, doneMessage, onUploaded }) => {
    const inputRef = useRef(null)
    const [state, setState] = useState({ status: 'idle', message: '' })

    const handleChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        if (!IMAGE_TYPES.includes(file.type)) {
            setState({ status: 'error', message: 'JPEG・PNG・WebP の画像を選んでください。' })
            return
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setState({ status: 'error', message: '画像は10MBまでにしてください。' })
            return
        }
        const formData = new FormData()
        formData.append('image', file)
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
        setState({ status: 'uploading', message: 'アップロード中…' })
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_DOMAIN}${endpoint}`, formData, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
            })
            setState({ status: 'done', message: doneMessage })
            onUploaded(response.data)
        } catch (error) {
            console.error('画像のアップロードに失敗しました:', error)
            const message = typeof error.response?.data === 'string' ? error.response.data : 'アップロードできませんでした。時間をおいてもう一度お試しください。'
            setState({ status: 'error', message })
        }
    }

    return (
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={state.status === 'uploading'}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
            >
                <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                {label}
            </button>
            <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(',')} onChange={handleChange} className="hidden" aria-label={label} />
            <p role="status" aria-live="polite" className={`min-h-[1rem] text-xs ${state.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                {state.message || hint}
            </p>
        </div>
    )
}

export default ImageUploadButton
