import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ArrowDownIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, ArrowUpIcon } from '@heroicons/react/24/solid'
import { useAutoSave } from '../../../../utils/useAutoSave'
import SaveStatus from '../../../_utils/SaveStatus'
import LoadStatus from '../../../_utils/LoadStatus'
import GitHubIcon from '../../../_utils/GitHubIcon'
import { EditButton, EditPanel, TextField } from '../../../_utils/EditControls'

// カテゴリ一覧がまだ読み込めていないとき（または読み込めなかったとき）に使う（Works と同じ）
const DEFAULT_CATEGORIES = ['学外活動', '大学', '高校']
const OTHER_LABEL = 'その他'

// GitHub の言語の色（よく使うものだけ。無い言語は灰色）
const LANGUAGE_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#663399',
    Lua: '#000080',
    Python: '#3572A5',
    'C++': '#f34b7d',
    C: '#555555',
    Java: '#b07219',
    Shell: '#89e051',
}

// 保存する値（GitHub から取る名前・説明文などは持たない）
// confirmed: DB に行がある（または管理者が確認した）。未確認のリポジトリは、確認するまで保存しない
const toSettings = (repos) => repos.map(({ name, is_visible, category, sort_order, comment, confirmed }) => ({ name, is_visible, category, sort_order, comment, confirmed }))
// 未確認のリポジトリ（sort_order が null）には、確認済みの最後の続きの番号を仮に振っておく（確認したときにその番号で保存する）
const withConfirmed = (repos) => {
    let next = Math.max(0, ...repos.filter((repo) => !repo.is_new).map((repo) => repo.sort_order ?? 0))
    return repos.map((repo) => ({
        ...repo,
        confirmed: !repo.is_new,
        // 公開画面の API は表示中のものだけを返し、is_visible を含めない
        is_visible: repo.is_visible ?? true,
        sort_order: repo.is_new ? ++next : repo.sort_order,
        comment: repo.comment ?? '',
    }))
}

// カテゴリの順 → 並び順でまとめる。どのカテゴリにも当てはまらないものは「その他」
const groupByCategory = (repos, categories) => {
    const groups = categories.map((category) => ({ category, items: repos.filter((repo) => repo.category === category) }))
    const others = repos.filter((repo) => !categories.includes(repo.category))
    return [...groups, { category: OTHER_LABEL, items: others }].filter((group) => group.items.length > 0)
}

const authHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': token } : {}
}

const Language = ({ name }) => name && (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
        <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: LANGUAGE_COLORS[name] ?? '#9ca3af' }} aria-hidden="true" />
        {name}
    </span>
)

