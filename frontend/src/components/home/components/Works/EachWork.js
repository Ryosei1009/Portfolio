import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useEffect, useState } from 'react';
import ImageModal from './ImageModal';
import WorkDetailBody from './WorkDetailBody';
import WorkDetailEditor from './WorkDetailEditor';

const EachWork = ({ modalIsOpen, setModalIsOpen, selectedWork, setSelectedWork, orderedWorks, isAuth, setWorks, imageVersions, onImageUploaded }) => {
    const [selectedImage, setSelectedImage] = useState(1);
    const [isOpen, setIsOpen] = useState(false)
    const handleClose = () => {
        setModalIsOpen(false)
        setTimeout(() => {
            setSelectedImage(1)
        }, 300)
    }

    useEffect(() => {
        // 画像拡大中は作品を切り替えない
        if (modalIsOpen && !isAuth && !isOpen) {
            const handleKeyDown = (event) => {
                // id ではなく画面の並び順で前後の作品を探す
                const index = orderedWorks.findIndex((item) => item.id === selectedWork.id)
                if (index === -1) return
                if (event.key === "ArrowRight") {
                    index < orderedWorks.length - 1 && setSelectedWork(orderedWorks[index + 1])
                }
                if (event.key === "ArrowLeft") {
                    index > 0 && setSelectedWork(orderedWorks[index - 1])
                }
            };

            window.addEventListener("keydown", handleKeyDown);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [selectedWork, setSelectedWork, orderedWorks, modalIsOpen, isAuth, isOpen]);

    const zoom = () => setIsOpen(true)
    const imageVersion = imageVersions?.[selectedWork?.id]

    return (
        <Transition appear show={modalIsOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => !isOpen && handleClose()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                {/* スクロールするのは外側の箱だけにする（パネルの中でスクロールさせると、
                    iPhone では読み終わった後のスクロールが背景のページに伝わってしまうため） */}
                <div className="fixed inset-0 overflow-y-auto overscroll-contain scroll-hidden">
                    <div className="flex min-h-full items-start justify-center py-8">
                        <div className="transition-opacity w-2/3 max-2xl:w-4/5 max-lg:w-3/5 max-md:w-4/5 max-sm:w-11/12 outline-none">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                {selectedWork && (
                                    <div className="relative rounded-xl border-8 border-main">
                                        <div className="absolute inset-0 bg-white rounded-md"></div>
                                        <Dialog.Panel className="relative px-10 max-lg:px-4 pt-12 max-lg:pt-14 pb-12 max-lg:pb-5 flex flex-col items-center">
                                            {/* 閉じるボタン。高さ0の帯を上に固定して、その右上に重ねる（下の内容を押し下げない）
                                                帯の top とボタンの -top は、パネルの上の余白（pt）に合わせて、ボタンが枠の 4px 内側に来るようにする */}
                                            <div className="sticky top-12 max-lg:top-14 z-10 h-0 self-stretch">
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    aria-label="閉じる"
                                                    className="absolute -top-11 max-lg:-top-[3.25rem] -right-9 max-lg:-right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                                >
                                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                            {isAuth ? (
                                                // 作品ごとに作り直して、前の作品の未保存分は閉じるときに保存する
                                                <WorkDetailEditor key={selectedWork.id} work={selectedWork} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onZoom={zoom} setWorks={setWorks} imageVersion={imageVersion} onImageUploaded={() => onImageUploaded(selectedWork.id)} />
                                            ) : (
                                                <WorkDetailBody work={selectedWork} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onZoom={zoom} imageVersion={imageVersion} />
                                            )}
                                        </Dialog.Panel>
                                    </div>
                                )}
                            </Transition.Child>
                        </div>
                    </div>
                </div>
                <ImageModal isOpen={isOpen} setIsOpen={setIsOpen} selectedImage={selectedImage} selectedWork={selectedWork} imageVersion={imageVersion} />
            </Dialog >
        </Transition >
    )
}

export default EachWork
