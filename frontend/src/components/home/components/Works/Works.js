import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import EachWork from './EachWork';
import CreateWorkModal from '../CreateWork/CreateWorkModal';
import { plainText, workImageAlt } from '../../../../utils/TextUtil';
import { showFallbackImage, workImageUrl } from './workImage';
import WorkSettingsDialog from './WorkSettingsDialog';
import { EditButton } from '../../../_utils/EditControls';
import { useAutoSave } from '../../../../utils/useAutoSave';
import SaveStatus from '../../../_utils/SaveStatus';
import CategoryEditor, { categoryProblem } from './CategoryEditor';

// 並び順として保存する値（id と sort_order だけ）
const toOrder = (works) => works?.map((item) => ({ id: item.id, sort_order: item.sort_order ?? 0 }))

// カテゴリ一覧がまだ読み込めていないとき（または読み込めなかったとき）に使う
const DEFAULT_CATEGORIES = ['学外活動', '大学', '高校']
// 画面の中で名前を変えたり並べ替えたりしても、どのカテゴリか分かるように key を付ける
let nextCategoryKey = 1
const newCategoryKey = () => nextCategoryKey++
const withCategoryKeys = (names) => names.map((name) => ({ key: newCategoryKey(), name }))


const Works = ({ isAuth, onLoaded }) => {
    const [selectedWork, setSelectedWork] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [createWorkModalIsOpen, setCreateWorkModalIsOpen] = useState(false);
    // 画像を差し替えた作品の id → 差し替えた時刻（画像の URL に付けて、新しい画像を表示させる）
    const [imageVersions, setImageVersions] = useState({});
    const handleImageUploaded = (id) => setImageVersions((prev) => ({ ...prev, [id]: Date.now() }));
    // 設定を編集している作品の id
    const [settingsWorkId, setSettingsWorkId] = useState(null);
    const [works, setWorks] = useState()

    // カテゴリ一覧（管理者が編集できる）。savedNames は DB に保存済みの名前（key → 名前）
    // 作品は保存済みの名前で持っているので、名前を入力している間も、作品は保存済みの名前でまとめる
    const [categoryItems, setCategoryItems] = useState(() => withCategoryKeys(DEFAULT_CATEGORIES))
    const [savedNames, setSavedNames] = useState(() => Object.fromEntries(categoryItems.map((item) => [item.key, item.name])))
    const [isEditingCategories, setIsEditingCategories] = useState(false)
    const categoryDraft = useMemo(() => categoryItems.map(({ key, name }) => ({ key, name })), [categoryItems])
    const saveCategories = async (draft) => {
        const problem = categoryProblem(draft)
        if (problem) throw new Error(problem)
        const items = draft.map((item) => ({ name: item.name.trim(), previous_name: savedNames[item.key] ?? null }))
        await axios.post(`${process.env.REACT_APP_API_DOMAIN}/categories/save`, { items }, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        })
        // サーバーでは作品のカテゴリも書き換わったので、画面の作品にも反映する
        const renamed = new Map(items.filter((item) => item.previous_name !== null).map((item) => [item.previous_name, item.name]))
        setWorks((prev) => prev?.map((work) => (renamed.has(work.category) ? { ...work, category: renamed.get(work.category) } : work)))
        setSavedNames(Object.fromEntries(draft.map((item) => [item.key, item.name.trim()])))
    }
    const { status: categoryStatus, flush: flushCategories, reset: resetCategories } = useAutoSave(categoryDraft, saveCategories)
    // 作品の設定や新規作成で選べるのは、保存済みのカテゴリだけ
    const categories = categoryItems.map((item) => savedNames[item.key]).filter(Boolean)

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/categories/get`)
                if (!response.ok) return
                const names = await response.json()
                if (!Array.isArray(names) || names.length === 0) return
                const items = withCategoryKeys(names)
                // 読み込んだ値は保存済みとして扱う
                resetCategories(items.map(({ key, name }) => ({ key, name })))
                setCategoryItems(items)
                setSavedNames(Object.fromEntries(items.map((item) => [item.key, item.name])))
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    // 並び替え（管理者のみ）。読み込んだ並び順は保存済みとして扱う
    const order = useMemo(() => toOrder(works), [works])
    // DB に保存済みの並び順（id → sort_order）。変わった作品の分だけを送るために使う
    const savedOrder = useRef(new Map())
    const openerRef = useRef(null)
    const [searchParams, setSearchParams] = useSearchParams()
    // ?work=<id> で来たときに、まだ開いていない作品の id（自分で作品を開いたら取り消す）
    const pendingWorkId = useRef(searchParams.get('work'))
    const saveOrder = async (orders) => {
        const changed = orders.filter((item) => savedOrder.current.get(item.id) !== item.sort_order)
        if (changed.length === 0) return
        await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update/order`, { orders: changed }, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        })
        changed.forEach((item) => savedOrder.current.set(item.id, item.sort_order))
    }
    const { reset: resetOrder } = useAutoSave(order, saveOrder)

    useEffect(() => {
        async function fetchWorks() {
            try {
                // 管理者のトークンがあれば送る（非公開の作品も受け取るため）
                const token = localStorage.getItem('token')
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/works/get`, {
                    headers: token ? { 'Authorization': token } : {},
                });
                const data = await response.json();
                savedOrder.current = new Map(toOrder(data).map((item) => [item.id, item.sort_order]));
                resetOrder(toOrder(data));
                setWorks(data);
            } catch (error) {
                console.error('Error fetching new item list:', error);
            } finally {
                onLoaded?.()
            }
        }
        fetchWorks();
    }, [])

    // 非公開（is_published = 0）は管理者にだけ表示する
    const visibleWorks = works ? works.filter((item) => isAuth || Number(item.is_published) !== 0) : []
    const sortedWorks = [...visibleWorks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
    const featuredWorks = sortedWorks.filter((item) => Number(item.is_featured) === 1)
    const otherWorks = sortedWorks.filter((item) => Number(item.is_featured) !== 1)
    const worksByCategory = categoryItems.map((category) => ({
        key: category.key,
        category: category.name,
        items: otherWorks.filter((item) => item.category === savedNames[category.key]),
    }))
    // どのカテゴリにも当てはまらない作品（管理者にだけ「未分類」として出す）
    const savedNameList = Object.values(savedNames)
    const uncategorized = otherWorks.filter((item) => !savedNameList.includes(item.category))
    if (isAuth && uncategorized.length > 0) worksByCategory.push({ key: 'uncategorized', category: '未分類', items: uncategorized })
    const workCounts = Object.fromEntries(categoryItems.map((category) => [category.key, works?.filter((item) => item.category === savedNames[category.key]).length ?? 0]))

    // 画面に並んでいる順（詳細モーダルの ← → 移動で使う）
    const orderedWorks = [...featuredWorks, ...worksByCategory.flatMap(({ items }) => items)]
    const settingsWork = works?.find((item) => item.id === settingsWorkId)

    // 作品ごとの URL（?work=<id>）。開く・← → で移るときに置き換え、閉じたら消す（履歴は増やさない）
    const openWorkId = modalIsOpen && selectedWork?.id != null ? selectedWork.id : null
    const wasOpen = useRef(false)
    useEffect(() => {
        if (openWorkId === null && !wasOpen.current) return
        wasOpen.current = openWorkId !== null
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (openWorkId === null) next.delete('work')
            else next.set('work', openWorkId)
            return next
        }, { replace: true })
    }, [openWorkId])

    // ?work=<id> で来たときは、作品を読み込んだ後にその作品を開く。表示されない id なら何もしない
    // （管理者かどうかの確認は後から終わるので、非公開の作品が表示されるまで待つ）
    useEffect(() => {
        if (!pendingWorkId.current || !works) return
        const work = visibleWorks.find((item) => String(item.id) === pendingWorkId.current)
        if (work) handleModal(work)
    }, [works, isAuth])

    // 同じ欄（代表作・カテゴリ）の中で、隣の作品と入れ替える
    // 欄の中の番号に重なりが無ければ2作品の番号を入れ替えるだけにし、重なりがあるときだけ欄の番号を振り直す
    const moveWork = (group, index, delta) => {
        const target = index + delta
        if (target < 0 || target >= group.length) return
        const current = group[index]
        const neighbor = group[target]
        const hasTies = new Set(group.map((item) => item.sort_order)).size !== group.length
        let newOrder
        if (hasTies) {
            const reordered = [...group]
            ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
            newOrder = new Map(reordered.map((item, i) => [item.id, i + 1]))
        } else {
            newOrder = new Map([[current.id, neighbor.sort_order], [neighbor.id, current.sort_order]])
        }
        setWorks((prev) => prev.map((item) => (newOrder.has(item.id) ? { ...item, sort_order: newOrder.get(item.id) } : item)))
    }

    // 作った作品を一覧に足し、そのまま詳細の編集画面を開く
    const handleCreated = (work) => {
        const next = [...(works ?? []), work]
        savedOrder.current.set(work.id, work.sort_order)
        resetOrder(toOrder(next))
        setWorks(next)
        setCreateWorkModalIsOpen(false)
        handleModal(work)
    }

    // opener: 押したカード。詳細を閉じたら、そこへフォーカスを戻す（← → で別の作品に移っても、最初に押したカードへ戻す）
    const handleModal = (work, opener = null) => {
        openerRef.current = opener
        pendingWorkId.current = null
        setSelectedWork(work);
        setModalIsOpen(true)
    }
    const handleAfterClose = () => {
        openerRef.current?.focus({ preventScroll: true })
        openerRef.current = null
    }

    return (
        <>
            <div id="works" className="scroll-mt-16">
                <div className="flex justify-center">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0 flex flex-wrap justify-between items-end gap-3">
                            <h2 className="text-5xl max-sm:text-4xl">Works<span className="ml-4 text-xl">これまでしてきたこと</span></h2>
                            {isAuth && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <SaveStatus status={categoryStatus} onRetry={flushCategories} />
                                    <EditButton label="カテゴリを編集" isOpen={isEditingCategories} onClick={() => setIsEditingCategories(!isEditingCategories)} />
                                    <button
                                        type="button"
                                        onClick={() => setCreateWorkModalIsOpen(true)}
                                        className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700"
                                    >
                                        <PlusIcon className="h-4 w-4" aria-hidden="true" />
                                        作品を追加
                                    </button>
                                </div>
                            )}
                        </div>
                        {isAuth && isEditingCategories && (
                            <CategoryEditor
                                items={categoryItems}
                                setItems={setCategoryItems}
                                workCounts={workCounts}
                                onClose={() => setIsEditingCategories(false)}
                                newKey={newCategoryKey}
                            />
                        )}
                    </div>
                </div>
                <div className="flex justify-center pb-16">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        {/* 代表作 */}
                        {featuredWorks.length > 0 && (
                            <>
                                <div className="mt-6 flex">
                                    <h3 className="text-xl font-bold bg-gray-900 px-4 py-1 rounded-lg text-white">
                                        代表作
                                    </h3>
                                </div>
                                <div className="mt-6 grid grid-cols-3 max-md:grid-cols-1 gap-6 text-black font-bold">
                                    {featuredWorks.map((item, index) => (
                                        <WorkCard key={item.id} item={item} imageVersion={imageVersions[item.id]} size="large" isAuth={isAuth} onOpen={handleModal} onOpenSettings={setSettingsWorkId} onMove={(delta) => moveWork(featuredWorks, index, delta)} isFirst={index === 0} isLast={index === featuredWorks.length - 1} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* その他（カテゴリごと） */}
                        {worksByCategory.filter(({ items }) => items.length > 0).map(({ key, category, items }) => (
                            <React.Fragment key={key}>
                                <div className="mt-12 flex">
                                    <h3 className="text-xl font-bold bg-blue-500 px-4 py-1 rounded-lg text-white">
                                        {category}
                                    </h3>
                                </div>
                                <div className="mt-6 grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 gap-4 max-sm:gap-3 text-black font-bold">
                                    {items.map((item, index) => (
                                        <WorkCard key={item.id} item={item} imageVersion={imageVersions[item.id]} size="small" isAuth={isAuth} onOpen={handleModal} onOpenSettings={setSettingsWorkId} onMove={(delta) => moveWork(items, index, delta)} isFirst={index === 0} isLast={index === items.length - 1} />
                                    ))}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <EachWork modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} selectedWork={selectedWork} setSelectedWork={setSelectedWork} orderedWorks={orderedWorks} isAuth={isAuth} setWorks={setWorks} imageVersions={imageVersions} onImageUploaded={handleImageUploaded} onAfterClose={handleAfterClose} />
            {isAuth && (
                <CreateWorkModal isOpen={createWorkModalIsOpen} onClose={() => setCreateWorkModalIsOpen(false)} categories={categories} onCreated={handleCreated} />
            )}
            {isAuth && settingsWork && (
                <WorkSettingsDialog key={settingsWork.id} work={settingsWork} categories={categories} setWorks={setWorks} onClose={() => setSettingsWorkId(null)} />
            )}
        </>
    )
}

export default Works

const WorkCard = ({ item, imageVersion, size, isAuth, onOpen, onOpenSettings, onMove, isFirst, isLast }) => {
    const isLarge = size === 'large'
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(item, event.currentTarget)
        }
    }
    const buttonProps = {
        role: 'button',
        tabIndex: 0,
        'aria-label': `${plainText(item.each_name) || '作品'}の詳細を開く`,
        onClick: (event) => onOpen(item, event.currentTarget),
        onKeyDown: handleKeyDown,
    }

    // 管理者はカードの中に「設定」ボタンがあるので、画像だけを詳細を開くボタンにする
    return (
        <div
            {...(isAuth ? {} : buttonProps)}
            className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow ${isAuth ? '' : 'cursor-pointer'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
        >
            <div {...(isAuth ? buttonProps : {})} className="relative aspect-video overflow-hidden cursor-pointer">
                {Number(item.is_published) === 0 && (
                    <div className="absolute left-2 top-2 z-[1] rounded-md bg-gray-900/80 px-2 py-0.5 text-xs font-bold text-white">
                        非公開
                    </div>
                )}
                <img
                    src={workImageUrl(item.id, '1_mid.jpg', imageVersion)} alt={workImageAlt(item, 1)}
                    onError={showFallbackImage}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>
            <div className={`flex-1 flex flex-col ${isLarge ? 'px-4 py-5 text-xl max-md:text-lg' : 'px-2 py-3 text-base max-sm:text-sm'}`}>
                {/* name の1つ目の <p> はカテゴリ見出しなので小さく表示する */}
                <div className="[&>p:first-child]:text-[0.75em] [&>p:first-child]:font-medium [&>p:first-child]:text-gray-500" dangerouslySetInnerHTML={{ __html: item.name }} />
                {item.highlight && (
                    // カードの高さがそろうように下端に寄せる
                    <div className={`mt-auto pt-3 flex justify-center ${isLarge ? 'text-sm' : 'text-xs'}`}>
                        <div className={`rounded-lg bg-emerald-50 py-1 text-center text-balance font-medium text-emerald-800 ${isLarge ? 'px-3' : 'px-2'}`}>
                            {item.highlight}
                        </div>
                    </div>
                )}
                {isAuth && (
                    <div className={`${item.highlight ? 'pt-2' : 'mt-auto pt-3'} flex items-center justify-center gap-1`}>
                        <MoveButton direction="back" disabled={isFirst} onClick={() => onMove(-1)} />
                        <EditButton label="設定" onClick={() => onOpenSettings(item.id)} />
                        <MoveButton direction="forward" disabled={isLast} onClick={() => onMove(1)} />
                    </div>
                )}
            </div>
        </div>
    )
}

// 並び替えのボタン（前へ／後ろへ）
const MoveButton = ({ direction, disabled, onClick }) => {
    const Icon = direction === 'back' ? ChevronLeftIcon : ChevronRightIcon
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === 'back' ? '前に移動' : '後ろに移動'}
            title={direction === 'back' ? '前に移動' : '後ろに移動'}
            className="rounded-full border border-gray-300 bg-white p-1 text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    )
}
