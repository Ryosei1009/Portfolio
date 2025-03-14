import { Dialog, Transition } from '@headlessui/react'
import axios from 'axios';
import React, { Fragment, useRef, useState } from 'react'

const CreateWorkModal = ({ createWorkModalIsOpen, setCreateWorkModalIsOpen }) => {
    const purposeRef = useRef(null);
    const adjustPurposeHeight = () => {
        const textarea = purposeRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const outlookRef = useRef(null);
    const adjustOutlookHeight = () => {
        const textarea = outlookRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const device_1Ref = useRef(null);
    const adjustDevice_1Height = () => {
        const textarea = device_1Ref.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const device_2Ref = useRef(null);
    const adjustDevice_2Height = () => {
        const textarea = device_2Ref.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const device_3Ref = useRef(null);
    const adjustDevice_3Height = () => {
        const textarea = device_3Ref.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const device_4Ref = useRef(null);
    const adjustDevice_4Height = () => {
        const textarea = device_4Ref.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    const device_5Ref = useRef(null);
    const adjustDevice_5Height = () => {
        const textarea = device_5Ref.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [displayError, setDisplayError] = useState(false);
    const uploadError = {
        name: '名前が入力されていません',
        each: 'Modal内の名前が入力されていません',
        url: 'urlが入力されていません',
        url_name: 'urlの名前が入力されていません',
        purpose: '目的が入力されていません',
        outlook: '展望が入力されていません',
        device_1: '工夫1が入力されていません',
        device_2: '工夫2が入力されていません',
        device_3: '工夫3が入力されていません',
        device_4: '工夫4が入力されていません',
        device_5: '工夫5が入力されていません',
    };

    const [formData, setFormData] = useState({
        name: '',
        each: '',
        url: '',
        url_name: '',
        purpose: '',
        outlook: '',
        device_1: '',
        device_2: '',
        device_3: '',
        device_4: '',
        device_5: '',
    })

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }


    const updateWork = async () => {
        setDisplayError(true);
        if (!formData.name || !formData.each || !formData.url || !formData.url_name || !formData.purpose || !formData.outlook || !formData.device_1 || !formData.device_2 || !formData.device_3 || !formData.device_4 || !formData.device_5) {
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/create`, formData, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };

    return (
        <Transition appear show={createWorkModalIsOpen} as={Fragment}>
            <Dialog as="div" className="relative" onClose={() => setCreateWorkModalIsOpen(false)}>
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
                <div className="fixed inset-0 overflow-scroll scroll-hidden flex justify-center my-8 z-10">
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
                            <div className="relative rounded-xl border-8 border-main">
                                <div className="absolute inset-0 bg-white rounded-md"></div>
                                <Dialog.Panel className="1relative scroll-hidden overflow-y-auto max-h-[80vh] flex flex-col items-center">
                                    <div className="z-10 w-full px-10 max-lg:px-4 py-12 max-lg:py-5">
                                        <div className="z-10 text-center text-3xl font-bold">
                                            実績作成
                                        </div>
                                        <div className="z-10 w-full">
                                            <div className="relative flex flex-col mt-4 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="name">
                                                    名前<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="border-b-2 border-b-gray-200 focus:outline-none"
                                                    onChange={handleChange}
                                                    value={formData.name}
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.name) && (uploadError.name)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-4 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="each">
                                                    Modal内の名前<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="border-b-2 border-b-gray-200 focus:outline-none"
                                                    onChange={handleChange}
                                                    value={formData.each}
                                                    type="text"
                                                    id="each"
                                                    name="each"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.each) && (uploadError.each)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-4 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="url">
                                                    URL<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="border-b-2 border-b-gray-200 focus:outline-none"
                                                    onChange={handleChange}
                                                    value={formData.url}
                                                    type="text"
                                                    id="url"
                                                    name="url"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.url) && (uploadError.url)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-4 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="url">
                                                    URLの名前<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="border-b-2 border-b-gray-200 focus:outline-none"
                                                    onChange={handleChange}
                                                    value={formData.url_name}
                                                    type="text"
                                                    id="url_name"
                                                    name="url_name"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.url_name) && (uploadError.url_name)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="purpose">目的<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={purposeRef}
                                                    onChange={(event) => {
                                                        adjustPurposeHeight();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.purpose}
                                                    id="purpose"
                                                    name="purpose"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.purpose) && (uploadError.purpose)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="outlook">展望<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={outlookRef}
                                                    onChange={(event) => {
                                                        adjustOutlookHeight();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.outlook}
                                                    id="outlook"
                                                    name="outlook"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.outlook) && (uploadError.outlook)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="device_1">工夫1<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={device_1Ref}
                                                    onChange={(event) => {
                                                        adjustDevice_1Height();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.device_1}
                                                    id="device_1"
                                                    name="device_1"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.device_1) && (uploadError.device_1)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="device_2">工夫2<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={device_2Ref}
                                                    onChange={(event) => {
                                                        adjustDevice_2Height();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.device_2}
                                                    id="device_2"
                                                    name="device_2"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.device_2) && (uploadError.device_2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="device_3">工夫3<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={device_3Ref}
                                                    onChange={(event) => {
                                                        adjustDevice_3Height();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.device_3}
                                                    id="device_3"
                                                    name="device_3"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.device_3) && (uploadError.device_3)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="device_4">工夫4<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={device_4Ref}
                                                    onChange={(event) => {
                                                        adjustDevice_4Height();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.device_4}
                                                    id="device_4"
                                                    name="device_4"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.device_4) && (uploadError.device_4)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-4 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="device_5">工夫5<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={device_5Ref}
                                                    onChange={(event) => {
                                                        adjustDevice_5Height();
                                                        handleChange(event);
                                                    }}
                                                    value={formData.device_5}
                                                    id="device_5"
                                                    name="device_5"
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.device_5) && (uploadError.device_5)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="bg-green-400 rounded-xl text-white px-6 py-2 mt-4" onClick={() => updateWork()}>
                                                作成
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog >
        </Transition >
    )
}

export default CreateWorkModal