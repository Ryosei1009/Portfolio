import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import EachWork from './EachWork';
import CreateWorkModal from '../CreateWork/CreateWorkModal';
import { workImageAlt } from '../../../../utils/TextUtil';
import WorkSettingsDialog from './WorkSettingsDialog';
import { EditButton } from '../../../_utils/EditControls';
import { useAutoSave } from '../../../../utils/useAutoSave';

// 並び順として保存する値（id と sort_order だけ）
const toOrder = (works) => works?.map((item) => ({ id: item.id, sort_order: item.sort_order ?? 0 }))


const Works = ({ isAuth, onLoaded }) => {
    const [selectedWork, setSelectedWork] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [createWorkModalIsOpen, setCreateWorkModalIsOpen] = useState(false);
    // 設定を編集している作品の id
    const [settingsWorkId, setSettingsWorkId] = useState(null);
    const [works, setWorks] = useState()
    const categories = ['学外活動', '大学', '高校']

    // 並び替え（管理者のみ）。読み込んだ並び順は保存済みとして扱う
    const order = useMemo(() => toOrder(works), [works])
    // DB に保存済みの並び順（id → sort_order）。変わった作品の分だけを送るために使う
    const savedOrder = useRef(new Map())
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
                console.log(data)
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
    const worksByCategory = categories.map((category) => ({
        category,
        items: otherWorks.filter((item) => item.category === category),
    }))

    // 画面に並んでいる順（詳細モーダルの ← → 移動で使う）
    const orderedWorks = [...featuredWorks, ...worksByCategory.flatMap(({ items }) => items)]
    const settingsWork = works?.find((item) => item.id === settingsWorkId)

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

    const handleModal = (work) => {
        setSelectedWork(work);
        setModalIsOpen(true)
    }

    return (
        <>
            <div id="works" className="scroll-mt-16">
                <div className="flex justify-center">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0 flex flex-wrap justify-between items-end gap-3">
                            <div>Works<span className="ml-4 text-xl">これまでしてきたこと</span></div>
                            {isAuth && (
                                <button
                                    type="button"
                                    onClick={() => setCreateWorkModalIsOpen(true)}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700"
                                >
                                    <PlusIcon className="h-4 w-4" aria-hidden="true" />
                                    作品を追加
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center pb-16">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        {/* 代表作 */}
                        {featuredWorks.length > 0 && (
                            <>
                                <div className="mt-6 flex">
                                    <div className="text-xl font-bold bg-gray-900 px-4 py-1 rounded-lg text-white">
                                        代表作
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-3 max-md:grid-cols-1 gap-6 text-black font-bold">
                                    {featuredWorks.map((item, index) => (
                                        <WorkCard key={item.id} item={item} size="large" isAuth={isAuth} onOpen={handleModal} onOpenSettings={setSettingsWorkId} onMove={(delta) => moveWork(featuredWorks, index, delta)} isFirst={index === 0} isLast={index === featuredWorks.length - 1} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* その他（カテゴリごと） */}
                        {worksByCategory.filter(({ items }) => items.length > 0).map(({ category, items }) => (
                            <React.Fragment key={category}>
                                <div className="mt-12 flex">
                                    <div className="text-xl font-bold bg-blue-500 px-4 py-1 rounded-lg text-white">
                                        {category}
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 gap-4 max-sm:gap-3 text-black font-bold">
                                    {items.map((item, index) => (
                                        <WorkCard key={item.id} item={item} size="small" isAuth={isAuth} onOpen={handleModal} onOpenSettings={setSettingsWorkId} onMove={(delta) => moveWork(items, index, delta)} isFirst={index === 0} isLast={index === items.length - 1} />
                                    ))}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <EachWork modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} selectedWork={selectedWork} setSelectedWork={setSelectedWork} orderedWorks={orderedWorks} isAuth={isAuth} setWorks={setWorks} />
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

const WorkCard = ({ item, size, isAuth, onOpen, onOpenSettings, onMove, isFirst, isLast }) => {
    const isLarge = size === 'large'
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(item)
        }
    }
    const buttonProps = { role: 'button', tabIndex: 0, onClick: () => onOpen(item), onKeyDown: handleKeyDown }

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
                    src={`${process.env.REACT_APP_API_DOMAIN}/images/works/${item.id}/1_mid.jpg`} alt={workImageAlt(item, 1)}
                    onError={(event) => { event.target.onerror = null; event.target.src = '/images/works/error.jpg' }}
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
