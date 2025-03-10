import { Dialog, Transition } from '@headlessui/react'
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
    
    const [displayError, setDisplayError] = useState(false);
    const [uploadError, setUploadError] = useState({
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
    }); 

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
                    <div className="fixed inset-0 bg-black/25" />
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
                                            <div className="relative flex flex-col mt-12 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
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
                                                    // maxLength={31}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.name) && (uploadError.name)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.name.length}/31 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-12 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
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
                                                    // maxLength={31}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.each) && (uploadError.each)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.each.length}/31 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-12 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
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
                                                    // maxLength={31}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.url) && (uploadError.url)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.url.length}/31 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative flex flex-col mt-12 bg-white px-6 pt-6 pb-3 rounded-md border-gray-300 border-1">
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
                                                    // maxLength={31}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.url_name) && (uploadError.url_name)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.url_name.length}/31 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-8 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="purpose">目的<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={purposeRef}
                                                    onChange={() => {
                                                        adjustPurposeHeight();
                                                        handleChange();
                                                    }}
                                                    value={formData.purpose}
                                                    id="purpose"
                                                    name="purpose"
                                                    // maxLength={4000}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.purpose) && (uploadError.purpose)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.purpose.length}/4000 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col mt-8 bg-white px-6 py-6 rounded-md border-gray-300 border-1">
                                                <label className="text-lg" htmlFor="outlook">展望<span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="border-b-2 border-b-gray-200 focus:outline-none scroll-hidden"
                                                    ref={outlookRef}
                                                    onChange={() => {
                                                        adjustOutlookHeight();
                                                        handleChange();
                                                    }}
                                                    value={formData.outlook}
                                                    id="outlook"
                                                    name="outlook"
                                                    // maxLength={4000}
                                                />
                                                <div className="flex justify-between text-gray-500">
                                                    <div className="text-red-500 font-bold">
                                                        {(displayError && !formData.outlook) && (uploadError.outlook)}
                                                    </div>
                                                    <div>
                                                        {/* {formData.outlook.length}/4000 */}
                                                    </div>
                                                </div>
                                            </div>
                                            <button></button>
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