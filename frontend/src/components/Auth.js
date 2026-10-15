import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Auth = ({ isAuth, setIsAuth, onLogout }) => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!password) {
            setError('パスワードを入力してください')
            return
        }
        setIsSending(true)
        setError('')
        try {
            const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/auth/create`, {
                method: 'POST',
                headers: {
                    'password': password
                }
            });
            if (response.status === 401) {
                setError('パスワードが違います')
                return
            }
            if (!response.ok) throw new Error(`status ${response.status}`)
            const data = await response.json();
            localStorage.setItem('token', data.token);
            setIsAuth(true)
            navigate('/')
        } catch (error) {
            console.error('Error checking auth:', error);
            setError('ログインできませんでした。時間をおいてもう一度お試しください')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 max-sm:p-6 shadow-sm">
                <h1 className="text-2xl max-sm:text-xl font-bold text-center">管理者ログイン</h1>
                {isAuth ? (
                    <div className="mt-6 flex flex-col gap-3">
                        <p className="text-center text-gray-600">ログインしています</p>
                        <Link
                            to="/"
                            className="rounded-full bg-gray-900 px-6 py-3 text-center font-bold text-white hover:bg-gray-700 transition-colors"
                        >
                            トップへ戻る
                        </Link>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="rounded-full border-2 border-gray-900 px-6 py-3 font-bold hover:bg-gray-100 transition-colors"
                        >
                            ログアウト
                        </button>
                    </div>
                ) : (
                    <form className="mt-6 flex flex-col" onSubmit={handleSubmit} noValidate>
                        <label htmlFor="password" className="text-sm font-bold text-gray-700">パスワード</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            autoFocus
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            aria-invalid={!!error}
                            aria-describedby={error ? 'password-error' : undefined}
                            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                        <p id="password-error" role="alert" className="mt-2 min-h-[1.25rem] text-sm text-red-600">
                            {error}
                        </p>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="mt-2 rounded-full bg-gray-900 px-6 py-3 font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            {isSending ? 'ログイン中…' : 'ログイン'}
                        </button>
                        <Link to="/" className="mt-4 text-center text-sm text-gray-500 hover:underline">
                            トップへ戻る
                        </Link>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Auth
