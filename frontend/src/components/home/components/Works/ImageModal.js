import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { workImageAlt } from '../../../../utils/TextUtil'
import { showFallbackImage, workImageUrl } from './workImage'

// 画像・動画の拡大表示（作品詳細の中で開く）
// 閉じるときはアニメーションさせずにすぐ閉じる。閉じている途中に Esc をもう一度押すと、
// 閉じかけの拡大表示がその Esc を受け取ってしまい、作品詳細が閉じなかったため
const ImageModal = ({ isOpen, setIsOpen, selectedImage, selectedWork, imageVersion }) => {
    const closeRef = useRef(null)

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" initialFocus={closeRef} onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                {/* 画像の外（背景）を押したら閉じる（画像の中のクリックは Dialog.Panel が止める） */}
                <div className="fixed inset-0 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                    >
                        <Dialog.Panel className="relative max-w-5xl mx-auto flex flex-col items-end">
                            <button
                                ref={closeRef}
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-900 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                閉じる
                            </button>
                            {(selectedWork.id === 4 && selectedImage === 2) || (selectedWork.id === 16 && selectedImage === 5) ? (
                                <video
                                    className="w-full h-auto max-h-[85vh] bg-white object-contain"
                                    src={workImageUrl(selectedWork.id, `${selectedImage}.mp4`)}
                                    aria-label={`${workImageAlt(selectedWork, selectedImage)}（動画）`}
                                    controls
                                    autoPlay
                                    muted
                                />
                            ) : (
                                <img
                                    className="w-full h-auto max-h-[85vh] bg-white object-contain"
                                    src={workImageUrl(selectedWork.id, `${selectedImage}.jpg`, imageVersion)}
                                    alt={workImageAlt(selectedWork, selectedImage)}
                                    onError={showFallbackImage}
                                />
                            )}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default ImageModal
