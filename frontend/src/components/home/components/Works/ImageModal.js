import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef, useState } from 'react'
import axios from 'axios'

const ImageModal = ({ isOpen, setIsOpen, selectedImage, selectedWork, isAuth }) => {
    const fileInputRef = useRef(null)
    const [previewUrl, setPreviewUrl] = useState();
    const [isNotImage, setIsNotImage] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setIsNotImage(true);
                return;
            };
            setIsNotImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new window.Image();

                img.src = reader.result;

                img.onload = () => {
                    setPreviewUrl(reader.result);
                    updateWorkImage(file);
                };
            };
            reader.readAsDataURL(file);
        }
    }

    const updateWorkImage = async (image) => {
        if (!selectedWork?.id || !selectedImage) {
            console.error("選択されたワークや画像が正しく設定されていません");
            return;
        }
        const formData = new FormData();
        formData.append('image', image);
        formData.append('id', selectedWork.id);
        formData.append('image_id', selectedImage);

        try {
            await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update_image`, formData, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
            });
        } catch (error) {
            console.error('画像アップロード失敗:', error);
        }
    };



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
                            {selectedWork.id === 10 && selectedImage === 2 ? (
                                <video
                                    className="w-full h-auto max-h-screen bg-white object-contain"
                                    src={`${previewUrl ? previewUrl : `${process.env.REACT_APP_API_DOMAIN}/images/works/${selectedWork.id}/${selectedImage}.mp4`}`}
                                    alt=""
                                    controls
                                    autoPlay
                                    muted
                                />
                            ) : (
                                <img
                                    className="w-full h-auto max-h-screen bg-white object-contain"
                                    src={`${previewUrl ? previewUrl : `${process.env.REACT_APP_API_DOMAIN}/images/works/${selectedWork.id}/${selectedImage}.png`}`}
                                    alt=""
                                />
                            )}
                            {isAuth && (
                                <>
                                    <span className="bg-green-500 text-white text-center mt-2 px-6 py-2 rounded-lg cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                        画像更新
                                    </span>
                                    {isNotImage && <div className="text-red-500 mb-1">画像を選択してください。</div>}
                                    <input accept="image/png" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </>
                            )}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default ImageModal