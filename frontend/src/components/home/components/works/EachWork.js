import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { newLineUtil } from '../../../../utils/TextUtil';
import ImageModal from './ImageModal';
import { works } from '../db/Works';

const EachWork = ({ modalIsOpen, setModalIsOpen, selectedWork, setSelectedWork }) => {
    const [selectedImage, setSelectedImage] = useState();
    const [isOpen, setIsOpen] = useState(false)
    const handleClose = () => {
        setModalIsOpen(false)
        setTimeout(() => {
            setSelectedImage(null)
        }, 300)
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowRight") {
                console.log(selectedWork.id)
                selectedWork.id !== works.length && setSelectedWork(works[parseInt(selectedWork.id)])
                console.log(selectedWork.id)
            }
            if (event.key === "ArrowLeft") {
                selectedWork.id - 1 !== 0 && setSelectedWork(works[parseInt(selectedWork.id) - 2])
                console.log(selectedWork.id)
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedWork, setSelectedWork]);

    const getDevicesNumber = () => {
        switch (selectedImage) {
            case 1:
                return " ①";
            case 2:
                return " ②";
            case 3:
                return " ③";
            case 4:
                return " ④";
            case 5:
                return " ⑤";
            default:
                return " ①";
        }
    }

    return (
        <>
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
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-scroll scroll-hidden flex justify-center my-8">
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
                                        <Dialog.Panel className="relative scroll-hidden px-10 max-lg:px-4 py-12 max-lg:py-5 overflow-y-auto max-h-[80vh] flex flex-col items-center">
                                            <div className="text-5xl max-2xl:text-4xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl font-bold mb-2">
                                                <div dangerouslySetInnerHTML={{ __html: selectedWork.each }} />
                                            </div>
                                            <a href={selectedWork.url} target="_blank" rel="noopener noreferrer" className={`${selectedWork.url && "text-blue-500 hover:underline"} outline-none`}>
                                                {selectedWork.url_name}
                                            </a>
                                            <div className="flex max-lg:flex-col mt-8 max-lg:mt-4 items-center">
                                                <div className="flex flex-col items-center w-11/24 max-lg:w-full mr-4 max-xl:mr-4 max-lg:mr-0">
                                                    <img onClick={() => setIsOpen(true)} className="w-45/48 cursor-pointer hover:opacity-80"
                                                        src={selectedImage ? (`/images/works/${selectedWork.id}/${selectedWork.id === 5 ? (selectedImage === 4 ? (`${selectedImage}.gif`) : (`${selectedImage}.png`)) : (`${selectedImage}.png`)}`) : (`/images/works/${selectedWork.id}/1.png`)}
                                                        alt={selectedWork.id} />
                                                    <div className="mt-6 max-md:mt-4 px-2 flex justify-between">
                                                        {[1, 2, 3, 4, 5].map((item) => (
                                                            <img key={item} onClick={() => setSelectedImage(item)} className="w-1/6 h-161 cursor-pointer hover:opacity-80 hover:scale-110" src={`/images/works/${selectedWork.id}/${selectedWork.id === 5 ? (item === 4 ? (`${item}.gif`) : (`${item}.png`)) : (`${item}.png`)}`} alt={selectedWork.id} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="h-full w-13/24 max-lg:w-full text-start max-lg:border-t-2 mt-4">
                                                    <div className="flex flex-col text-sm max-xl:text-xs overflow-y-auto max-lg:h-full">
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-orange-500 border-4 mb-3">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                目的
                                                            </div>
                                                            <div className="ml-2">
                                                                {newLineUtil(selectedWork.purpose)}
                                                            </div>
                                                        </div>
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-blue-200 border-4 mb-3">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                展望
                                                            </div>
                                                            <div className="ml-2">
                                                                {newLineUtil(selectedWork.outlook)}
                                                            </div>
                                                        </div>
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-yellow-300 border-4">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                工夫 <span className="font-normal">{getDevicesNumber()}</span>
                                                            </div>
                                                            <div className="ml-2">
                                                                {selectedWork.device[selectedImage] ? (
                                                                    newLineUtil(selectedWork.device[selectedImage])
                                                                ) : (
                                                                    newLineUtil(selectedWork.device[1])
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </div>
                                )}
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <ImageModal isOpen={isOpen} setIsOpen={setIsOpen} selectedImage={selectedImage} selectedWork={selectedWork} setSelectedImage={setSelectedImage} />
        </>
    )
}

export default EachWork
