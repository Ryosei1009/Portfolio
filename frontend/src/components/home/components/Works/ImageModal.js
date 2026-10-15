import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'
import { workImageAlt } from '../../../../utils/TextUtil'
import { showFallbackImage, workImageUrl } from './workImage'

const ImageModal = ({ isOpen, setIsOpen, selectedImage, selectedWork, imageVersion }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
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
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative max-w-5xl mx-auto">
                            {(selectedWork.id === 4 && selectedImage === 2) || (selectedWork.id === 16 && selectedImage === 5) ? (
                                <video
                                    className="w-full h-auto max-h-screen bg-white object-contain"
                                    src={workImageUrl(selectedWork.id, `${selectedImage}.mp4`)}
                                    aria-label={`${workImageAlt(selectedWork, selectedImage)}（動画）`}
                                    controls
                                    autoPlay
                                    muted
                                />
                            ) : (
                                <img
                                    className="w-full h-auto max-h-screen bg-white object-contain"
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