const RepositoryCard = ({ repo }) => (
    <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
    >
        <div className="flex items-start gap-2">
            <GitHubIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" />
            <span className="font-bold break-all group-hover:underline">{repo.name}</span>
            <ArrowTopRightOnSquareIcon className="mt-1 ml-auto h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span className="sr-only">（GitHub が新しいタブで開きます）</span>
        </div>
        {repo.description && <p className="mt-2 text-sm leading-relaxed text-gray-700">{repo.description}</p>}
        {repo.comment && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs leading-relaxed text-emerald-900">{repo.comment}</p>}
        <div className="mt-auto pt-3">
            <Language name={repo.language} />
        </div>
    </a>
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

const Repositories = ({ isAuth, onLoaded }) => {
    const [repos, setRepos] = useState([])
    // 'loading' | 'error' | 'done'
    const [loadStatus, setLoadStatus] = useState('loading')
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [isEditing, setIsEditing] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const panelRef = useRef(null)

    // DB に保存済みの設定（name → JSON）。変わったリポジトリの分だけを送るために使う
    const saved = useRef(new Map())
    const settings = useMemo(() => toSettings(repos), [repos])
    const save = async (draft) => {
        const changed = draft.filter((item) => item.confirmed && saved.current.get(item.name) !== JSON.stringify(item))
        if (changed.length === 0) return
        await axios.post(`${process.env.REACT_APP_API_DOMAIN}/repositories/save`, {
            items: changed.map(({ confirmed, ...item }) => item),
        }, { headers: authHeaders() })
        changed.forEach((item) => saved.current.set(item.name, JSON.stringify(item)))
    }
    const { status: saveStatus, flush, reset } = useAutoSave(settings, save)

    // refresh: 管理者が「GitHub から読み直す」を押したとき（サーバーが取っておいた一覧を使わない）
    const fetchRepos = useCallback(async ({ refresh = false } = {}) => {
        if (!refresh) setLoadStatus('loading')
        try {
            const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/repositories/get${refresh ? '?refresh=1' : ''}`, { headers: authHeaders() })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = withConfirmed(await response.json())
            const loaded = toSettings(data)
            saved.current = new Map(loaded.filter((item) => item.confirmed).map((item) => [item.name, JSON.stringify(item)]))
            // 読み込んだ値は保存済みとして扱う
            reset(loaded)
            setRepos(data)
            setLoadStatus('done')
        } catch (error) {
            console.error('Error fetching repositories:', error)
            if (!refresh) setLoadStatus('error')
        } finally {
            onLoaded?.()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset])

    useEffect(() => {
        fetchRepos()
        async function fetchCategories() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/categories/get`)
                if (!response.ok) return
                const names = await response.json()
                if (Array.isArray(names) && names.length > 0) setCategories(names)
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (isEditing) panelRef.current?.scrollIntoView({ block: 'nearest' })
    }, [isEditing])

    const refresh = async () => {
        setIsRefreshing(true)
        // 入力途中の分を先に保存してから、読み直す
        await flush()
        await fetchRepos({ refresh: true })
        setIsRefreshing(false)
    }

    // 変えたリポジトリは「確認済み」にする（未確認のまま変えた場合も、保存の対象になる）
    const updateRepo = (name, key) => (value) => setRepos((prev) => prev.map((repo) => (repo.name === name ? { ...repo, [key]: value, confirmed: true } : repo)))
    // 並び順は、編集欄の上から 1, 2, 3… と振り直す（カテゴリが違っても通し番号でよい。表示はカテゴリごとにまとめる）
    const moveRepo = (index, delta) => setRepos((prev) => {
        const next = [...prev]
        ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
        return next.map((repo, i) => ({ ...repo, sort_order: i + 1 }))
    })

    // 公開画面: 表示中のものだけ（サーバーも表示中のものだけを返す）。管理者も、公開画面と同じものをカードで確認する
    const visibleRepos = repos.filter((repo) => repo.is_visible)
    const groups = groupByCategory(visibleRepos, categories)
    const newCount = repos.filter((repo) => !repo.confirmed).length

    // 公開画面で、表示するリポジトリが1つも無いときは、セクションごと出さない
    if (!isAuth && loadStatus === 'done' && visibleRepos.length === 0) return null

    return (
        <div id="repositories" className="flex justify-center pb-24 scroll-mt-16">
            <div className="text-black w-full max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4 max-md:mb-0">
                    <h2 className="text-5xl max-sm:text-4xl font-bold">
                        Repositories<span className="ml-4 text-xl">ソースコード</span>
                    </h2>
                    {isAuth && (
                        <div className="flex flex-wrap items-center gap-2">
                            <SaveStatus status={saveStatus} onRetry={flush} />
                            <EditButton label={newCount > 0 ? `リポジトリを編集（未確認 ${newCount}件）` : 'リポジトリを編集'} isOpen={isEditing} onClick={() => setIsEditing(!isEditing)} />
                        </div>
                    )}
                </div>
                <p className="mt-2 text-sm text-gray-600">GitHub で公開しているリポジトリです。カードを押すと GitHub が開きます。</p>
                <LoadStatus status={loadStatus} onRetry={() => fetchRepos()} className="mt-6" />

                {isAuth && isEditing && loadStatus === 'done' && (
                    <div ref={panelRef} className="scroll-mb-28">
                        <EditPanel title="リポジトリを編集" onClose={() => setIsEditing(false)} className="mt-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-gray-500">
                                    「表示」をオンにしたものだけが公開画面に出ます。GitHub で新しく公開したリポジトリは「未確認」として下に追加されます。
                                    名前と説明文は GitHub の内容を使います（説明文の先頭の【】は表示しません）。
                                </p>
                                <button
                                    type="button"
                                    onClick={refresh}
                                    disabled={isRefreshing}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-40"
                                >
                                    <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    GitHub から読み直す
                                </button>
                            </div>
                            {repos.length === 0 ? (
                                <p className="text-sm text-gray-500">公開リポジトリが見つかりませんでした。About Me の GitHub の URL を確かめてください。</p>
                            ) : (
                                <ol className="flex flex-col gap-3">
                                    {repos.map((repo, index) => (
                                        <li key={repo.name} className={`rounded-lg border p-3 ${repo.confirmed ? 'border-gray-200' : 'border-amber-300 bg-amber-50'}`}>
                                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold break-all hover:underline">{repo.name}</a>
                                                    {!repo.confirmed && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">未確認</span>}
                                                    {repo.fork && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">fork</span>}
                                                    {repo.archived && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">アーカイブ済み</span>}
                                                    <Language name={repo.language} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <IconButton label="上に移動" disabled={index === 0} onClick={() => moveRepo(index, -1)}><ArrowUpIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                                    <IconButton label="下に移動" disabled={index === repos.length - 1} onClick={() => moveRepo(index, 1)}><ArrowDownIcon className="h-4 w-4" aria-hidden="true" /></IconButton>
                                                </div>
                                            </div>
                                            {repo.description && <p className="mb-2 text-xs text-gray-600">{repo.description}</p>}
                                            <div className="grid grid-cols-[auto_1fr_2fr] max-md:grid-cols-1 items-start gap-3">
                                                <label className="flex min-h-11 items-center gap-2 text-sm font-bold text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={repo.is_visible}
                                                        onChange={(event) => updateRepo(repo.name, 'is_visible')(event.target.checked)}
                                                        className="h-5 w-5 accent-gray-900"
                                                    />
                                                    表示
                                                </label>
                                                <label className="flex flex-col text-sm font-bold text-gray-700">
                                                    カテゴリ
                                                    <select
                                                        value={categories.includes(repo.category) ? repo.category : ''}
                                                        onChange={(event) => updateRepo(repo.name, 'category')(event.target.value || null)}
                                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                    >
                                                        <option value="">{OTHER_LABEL}（未設定）</option>
                                                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                                    </select>
                                                </label>
                                                <TextField label="一言コメント" value={repo.comment} onChange={updateRepo(repo.name, 'comment')} maxLength={200} hint="空なら出しません。" />
                                            </div>
                                            {!repo.confirmed && (
                                                <button
                                                    type="button"
                                                    onClick={() => updateRepo(repo.name, 'confirmed')(true)}
                                                    className="mt-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-100"
                                                >
                                                    非表示のまま確認済みにする
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </EditPanel>
                    </div>
                )}

                {isAuth && loadStatus === 'done' && visibleRepos.length === 0 && (
                    <p className="mt-6 rounded-2xl border border-dashed border-gray-300 px-6 py-8 text-center text-sm text-gray-500">
                        表示中のリポジトリがありません。公開画面では、このセクションは表示されません。
                    </p>
                )}

                {groups.map(({ category, items }) => (
                    <section key={category} className="mt-10 first-of-type:mt-6">
                        <div className="flex">
                            <h3 className="text-xl font-bold bg-blue-500 px-4 py-1 rounded-lg text-white">{category}</h3>
                        </div>
                        <div className="mt-4 grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
                            {items.map((repo) => <RepositoryCard key={repo.name} repo={repo} />)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}

export default Repositories
