import React, { useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import ImageModal from './ImageModal'
import axios from 'axios'

const EditEachWork = ({ selectedWork, selectedImage, getDevicesNumber, setSelectedImage, setIsOpen, isOpen, handleClose, modalIsOpen, setWorks, works }) => {
    const [isEachNameMarkedText, setIsEachNameMarkedText] = useState(true)
    const eachNameRef = useRef(null)
    const adjustEachNameHeight = () => {
        const textarea = eachNameRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [isPurposeMarkedText, setIsPurposeMarkedText] = useState(true)
    const purposeRef = useRef(null)
    const adjustPurposeHeight = () => {
        const textarea = purposeRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [isOutlookMarkedText, setIsOutlookMarkedText] = useState(true)
    const outlookRef = useRef(null)
    const adjustOutlookHeight = () => {
        const textarea = outlookRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [isDeviceMarkedText, setIsDeviceMarkedText] = useState(true)
    const deviceRef = useRef(null)
    const adjustDeviceHeight = () => {
        const textarea = deviceRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [formData, setFormData] = useState({
        id: selectedWork.id,
        each_name: selectedWork.each_name,
        url: selectedWork.url,
        url_name: selectedWork.url_name,
        purpose: selectedWork.purpose,
        outlook: selectedWork.outlook,
        device_1: selectedWork.device_1,
        device_2: selectedWork.device_2,
        device_3: selectedWork.device_3,
        device_4: selectedWork.device_4,
        device_5: selectedWork.device_5,
    })
    
    useEffect(() => {
        if (selectedWork) {
            setFormData({
                id: selectedWork.id,
                each_name: selectedWork.each_name,
                url: selectedWork.url,
                url_name: selectedWork.url_name,
                purpose: selectedWork.purpose,
                outlook: selectedWork.outlook,
                device_1: selectedWork.device_1,
                device_2: selectedWork.device_2,
                device_3: selectedWork.device_3,
                device_4: selectedWork.device_4,
                device_5: selectedWork.device_5,
            });
        }
    }, [selectedWork]);

    const handleChange = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    useEffect(() => {
        console.log(formData)
        setWorks(works && works.map((work) => {
            if (work.id === formData.id) {
                return {
                    ...work,
                    each_name: formData.each_name,
                    url: formData.url,
                    url_name: formData.url_name,
                    purpose: formData.purpose,
                    outlook: formData.outlook,
                    device_1: formData.device_1,
                    device_2: formData.device_2,
                    device_3: formData.device_3,
                    device_4: formData.device_4,
                    device_5: formData.device_5,
                }
            }
            return work
        }))
        const updateWork = async () => {
            try {
                await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
            } catch (error) {
                console.error('Error uploading data:', error);
            }
        };

        if (Object.keys(formData).length > 0) {
            updateWork();
        }
    }, [formData]);

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
                                                <div
                                                    className={`${isEachNameMarkedText ? "block" : "hidden"} ml-2`}
                                                    dangerouslySetInnerHTML={{ __html: formData.each_name }}
                                                    onClick={() => {
                                                        setIsEachNameMarkedText(false)
                                                        setTimeout(() => {
                                                            eachNameRef.current.focus()
                                                            eachNameRef.current.setSelectionRange(0, 0);
                                                            adjustEachNameHeight()
                                                        }, 1)
                                                    }}
                                                />
                                                <textarea
                                                    name="each_name"
                                                    className={`${isEachNameMarkedText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                                                    value={(formData.each_name)}
                                                    onBlur={() => setIsEachNameMarkedText(true)}
                                                    ref={eachNameRef}
                                                    onChange={(event) => {
                                                        handleChange(event)
                                                        adjustEachNameHeight()
                                                    }}
                                                />
                                            </div>
                                            {formData.url === "none" ? (
                                                <div className="outline-none">
                                                    {formData.url_name}
                                                </div>
                                            ) : (
                                                <a href={formData.url} target="_blank" rel="noopener noreferrer" className={`${formData.url && "text-blue-500 hover:underline"} outline-none`}>
                                                    {formData.url_name}
                                                </a>
                                            )}
                                            <div className="flex max-lg:flex-col mt-8 max-lg:mt-4 items-center">
                                                <div className="flex flex-col items-center w-11/24 max-lg:w-full mr-4 max-xl:mr-4 max-lg:mr-0">
                                                    <img onClick={() => setIsOpen(true)} className="w-45/48 cursor-pointer hover:opacity-80"
                                                        src={selectedImage ? (`${process.env.REACT_APP_IMAGE_DOMAIN}/images/works/${formData.id}/${selectedImage}.png`) : (`${process.env.REACT_APP_IMAGE_DOMAIN}/images/works/${formData.id}/1.png`)}
                                                        alt={formData.id} loading="lazy" onError={(event) => event.target.src = "/images/works/error.png"} />
                                                    <div className="mt-6 max-md:mt-4 px-2 flex justify-between">
                                                        {[1, 2, 3, 4, 5].map((item) => (
                                                            <img key={item} onClick={() => setSelectedImage(item)} className="w-1/6 h-161 cursor-pointer hover:opacity-80 hover:scale-110" src={`${process.env.REACT_APP_IMAGE_DOMAIN}/images/works/${formData.id}/${item}.png`} alt={formData.id} loading="lazy" onError={(event) => event.target.src = "/images/works/error.png"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="h-full w-13/24 max-lg:w-full text-start max-lg:border-t-2 mt-4">
                                                    <div className="flex flex-col text-sm max-xl:text-xs max-lg:h-full overflow-y-scroll h-96 scroll-hidden">
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-orange-500 border-4 mb-3">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                目的
                                                            </div>
                                                            <div
                                                                className={`${isPurposeMarkedText ? "block" : "hidden"} ml-2`}
                                                                dangerouslySetInnerHTML={{ __html: formData.purpose }}
                                                                onClick={() => {
                                                                    setIsPurposeMarkedText(false)
                                                                    setTimeout(() => {
                                                                        purposeRef.current.focus()
                                                                        purposeRef.current.setSelectionRange(0, 0);
                                                                        adjustPurposeHeight()
                                                                    }, 1)
                                                                }}
                                                            />
                                                            <textarea
                                                                name="purpose"
                                                                className={`${isPurposeMarkedText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                                                                value={(formData.purpose)}
                                                                onBlur={() => setIsPurposeMarkedText(true)}
                                                                ref={purposeRef}
                                                                onChange={(event) => {
                                                                    handleChange(event)
                                                                    adjustPurposeHeight()
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-blue-200 border-4 mb-3">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                展望
                                                            </div>
                                                            <div
                                                                className={`${isOutlookMarkedText ? "block" : "hidden"} ml-2`}
                                                                dangerouslySetInnerHTML={{ __html: formData.outlook }}
                                                                onClick={() => {
                                                                    setIsOutlookMarkedText(false)
                                                                    setTimeout(() => {
                                                                        outlookRef.current.focus()
                                                                        outlookRef.current.setSelectionRange(0, 0);
                                                                        adjustOutlookHeight()
                                                                    }, 1)
                                                                }}
                                                            />
                                                            <textarea
                                                                name="outlook"
                                                                className={`${isOutlookMarkedText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                                                                value={(formData.outlook)}
                                                                onBlur={() => setIsOutlookMarkedText(true)}
                                                                ref={outlookRef}
                                                                onChange={(event) => {
                                                                    handleChange(event)
                                                                    adjustOutlookHeight()
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="px-4 max-lg:px-3 py-2 max-lg:py-2 border-yellow-300 border-4">
                                                            <div className="text-xl max-lg:text-lg font-bold">
                                                                工夫 <span className="font-normal">{getDevicesNumber()}</span>
                                                            </div>
                                                            <div
                                                                className={`${isDeviceMarkedText ? "block" : "hidden"} ml-2`}
                                                                dangerouslySetInnerHTML={{ __html: formData[`device_${selectedImage}`] ? formData[`device_${selectedImage}`] : formData.device_1 }}
                                                                onClick={() => {
                                                                    setIsDeviceMarkedText(false)
                                                                    setTimeout(() => {
                                                                        deviceRef.current.focus()
                                                                        deviceRef.current.setSelectionRange(0, 0);
                                                                        adjustDeviceHeight()
                                                                    }, 1)
                                                                }}
                                                            />
                                                            <textarea
                                                                name={selectedImage ? `device_${selectedImage}` : "device_1"}
                                                                className={`${isDeviceMarkedText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                                                                value={(formData[`device_${selectedImage}`] ? formData[`device_${selectedImage}`] : formData.device_1)}
                                                                onBlur={() => setIsDeviceMarkedText(true)}
                                                                ref={deviceRef}
                                                                onChange={(event) => {
                                                                    handleChange(event)
                                                                    adjustDeviceHeight()
                                                                }}
                                                            />
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
                </Dialog >
            </Transition >
            <ImageModal isOpen={isOpen} setIsOpen={setIsOpen} selectedImage={selectedImage} selectedWork={selectedWork} setSelectedImage={setSelectedImage} />
        </>
    )
}

export default EditEachWork