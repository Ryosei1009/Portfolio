import React, { useEffect, useRef, useState } from 'react'
import EachWork from './EachWork';
import CreateWorkModal from '../CreateWork/CreateWorkModal';
import axios from 'axios';

const Works = ({ isAuth }) => {
    const [selectedWork, setSelectedWork] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [createWorkModalIsOpen, setCreateWorkModalIsOpen] = useState(false);
    const [works, setWorks] = useState()
    const categories = ['学外活動', '大学', '高校']

    useEffect(() => {
        async function fetchWorks() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/works/get`);
                const data = await response.json();
                setWorks(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching new item list:', error);
            }
        }
        fetchWorks();
    }, [])

    const sortedWorks = works ? [...works].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id) : []
    const featuredWorks = sortedWorks.filter((item) => Number(item.is_featured) === 1)
    const otherWorks = sortedWorks.filter((item) => Number(item.is_featured) !== 1)
    const worksByCategory = categories.map((category) => ({
        category,
        items: otherWorks.filter((item) => item.category === category),
    }))

    // 画面に並んでいる順（詳細モーダルの ← → 移動で使う）
    const orderedWorks = [...featuredWorks, ...worksByCategory.flatMap(({ items }) => items)]

    const handleModal = (work) => {
        setSelectedWork(work);
        setModalIsOpen(true)
    }

    return (
        <>
            <div id="works" className="scroll-mt-16">
                <div className="flex justify-center">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0 flex justify-between items-end">
                            <div>Works<span className="ml-4 text-xl">これまでしてきたこと</span></div>
                            {isAuth && <div className="text-xl font-normal text-blue-600 hover:underline cursor-pointer" onClick={() => setCreateWorkModalIsOpen(true)}>新規作成</div>}
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
                                    {featuredWorks.map((item) => (
                                        <WorkCard key={item.id} item={item} size="large" isAuth={isAuth} onOpen={handleModal} />
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
                                    {items.map((item) => (
                                        <WorkCard key={item.id} item={item} size="small" isAuth={isAuth} onOpen={handleModal} />
                                    ))}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <EachWork modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} selectedWork={selectedWork} setSelectedWork={setSelectedWork} works={works} orderedWorks={orderedWorks} isAuth={isAuth} setWorks={setWorks} />
            <CreateWorkModal createWorkModalIsOpen={createWorkModalIsOpen} setCreateWorkModalIsOpen={setCreateWorkModalIsOpen} />
        </>
    )
}

export default Works

const WorkCard = ({ item, size, isAuth, onOpen }) => {
    const isLarge = size === 'large'
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(item)
        }
    }
    const buttonProps = { role: 'button', tabIndex: 0, onClick: () => onOpen(item), onKeyDown: handleKeyDown }

    // 管理者は作品名をその場で編集するので、画像だけを詳細を開くボタンにする
    return (
        <div
            {...(isAuth ? {} : buttonProps)}
            className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow ${isAuth ? '' : 'cursor-pointer'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
        >
            <div {...(isAuth ? buttonProps : {})} className="aspect-video overflow-hidden cursor-pointer">
                <img
                    src={`${process.env.REACT_APP_API_DOMAIN}/images/works/${item.id}/1_mid.jpg`} alt={item.id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>
            <div className={`flex-1 flex flex-col ${isLarge ? 'px-4 py-5 text-xl max-md:text-lg' : 'px-2 py-3 text-base max-sm:text-sm'}`}>
                {isAuth ? (
                    <WorkNameEditor item={item} />
                ) : (
                    // name の1つ目の <p> はカテゴリ見出しなので小さく表示する
                    <div className="[&>p:first-child]:text-[0.75em] [&>p:first-child]:font-medium [&>p:first-child]:text-gray-500" dangerouslySetInnerHTML={{ __html: item.name }} />
                )}
                {item.highlight && (
                    // カードの高さがそろうように下端に寄せる
                    <div className={`mt-auto pt-3 flex justify-center ${isLarge ? 'text-sm' : 'text-xs'}`}>
                        <div className={`rounded-lg bg-emerald-50 py-1 text-center text-balance font-medium text-emerald-800 ${isLarge ? 'px-3' : 'px-2'}`}>
                            {item.highlight}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const WorkNameEditor = ({ item }) => {
    const [isEditing, setIsEditing] = useState(false)
    const nameRef = useRef(null)
    const [formData, setFormData] = useState({
        id: item.id,
        name: item.name,
    })

    const handleChange = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    useEffect(() => {
        const updateName = async () => {
            try {
                await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update/name`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
            } catch (error) {
                console.error('Error uploading data:', error);
            }
        };
        if (Object.keys(formData).length > 0) {
            updateName();
        }
    }, [formData]);

    return (
        <>
            <input
                name="name"
                type="text"
                onBlur={() => setIsEditing(false)}
                onChange={(event) => handleChange(event)}
                value={formData.name}
                className={`${isEditing ? "block" : "hidden"} w-full`}
                ref={nameRef}
            />
            <div
                dangerouslySetInnerHTML={{ __html: formData.name }}
                className={`${isEditing ? "hidden" : "block"}`}
                onClick={() => {
                    setIsEditing(true)
                    setTimeout(() => {
                        nameRef.current.focus()
                        nameRef.current.setSelectionRange(0, 0);
                    }, 1)
                }}
            />
        </>

    )
}